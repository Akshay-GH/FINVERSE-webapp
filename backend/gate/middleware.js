
import dotenv from 'dotenv';
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

import jwt from 'jsonwebtoken';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization;
    if (!token || token.startsWith("Bearer ") === false) {
        return res.status(401).json({ error: 'No token provided' });
    }
    const actualToken = token.split(" ")[1];

    try {
        const verifyToken = jwt.verify(actualToken, SECRET_KEY);
        if (!verifyToken) {
            return res.status(401).json({ error: 'Invalid token' });
        }

   req.userId = verifyToken.userId;
   next();
} catch (error) {
   return res.status(403).json({ error: 'Unauthorized' });
}
    
}

export { authMiddleware };