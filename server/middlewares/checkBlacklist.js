const jwt = require('jsonwebtoken');
const redisClient = require('../redisClient');

const checkBlacklist = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token mancante' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ message: 'Token non valido' });
  }

  // Se il token ha un jti controlliamo (opzionale → se usi jti anche per accessToken)
  const jti = decoded.jti;
  if (jti) {
    const isBlacklisted = await redisClient.get(jti);
    if (isBlacklisted) {
      return res.status(401).json({ message: 'Token revocato' });
    }
  }

  // Salva il payload decoded nel req.user → utile per le rotte
  req.user = decoded;
  next();
};

module.exports = checkBlacklist;
