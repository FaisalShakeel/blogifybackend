const BlogModel = require('../Models/BlogModel');
exports.addBlog = async (req, res) => {
    try {
        // Log the incoming request body and user details
        console.log("Blog Content", req.body);
        console.log("User", req.user);

        // Extract required fields from the request body
        const { title, tags, category, content } = req.body;

        // Validate required fields
        if (!title || !tags || !category || !content) {
            return res.status(400).json({
                success: false,
                message: "Title, tags, category, and content are required fields."
            });
        }

        // Validate that tags and category are arrays (if required)
        if (!Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                message: "Tags must be an array."
            });
        }


        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category is required"
            });
        }

        // Add user details to the blog
        req.body.publishedByPhotoUrl = req.user.profilePhotoUrl;
        req.body.publishedById = req.user.id;
        req.body.publishedByName = req.user.name;

        // Create a new blog document
        const newBlog = BlogModel(req.body);

        // Save the blog to the database
        await newBlog.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: req.body.isInDraft?"Blog successfully saved as draft.":"Blog published successfully.",
            newBlog
        });

    } catch (error) {
        console.error("Error adding blog:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error.",
        
        });
    }
};
exports.getBlogById=async (req, res) => {
    try {
        const { blogId } = req.params;

        // Validate if blogId is provided
        if (!blogId) {
            return res.status(400).json({ message: 'Blog ID is required' });
        }

        // Find the blog by ID
        const blog = await BlogModel.findById(blogId);

        // Check if blog exists
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Return the blog
        res.status(200).json({success:true, blog});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.likeBlog = async (req, res) => {
    try {
      const userId = req.user.id; // ID of the person liking the blog
      const { blogId } = req.body; // ID of the blog being liked
  
      // Find the blog by ID
      const blog = await BlogModel.findById(blogId);
  
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      // Check if the user has already liked the blog
      const userHasLiked = blog.likedBy.includes(userId);
  
      if (userHasLiked) {
        // If already liked, remove the user from the likedBy list
      blog.likedBy = blog.likedBy.filter(id => id.toString() !== userId.toString());
        await blog.save();
        return res.status(200).json({success:true, message: "You have unliked the blog",blog });
      } else {
        // If not liked, add the user to the likedBy list
        blog.likedBy.push(userId);
        // const socketID=getReceiverSocketId(video.uploadedBy)
        // const notification=new NotificationModel({sentByName:req.user.name,sentByPhotoUrl:req.user.profilePhotoUrl,title:`${req.user.name} Has Liked Your Video:`+video.title,type:"Liked Video", sentBy:req.user.id,sentTo:video.uploadedBy,videoId:video._id})
        //       getIO().to(socketID).emit("new-notification",notification)
      
        //       await blog.save();
        //       await notification.save()
        await blog.save()
        return res.status(200).json({success:true, message: "You have liked the blog", blog });
      }
    } catch (error) {
      console.error("Error liking/unliking blog:", error);
      return res.status(500).json({ message: "An error occurred", error: error.message });
    }
  };
  