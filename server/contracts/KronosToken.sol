// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title KronosToken
 * @dev Kronos Token (KRO) - An ERC20 token for the attention economy
 * 1 KRO = 1 minute of attention
 * Features: Staking, Rewards Distribution, Burning
 */
contract KronosToken is ERC20, ERC20Burnable, Ownable {
  // Maximum supply: 1 million KRO
  uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

  // Staking rewards rate (APY percentage)
  mapping(uint256 => uint256) public stakingAPY;

  // User stakes
  struct Stake {
    uint256 amount;
    uint256 lockPeriod;
    uint256 startTime;
    bool claimed;
  }

  mapping(address => Stake[]) public stakes;

  // Events
  event StakeCreated(
    address indexed user,
    uint256 amount,
    uint256 lockPeriod,
    uint256 startTime
  );
  event RewardsClaimed(address indexed user, uint256 amount);
  event TokensMinted(address indexed to, uint256 amount);

  constructor() ERC20("Kronos Token", "KRO") {
    // Set APY for different lock periods (30, 60, 90 days)
    stakingAPY[30] = 5;
    stakingAPY[60] = 10;
    stakingAPY[90] = 15;

    // Mint initial supply
    _mint(msg.sender, 100_000 * 10**18);
  }

  /**
   * @dev Mint tokens (only owner - used for daily rewards distribution)
   */
  function mint(address to, uint256 amount) public onlyOwner {
    require(totalSupply() + amount <= MAX_SUPPLY, "Exceeds max supply");
    _mint(to, amount);
    emit TokensMinted(to, amount);
  }

  /**
   * @dev Create a stake
   */
  function createStake(uint256 amount, uint256 lockPeriodDays) public {
    require(balanceOf(msg.sender) >= amount, "Insufficient balance");
    require(
      lockPeriodDays == 30 || lockPeriodDays == 60 || lockPeriodDays == 90,
      "Invalid lock period"
    );

    // Transfer tokens to contract
    transferFrom(msg.sender, address(this), amount);

    // Create stake record
    Stake memory newStake = Stake({
      amount: amount,
      lockPeriod: lockPeriodDays,
      startTime: block.timestamp,
      claimed: false
    });

    stakes[msg.sender].push(newStake);

    emit StakeCreated(msg.sender, amount, lockPeriodDays, block.timestamp);
  }

  /**
   * @dev Calculate rewards for a stake
   */
  function calculateRewards(address user, uint256 stakeIndex)
    public
    view
    returns (uint256)
  {
    require(stakeIndex < stakes[user].length, "Invalid stake index");

    Stake memory stake = stakes[user][stakeIndex];
    require(!stake.claimed, "Stake already claimed");

    uint256 endTime = stake.startTime + (stake.lockPeriod * 1 days);
    require(block.timestamp >= endTime, "Lock period not completed");

    uint256 apy = stakingAPY[stake.lockPeriod];
    uint256 rewards = (stake.amount * apy * stake.lockPeriod) / 36500;

    return rewards;
  }

  /**
   * @dev Claim staking rewards
   */
  function claimRewards(uint256 stakeIndex) public {
    require(stakeIndex < stakes[msg.sender].length, "Invalid stake index");

    Stake storage stake = stakes[msg.sender][stakeIndex];
    require(!stake.claimed, "Already claimed");

    uint256 endTime = stake.startTime + (stake.lockPeriod * 1 days);
    require(block.timestamp >= endTime, "Lock period not completed");

    uint256 rewards = calculateRewards(msg.sender, stakeIndex);

    // Mark as claimed
    stake.claimed = true;

    // Transfer principal + rewards
    _mint(msg.sender, rewards);
    transfer(msg.sender, stake.amount);

    emit RewardsClaimed(msg.sender, rewards);
  }

  /**
   * @dev Get user's total staked amount
   */
  function getTotalStaked(address user) public view returns (uint256) {
    uint256 total = 0;
    for (uint256 i = 0; i < stakes[user].length; i++) {
      if (!stakes[user][i].claimed) {
        total += stakes[user][i].amount;
      }
    }
    return total;
  }

  /**
   * @dev Get number of stakes for user
   */
  function getStakeCount(address user) public view returns (uint256) {
    return stakes[user].length;
  }

  /**
   * @dev Override decimals to 18
   */
  function decimals() public pure override returns (uint8) {
    return 18;
  }
}
