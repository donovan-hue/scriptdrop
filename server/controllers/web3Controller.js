const Web3User = require('../models/Web3User');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');

/**
 * Initialize Web3 login - Generate nonce for signature challenge
 * POST /api/web3/login/initialize
 */
exports.initializeLogin = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Validate wallet address format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet address format'
      });
    }

    const lowerAddress = walletAddress.toLowerCase();

    // Find or create Web3User
    let web3User = await Web3User.findOne({ walletAddress: lowerAddress });

    if (!web3User) {
      web3User = new Web3User({
        walletAddress: lowerAddress,
        metadata: {
          userAgent: req.get('user-agent'),
          ipAddress: req.ip
        }
      });
    }

    // Generate nonce
    const nonce = web3User.generateNonce();
    await web3User.save();

    res.status(200).json({
      success: true,
      data: {
        walletAddress: lowerAddress,
        nonce,
        message: `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}`,
        expiresIn: 5 * 60 * 1000 // 5 minutes in milliseconds
      }
    });
  } catch (error) {
    console.error('Initialize login error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error initializing login'
    });
  }
};

/**
 * Verify signature and create session
 * POST /api/web3/login/verify
 */
exports.verifySignature = async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;

    // Validate inputs
    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: walletAddress, signature, nonce'
      });
    }

    const lowerAddress = walletAddress.toLowerCase();

    // Find Web3User
    const web3User = await Web3User.findOne({ walletAddress: lowerAddress });

    if (!web3User) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found. Please initialize login first.'
      });
    }

    // Check nonce expiration
    if (web3User.isNonceExpired()) {
      return res.status(400).json({
        success: false,
        message: 'Nonce has expired. Please initialize login again.'
      });
    }

    // Check nonce match
    if (web3User.nonce !== nonce) {
      web3User.incrementFailedAttempts();
      await web3User.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid nonce'
      });
    }

    // Verify signature
    try {
      const message = `Sign this message to verify your wallet ownership.\n\nNonce: ${nonce}`;
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== lowerAddress) {
        web3User.incrementFailedAttempts();
        await web3User.save();
        return res.status(400).json({
          success: false,
          message: 'Signature verification failed'
        });
      }
    } catch (error) {
      web3User.incrementFailedAttempts();
      await web3User.save();
      return res.status(400).json({
        success: false,
        message: 'Invalid signature format'
      });
    }

    // Signature verified - update user
    web3User.isVerified = true;
    web3User.lastLoginAt = new Date();
    web3User.resetFailedAttempts();
    web3User.signatureCount += 1;

    await web3User.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: web3User._id,
        walletAddress: lowerAddress,
        verified: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: web3User._id,
          walletAddress: web3User.walletAddress,
          ens: web3User.ens,
          isVerified: web3User.isVerified,
          chainId: web3User.chainId,
          balance: web3User.balance,
          networkName: web3User.networkName
        }
      }
    });
  } catch (error) {
    console.error('Verify signature error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error verifying signature'
    });
  }
};

/**
 * Login with wallet (simplified - used after verification)
 * POST /api/web3/login
 */
exports.loginWithWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address is required'
      });
    }

    const lowerAddress = walletAddress.toLowerCase();
    const web3User = await Web3User.findOne({ walletAddress: lowerAddress }).populate('linkedUser');

    if (!web3User) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (!web3User.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Wallet is not verified. Please complete verification first.'
      });
    }

    // Update last login
    web3User.lastLoginAt = new Date();
    await web3User.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: web3User._id,
        walletAddress: lowerAddress,
        verified: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: web3User._id,
          walletAddress: web3User.walletAddress,
          ens: web3User.ens,
          isVerified: web3User.isVerified,
          chainId: web3User.chainId,
          balance: web3User.balance,
          networkName: web3User.networkName,
          linkedUser: web3User.linkedUser
        }
      }
    });
  } catch (error) {
    console.error('Login with wallet error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in with wallet'
    });
  }
};

/**
 * Get user wallet profile
 * GET /api/web3/profile
 */
exports.getUserWallet = async (req, res) => {
  try {
    const web3User = await Web3User.findById(req.user.id).populate('linkedUser', 'username email firstName lastName avatar');

    if (!web3User) {
      return res.status(404).json({
        success: false,
        message: 'Wallet profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: web3User._id,
        walletAddress: web3User.walletAddress,
        ens: web3User.ens,
        isVerified: web3User.isVerified,
        chainId: web3User.chainId,
        balance: web3User.balance,
        networkName: web3User.networkName,
        lastLoginAt: web3User.lastLoginAt,
        signatureCount: web3User.signatureCount,
        linkedUser: web3User.linkedUser,
        createdAt: web3User.createdAt,
        updatedAt: web3User.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user wallet error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching wallet profile'
    });
  }
};

/**
 * Update wallet balance and network info
 * POST /api/web3/update-balance
 */
exports.updateWalletBalance = async (req, res) => {
  try {
    const { balance, chainId, networkName } = req.body;

    if (!balance || chainId === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Balance and chainId are required'
      });
    }

    const web3User = await Web3User.findByIdAndUpdate(
      req.user.id,
      {
        balance: balance.toString(),
        chainId,
        networkName: networkName || 'ethereum'
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: web3User
    });
  } catch (error) {
    console.error('Update wallet balance error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating wallet balance'
    });
  }
};

/**
 * Update ENS name
 * POST /api/web3/update-ens
 */
exports.updateENS = async (req, res) => {
  try {
    const { ens } = req.body;

    if (!ens) {
      return res.status(400).json({
        success: false,
        message: 'ENS name is required'
      });
    }

    const web3User = await Web3User.findByIdAndUpdate(
      req.user.id,
      { ens },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: web3User
    });
  } catch (error) {
    console.error('Update ENS error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating ENS'
    });
  }
};

/**
 * Logout (optional - can be used to invalidate tokens on server side)
 * POST /api/web3/logout
 */
exports.logout = async (req, res) => {
  try {
    // In a real application, you might want to add token to a blacklist
    // or invalidate sessions here
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging out'
    });
  }
};
