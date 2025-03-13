const mongoose = require("mongoose");
const ObjectId=mongoose.Schema.Types.ObjectId;
const TradeSchema = new mongoose.Schema({
  user: { type: ObjectId, ref: "User", required: true },
  event: { type: ObjectId, ref: "Event", required: true },
  option: { type: String, enum: ["yes", "no"], required: true },
  amount: { type: Number, required: true }, 
  odds: {
    type:ObjectId,
    ref:"MarketData"
  }, 
  status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trade", TradeSchema);
