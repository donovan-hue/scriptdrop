const jwt = require('jsonwebtoken');
const Web3User = require('../models/Web3User');

/**
 * Web3 Auth middleware - Verify JWT token and load Web3User
 * Similar to protect middleware but for Web3 authenticated users
 */
const web3Protect = async (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // No token provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route - no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if this is a Web3 user
    if (!decoded.verified) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - not a verified Web3 user'
      });
    }

    // Load Web3User
    const web3User = await Web3User.findById(decoded.id);

    if (!web3User) {
      return res.status(401).json({
        success: false,
        message: 'Web3 user not found'
      });
    }

    // Check if user is verified
    if (!web3User.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Web3 user is not verified'
      });
    }

    // Attach user to request
    req.user = {
      id: web3User._id,
      walletAddress: web3User.walletAddress,
      web3User: web3User
    };

    next();
  } catch (error) {
    console.error('Web3 auth error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

/**
 * Verify wallet signature middleware
 * Validates that a provided signature matches the wallet address
 */
const verifyWalletSignature = async (req, res, next) => {
  try {
    const { walletAddress, signature, message } = req.body;

    if (!walletAddress || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: walletAddress, signature, message'
      });
    }

    const { ethers } = require('ethers');

    // Recover address from signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Signature verification failed'
      });
    }

    // Attach verified data to request
    req.verifiedWallet = {
      address: recoveredAddress.toLowerCase(),
      message,
      signature
    };

    next();
  } catch (error) {
    console.error('Wallet signature verification error:', error.message);
    res.status(400).json({
      success: false,
      message: 'Invalid signature or message format'
    });
  }
};

/**
 * Check if wallet exists middleware
 */
const checkWalletExists = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    const web3User = await Web3User.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    if (!web3User) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    req.web3User = web3User;
    next();
  } catch (error) {
    console.error('Check wallet exists error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error checking wallet'
    });
  }
};

/**
 * Validate wallet address format middleware
 */
const validateWalletAddress = (req, res, next) => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      message: 'Wallet address is required'
    });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid wallet address format. Must be a valid Ethereum address (0x...)'
    });
  }

  next();
};

module.exports = {
  web3Protect,
  verifyWalletSignature,
  checkWalletExists,
  validateWalletAddress
};
