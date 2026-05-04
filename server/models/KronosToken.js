const mongoose = require('mongoose');

const kronosTokenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Kronos Token',
    },
    symbol: {
      type: String,
      default: 'KRO',
    },
    totalSupply: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('1000000'),
    },
    circulatingSupply: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    burnedSupply: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('0'),
    },
    contractAddress: {
      type: String,
      required: false,
      sparse: true,
    },
    network: {
      type: String,
      enum: ['sepolia', 'mainnet', 'testnet'],
      default: 'sepolia',
    },
    decimals: {
      type: Number,
      default: 18,
    },
    attentionRate: {
      type: Number,
      default: 1, // 1 KRO per minute
    },
    stakingAPY: {
      type: Map,
      of: Number,
      default: new Map([
        ['30', 5],
        ['60', 10],
        ['90', 15],
      ]),
    },
    dailyRewardPool: {
      type: mongoose.Types.Decimal128,
      default: mongoose.Types.Decimal128.fromString('1000'),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'kronos_tokens' }
);

kronosTokenSchema.index({ contractAddress: 1 });

module.exports = mongoose.model('KronosToken', kronosTokenSchema);
