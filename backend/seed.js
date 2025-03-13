const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/user");
const Trade=require('./models/trade');
const Event=require('./models/event');
const MarketData=require('./models/marketData');
const logger=require('./logger');

async function seedDatabase() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/opinionTradingApp");

    logger.info(" Connected to MongoDB");
    await User.deleteMany();
    await Event.deleteMany();
    await MarketData.deleteMany();
    await Trade.deleteMany();


    // Hash passwords
    const saltRounds = 10;
    const hashedAdminPassword = await bcrypt.hash("admin123", saltRounds);
    const hashedUserPassword = await bcrypt.hash("user123", saltRounds);

    const users = [
      {
        username: "admin",
        email: "admin@example.com",
        password: hashedAdminPassword,
        role: "admin",
        balance: 0, 
      },
      {
        username: "user",
        email: "user@example.com",
        password: hashedUserPassword,
        role: "user",
        balance: 1000,
      },
    ];

 
    await User.insertMany(users);

    logger.info(" Users seeded successfully");
    
    const eventsData = [
        { title: "Football World Cup Final", category: "Sports", odds: { yes: 1.8, no: 2.2 }, startTime: new Date("2025-06-10T18:00:00Z"), endTime: new Date("2025-06-10T20:00:00Z"), status: "upcoming" },
        { title: "Presidential Elections", category: "Politics", odds: { yes: 1.6, no: 2.4 }, startTime: new Date("2025-11-08T08:00:00Z"), endTime: new Date("2025-11-08T22:00:00Z"), status: "upcoming" },
        { title: "NBA Finals Game 7", category: "Sports", odds: { yes: 1.9, no: 2.1 }, startTime: new Date("2025-06-20T19:30:00Z"), endTime: new Date("2025-06-20T22:00:00Z"), status: "live" },
        { title: "US Open Tennis Final", category: "Sports", odds: { yes: 1.7, no: 2.3 }, startTime: new Date("2025-09-10T16:00:00Z"), endTime: new Date("2025-09-10T19:00:00Z"), status: "live" },
        { title: "Oscar Awards 2025", category: "Entertainment", odds: { yes: 1.5, no: 2.5 }, startTime: new Date("2025-03-10T20:00:00Z"), endTime: new Date("2025-03-10T23:30:00Z"), status: "closed" },
        { title: "FIFA Ballon d'Or Ceremony", category: "Sports", odds: { yes: 1.4, no: 2.6 }, startTime: new Date("2025-12-10T19:00:00Z"), endTime: new Date("2025-12-10T21:00:00Z"), status: "upcoming" },
        { title: "Bitcoin Halving Event", category: "Finance", odds: { yes: 2.0, no: 1.8 }, startTime: new Date("2025-04-25T00:00:00Z"), endTime: new Date("2025-04-25T23:59:59Z"), status: "upcoming" },
        { title: "Super Bowl 2026", category: "Sports", odds: { yes: 1.85, no: 2.15 }, startTime: new Date("2026-02-08T18:30:00Z"), endTime: new Date("2026-02-08T22:00:00Z"), status: "upcoming" },
        { title: "US Federal Reserve Interest Rate Decision", category: "Finance", odds: { yes: 1.75, no: 2.25 }, startTime: new Date("2025-06-15T14:00:00Z"), endTime: new Date("2025-06-15T14:30:00Z"), status: "live" },
        { title: "Nobel Prize Announcement", category: "Science", odds: { yes: 1.9, no: 2.1 }, startTime: new Date("2025-10-05T12:00:00Z"), endTime: new Date("2025-10-05T14:00:00Z"), status: "upcoming" },
      ];
  
      for (let { title, category, odds, startTime, endTime, status } of eventsData) {
        const event = new Event({ title, category, startTime, endTime, status });
        await event.save();
  
        const updatedOdds = await MarketData.findOneAndUpdate(
          { event: event._id },
          { $push: { oddsHistory: odds } },
          { upsert: true, new: true }
        );
  
        event.odds = updatedOdds._id; 
        await event.save(); 
      }
  
      logger.info("Events with status and odds seeded successfully.");


    const user = await User.findOne({ username: "user" });
    const liveEvent = await Event.findOne({ status: "live" }).populate("odds");
    const odds=liveEvent.odds.oddsHistory;
    const lastUpdatedOddsId=odds[odds.length-1]._id;
     

    if (user && liveEvent) {
      const tradeAmount = 100;

      if (user.balance >= tradeAmount) {
        const trade = new Trade({
          user: user._id,
          event: liveEvent._id,
          option: "yes",
          odds: lastUpdatedOddsId,
          amount: tradeAmount,
          status: "pending",
        });

        user.balance -= tradeAmount;
        await user.save();
        await trade.save();

        logger.info(` Trade placed: User '${user.username}' bet on '${liveEvent.title}'`);
      } else {
        logger.warn(` User '${user.username}' does not have enough balance to place a trade.`);
      }
    } else {
      logger.warn(" No live event found. Skipping trade placement.");
    }
    logger.info("Seeding completed successfully.");
    mongoose.connection.close();
  } catch (error) {
    logger.error("Error seeding database:", error);
    mongoose.connection.close();
  }
}
seedDatabase();