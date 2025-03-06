const express = require('express');
const cors = require('cors');
const path=require('path')
require('dotenv').config()
const userRouter=require('./Routes/UserRoutes')
const blogRouter=require('./Routes/BlogRoutes')
const listRouter = require('./Routes/ListRoutes')
const authRouter=require('./Routes/AuthRoutes')
const connectToMongoDB = require('./dbconnection');
const cookieParser = require('cookie-parser');
const { getHomePageData } = require('./Controllers/HomeController');
const { getSearchResults } = require('./Controllers/SearchController');
const app = express();
// Connect to MongoDB
connectToMongoDB();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL, // Allow requests from the frontend URL
  credentials: true, // Allow cookies to be sent and received
};
app.use(cors(corsOptions)); // Enable CORS with the specified options
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//Cookie parser
app.use(cookieParser())
// Middleware to parse JSON bodies
// Increase the payload size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use("/users",userRouter)
app.use("/blogs",blogRouter)
app.use("/lists",listRouter)
app.use("/auth",authRouter)
app.use("/search",getSearchResults)
app.get("/",getHomePageData) //setting the route to get homepage data like blogs,popular blogs and featured authors
// Not found router
app.get('*', (req, res) => {
  res.status(404).json({message:"Not Found!"});
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});