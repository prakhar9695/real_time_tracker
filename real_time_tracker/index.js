const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const path = require("path");

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketio(server);

// Set view engine to EJS for dynamic HTML rendering
app.set("view engine", "ejs");

// Serve static files (like CSS, JS) from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log(`New user connected: ${socket.id}`);

    // Handle receiving location data from the client
    socket.on("send-location", (data) => {
        if (!data.latitude || !data.longitude) {
            console.error(`Invalid location data from ${socket.id}:`, data);
            return;
        }

        console.log(`Location received from ${socket.id}:`, data);

        // Broadcast location to all connected clients
        io.emit("receive-location", {
            id: socket.id,
            ...data, // Spread operator to include latitude and longitude
        });
    });

    // Notify other users about the disconnection
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        io.emit("user-disconnect", socket.id);
    });
});

// Serve the index page
app.get("/", (req, res) => {
    res.render("index", { title: "Real-Time Location Tracker" }); // Pass a title for better dynamic rendering
});

// Start the server on a dynamic port (for deployment) or 8000 as fallback
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});


