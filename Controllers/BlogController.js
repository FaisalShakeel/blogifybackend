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