const ListModel = require("../Models/ListModel");

// Create a new list
exports.createList = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validate request body
    if (!title || typeof title !== "string") {
      return res.status(400).json({ success: false, message: "List title is required and must be a string." });
    }
    if (!description) {
      return res.status(400).json({ success: false, message: "List description is required." });
    }
    if(!req.file){
      return res.status(400).json({ success: false, message: "List photo is required." });


    }

    // Create the list
    const newList = new ListModel({
      title,
      description: description || "",
      photoUrl:process.env.BASE_URL+req.file.path,
      createdBy: req.user.id,
    });

    // Save to database
    await newList.save();

    // Respond with the created list
    res.status(201).json({
      success: true,
      message: "List created successfully!",
      list: newList,
    });
  } catch (e) {
    console.log(e.message)
    res.status(500).json({ success: false, message: "Failed to create list. Please try again." });
  }
};

// Get lists created by the logged-in user
exports.getMyLists = async (req, res) => {
  try {
    // Fetch lists created by the user
    const lists = await ListModel.find({ createdBy: req.user.id });

    // Check if lists exist
    if (!lists || lists.length === 0) {
      return res.status(404).json({ success: true, message: "No lists found." });
    }

    // Respond with the lists
    res.status(200).json({
      success: true,
      message: "Lists retrieved successfully.",
      lists,
    });
  } catch (e) {
    console.error("Error fetching lists:", e.message);
    res.status(500).json({ success: false, message: "Failed to fetch lists. Please try again." });
  }
};

// Add to list
exports.addToList = async (req, res) => {
  try {
    const { listId, item } = req.body;
    console.log("List ID",listId)

    // Validate the request
    if (!listId || !item || !item._id) {
      return res.status(400).json({
        success: false,
        message: "List ID and item object with a valid '_id' are required.",
      });
    }

    // Find the list by ID
    const list = await ListModel.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found.",
      });
    }

    // Check if the logged-in user owns the list
    if (list.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this list.",
      });
    }

    // Check if the item already exists in the list
    const itemIndex = list.blogs.findIndex(
      (i) => i._id.toString() === item._id.toString()
    );

    if (itemIndex > -1) {
      // Item is already in the list, so remove it
      list.blogs.splice(itemIndex, 1);
      await list.save();
      return res.status(200).json({
        success: true,
        message: "Item removed from the list.",
        list,
      });
    } else {
      // Item is not in the list, so add it
      list.blogs.push(item);
      await list.save();
      return res.status(200).json({
        success: true,
        message: "Item added to the list.",
        list,
      });
    }
  } catch (e) {
    console.error("Error in addToList:", e.message);
    res.status(500).json({
      success: false,
      message: "Failed to modify the list. Please try again.",
    });
  }
};

// Get a specific list by ID
exports.getList = async (req, res) => {
  try {
    const listId = req.params.listId;

    const list = await ListModel.findById(listId);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "List not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "List retrieved successfully.",
      list,
    });
  } catch (error) {
    console.error("Error fetching list:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching the list.",
    });
  }
};

// Update a list
exports.updateList = async (req, res) => {
  try {
    const listId = req.params.listId;

    // Validate listId
    if (!listId) {
      return res.status(400).json({
        success: false,
        message: "List ID is required.",
      });
    }

    // Prepare update data
    const updateData = {
      title: req.body.title,
      description: req.body.description,
    };

    // If a file is uploaded, update photoUrl
    if (req.file) {
      updateData.photoUrl = process.env.BASE_URL.toString()+req.file.path.toString();
    }

    // Update the list in the database
    const updatedList = await ListModel.findByIdAndUpdate(
      listId,
      updateData,
      { new: true, runValidators: true }
    );

    // Check if list exists
    if (!updatedList) {
      return res.status(404).json({
        success: false,
        message: "List not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "List updated successfully.",
      list: updatedList,
    });
  } catch (error) {
    console.error("Error updating list:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the list.",
      error: error.message, // Optional: Include error details for debugging
    });
  }
};

// Delete a list
exports.deleteList = async (req, res) => {
  try {
    const listId = req.params.listId;

    const deletedList = await ListModel.findByIdAndDelete(listId);

    if (!deletedList) {
      return res.status(404).json({
        success: false,
        message: "List not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "List deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting list:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the list.",
    });
  }
};