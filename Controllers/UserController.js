const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BlogModel = require('../Models/BlogModel')
const ListModel = require('../Models/ListModel')
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
  exports.follow = async (req, res) => {
   
    const userId = req.user.id; // getting user ID from decoded object in middleware
    const { followingId } = req.body; // ID of the user to follow/unfollow

    if (!followingId) {
        return res.status(400).json({ success: false, message: "User ID to follow is required" });
    }

    try {
        // Fetch both users from the database
        const user = await UserModel.findById(userId);
        const userToFollow = await UserModel.findById(followingId);

        if (!user || !userToFollow) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the user is already following
        const isFollowing = user.followings.some(following => following._id.toString() === followingId);

        if (isFollowing) {
            // Remove the following relationship
            user.followings = user.followings.filter(following => following._id.toString() !== followingId);
            userToFollow.followers = userToFollow.followers.filter(follower => follower._id.toString() !== userId);

            await user.save();
            await userToFollow.save();

            return res.status(200).json({ success: true, message: "Unfollowed the user successfully", author: userToFollow });
        } else {
            
            const userToFollowData = {
                _id: userToFollow._id,
                name: userToFollow.name,
                email: userToFollow.email,       
                bio:userToFollow.bio,
                profilePhotoUrl:userToFollow.profilePhotoUrl
                
            };

            const userData = {
                _id: user._id,
                name: user.name,        
                email: user.email,              
                bio:user.bio,
                profilePhotoUrl:user.profilePhotoUrl
              
            };

            
            user.followings.push(userToFollowData);
            userToFollow.followers.push(userData);

            await user.save();
            await userToFollow.save();

            return res.status(200).json({ success: true, message: "Followed the user successfully", author: userToFollow });
        }
    } catch (error) {
        console.error("Error in follow operation:", error);
        return res.status(500).json({ success: false, message: "An error occurred", error: error.message });
    }
};
exports.getProfile = async (req, res) => {
  const userId = req.params.id; // User ID from request params

  try {
    // Fetch user data
    const user = await UserModel.findById(userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch blogs created by the user
    const blogs = await BlogModel.find({ publishedById: userId });

    // Fetch blogs liked by the user
    const likedBlogs = await BlogModel.find({ likedBy: userId });

    // Fetch lists created by the user
    const lists = await ListModel.find({ createdBy: userId }).populate('blogs');

    // Fetch blogs saved by the user (blogs in the user's lists)
    const savedBlogs = [];
    for (const list of lists) {
      savedBlogs.push(...list.blogs);
    }

    // Remove duplicates from savedBlogs (if any)
    const uniqueSavedBlogs = [...new Set(savedBlogs.map(blog => blog._id.toString()))]
      .map(id => savedBlogs.find(blog => blog._id.toString() === id));

    // Response object
    const response = {
      success: true,
      message: 'Profile fetched successfully',
      
        user,
        blogs,
        likedBlogs,
        savedBlogs: uniqueSavedBlogs,
        lists,
    
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};