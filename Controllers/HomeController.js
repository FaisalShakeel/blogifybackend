const UserModel = require('../Models/UserModel');
const BlogModel = require('../Models/BlogModel');

exports.getHomePageData = async (req, res) => {
  
  try {
    // Fetch popular blogs with proper error handling and null checks
    const popularBlogs = await BlogModel.aggregate([
      {
        $match: {
          isInDraft: false // Only include blogs that are not in draft
        }
      },
      {
        $addFields: {
          likedBy: { $ifNull: ['$likedBy', []] },
          comments: { $ifNull: ['$comments', []] },
        }
      },
      {
        $addFields: {
          likeCount: { 
            $cond: {
              if: { $isArray: '$likedBy' },
              then: { $size: '$likedBy' },
              else: 0
            }
          },
          commentCount: {
            $cond: {
              if: { $isArray: '$comments' },
              then: { $size: '$comments' },
              else: 0
            }
          }
        }
      },
      {
        $addFields: {
          popularityScore: { $add: ['$likeCount', '$commentCount'] }
        }
      },
      {
        // Ensure only blogs with at least one like or comment
        $match: {
          $or: [
            { "likedBy.0": { $exists: true } }, // At least one like
            { "comments.0": { $exists: true } } // At least one comment
          ]
        }
      },
      {
        $sort: { 
          popularityScore: -1,
          createdAt: -1 
        }
      },
      {
        $limit: 5
      },
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
          commentCount: 1,
          popularityScore: 1
        }
      }
    ]);

    // Log the popular blogs for debugging
    console.log('Popular Blogs:', popularBlogs);

    // Extract IDs of popular blogs
    const popularBlogIds = popularBlogs.map(blog => blog._id);

    // Fetch regular blogs excluding popular ones and drafts
    const blogs = await BlogModel.find({ 
      _id: { $nin: popularBlogIds },
      isInDraft: false // Only include blogs that are not in draft
    })
    .sort({ createdAt: -1 }) // Sort by creation date
    .limit(15)
    .select('title content publishedByName publishedByPhotoUrl category createdAt'); // Select only needed fields

    // Fetch featured authors with proper error handling
    const featuredAuthors = await UserModel.aggregate([
      {
        $match: { 
          role: 'Author',
          // Ensure the followers field exists
          followers: { $exists: true }
        }
      },
      {
        $addFields: {
          // Handle cases where followers array might be null
          followers: { $ifNull: ['$followers', []] },
          followerCount: {
            $cond: {
              if: { $isArray: '$followers' },
              then: { $size: '$followers' },
              else: 0
            }
          }
        }
      },
      {
        $sort: { 
          followerCount: -1,
          createdAt: -1 // Secondary sort by creation date
        }
      },
      {
        $limit: 5
      },
      {
        // Project only the fields we need
        $project: {
          _id: 1,
          name: 1,
          bio: 1,
          profilePhotoUrl: 1,
          followerCount: 1
        }
      }
    ]);

    // Send the response
    res.json({
      success: true,
      blogs,
      featuredAuthors,
      popularBlogs,
      // Include counts for debugging
      counts: {
        popularBlogs: popularBlogs.length,
        regularBlogs: blogs.length,
        featuredAuthors: featuredAuthors.length
      }
    });

  } catch (error) {
    console.error('Error fetching homepage data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error!',
      error: error.message,
      // Include the full error stack in development
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};