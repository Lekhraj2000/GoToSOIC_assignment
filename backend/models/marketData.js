  const mongoose = require("mongoose");
  const ObjectId=mongoose.Schema.Types.ObjectId;
  const oddsSchema=new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
        yes: { type: Number, required: true }, // Example: 1.8
        no: { type: Number, required: true } // Example: 2.2
  })
  const MarketDataSchema = new mongoose.Schema({
    event: { type:ObjectId, ref: "Event", required: true },
    oddsHistory: [oddsSchema]
  });

  module.exports = mongoose.model("MarketData", MarketDataSchema);
