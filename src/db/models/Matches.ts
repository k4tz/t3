import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MatchSchema = new Schema({
    playerOne: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    playerTwo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    victor:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    duration:  { type: Number },
    startedAt: { type: Date, default: Date.now },
    endedAt:   { type: Date },
}, 
{ 
    timestamps: true 
});

MatchSchema.index({ playerOne: 1 });
MatchSchema.index({ playerTwo: 1 });
MatchSchema.index({ victor: 1 });

export default mongoose.model("Matches", MatchSchema);