import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    totalMatches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    draws: { type: Number, default: 0 },
    totalStars: { type: Number, default: 0 },
});

/**
 * below line is commented out because having unique on username definition when creating 
 * schema above creates an index already
 */
// UserSchema.index({ username: 1 }, { unique: true });

export default mongoose.model("User", UserSchema);