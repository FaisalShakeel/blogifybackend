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
        req.body.publishedByBio=req.user.bio
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
exports.getBlogById = async (req, res) => {
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

        // Find related blogs with the same category, excluding the current blog
        const relatedBlogs = await BlogModel.find({
            category: blog.category,
            _id: { $ne: blogId } // Exclude the current blog
        }).limit(5); // Limit the number of related blogs to 5 (you can adjust this)

        // Return the blog and related blogs
        res.status(200).json({ success: true, blog, relatedBlogs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
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
  exports.addComment = async (req, res) => {
    try {
    
        // Destructure the required data from request
        const { blogId, comment } = req.body;
        const { id: userId, name, profilePhotoUrl } = req.user;

        // Validate the input
        if (!blogId || !comment) {
            return res.status(400).json({
                success: false,
                message: "Blog ID and comment text are required.",
            });
        }

        // Fetch the blog from the database
        const blog = await BlogModel.findById(blogId);

        // If blog is not found
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found.",
            });
        }

        // Create a new comment object
        const newComment = {
            _id:Math.random(),
            userId,
            name,
            profilePhotoUrl,
            text: comment,
            date: new Date(),
            replies:[]
        };

        // Add the comment to the blogs's comments array
       blog.comments.push(newComment);
   
        await blog.save();

        // Respond with success
        return res.status(200).json({
            success: true,
            message: "Comment added successfully.",
            blog, // Optionally return the updated comments
        });
    } catch (e) {
        // Handle any errors
        console.error("Error adding comment:", e);
        return res.status(500).json({
            success: false,
            message: "An error occurred while adding the comment.",
        });
    }
};
exports.replyToComment = async (req, res) => {
  console.log("Replying To Comment", req.body);
  try {
    const { blogId, commentId, replyText } = req.body;

    if (!blogId || typeof commentId === "undefined" || !replyText) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // Find the blog by ID
    const blog = await BlogModel.findById(blogId);

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found." });
    }
     let comment = blog.comments.find((c) => c._id.toString() === commentId.toString());

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }


    // Find the comment index by commentId
    const commentIndex = blog.comments.findIndex((c) => c._id.toString() === commentId.toString());
    console.log("Comment Index",commentIndex)

    

    // Create a reply object
    const newReply = {
      _id: Math.random(), // Unique ID for the reply
      text: replyText,
      name: req.user.name,
      profilePhotoUrl: req.user.profilePhotoUrl,
      date: new Date(),
    };
    console.log("Comment Replies",comment.replies)
    comment.replies.push(newReply)
    console.log("Comment Replies After Updating",comment.replies)
    console.log("Latest Comment",comment)
    blog.comments[commentIndex]=comment


    // Save the updated blog
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Reply added successfully.",
      blog,
    });
  } catch (e) {
    console.error("Error replying to comment:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred while replying to the comment.",
    });
  }
};
exports.getBlogsByTag = async (req, res) => {
  try {
      const { tag } = req.params;

      if (!tag) {
          return res.status(400).json({ message: 'Tag is required' });
      }

      // Fetch blogs that have the specified tag in their tags array
      const blogs = await BlogModel.find({ tags: tag });

      if (blogs.length === 0) {
          return res.status(200).json({success:true, message: 'No blogs found with this tag',blogs:[],popularTags:[] });
      }

      // Fetch all blogs to calculate popular tags
      const allBlogs = await BlogModel.find({});

      // Calculate popularity score for each blog (likes + comments)
      const blogPopularity = allBlogs.map(blog => ({
          blog,
          popularity: blog.likedBy.length + blog.comments.length
      }));

      // Sort blogs by popularity (most popular first)
      blogPopularity.sort((a, b) => b.popularity - a.popularity);

      // Extract tags from the most popular blogs
      const tagCounts = {};
      blogPopularity.forEach(({ blog }) => {
          blog.tags.forEach(t => {
              if (tagCounts[t]) {
                  tagCounts[t]++;
              } else {
                  tagCounts[t] = 1;
              }
          });
      });

      // Sort tags by frequency (most frequent first)
      const popularTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).slice(0, 10); // Top 10 popular tags

      // Return blogs and popular tags in the response
      res.status(200).json({
          message: 'Blogs fetched successfully',
          blogs,
          success:true,
          popularTags
      });

  } catch (error) {
      console.error('Error fetching blogs by tag:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};
  