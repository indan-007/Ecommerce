// Admin Dashboard JavaScript

// DOM Elements
const sidebar = document.querySelector('.sidebar');
const toggle = document.querySelector('.toggle');
const navLinks = document.querySelectorAll('.nav-links li');
const contentSections = document.querySelectorAll('.content-section');
const userModal = document.getElementById('userModal');
const deleteModal = document.getElementById('deleteModal');
const closeModalBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const userForm = document.getElementById('userForm');
const addUserBtn = document.getElementById('addUserBtn');
const modalTitle = document.getElementById('modalTitle');
const userRoleFilter = document.getElementById('userRoleFilter');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
const logoutBtn = document.getElementById('logoutBtn');

// Authentication check
function checkAuth() {
    const authToken = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!authToken || user.role !== 'admin') {
        window.location.href = '../login.html';
    }
}

// Call auth check on page load
checkAuth();

// Toggle sidebar
if (toggle) {
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}

// Navigation functionality
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Remove active class from all links
        navLinks.forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Hide all content sections
        contentSections.forEach(section => section.classList.remove('active'));
        
        // Show selected content section
        const targetId = link.dataset.target;
        if (targetId) {
            document.getElementById(targetId).classList.add('active');
            
            // Load data for the section if needed
            if (targetId === 'users') {
                loadUsers();
            } else if (targetId === 'products') {
                // loadProducts();
            } else if (targetId === 'orders') {
                // loadOrders();
            } else if (targetId === 'payments') {
                // loadPayments();
            }
        }
    });
});

// User Management
let currentUserId = null;
let currentPage = 1;
let totalPages = 1;
let currentFilter = 'all';

// Open modal to add new user
if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
        modalTitle.textContent = 'Add User';
        userForm.reset();
        document.getElementById('userId').value = '';
        document.querySelector('.password-field').style.display = 'block';
        currentUserId = null;
        openModal(userModal);
    });
}

// Close modals
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        closeModal(userModal);
    });
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        closeModal(userModal);
    });
}

document.getElementById('cancelDeleteBtn')?.addEventListener('click', () => {
    closeModal(deleteModal);
});

// Submit user form
if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            username: document.getElementById('modalUsername').value,
            email: document.getElementById('modalEmail').value,
            full_name: document.getElementById('modalFullName').value,
            role: document.getElementById('modalRole').value,
            is_verified: document.getElementById('modalVerified').checked
        };
        
        // If password field is visible and has value, add it to userData
        const passwordField = document.getElementById('modalPassword');
        if (passwordField.value && passwordField.style.display !== 'none') {
            userData.password = passwordField.value;
        }
        
        try {
            let url = 'http://localhost:3000/api/users';
            let method = 'POST';
            
            if (currentUserId) {
                url += `/${currentUserId}`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(userData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                closeModal(userModal);
                loadUsers();
            } else {
                alert(data.message || 'Error processing user data');
            }
        } catch (error) {
            alert('Error connecting to server');
        }
    });
}

// Filter users by role
if (userRoleFilter) {
    userRoleFilter.addEventListener('change', () => {
        currentFilter = userRoleFilter.value;
        currentPage = 1;
        loadUsers();
    });
}

// Pagination
if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadUsers();
        }
    });
}

if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadUsers();
        }
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    });
}

// Load users data
async function loadUsers() {
    try {
        const response = await fetch(`http://localhost:3000/api/users?page=${currentPage}&role=${currentFilter}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderUsers(data.users);
            
            // Update pagination info
            totalPages = data.totalPages || 1;
            pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
            
            // Enable/disable pagination buttons
            prevPageBtn.disabled = currentPage <= 1;
            nextPageBtn.disabled = currentPage >= totalPages;
        } else {
            alert(data.message || 'Error loading users');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Render users table
function renderUsers(users) {
    const tableBody = document.querySelector('#usersTable tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (users.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center;">No users found</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.full_name || '-'}</td>
            <td>${user.role}</td>
            <td>${user.is_verified ? 'Yes' : 'No'}</td>
            <td class="action-icons">
                <button class="edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                <button class="delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.id;
            editUser(userId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.id;
            confirmDeleteUser(userId);
        });
    });
}

// Edit user
async function editUser(userId) {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const user = data.user;
            
            // Set form values
            document.getElementById('userId').value = user.id;
            document.getElementById('modalUsername').value = user.username;
            document.getElementById('modalEmail').value = user.email;
            document.getElementById('modalFullName').value = user.full_name || '';
            document.getElementById('modalRole').value = user.role;
            document.getElementById('modalVerified').checked = user.is_verified;
            
            // Hide password field for edit
            document.querySelector('.password-field').style.display = 'none';
            
            // Update modal title and current user ID
            modalTitle.textContent = 'Edit User';
            currentUserId = user.id;
            
            openModal(userModal);
        } else {
            alert(data.message || 'Error loading user data');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Confirm delete user
function confirmDeleteUser(userId) {
    currentUserId = userId;
    openModal(deleteModal);
    
    // Add event listener to confirm button
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteUser);
}

// Delete user
async function deleteUser() {
    try {
        const response = await fetch(`http://localhost:3000/api/users/${currentUserId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeModal(deleteModal);
            loadUsers();
        } else {
            alert(data.message || 'Error deleting user');
        }
    } catch (error) {
        alert('Error connecting to server');
    }
}

// Modal helpers
function openModal(modal) {
    modal.style.display = 'block';
}

function closeModal(modal) {
    modal.style.display = 'none';
}

// Initialize dashboard
function initDashboard() {
    // Load dashboard data
    loadUsers();
}

// Call initialization function
document.addEventListener('DOMContentLoaded', initDashboard); 