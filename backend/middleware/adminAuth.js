const jwt=require('jsonwebtoken');

const JWT_SECRET = "your_jwt_secret";
const adminAuth=async(req,res,next)=>{
    try{
        const token=req.header("Authorization");
        if(!token)return res.status(401).json({
            message:"Access Denied"
        });
        const decoded=jwt.verify(token,JWT_SECRET);
        
        if( decoded.role!=='admin'){
            return res.status(403).json({message:"Forbidden : Admin only"})
        }
        next()
    }catch(e){
        res.status(500).json({message:"server error"})
    }
}
module.exports=adminAuth;