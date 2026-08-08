const jwt = require('jsonwebtoken');

module.exports = async (req, res, next)=>{
    try{
            const token = req.headers.authorization;
            if(!token) return res.status(401).json({message: 'Login First!'});
            const Token = token.split(' ')[1];
            const decoded = jwt.verify(Token, process.env.JWT_SECRET);
            req.userId = decoded.id;
            next();
     }

    catch(e){
                res.status(401).json({message: 'Not authorized: Login First!!'});
            }
}