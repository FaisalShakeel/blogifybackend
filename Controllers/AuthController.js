exports.getDecodedUser = async (req, res) => {
    console.log("Getting Decoded User")
      try {
        if (req.user) {
          res.status(200).json({
            success: true,
            message: "User decoded successfully.",
            user: req.user, // Optional: Include the user object in the response
          });
        } else {
          res.status(401).json({
            success: false,
            message: "Unauthorized: User not found in the request.",
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "An error occurred while decoding the user.",
          error: error.message, // Include the error message for debugging
        });
      }
    };
    exports.logout = async (req, res) => {
      try {
        res.clearCookie("auth_token", {
          httpOnly: false, // Since you're setting httpOnly: false, keep it the same
          secure: false, // Should match how you're setting it
          sameSite: "lax", // Keep sameSite behavior consistent
        });
    
        return res.status(200).json({
          success: true,
          message: "Logout successful",
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong while logging out",
        });
      }
    };