import "./App.css";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io("http://localhost:3000");

function App() {
  const [userId, setUserId] = useState(""); // User ID
  const [recipientId, setRecipientId] = useState(""); // Receiver ID
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]); // Store messages

  useEffect(() => {
    socket.on("message", (data) => {
      console.log("Received:", data);
      setMessages((prev) => [...prev, { text: data, type: "received" }]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  // Register user ID when they connect
  const registerUser = () => {
    if (userId.trim()) {
      socket.emit("register", userId);
      console.log(`User registered: ${userId}`);
    }
  };

  // Send private message
  const handleSubmit = (e) => {
    e.preventDefault();
    if (recipientId.trim() && message.trim()) {
      socket.emit("private-message", { recipientId, message });
      setMessages((prev) => [...prev, { text: message, type: "sent" }]);
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Private Chat</div>

      {/* User ID Input */}
      <div className="user-input">
        <input
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={registerUser}>Register</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          placeholder="Recipient ID"
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
