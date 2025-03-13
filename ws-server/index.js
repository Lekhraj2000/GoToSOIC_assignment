const WebSocket = require("ws");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const winston = require("winston");
const User = require("./models/user");
const Event = require("./models/event");
const Trade = require("./models/trade");


const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: "websocket.log" })],
});


mongoose
  .connect("mongodb://127.0.0.1:27017/opinionTradingApp")
  .then(() => logger.info(" Connected to MongoDB"))
  .catch((error) => logger.error(` MongoDB Connection Error: ${error.message}`));

const clients = new Map();
const wss = new WebSocket.Server({ port: 8080 });
logger.info("WebSocket server running on ws://localhost:8080");


const JWT_SECRET = "your_jwt_secret"; 

const authenticate = async (token) => {
  try {
    if (!token) return { success: false, error: "No token provided" };
    const decoded = jwt.verify(token, JWT_SECRET);
  
    const user = await User.findById(decoded.userId);
  
    if (!user || user.role!=='admin') return { success: false, error: "Invalid user" };

    return { success: true, user };
  } catch (error) {
    return { success: false, error: "Invalid or expired token" };
  }
};


const broadcast = (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};


wss.on("connection", (ws) => {
  logger.info(" New client connected");

  ws.send(JSON.stringify({ message: "Welcome to the WebSocket server! Please authenticate." }));

  ws.on("message", async (message) => {
    try {
      const { token, type } = JSON.parse(message);
      const auth = await authenticate(token);

      if (!auth.success) {
        ws.send(JSON.stringify({ error: auth.error }));
        logger.warn(`Authentication failed: ${auth.error}`);
        return;
      }

      const { user } = auth;
      logger.info(`User '${user.username}' connected via WebSocket`);

      if (type === "subscribe_events") {
        const events = await Event.find({});
        ws.send(JSON.stringify({ type: "events_data", data: events }));
        logger.info(" Sent events data");
      } 

      else if (type === "subscribe_trades") {
        const trades = await Trade.find({}).populate("event user");
        ws.send(JSON.stringify({ type: "trades_data", data: trades }));
        logger.info(" Sent trades data");
      }
      

      else {
        ws.send(JSON.stringify({ error: "Invalid request type" }));
        logger.warn(` Invalid request type from '${user.username}'`);
      }
    } catch (error) {
      ws.send(JSON.stringify({ error: "Invalid request" }));
      logger.error(` Error processing message: ${error.message}`);
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
    logger.info("Client disconnected");
  });
});
const broadcastToAuthenticatedUsers = async () => {
    try {
      const updatedEvents = await Event.find({});
      const updatedTrades = await Trade.find({}).populate("event user");
  
      clients.forEach((user, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "events_update", data: updatedEvents }));
          ws.send(JSON.stringify({ type: "trades_update", data: updatedTrades }));
        }
      });
  
      logger.info("Broadcasted events & trades updates to authenticated users");
    } catch (error) {
      logger.error(`Error fetching updates: ${error.message}`);
    }
  };
  
 
  setInterval(broadcastToAuthenticatedUsers, 1000);
  
  logger.info(" WebSocket Live Updates Enabled for Authenticated Users (5s)");

