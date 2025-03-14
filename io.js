const socketIo = require('socket.io');

let IO;
let connectedUsers = [];

const initializeSocket = (server) => {
    console.log("Initializing Socket.IO");
    
    IO = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        },
        pingTimeout: 120000,    // 2 minutes
        pingInterval: 30000     // 30 seconds
    });

    IO.on("connection", (socket) => {
        console.log("New client connected with ID:", socket.id);

        // Get userId from handshake query
        const userId = socket.handshake.query.userId;

        if (!userId) {
            console.log("No userId provided in query, disconnecting:", socket.id);
            socket.disconnect();
            return;
        }

        // Remove existing connection for this user if it exists
        const existingUserIndex = connectedUsers.findIndex(user => user.ID === userId);
        if (existingUserIndex !== -1) {
            console.log(`User ${userId} already connected, updating socket ID`);
            connectedUsers.splice(existingUserIndex, 1);
        }

        // Add user to connectedUsers
        connectedUsers.push({ ID: userId, socketId: socket.id });
        console.log(`User added - ID: ${userId}, Socket: ${socket.id}`);
        console.log("Current connected users:", connectedUsers);

        // Handle disconnection
        socket.on('disconnect', (reason) => {
            const disconnectedUser = connectedUsers.find(user => user.socketId === socket.id);
            connectedUsers = connectedUsers.filter(user => user.socketId !== socket.id);
            console.log(`User disconnected - Socket: ${socket.id}, UserID: ${disconnectedUser?.ID || 'Unknown'}, Reason: ${reason}`);
            console.log("Remaining connected users:", connectedUsers);
        });

        // Handle reconnection
        socket.on('reconnect', (attemptNumber) => {
            console.log(`Client reconnected - Socket: ${socket.id}, Attempt: ${attemptNumber}`);
            // Since userId is from query, we don't need to request it again
            const reconnectUserId = socket.handshake.query.userId;
            if (reconnectUserId) {
                const existingIndex = connectedUsers.findIndex(user => user.ID === reconnectUserId);
                if (existingIndex !== -1) {
                    connectedUsers.splice(existingIndex, 1);
                }
                connectedUsers.push({ ID: reconnectUserId, socketId: socket.id });
                console.log(`User re-added after reconnect - ID: ${reconnectUserId}, Socket: ${socket.id}`);
            }
        });

        // Handle connection errors
        socket.on('error', (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });

        // Handle reconnection attempts
        socket.on('reconnect_attempt', (attempt) => {
            console.log(`Reconnect attempt ${attempt} for socket: ${socket.id}`);
        });
    });

    return IO;
};

const getIO = () => {
    if (!IO) {
        throw new Error("Socket.IO not initialized! Call initializeSocket first.");
    }
    return IO;
};

const getReceiverSocketId = (userId) => {
    const user = connectedUsers.find(user => user.ID === userId);
    if (!user) {
        console.log(`No socket found for user ID: ${userId}`);
        return null;
    }
    console.log(`Found socket ${user.socketId} for user ID: ${userId}`);
    return user.socketId;
};

const isUserConnected = (userId) => {
    return connectedUsers.some(user => user.ID === userId);
};

const getConnectedUsers = () => {
    return [...connectedUsers];
};

module.exports = { 
    initializeSocket, 
    getReceiverSocketId, 
    getIO,
    isUserConnected,
    getConnectedUsers 
};