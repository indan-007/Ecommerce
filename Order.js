// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// -------------------- MODELS --------------------

// File: models/Order.js
const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  items: [{
    productId: String,
    productName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  status: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    message: String
  }],
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update the updatedAt field
OrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);

// File: models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  notificationPreferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);

// -------------------- NOTIFICATION SERVICES --------------------

// File: services/notificationService.js
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Notification templates
const templates = {
  PLACED: {
    subject: 'Order Placed Successfully',
    email: (orderDetails) => `
      <h2>Thank you for your order!</h2>
      <p>Your order #${orderDetails.orderId} has been placed successfully.</p>
      <p>Total Amount: ₹${orderDetails.totalAmount}</p>
      <p>We'll notify you once your order is confirmed.</p>
    `,
    sms: (orderDetails) => 
      `Your order #${orderDetails.orderId} for ₹${orderDetails.totalAmount} has been placed. Track your order at: example.com/track/${orderDetails.orderId}`,
    whatsapp: (orderDetails) => 
      `Thank you for shopping with us! Your order #${orderDetails.orderId} for ₹${orderDetails.totalAmount} has been placed successfully. We'll keep you updated with the status of your order.`
  },
  CONFIRMED: {
    subject: 'Order Confirmed',
    email: (orderDetails) => `
      <h2>Your order has been confirmed!</h2>
      <p>We're preparing your order #${orderDetails.orderId} for shipment.</p>
      <p>Estimated delivery: ${getEstimatedDelivery()}</p>
    `,
    sms: (orderDetails) => 
      `Your order #${orderDetails.orderId} is confirmed! Est. delivery: ${getEstimatedDelivery()}. Track: example.com/track/${orderDetails.orderId}`,
    whatsapp: (orderDetails) => 
      `Great news! Your order #${orderDetails.orderId} has been confirmed and is being processed. Estimated delivery by ${getEstimatedDelivery()}.`
  },
  PACKED: {
    subject: 'Order Packed',
    email: (orderDetails) => `
      <h2>Your order has been packed!</h2>
      <p>Your order #${orderDetails.orderId} is packed and ready for shipping.</p>
      <p>It will be handed over to our delivery partner soon.</p>
    `,
    sms: (orderDetails) => 
      `Order #${orderDetails.orderId} packed! Will be shipped soon. Track: example.com/track/${orderDetails.orderId}`,
    whatsapp: (orderDetails) => 
      `Your order #${orderDetails.orderId} has been packed and is ready for shipping! We'll notify you once it's on the way.`
  },
  SHIPPED: {
    subject: 'Order Shipped',
    email: (orderDetails) => `
      <h2>Your order is on the way!</h2>
      <p>Your order #${orderDetails.orderId} has been shipped.</p>
      <p>Tracking number: ${orderDetails.trackingNumber || 'Will be updated soon'}</p>
      <p>Estimated delivery: ${getEstimatedDelivery()}</p>
    `,
    sms: (orderDetails) => 
      `Order #${orderDetails.orderId} shipped! Track: example.com/track/${orderDetails.orderId}. Est. delivery: ${getEstimatedDelivery()}`,
    whatsapp: (orderDetails) => 
      `Your order #${orderDetails.orderId} has been shipped and is on its way to you! Estimated delivery: ${getEstimatedDelivery()}. Track your order here: example.com/track/${orderDetails.orderId}`
  },
  OUT_FOR_DELIVERY: {
    subject: 'Order Out for Delivery',
    email: (orderDetails) => `
      <h2>Your order is out for delivery!</h2>
      <p>Your order #${orderDetails.orderId} is out for delivery and will arrive today.</p>
      <p>Our delivery partner will contact you on ${orderDetails.shippingAddress.phone}.</p>
    `,
    sms: (orderDetails) => 
      `Order #${orderDetails.orderId} is out for delivery today! Our delivery partner may call you. Track: example.com/track/${orderDetails.orderId}`,
    whatsapp: (orderDetails) => 
      `Your order #${orderDetails.orderId} is out for delivery and will arrive today! Our delivery partner might contact you on your registered phone number.`
  },
  DELIVERED: {
    subject: 'Order Delivered',
    email: (orderDetails) => `
      <h2>Your order has been delivered!</h2>
      <p>Your order #${orderDetails.orderId} has been delivered successfully.</p>
      <p>Thank you for shopping with us!</p>
      <p>Please rate your experience: example.com/feedback/${orderDetails.orderId}</p>
    `,
    sms: (orderDetails) => 
      `Order #${orderDetails.orderId} delivered! Thank you for shopping with us. Rate your experience: example.com/feedback/${orderDetails.orderId}`,
    whatsapp: (orderDetails) => 
      `Your order #${orderDetails.orderId} has been delivered! We hope you enjoy your purchase. Thank you for shopping with us! If you have a moment, please share your feedback: example.com/feedback/${orderDetails.orderId}`
  },
  CANCELLED: {
    subject: 'Order Cancelled',
    email: (orderDetails) => `
      <h2>Your order has been cancelled</h2>
      <p>Your order #${orderDetails.orderId} has been cancelled as requested.</p>
      <p>Refund of ₹${orderDetails.totalAmount} will be processed in 5-7 business days.</p>
    `,
    sms: (orderDetails) => 
      `Order #${orderDetails.orderId} cancelled. Refund of ₹${orderDetails.totalAmount} will be processed in 5-7 days.`,
    whatsapp: (orderDetails) => 
      `Your order #${orderDetails.orderId} has been cancelled as requested. The refund of ₹${orderDetails.totalAmount} will be processed within 5-7 business days to your original payment method.`
  }
};

