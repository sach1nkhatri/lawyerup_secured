const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { generateMfaToken } = require('../utils/generateToken');
const {
  logLoginFailed,
  logLoginSuccess,
  logAccountLocked,
  logMfaVerifyFailed,
  logMfaVerifySuccess
} = require('../utils/securityLogger');
const {
  logMfaSetup,
  logPasswordChange
} = require('../utils/auditLogger');
const {
  validatePassword,
  PASSWORD_EXPIRY_DAYS,
  PASSWORD_ERRORS
} = require('../utils/passwordPolicy');
const { setAccessTokenCookie, clearAccessTokenCookie } = require('../utils/cookieHelpers');


exports.register = async (req, res) => {
  const {
    fullName,
    email,
    password,
    role = 'user', // default to 'user'
    contactNumber
  } = req.body;

  try {
    // Validate password against policy
    // Frontend implements password strength meter for better UX
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate password expiry date
    const passwordExpiresAt = PASSWORD_EXPIRY_DAYS 
      ? new Date(Date.now() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role,
      contactNumber,
      passwordChangedAt: Date.now(),
      passwordExpiresAt,
      passwordHistory: [] // No history for new users
    });

    // Prepare user object without password
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      plan: newUser.plan || 'Free Trial',
      contactNumber: newUser.contactNumber
    };

    // Set access token as httpOnly cookie (more secure than returning in body)
    // Security: httpOnly cookies prevent XSS attacks from stealing tokens
    const accessToken = generateToken(newUser._id);
    setAccessTokenCookie(res, accessToken);

    res.status(201).json({
      user: userResponse
      // Token no longer returned in body for security (stored in httpOnly cookie)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // Get client IP address for security logging
  // Prefer X-Forwarded-For header if behind proxy, otherwise use connection IP
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.connection.remoteAddress 
    || req.ip 
    || 'unknown';
  
  // Get user agent for audit logging
  // Forensic: Helps identify device/browser and detect anomalies
  const userAgent = req.headers['user-agent'] || null;

  try {
    const user = await User.findOne({ email }).select('+password');
    
    // Security: Don't reveal if user exists or not to prevent enumeration
    // Return same error message for both cases
    if (!user) {
      await logLoginFailed(email || 'unknown', clientIp, userAgent, 'user_not_found');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Brute-force protection: Check if account is locked
    // This prevents login attempts even if password is correct
    if (user.isLocked()) {
      const lockUntil = user.lockUntil;
      const minutesRemaining = Math.ceil((lockUntil - Date.now()) / (1000 * 60));
      
      await logAccountLocked(
        user._id.toString(),
        user.role,
        user.email,
        clientIp,
        userAgent,
        user.failedLoginAttempts,
        lockUntil
      );
      
      return res.status(423).json({
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
        lockUntil: lockUntil.toISOString(),
        retryAfter: minutesRemaining
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      // Register failed login attempt
      // Default: lock after 5 failed attempts for 30 minutes
      await user.registerFailedLogin(5, 30);
      
      // Reload user from database to get updated lock status
      const updatedUser = await User.findById(user._id);
      
      // Log security event
      await logLoginFailed(user.email, clientIp, userAgent, 'invalid_password');
      
      // Check if account was just locked
      if (updatedUser.isLocked()) {
        const lockUntil = updatedUser.lockUntil;
        const minutesRemaining = Math.ceil((lockUntil - Date.now()) / (1000 * 60));
        
        await logAccountLocked(
          updatedUser._id.toString(),
          updatedUser.role,
          updatedUser.email,
          clientIp,
          userAgent,
          updatedUser.failedLoginAttempts,
          lockUntil
        );
        
        return res.status(423).json({
          message: `Account has been temporarily locked due to multiple failed login attempts. Please try again in ${minutesRemaining} minute(s).`,
          lockUntil: lockUntil.toISOString(),
          retryAfter: minutesRemaining
        });
      }
      
      // Return generic error message (don't reveal if account is close to lockout)
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Successful login: Reset failed login attempts
    // This clears the lock if it exists and resets the counter
    await user.resetLoginAttempts();
    
    // Log successful login
    await logLoginSuccess(user._id.toString(), user.role, user.email, clientIp, userAgent, user.mfaEnabled);
    
    // Check if password has expired
    if (user.isPasswordExpired()) {
      return res.status(403).json({
        message: PASSWORD_ERRORS.EXPIRED_PASSWORD,
        passwordExpired: true,
        requiresPasswordChange: true
      });
    }
    
    // Check if MFA is enabled for this user
    if (user.mfaEnabled) {
      // Return MFA token instead of access token
      const mfaToken = generateMfaToken(user._id);
      return res.json({
        mfaRequired: true,
        mfaToken,
        userId: user._id,
        email: user.email,
        passwordExpiresAt: user.passwordExpiresAt // Include expiry info
      });
    }
    
    // Normal login flow for users without MFA
    // Set access token as httpOnly cookie (more secure than returning in body)
    // Security: httpOnly cookies prevent XSS attacks from stealing tokens
    const accessToken = generateToken(user._id);
    setAccessTokenCookie(res, accessToken);
    
    res.json({
      user,
      // Token no longer returned in body for security (stored in httpOnly cookie)
      // Frontend should rely on cookie for subsequent requests
      passwordExpiresAt: user.passwordExpiresAt // Include expiry info for frontend
    });
  } catch (err) {
    console.error('[Login Error]', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};


exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) return res.status(404).json({ message: 'Admin not found or unauthorized' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    // Set access token as httpOnly cookie (more secure than returning in body)
    // Security: httpOnly cookies prevent XSS attacks from stealing tokens
    const accessToken = generateToken(user._id);
    setAccessTokenCookie(res, accessToken);

    res.json({
      user
      // Token no longer returned in body for security (stored in httpOnly cookie)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





exports.updateProfile = async (req, res) => {
  const { name, contactNumber, city, state, address } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update only fields provided
    if (name) user.fullName = name;
    if (contactNumber) user.contactNumber = contactNumber;
    if (city) user.city = city;
    if (state) user.state = state;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.registerAdmin = async (req, res) => {
  const { fullName, email, password, secretKey } = req.body;

  //  Hardcoded keys to bypass dotenv issue
  const adminKeys = ['key1234567', 'keyMegaAdmin', 'admin999', 'topSecret666'];

  console.log('[🧪 Admin Register] Key:', secretKey);
  console.log('[🔐 Allowed Keys]:', adminKeys);

  if (!secretKey || !adminKeys.includes(secretKey.trim())) {
    return res.status(401).json({ message: ' Invalid Admin Secret Key' });
  }

  try {
    // Validate password against policy (admins must also follow password policy)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: 'Password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Calculate password expiry date
    const passwordExpiresAt = PASSWORD_EXPIRY_DAYS 
      ? new Date(Date.now() + PASSWORD_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
      : null;

    const newAdmin = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'admin',
      contactNumber: 'N/A',
      passwordChangedAt: Date.now(),
      passwordExpiresAt,
      passwordHistory: [] // No history for new users
    });

    // Set access token as httpOnly cookie (more secure than returning in body)
    // Security: httpOnly cookies prevent XSS attacks from stealing tokens
    const token = generateToken(newAdmin._id);
    setAccessTokenCookie(res, token);

    res.status(201).json({
      message: 'Admin registered successfully',
      user: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
        role: newAdmin.role
      }
      // Token no longer returned in body for security (stored in httpOnly cookie)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    console.error('[Get All Users Error]', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const allowedStatuses = ['verified', 'hold', 'disable'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User status updated to '${status}'`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==================== MFA (Multi-Factor Authentication) Functions ====================

/**
 * POST /api/auth/mfa/setup
 * Generate TOTP secret and QR code for MFA setup
 * Requires authentication
 */
exports.mfaSetup = async (req, res) => {
  // Get client IP and user agent for audit logging
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.connection.remoteAddress 
    || req.ip 
    || 'unknown';
  const userAgent = req.headers['user-agent'] || null;

  try {
    const user = await User.findById(req.user.id).select('+mfaTempSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If MFA is already enabled, return error
    if (user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is already enabled for this account' });
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `LawyerUp Secure (${user.email})`,
      issuer: 'LawyerUp'
    });

    // Save temporary secret (will be confirmed later)
    user.mfaTempSecret = secret.base32;
    await user.save();

    // Log MFA setup event
    await logMfaSetup(user._id.toString(), user.role, clientIp, userAgent);

    // Generate QR code data URL
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    res.json({
      otpauth_url: secret.otpauth_url,
      qrCodeDataUrl,
      secret: secret.base32 // Return for manual entry (optional)
    });
  } catch (err) {
    console.error('[MFA Setup Error]', err);
    res.status(500).json({ message: 'Failed to setup MFA', error: err.message });
  }
};

/**
 * POST /api/auth/mfa/confirm
 * Confirm MFA setup by verifying TOTP code
 * Requires authentication
 */
exports.mfaConfirm = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ message: 'TOTP code is required' });
  }

  try {
    const user = await User.findById(req.user.id).select('+mfaTempSecret');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.mfaTempSecret) {
      return res.status(400).json({ message: 'No pending MFA setup found. Please run /mfa/setup first' });
    }

    // Verify TOTP code against temporary secret
    const verified = speakeasy.totp.verify({
      secret: user.mfaTempSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps (60 seconds) tolerance
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid TOTP code' });
    }

    // Generate recovery codes (8 codes, 8 characters each)
    const recoveryCodes = [];
    const recoveryCodeHashes = [];
    
    for (let i = 0; i < 8; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      recoveryCodes.push(code);
      // Hash recovery code using SHA256
      const hash = crypto.createHash('sha256').update(code).digest('hex');
      recoveryCodeHashes.push(hash);
    }

    // Enable MFA: move temp secret to permanent secret
    user.mfaEnabled = true;
    user.mfaSecret = user.mfaTempSecret;
    user.mfaTempSecret = null;
    user.mfaRecoveryCodes = recoveryCodeHashes;
    await user.save();

    // Get client IP and user agent for audit logging
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.connection.remoteAddress 
      || req.ip 
      || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    // Log MFA confirmation event
    await logMfaSetup(user._id.toString(), user.role, clientIp, userAgent);

    // Return recovery codes ONCE (only at confirmation)
    res.json({
      message: 'MFA enabled successfully',
      recoveryCodes, // Store these securely - shown only once!
      warning: 'Save these recovery codes in a safe place. They will not be shown again.'
    });
  } catch (err) {
    console.error('[MFA Confirm Error]', err);
    res.status(500).json({ message: 'Failed to confirm MFA', error: err.message });
  }
};

/**
 * POST /api/auth/mfa/verify
 * Verify MFA code or recovery code after login
 * Does NOT require normal auth; uses mfaToken instead
 * 
 * Security: Rate limiting is applied at route level to prevent brute-force attacks
 */
exports.mfaVerify = async (req, res) => {
  const { mfaToken, code, recoveryCode } = req.body;

  // Get client IP address for security logging
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
    || req.connection.remoteAddress 
    || req.ip 
    || 'unknown';
  
  // Get user agent for audit logging
  const userAgent = req.headers['user-agent'] || null;

  if (!mfaToken) {
    return res.status(400).json({ message: 'mfaToken is required' });
  }

  if (!code && !recoveryCode) {
    return res.status(400).json({ message: 'Either code or recoveryCode is required' });
  }

  try {
    // Verify MFA token
    if (!process.env.MFA_JWT_SECRET) {
      return res.status(500).json({ message: 'MFA configuration error' });
    }

    const decoded = jwt.verify(mfaToken, process.env.MFA_JWT_SECRET);
    
    if (decoded.purpose !== 'mfa') {
      return res.status(400).json({ message: 'Invalid token purpose' });
    }

    const user = await User.findById(decoded.sub).select('+mfaSecret +mfaRecoveryCodes');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is not enabled for this user' });
    }

    let verified = false;
    let verificationMethod = 'unknown';

    // Verify TOTP code
    if (code) {
      verificationMethod = 'totp';
      verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });
    }
    // Verify recovery code
    else if (recoveryCode) {
      verificationMethod = 'recovery_code';
      const recoveryCodeHash = crypto.createHash('sha256').update(recoveryCode.toUpperCase()).digest('hex');
      const codeIndex = user.mfaRecoveryCodes.findIndex(hash => hash === recoveryCodeHash);
      
      if (codeIndex !== -1) {
        verified = true;
        // Remove used recovery code (one-time use)
        user.mfaRecoveryCodes.splice(codeIndex, 1);
        await user.save();
      }
    }

    if (!verified) {
      // Log failed MFA verification attempt
      const reason = verificationMethod === 'totp' ? 'invalid_totp' : 'invalid_recovery_code';
      await logMfaVerifyFailed(
        user._id.toString(),
        user.role,
        user.email,
        clientIp,
        userAgent,
        reason
      );
      
      return res.status(401).json({ message: 'Invalid MFA code or recovery code' });
    }

    // Log successful MFA verification
    await logMfaVerifySuccess(
      user._id.toString(),
      user.role,
      user.email,
      clientIp,
      userAgent,
      verificationMethod
    );

    // Generate access token and set as httpOnly cookie
    // Security: httpOnly cookies prevent XSS attacks from stealing tokens
    // Note: mfaToken remains in JSON body (temporary, short-lived) but final
    // access token is stored securely in httpOnly cookie
    const accessToken = generateToken(user._id);
    setAccessTokenCookie(res, accessToken);

    // Prepare safe user payload (without sensitive fields)
    const safeUserPayload = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      plan: user.plan,
      contactNumber: user.contactNumber
    };

    res.json({
      // Token no longer returned in body for security (stored in httpOnly cookie)
      // Frontend should rely on cookie for subsequent requests
      user: safeUserPayload
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'MFA token expired. Please login again' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid MFA token' });
    }
    console.error('[MFA Verify Error]', err);
    res.status(500).json({ message: 'Failed to verify MFA', error: err.message });
  }
};

/**
 * POST /api/auth/mfa/disable
 * Disable MFA for the authenticated user
 * Requires authentication, password, and either TOTP code OR recovery code
 */
exports.mfaDisable = async (req, res) => {
  const { password, code, recoveryCode } = req.body;

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (!code && !recoveryCode) {
    return res.status(400).json({ message: 'Either TOTP code or recovery code is required' });
  }

  try {
    const user = await User.findById(req.user.id).select('+password +mfaSecret +mfaRecoveryCodes');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.mfaEnabled) {
      return res.status(400).json({ message: 'MFA is not enabled for this account' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    let verified = false;

    // Verify TOTP code
    if (code) {
      verified = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: code,
        window: 2
      });
    }
    // Verify recovery code
    else if (recoveryCode) {
      const recoveryCodeHash = crypto.createHash('sha256').update(recoveryCode.toUpperCase()).digest('hex');
      const codeIndex = user.mfaRecoveryCodes.findIndex(hash => hash === recoveryCodeHash);
      
      if (codeIndex !== -1) {
        verified = true;
        // Remove used recovery code
        user.mfaRecoveryCodes.splice(codeIndex, 1);
      }
    }

    if (!verified) {
      return res.status(401).json({ message: 'Invalid TOTP code or recovery code' });
    }

    // Disable MFA
    user.mfaEnabled = false;
    user.mfaSecret = null;
    user.mfaTempSecret = null;
    user.mfaRecoveryCodes = [];
    await user.save();

    // TODO: Log audit event if audit log exists

    res.json({ message: 'MFA disabled successfully' });
  } catch (err) {
    console.error('[MFA Disable Error]', err);
    res.status(500).json({ message: 'Failed to disable MFA', error: err.message });
  }
};

/**
 * POST /api/auth/change-password
 * Change user password with password policy enforcement
 * Requires authentication
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ 
      message: 'Current password and new password are required' 
    });
  }

  try {
    // Load user with password and password history
    const user = await User.findById(req.user.id).select('+password +passwordHistory');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Validate new password against policy
    // TODO: Frontend should implement password strength meter for better UX
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        message: 'New password does not meet requirements',
        errors: passwordValidation.errors
      });
    }

    // Check if new password is the same as current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ 
        message: 'New password must be different from current password' 
      });
    }

    // Check if new password is reused (matches any password in history)
    const isReused = await user.isPasswordReused(newPassword, bcrypt.compare);
    if (isReused) {
      return res.status(400).json({
        message: PASSWORD_ERRORS.REUSED_PASSWORD
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password using helper method (maintains history and sets expiry)
    await user.updatePassword(
      hashedNewPassword,
      5, // Keep last 5 passwords in history
      PASSWORD_EXPIRY_DAYS // Set expiry date
    );

    // Get client IP and user agent for audit logging
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() 
      || req.connection.remoteAddress 
      || req.ip 
      || 'unknown';
    const userAgent = req.headers['user-agent'] || null;

    // Log password change event
    await logPasswordChange(user._id.toString(), user.role, clientIp, userAgent);

    res.json({ 
      message: 'Password changed successfully',
      passwordExpiresAt: user.passwordExpiresAt
    });
  } catch (err) {
    console.error('[Change Password Error]', err);
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
};

/**
 * POST /api/auth/logout
 * Logout user by clearing authentication cookies
 * Requires authentication
 * 
 * Security: Clears httpOnly cookie containing access token
 * This invalidates the session on the client side
 */
exports.logout = async (req, res) => {
  try {
    // Clear access token cookie
    // Security: This invalidates the session token stored in httpOnly cookie
    // The cookie is automatically removed by the browser
    clearAccessTokenCookie(res);

    // TODO: If using refresh tokens or session store, invalidate them here
    // Example: await Session.deleteOne({ userId: req.user.id });

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('[Logout Error]', err);
    res.status(500).json({ message: 'Failed to logout', error: err.message });
  }
};
