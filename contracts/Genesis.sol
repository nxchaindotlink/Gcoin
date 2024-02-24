// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Genesis is ERC20 {
    uint16 public constant priceQuota = 1;
    uint16 public constant paymentFeeHolders = 1;
    string public constant segment = "Investimentos";
    IERC20 public usdtAddress;
    address public owner;
    uint32 public timeLock = 30 * 24 * 60 * 60;
    uint32 public constant existenceProtocol = 9000 * 24 * 60 * 60;

    mapping(address => uint256) public timeLockPer;
    mapping(address => uint256) public farming;
    mapping(address => uint256) public lastTimeDeposit;
    mapping(IERC20 => uint256) public reserve;

    event Deposit(address _owner, uint reserveMoreAmount, uint timeStamp);
    event Withdraw(address _owner, uint reserveLessAmount, uint timeStamp);

    constructor(address _usdtAddress) ERC20("Plural Coin Genesis", "PLG") {
        _mint(msg.sender, 13_604_500 * 10 ** decimals());
        owner = msg.sender;
        usdtAddress = IERC20(_usdtAddress);
    }

    function addYield(uint amount) external {
        require(balanceOf(msg.sender) >= amount, "You need balance for this");
        require(amount > 0, "amount require > 0");
        timeLockPer[msg.sender] = block.timestamp;
        farming[msg.sender] += amount;
        _transfer(msg.sender, address(this), amount );
    }

    function removeYield(uint amount) external {
        require(
            farming[msg.sender] >= amount,
            "You don't have tokens farmings for rewards"
        );
        require(
            block.timestamp >= timeLockPer[msg.sender] + timeLock,
            "Time lock not expired"
        );
        timeLockPer[msg.sender] = block.timestamp;
        farming[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
    }

    function getTxPerTime(uint amount) external {
        require(
            farming[msg.sender] >= amount,
            "You don't have tokens staked for rewards"
        );
         require(
           block.timestamp >= timeLockPer[msg.sender] + timeLock,
           "Reward claiming period has not passed yet"
         );
        require(
            amount <= usdtAddress.balanceOf(address(this)),
            "this contract dont have balance"
        );
        uint elapsedTimeInSeconds = block.timestamp - timeLockPer[msg.sender];
        uint elapsedTimeInMonths = elapsedTimeInSeconds / (30 * 24 * 60 * 60);
        uint totalAmount = elapsedTimeInMonths;
        uint reward = ((amount * 1 / 10) / 100)* totalAmount;
        usdtAddress.transfer(msg.sender, reward);
        reserve[usdtAddress] -= reward;
        timeLockPer[msg.sender] = block.timestamp;
    }

    function deposit(uint amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdtAddress.allowance(msg.sender, address(this)) >= amount,
            "You need to approve this contract to transfer the specified amount of USDT"
        );
        usdtAddress.transferFrom(msg.sender, address(this), amount);
        reserve[usdtAddress] += amount;
        lastTimeDeposit[msg.sender] = block.timestamp;
        emit Deposit(msg.sender, amount, block.timestamp);
    }

    function withdraw(uint amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(
            usdtAddress.balanceOf(address(this)) >= amount,
            "Insufficient balance in the contract"
        );
        usdtAddress.transfer(owner, amount);
        reserve[usdtAddress] -= amount;
        emit Withdraw(msg.sender, amount, block.timestamp);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function defineOwner(address _address) external onlyOwner {
        owner = _address;
    }

    function defineMethodPayment(address _address) onlyOwner external{
        usdtAddress = IERC20(_address);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner permission this function");
        _;
    }
}
