const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const config = require("../config/db.config.js");


function generateToken(user) {
  return jwt.sign({ userId: user._id, userName: user.username }, config.secret_key, { expiresIn: '1d' });
}

// Function to hash a password
async function hashPassword(password) {
  const saltRounds = 10; // Number of salt rounds (cost factor)
  return await bcrypt.hash(password, saltRounds);
}

// Function to verify a password
async function verifyPassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

function authenticateToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const tokenValue = token.replace('Bearer ', '');

  jwt.verify(tokenValue, config.secret_key, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}

module.exports = { generateToken, hashPassword, verifyPassword, authenticateToken };
