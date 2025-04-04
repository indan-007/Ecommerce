import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    setInput("");

    try {
      const response = await axios.post("http://localhost:5000/chat", {
        message: input,
      });

      const botMessage = { role: "assistant", content: response.data.reply };
      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div style={{ width: "300px", border: "1px solid #ddd", padding: "10px" }}>
      <div style={{ height: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <p key={index} style={{ textAlign: msg.role === "user" ? "right" : "left" }}>
            <strong>{msg.role === "user" ? "You: " : "Bot: "}</strong> {msg.content}
          </p>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Ask me anything..."
        style={{ width: "80%" }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chatbot;

import Chatbot from "./Chatbot";

function App() {
  return (
    <div>
      <h1>My E-Commerce Site</h1>
      <Chatbot />
    </div>
  );
}

export default App;
