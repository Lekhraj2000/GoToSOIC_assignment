const express=require('express');
const app=express();
const adminRoute=require('./routes/admin');
const userRoute=require('./routes/user');
const mongoose=require('mongoose');
const logger = require("./logger");
const cors=require('cors');
mongoose.connect("mongodb://127.0.0.1:27017/opinionTradingApp")
.then(() => logger.info("Connected to MongoDB"))
.catch((err) => logger.error("MongoDB connection error:", err));

app.use(cors());
app.use(express.json());

app.use('/api/admin',adminRoute);
app.use('/api',userRoute);

app.use((err,req,res)=>{
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ message: "Something went wrong!" });
})
app.listen(3000,()=>{
    console.log('listening at port 3000');
})



