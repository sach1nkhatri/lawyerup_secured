const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Generate MFA token for TOTP verification step
// This token is short-lived and used only during MFA verification flow
const generateMfaToken = (userId) => {
  if (!process.env.MFA_JWT_SECRET) {
    throw new Error('MFA_JWT_SECRET is not configured');
  }
  return jwt.sign(
    { 
      sub: userId, 
      purpose: 'mfa' 
    }, 
    process.env.MFA_JWT_SECRET, 
    {
      expiresIn: '5m' // 5 minutes expiry
    }
  );
};

module.exports = generateToken;
module.exports.generateMfaToken = generateMfaToken;
