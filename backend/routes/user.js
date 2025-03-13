const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const userAuth=require("../middleware/userAuth");
const Event  = require("../models/event");
const Trade = require("../models/trade");
const logger=require('../logger');

const router = express.Router();
const JWT_SECRET = "your_jwt_secret"; // Change to a secure value

/**  User Signup */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      logger.warn("Signup failed: Missing fields");
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      logger.warn(`Signup failed: Username '${username}' already in use`);
      return res.status(400).json({ message: "username already in use" });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({ username, email,password: hashedPassword ,role});
    await newUser.save();
    logger.info(`New user registered: ${username}`);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    res.status(500).json({ message: "Signup error", error: error.message });
  }
});

/** User Login */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      logger.warn("Login failed: Missing credentials");
      return res.status(400).json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      logger.warn(`Login failed: Invalid username '${username}'`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed: Incorrect password for username '${username}'`);
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    logger.info(`User logged in: ${username}`);
    res.json({ message: "Login successful", token });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: "Login error", error: error.message });
  }
});

router.get('/events',async(req,res)=>{
      try{
          const events=await Event.find().populate('odds');
          logger.info("Fetched all events");

          res.json(events);
      }catch(error){
        logger.error(`Error fetching events: ${error.message}`);
          res.status(500).json({
              message:"Internal server error"
          })
      }
})
router.get('/events/:id',async(req,res)=>{
  try {
      const event = await Event.findById(req.params.id).populate('odds');
      if (!event) {
        logger.warn("Fetched event ${req.params.id} does not exist");
        return res.status(404).json({ message: "Event not found" });
      }
      logger.info(`Fetched event '${req.params.id}' successfully`);
      res.json(event);
    } catch (error) {
      logger.error(`Error fetching event '${req.params.id}': ${error.message}`);
      res.status(500).json({ message: "Error fetching event", error: error.message });
    }
})
router.get('/trades',userAuth,async(req,res)=>{
    try{
        const userId=req.user.userId;
        const trades=await Trade.find({user:userId}).populate('odds');
        if(!trades.length){
          logger.warn(`No trades found for user '${userId}'`);            return res.json({message:" No Trades Found"});
        }
        logger.info(`Fetched trades for user '${userId}'`);

        res.json({trades})
    }catch(error){
      logger.error(`Error fetching trades for user '${req.user.userId}': ${error.message}`);
      res.status(500).json({ message: "Error fetching trades", error: error.message });
    }
})
router.get('/trades/:id',userAuth,async(req,res)=>{
  try{
      const userId=req.user.userId;

      const tradeId=req.params.id;
      logger.info(`User '${userId}' is fetching trade '${tradeId}'`);
      const trade=await Trade.find({_id:tradeId,user:userId});
      if(!trade.length){
        logger.warn(`No trades found for user '${userId}' with trade ID '${tradeId}'`);
        
          return res.json({message:" No Trades Found"});
      }
      logger.info(`Trade '${tradeId}' successfully fetched for user '${userId}'`);
      res.json({trade})
  }catch(error){
    logger.error(`Error fetching trade '${req.params.id}' for user '${req.user.userId}': ${error.message}`);
      res.status(500).json({ message: "Error fetching trades", error: error.message });
  }
})
router.post("/:eventId",userAuth,async(req,res)=>{
    try{
        const {option,amount}=req.body;
        const userId=req.user.userId;
        const eventId=req.params.eventId;

        if(!['yes','no'].includes(option)||amount<=0){
          logger.warn(`Trade failed: Invalid option '${option}' or amount '${amount}' for user '${userId}'`);

            return res.status(400).json({ message: "Invalid selection or amount" });
        }
        const event = await Event.findById(eventId).populate('odds');
        
        if (!event || event.status !== "live") {
          logger.warn(`Trade failed: Event '${eventId}' is not live or does not exist`);
          return res.status(400).json({ message: "Event is not live or does not exist" });
        }
        const user = await User.findById(userId);
        if (!user || user.balance < amount) {
          logger.warn(`Trade failed: Insufficient balance for user '${userId}'`);
          return res.status(400).json({ message: "Insufficient balance" });
        }
        user.balance -= amount;
        await user.save();
        const oddsArr=event.odds.oddsHistory;
        const lastUpdatedOddsId=oddsArr[oddsArr.length-1]._id;
        if (!lastUpdatedOddsId) {
          logger.error(`Trade failed: No odds data found for event '${eventId}'`);
          return res.status(500).json({ message: "Odds data not available" });
        }
        const trade = new Trade({
            user: userId,
            event: eventId,
            option:option,
            odds: lastUpdatedOddsId,
            amount:amount
          });
        await trade.save();
        logger.info(`Trade placed successfully by user '${userId}' for event '${eventId}'`);
        res.json({ message: "Trade placed successfully", trade });

    }catch(error){
      logger.error(`Error placing trade for user '${req.user.userId}' on event '${req.params.eventId}': ${error.message}`);
      res.status(500).json({ message: "Error placing trade", error: error.message });
    }
})
module.exports = router;
