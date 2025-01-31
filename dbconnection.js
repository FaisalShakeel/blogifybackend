const mongoose = require("mongoose");

const connectToMongoDB = async () => {
    try {
        const mongoURI = "mongodb://faisalshakeel120:C0nOCnyiyWq7kXpE@ac-hoy3oml-shard-00-00.9ipw5ey.mongodb.net:27017,ac-hoy3oml-shard-00-01.9ipw5ey.mongodb.net:27017,ac-hoy3oml-shard-00-02.9ipw5ey.mongodb.net:27017/blogify?ssl=true&replicaSet=atlas-26qf5k-shard-0&authSource=admin&retryWrites=true&w=majority&appName=moviemate"
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
        });
        
        console.log("Connected to MongoDB");
    } catch (e) {
        console.error("Error While Connecting With MongoDB:", e.message);
    }
};

module.exports = connectToMongoDB;