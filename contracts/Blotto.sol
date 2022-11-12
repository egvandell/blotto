// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';

import "hardhat/console.sol";

error Lottery_NotEnoughTokensSent();
error Lottery_NeedMoreTokensInsufficientBalance();
error Lottery_LotteryNotOpen();

interface Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (uint256);    
    function approve(address spender, uint256 amount) external returns (bool);
}

contract Blotto is VRFConsumerBaseV2, Pausable, Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    address[] private s_ticketAddresses;

    struct TicketInfo {
        uint16 lottery_id;
        uint256 totalTokens;
    }

    Token public blotToken;
    bool public s_lotteryStateOpen;
    uint16 public s_lottery_id;

    address constant public CHARITY_ADDRESS_HERE = 0x0000000000000000000000000000000000000000;
    address constant public DAO_ADDRESS_HERE = 0x0000000000000000000000000000000000000000;

    mapping(uint16 => mapping(address => TicketInfo)) private s_ticketInfos;
    mapping(uint16 => uint256) private s_ticketsBought;

//    mapping(address => uint256) public addressToken;

    event BoughtTicket(uint16 indexed s_lottery_id, address indexed from, uint256 amount);
    event WinnerPicked(uint16 indexed s_lottery_id, address indexed winner);

    uint256 public immutable i_entryMinimum;
    uint256 public immutable i_interval;
    VRFCoordinatorV2Interface public immutable i_vrfCoordinatorV2;
    bytes32 public immutable i_gasLane;
    uint64 public immutable i_subscription_id;
    uint32 public immutable i_callbackGasLimit;

    constructor(Token _tokenAddress,
        uint256 entryMinimum,
        uint256 interval,
        address vrfCoordinatorV2,
        bytes32 gasLane, //keyhash - decide on how much gas
        uint64 subscription_id,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        i_entryMinimum = entryMinimum;
        i_interval = interval;
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscription_id = subscription_id;
        i_callbackGasLimit = callbackGasLimit;
        require(address(_tokenAddress) != address(0),"Token Address cannot be address 0");                
        blotToken = _tokenAddress;
        s_lotteryStateOpen = true;
    }

    function buyTicket(uint256 tokenAmount) external payable whenNotPaused {   
        console.log("entered butTicket");


        if (tokenAmount == 0) { revert Lottery_NotEnoughTokensSent(); }
        if (blotToken.balanceOf(_msgSender()) <= tokenAmount) { revert Lottery_NeedMoreTokensInsufficientBalance(); }
        if (!s_lotteryStateOpen) { revert Lottery_LotteryNotOpen(); }

/*
        payable _to = address(this);
        require (blotToken.approve (_to, tokenAmount), "approve 1 failed");
        (bool success, ) =  _to.call{value: msg.value}(""); // Supposed to call transferFrom
        require (success, "Success Was not true1");
        require (blotToken.approve (_to, 0), "approve 2 failed"); // Wipe out any unspent allowance
*/
        console.log("before approve");
//        blotToken.approve(address(this), tokenAmount);
        console.log("aft approve");
//        blotToken.transferFrom(_msgSender(), address(this), tokenAmount);



        for (uint256 i=0; i < tokenAmount; i++) s_ticketAddresses.push(_msgSender());




//        s_ticketInfos[s_lottery_id][_msgSender()].totalTokens += tokenAmount;
//        s_ticketsBought[s_lottery_id] += tokenAmount;

        emit BoughtTicket(s_lottery_id, _msgSender(), tokenAmount);
    }

    function Tester(uint256 testint) external view {
        console.log("entered Tester with testint = %s", testint);

    }

    function PayableTester(uint256 testint) external payable {
        console.log("entered PayableTester with msg.value = %s and testint = %s", msg.value, testint);

    }

    function fulfillRandomWords(uint256 /*requestId*/, uint256[] memory randomWords) internal override {
// add a require / revert to make sure at least 1 ticket was purchased

//        address[] memory tokenAddressTickets;

//        for (uint i=0; i<s_ticketInfos[s_lottery_id].length; i++) 
//        {
//            for (uint j=0; j<s_ticketInfos[s_lottery_id][i].totalTokens; j++)
//                tokenAddressTickets.push = s_ticketInfos[s_lottery_id][i];
//        }
        uint256 totalTickets = s_ticketAddresses.length;

        uint256 indexOfWinner = randomWords[0] % s_ticketAddresses.length;
        address winner = s_ticketAddresses[indexOfWinner];

        // transfer tokens: 80% to winner, 19% to charity, 1% to DAO
        uint256 winner_tokens = totalTickets.div(100).mul(80);
        uint256 charity_tokens = totalTickets.div(100).mul(190);
        uint256 dao_tokens = totalTickets.sub(winner_tokens).sub(charity_tokens);        

        s_lotteryStateOpen = true;

//        s_ticketAddresses = new address[];

//        s_lastTimeStamp = block.timestamp;
        blotToken.transferFrom(address(this), winner, winner_tokens);
        blotToken.transferFrom(address(this), CHARITY_ADDRESS_HERE, charity_tokens);
        blotToken.transferFrom(address(this), DAO_ADDRESS_HERE, dao_tokens);

        emit WinnerPicked(s_lottery_id, winner);
    }

     // Add the `receive()` special function
    receive() external payable { }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}