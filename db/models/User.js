import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
});

// UserSchema.index({ username: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);