// Helper function to get estimated delivery date
function getEstimatedDelivery() {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + 5); // Assuming 5 days for delivery
  return deliveryDate.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Function to send notifications
async function sendNotifications(order) {
  try {
    // Get user preferences
    const user = await User.findOne({ userId: order.userId });
    if (!user) throw new Error('User not found');

    const templateData = templates[order.status];
    if (!templateData) throw new Error('Template not found for status: ' + order.status);

    // Prepare order details object for templates
    const orderDetails = {
      orderId: order.orderId,
      totalAmount: order.totalAmount,
      trackingNumber: order.trackingNumber || null,
      shippingAddress: order.shippingAddress
    };

    // Send email notification
    if (user.notificationPreferences.email) {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: templateData.subject,
        html: templateData.email(orderDetails)
      });
      console.log(`Email notification sent for Order #${order.orderId}`);
    }

    // Send SMS notification
    if (user.notificationPreferences.sms) {
      await twilioClient.messages.create({
        body: templateData.sms(orderDetails),
        from: process.env.TWILIO_PHONE_NUMBER,
        to: user.phone
      });
      console.log(`SMS notification sent for Order #${order.orderId}`);
    }

    // Send WhatsApp notification
    if (user.notificationPreferences.whatsapp) {
      await twilioClient.messages.create({
        body: templateData.whatsapp(orderDetails),
        from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
        to: `whatsapp:${user.phone}`
      });
      console.log(`WhatsApp notification sent for Order #${order.orderId}`);
    }

    return true;
  } catch (error) {
    console.error('Error sending notifications:', error);
    return false;
  }
}

module.exports = { sendNotifications };

// -------------------- CONTROLLERS --------------------

// File: controllers/orderController.js
const Order = require('../models/Order');
const { sendNotifications } = require('../services/notificationService');
const { generateOrderId } = require('../utils/helpers');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingAddress, paymentMethod } = req.body;
    
    // Generate unique order ID
    const orderId = generateOrderId();
    
    // Create order in database
    const order = new Order({
      orderId,
      userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'PLACED',
      statusHistory: [
        { status: 'PLACED', message: 'Order placed successfully' }
      ]
    });
    
    await order.save();
    
    // Send notifications
    await sendNotifications(order);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { orderId }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message } = req.body;
    
    // Find order
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update status
    order.status = status;
    order.statusHistory.push({
      status,
      message: message || `Order ${status.toLowerCase()}`
    });
    
    await order.save();
    
    // Send notifications
    await sendNotifications(order);
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};

// Get order details
exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message
    });
  }
};

// -------------------- ROUTES --------------------

// File: routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Order routes
router.post('/orders', orderController.createOrder);
router.get('/orders/:orderId', orderController.getOrder);
router.put('/orders/:orderId/status', orderController.updateOrderStatus);

module.exports = router;

// File: utils/helpers.js
// Generate unique order ID
exports.generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `OD${timestamp}${random}`;
};

// File: middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decodedToken.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Sample .env file
/*
PORT=3000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
*/

// -------------------- API ENDPOINTS --------------------
// 1. Create Order: POST /api/orders
// 2. Get Order Details: GET /api/orders/:orderId
// 3. Update Order Status: PUT /api/orders/:orderId/status