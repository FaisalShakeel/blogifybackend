const UserModel = require('../Models/UserModel');
const BlogModel = require('../Models/BlogModel');

exports.getHomePageData = async (req, res) => {
  
  
  try {
    // Fetch popular blogs with replies counting
    const popularBlogs = await BlogModel.aggregate([
      {
        $match: {
          isInDraft: false, // Only include blogs that are not in draft
        },
      },
      {
        $addFields: {
          likedBy: { $ifNull: ['$likedBy', []] },
          comments: { $ifNull: ['$comments', []] }, // Ensure comments is always an array
        },
      },
      // Before unwinding, calculate like count
      {
        $addFields: {
          likeCount: { $size: { $ifNull: ['$likedBy', []] } },
        }
      },
      // Skip the unwinding and grouping process if there are no real comments to process
      {
        $addFields: {
          hasComments: { 
            $cond: { 
              if: { $gt: [{ $size: "$comments" }, 0] }, 
              then: true, 
              else: false 
            } 
          },
          commentCount: 0, // Default to 0
          replyCount: 0    // Default to 0
        }
      },
      // Conditionally process comments only if they exist
      {
        $facet: {
          // Blogs with no comments (skip comment processing)
          noComments: [
            { $match: { hasComments: false } },
            {
              $project: {
                _id: 1,
                title: 1,
                content: 1,
                publishedByName: 1,
                publishedByPhotoUrl: 1,
                category: 1,
                createdAt: 1,
                likeCount: 1,
                commentCount: 1, // Will be 0
                replyCount: 1,   // Will be 0
                popularityScore: "$likeCount" // Just likeCount for blogs with no comments
              }
            }
          ],
          // Blogs with comments (process them)
          withComments: [
            { $match: { hasComments: true } },
            // Unwind comments to process each comment individually
            {
              $unwind: {
                path: '$comments',
                preserveNullAndEmptyArrays: false, // Don't keep empty ones here
              },
            },
            // Add replyCount for each comment
            {
              $addFields: {
                'comments.replies': { $ifNull: ['$comments.replies', []] },
                'comments.replyCount': { $size: { $ifNull: ['$comments.replies', []] } }
              },
            },
            // Group back to reconstruct the blog document with counts
            {
              $group: {
                _id: '$_id',
                title: { $first: '$title' },
                content: { $first: '$content' },
                publishedByName: { $first: '$publishedByName' },
                publishedByPhotoUrl: { $first: '$publishedByPhotoUrl' },
                category: { $first: '$category' },
                createdAt: { $first: '$createdAt' },
                likeCount: { $first: '$likeCount' },
                comments: { $push: '$comments' },
                commentCount: { $sum: 1 }, // Count actual comments
                replyCount: { $sum: '$comments.replyCount' }
              },
            },
            {
              $addFields: {
                popularityScore: { $add: ['$likeCount', '$commentCount', '$replyCount'] }
              },
            }
          ]
        }
      },
      // Combine results from both paths
      {
        $project: {
          allBlogs: { $concatArrays: ["$noComments", "$withComments"] }
        }
      },
      { $unwind: "$allBlogs" },
      { $replaceRoot: { newRoot: "$allBlogs" } },
      // Final filtering for popular blogs
      {
        $match: {
          $or: [
            { likeCount: { $gt: 0 } },
            { commentCount: { $gt: 0 } },
            { replyCount: { $gt: 0 } }
          ]
        },
      },
      {
        $sort: {
          popularityScore: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 5,
      }
    ]);

    console.log('Popular Blogs:', popularBlogs);

    // Extract IDs of popular blogs
    const popularBlogIds = popularBlogs.map((blog) => blog._id);

    // Fetch regular blogs excluding popular ones and drafts
    const blogs = await BlogModel.find({
      _id: { $nin: popularBlogIds },
      isInDraft: false,
    })
      .sort({ createdAt: -1 })
      .limit(15)
      .select('title content publishedByName publishedByPhotoUrl category createdAt');

    // Fetch featured authors
    const featuredAuthors = await UserModel.aggregate([
      {
        $match: {
          role: 'Author',
        },
      },
      {
        $addFields: {
          followers: { $ifNull: ['$followers', []] },
          followerCount: { $size: { $ifNull: ['$followers', []] } }
        },
      },
      {
        $sort: {
          followerCount: -1,
          createdAt: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          name: 1,
          bio: 1,
          profilePhotoUrl: 1,
          followerCount: 1,
        },
      },
    ]);

    // Send the response
    res.json({
      success: true,
      blogs,
      featuredAuthors,
      popularBlogs,
      counts: {
        popularBlogs: popularBlogs.length,
        regularBlogs: blogs.length,
        featuredAuthors: featuredAuthors.length,
      },
    });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};