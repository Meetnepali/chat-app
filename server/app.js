import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const port = 3000;
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

// Store connected users and their socket IDs
const users = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Store user ID when they connect
  socket.on("register", (userId) => {
    users[userId] = socket.id; // Map userId to socketId
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  console.log(users);
  // Handle private message (data should include recipient ID)
  socket.on("private-message", ({ recipientId, message }) => {
    const recipientSocketId = users[recipientId]; // Get recipient's socket ID

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("message", message); // Send only to specific user
      console.log(`Message sent to ${recipientId}: ${message}`);
      console.log(users);
    } else {
      console.log(`User ${recipientId} not found.`);
    }
  });

  console.log(users);   

  // Handle user disconnect
  socket.on("disconnect", () => {
    for (const userId in users) {
      if (users[userId] === socket.id) {
        console.log(`User ${userId} disconnected.`);
        delete users[userId]; // Remove user from list
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
