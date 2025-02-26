const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const UserModel = require('../Models/UserModel'); // Adjust the path to your User model
exports.createAccount = async (req, res) => {
  const { name, email, password, bio, role } = req.body;
  try {
    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    if (!bio) {
      return res.status(400).json({ success: false, message: "Bio is required" });
    }
    if (!role) {
      return res.status(400).json({ success: false, message: "Role is required" });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Profile photo is required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      profilePhotoUrl: process.env.BASE_URL+req.file.path, // Save file path
      bio,
      role,
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      {name:newUser.name,id: newUser._id, email: newUser.email, role: newUser.role,profilePhotoUrl:newUser.profilePhotoUrl,bio:newUser.bio},
      process.env.JWT_SECRET, // Use a secret key from environment variables
      { expiresIn: "7d" }
    );

   // Store token in cookies
   res.cookie("auth_token", token, {
    httpOnly: false, // If you want it accessible in `document.cookie`
    secure: false, // Use true if you're on HTTPS in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    sameSite: "lax", // Helps with cross-origin issues
  });


    // Send success response
    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePhotoUrl:newUser.profilePhotoUrl,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Validate required fields
      if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
      }
      if (!password) {
        return res.status(400).json({ success: false, message: "Password is required" });
      }
  
      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ success: false, message: "Email does not exist" });
      }
      // Compare passwords
      const isPasswordMatched = await bcrypt.compare(password, user.password);
      if (!isPasswordMatched) {
        return res.status(400).json({ success: false, message: "Incorrect password" });
      }
  console.log("JWT SECRET",process.env.JWT_SECRET) 
      // Generate JWT token
      const token = jwt.sign(
        {name:user.name, id: user._id, email: user.email, role: user.role,profilePhotoUrl:user.profilePhotoUrl,bio:user.bio},
        process.env.JWT_SECRET, // Use a secret key from environment variables
        { expiresIn: "7d" }
      );
  
     // Store token in cookies
    res.cookie("auth_token", token, {
      httpOnly: false, // If you want it accessible in `document.cookie`
      secure: false, // Use true if you're on HTTPS in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: "lax", // Helps with cross-origin issues
    });
  
  
      // Send success response
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };