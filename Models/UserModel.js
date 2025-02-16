const { default: mongoose } = require("mongoose");
const { Schema } = mongoose;
const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    profilePhotoUrl: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ["Reader", "Author"] // Restrict role to either "Reader" or "Writer"
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    }
});
const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;