const mongoose = require("mongoose");
const MarketData=require('../models/marketData');
const ObjectId=mongoose.Schema.Types.ObjectId;
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["upcoming", "live", "closed"],
    default: "upcoming",
  },
  result: {
    type: String,
    enum: ["yes", "no", "pending"],
    default: "pending",
  },
  odds: {
   type:ObjectId,
   ref:"MarketData"
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: { 
    type: Date, 
    required: true 
},
  createdAt: { 
    type: Date, 
    default: Date.now 
}});
module.exports=mongoose.model('Event',EventSchema)
