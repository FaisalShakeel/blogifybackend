const jwt = require("jsonwebtoken");
exports.verifyUser = async (req, res, next) => {
    console.log("Verifying User")
  try {
    // Extract the token from cookies
    const authToken = req.cookies.auth_token;
    console.log("Cookies",req.cookies)
    console.log("Here Is Your Auth Token",authToken)

    // Check if the token is present
    if (!authToken) {
      return res.status(401).json({ message: "No token provided!" });
    }

    //Verify the token
    console.log("JWT SECRET",process.env.JWT_SECRET)
    
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET.trim());
    console.log("Decoded User",decoded)

    // Attach the decoded user information to the request for further use
    req.user = decoded;

    // Proceed to the next middleware/route
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired!" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token!" });
    }

    // For other errors
    return res.status(500).json({ message: "Failed to authenticate token!" });
  }
};
