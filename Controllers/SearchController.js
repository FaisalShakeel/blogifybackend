const UserModel=require('../Models/UserModel')
const BlogModel = require('../Models/BlogModel')
const ListModel = require('../Models/ListModel')
exports.getSearchResults = async (req, res) => {
  try {
    const { query, authorPage = 1, blogPage = 1, listPage = 1, limit = 5 } = req.query;
    console.log("Search Query", query);

    if (!query || query.length < 2) {
      return res.status(400).json({
        message: 'Search query must be at least 2 characters long',
        authors: { items: [], total: 0 },
        blogs: { items: [], total: 0 },
        lists: { items: [], total: 0 },
      });
    }

    // Convert pagination parameters to numbers
    const authorPageNum = parseInt(authorPage);
    const blogPageNum = parseInt(blogPage);
    const listPageNum = parseInt(listPage);
    const limitNum = parseInt(limit);

    // Define search regex
    const searchRegex = new RegExp(query, 'i'); // Case-insensitive search

    // Search Authors with sorting by name
    const authorQuery = {
      $or: [
        { name: searchRegex },
        { bio: searchRegex },
      ],
    };

    const totalAuthors = await UserModel.countDocuments(authorQuery);
    const authors = await UserModel
      .find(authorQuery)
      .select('name profilePhotoUrl bio followers')
      .sort({ name: 1 }) // Sort alphabetically by name
      .skip((authorPageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Search Blogs with sorting by title
    const blogQuery = {
      $or: [
        { title: searchRegex },
        
        { tags: searchRegex },
      ],
    };

    const totalBlogs = await BlogModel.countDocuments(blogQuery);
    const blogs = await BlogModel
      .find(blogQuery)
      .select('title content publishedByName publishedByPhotoUrl likedBy tags')
      .sort({ title: 1 }) // Sort alphabetically by title
      .skip((blogPageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Search Lists with sorting by title
    const listQuery = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
      ],
    };

    const totalLists = await ListModel.countDocuments(listQuery);
    const lists = await ListModel
      .find(listQuery)
      .select('title description blogs photoUrl')
      .sort({ title: 1 }) // Sort alphabetically by title
      .skip((listPageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Format response
    const response = {
      success: true,
      authors: {
        items: authors.map(author => ({
          id: author._id,
          name: author.name,
          photo: author.profilePhotoUrl,
          bio: author.bio,
          followers: author.followers || [],
        })),
        total: totalAuthors,
      },
      blogs: {
        items: blogs.map(blog => ({
          id: blog._id,
          title: blog.title,
          content: blog.content,
          author: { name: blog.publishedByName },
          likedBy: blog.likedBy || [],
          tags: blog.tags || [],
        })),
        total: totalBlogs,
      },
      lists: {
        items: lists.map(list => ({
          id: list._id,
          title: list.title,
          photoUrl:list.photoUrl,
          description: list.description,
          blogs: list.blogs || [],
        })),
        total: totalLists,
      },
    };
    console.log("Search Results", response);

    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};