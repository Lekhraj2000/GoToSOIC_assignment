const express=require('express');
const Event=require('../models/event');
const Trade=require('../models/trade');
const MarketData=require('../models/marketData')
const adminAuth=require('../middleware/adminAuth');
const User = require('../models/user');
const router=express.Router();
const logger=require('../logger');

/* 1.View all events*/
router.get('/events',adminAuth,async(req,res)=>{
  try{
      const events=await Event.find().populate('odds');
      logger.info("Admin fetched all events");
      res.json(events);
  }catch(error){
    logger.error(`Error fetching events: ${error.message}`);
      res.status(500).json({
          message:"Internal server error"
      })
  }
})
/* 2. view a specific event*/
router.get('/events/:id',adminAuth,async(req,res)=>{
  try {
      const event = await Event.findById(req.params.id).populate('odds');
      if (!event) {
        logger.warn(`Event not found: ${eventId}`);
        return res.status(404).json({ message: "Event not found" });
      }
      logger.info(`Admin fetched event: ${eventId}`);
      res.json(event);
    } catch (error) {
      logger.error(`Error fetching event ${req.params.id}: ${error.message}`);
      res.status(500).json({ message: "Error fetching event", error: error.message });
    }
})

/** 3. Create a New Event */
router.post("/events", adminAuth, async (req, res) => {
    try {
      const { title, category, odds, startTime, endTime } = req.body;
      const event = new Event({ title, category, startTime, endTime });

      const updatedOdds = await MarketData.findOneAndUpdate({ 
        event: event._id 
      },{ 
        $push: { oddsHistory:odds }
      },{ 
        upsert: true, new: true 
      }
    );
      event.odds=updatedOdds._id;
      await event.save();
      logger.info(`Event created successfully: ${event._id}`);
      res.status(200).json({ message: "Event created", event });
    } catch (error) {
      logger.error(`Error creating event: ${error.message}`);
      res.status(500).json({ message: "Error creating event" });
    }
  });
/*  4.Update Event Status */
router.put("/events/:id/status",adminAuth,async(req,res)=>{
    try {
        const { status } = req.body;
        if (!["live", "paused", "closed"].includes(status)) {
          logger.warn(`Invalid status update attempt: ${status}`);
          return res.status(400).json({ message: "Invalid status" });
        }
        const event = await Event.findByIdAndUpdate(req.params.id, {status}, { new: true });
        if (!event) {
          logger.warn(`Event not found for update: ${req.params.id}`);
          return res.status(404).json({ message: "Event not found" });
        }
        logger.info(`Event status updated successfully: ${req.params.id}, New Status: ${status}`);
        res.json({ message: "Event updated", event });
      } catch (error) {
        logger.error(`Error updating event status: ${error.message}`);
        res.status(500).json({ message: "Error updating event" });
      }
})
/* 5. Update Odds */
router.put("/events/:id/odds",adminAuth,async(req,res)=>{
  try {
    const oddsObj = req.body.odds;
    console.log(oddsObj);
    const eventId=req.params.id;
    if (!oddsObj.yes || !oddsObj.no || oddsObj.yes <= 1 || oddsObj.no <= 1) {
      logger.warn(`Invalid odds update attempt for event ${eventId}: ${JSON.stringify(oddsObj)}`);
      return res.status(400).json({ message: "Invalid odds values" });
    }

    await MarketData.findOneAndUpdate(
      { event: eventId },
      { $push: { oddsHistory: oddsObj } },
      { upsert: true, new: true }
    );
    logger.info(`Odds updated successfully for event ${eventId}: ${JSON.stringify(oddsObj)}`);
    res.json({ message: "Odds updated successfully" });
  } catch (error) {
    logger.error(`Error updating odds for event ${req.params.id}: ${error.message}`);
    res.status(500).json({ message: "Error updating odds" });
  }
})
/* 6. View All Trades */
router.get("/trades", adminAuth, async (req, res) => {
    try {
      const trades = await Trade.find().populate("user").populate("event").populate('odds');
      if (!trades.length) {
        logger.warn("No trades found in the system.");
        return res.json({ message: "No Trades Found" });
      }
      logger.info("Admin fetched all trades successfully.");
      res.json(trades);
    } catch (error) {
      logger.error(`Error fetching trades: ${error.message}`);
      res.status(500).json({ message: "Error fetching trades" });
    }
});

/* 7.Settle Trades (Declare Event Result) */
router.post("/events/:id/settle",adminAuth,async(req,res)=>{
  const {result}=req.body;
  const eventId=req.params.id;
  try{
    if(!result||!eventId||!['yes','no'].includes(result)){
      logger.warn(`Invalid result input for event ${eventId}`);
      return  res.status(400).json({message:"Invalid result"});
    }
    const event=await Event.findByIdAndUpdate(eventId,{result,status:"closed"},{new:true});

    if (!event) {
      logger.warn(`Event ${eventId} not found while settling.`);
      return res.status(404).json({ message: "Event not found" });
    }
    logger.info(`Settling event ${eventId} with result ${result}`);
    const trades=await Trade.find({event:eventId,status:"pending"}).populate('odds');
    for(const trade of trades){
      const user=await User.findById(trade.user);
      if(trade.option===result){
        const payout=trade.amount*trade.odds[result];
        user.balance+=payout;
        trade.status='won';
        logger.info(`User ${user._id} won trade ${trade._id}, payout: ${payout}`);
      }else{
        trade.status='lost';
        logger.info(`User ${user._id} lost trade ${trade._id}`);
      }
      await user.save();
      await trade.save();
    }
    logger.info(`Event ${eventId} settled successfully.`);
    res.json({message:"Event Settled, Balance Updated"})
  }catch(error){
    logger.error(`Error settling event ${eventId}: ${error.message}`);
    res.status(500).json({message:"Error while settling event"})
  }
})

module.exports=router;