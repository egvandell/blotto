// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "./BlottoToken.sol";

import '@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol';
import '@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol';
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

import "hardhat/console.sol";


contract Blotto is VRFConsumerBaseV2, Pausable, Ownable, ReentrancyGuard, AutomationCompatibleInterface {
    // need to add logic so only the DAO can change these via multisig wallat
    address public s_charityAddress;                     // Current Charity Address, needs to be locked down
    address public s_daoAddress;                         // BlottoDAO address


//    mapping(uint16 => address) public BlottoWinners;    // lottery_id to winner address
    BlottoToken public blotToken;                       // $BLOT
    bool public s_lotteryStateOpen;                     // Blotto state

    uint16 private s_lottery_id;                        // current lottery id, defaults to 0
    address private s_lastWinner;                       // last winner

    address[] private s_ticketAddresses;                // each index is an individual ticket

    uint256 public immutable i_interval;
    uint256 public s_lastTimeStamp;
    VRFCoordinatorV2Interface public immutable i_vrfCoordinatorV2;
    bytes32 public immutable i_gasLane;
    uint64 public immutable i_subscription_id;
    uint32 public immutable i_callbackGasLimit;
    uint16 public constant REQUEST_CONFIRMATIONS = 3;
    uint32 public constant NUM_WORDS = 1;

    uint256 private s_randomWords;


    event GotTicket(uint16 indexed s_lottery_id, address indexed from, uint256 amount);
    event WinnerPicked(uint16 indexed s_lottery_id, address indexed winner);
    event TicketTransferred(uint16 indexed s_lottery_id, address indexed target, uint256 amount);
    event RequestedLotteryWinner(uint256 indexed requestId);

    constructor(address _tokenAddress,
        uint256 interval,
        address vrfCoordinatorV2,
        bytes32 gasLane, //keyhash - decide on how much gas
        uint64 subscription_id,
        uint32 callbackGasLimit,
        address CHARITY_ADDRESS,
        address DAO_ADDRESS
    ) VRFConsumerBaseV2(vrfCoordinatorV2) {
        blotToken = BlottoToken(_tokenAddress);
        i_interval = interval;
        s_lastTimeStamp = block.timestamp;
        i_vrfCoordinatorV2 = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        i_gasLane = gasLane;
        i_subscription_id = subscription_id;
        i_callbackGasLimit = callbackGasLimit;
        s_charityAddress = CHARITY_ADDRESS;
        s_daoAddress = DAO_ADDRESS;
        require(address(_tokenAddress) != address(0),"Token Address cannot be address 0");  
        require(address(CHARITY_ADDRESS) != address(0),"Charity Address cannot be address 0");  
        require(address(DAO_ADDRESS) != address(0),"DAO Address cannot be address 0");  

        s_lotteryStateOpen = true;
    }

    /// @notice Transfer $BLOT token(s) from the sender to the contract for the current lottery
    /// @param tokenAmount Total number of tokens being passed
    function getTicket(uint256 tokenAmount) external payable {   
        require (tokenAmount > 0, "Not Enough Tokens Sent");
        require (blotToken.allowance(_msgSender(), address(this))>= tokenAmount, "Allowance Insufficient");
        require (blotToken.balanceOf(_msgSender())>= tokenAmount, "Insufficient Token Balance");
        require (s_lotteryStateOpen, "Lottery is not open");

        // capture the sender & # of tix n2 s_ticketAddresses
        for (uint256 i=0; i < tokenAmount; i++) s_ticketAddresses.push(_msgSender());

        // transfer token(s) from the sender to Blotto
        blotToken.transferFrom(_msgSender(), address(this), tokenAmount);

        emit GotTicket(s_lottery_id, _msgSender(), tokenAmount); 
    }

    function getUserTicketCount() external view returns (uint256 totalTickets){
        for (uint256 i=0; i < s_ticketAddresses.length; i++) 
            if (s_ticketAddresses[i] == _msgSender()) totalTickets++;
    }

    function checkUpkeepProxy(bytes 
        calldata checkData   ) public view returns (
        bool upkeepNeeded, 
        bytes memory /*performData*/
        )
    {
        bytes memory performData;
        (upkeepNeeded, performData) = checkUpkeep(checkData);
    }

    function checkUpkeep(bytes 
        calldata  /*checkData*/    ) public view override returns (
        bool upkeepNeeded, 
        bytes memory /*performData*/
        )
    {
        bool timePassed = (block.timestamp - s_lastTimeStamp) > i_interval;
        bool hasPlayers = s_ticketAddresses.length > 0;
        upkeepNeeded = (timePassed && s_lotteryStateOpen && hasPlayers);

//        return (upkeepNeeded, "0x0");
    }

    function performUpkeepProxy (bytes calldata performData ) external 
    {
        performUpkeep(performData);
    }
    
    function performUpkeep (bytes calldata /* performData */ ) public override
    {
        s_lotteryStateOpen = false;

        uint256 requestId = i_vrfCoordinatorV2.requestRandomWords(
            i_gasLane,
            i_subscription_id,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );

        emit RequestedLotteryWinner(requestId);
    }

    function fulfillRandomWordsProxy(uint256 requestId, uint256[] memory randomWords) external {
        fulfillRandomWords(requestId, randomWords);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        // make sure at least 1 ticket was acquired before proceeding
        s_randomWords = randomWords[0];
        require ((s_ticketAddresses.length > 0), "No Tickets Acquired");

        uint256 totalTickets = s_ticketAddresses.length;

        uint256 indexOfWinner = randomWords[0] % totalTickets;
        address winner = s_ticketAddresses[indexOfWinner];

        emit WinnerPicked(s_lottery_id, winner);

        uint256 winner_tokens;
        uint256 charity_tokens;
        uint256 dao_tokens;

        // transfer tokens: 50% to winner, 45% to charity, 5% to DAO
        if (totalTickets < 100)
            winner_tokens = totalTickets;
        else {
            winner_tokens = uint256(int256(int256(totalTickets) / int256(100)) * int256(50));
            charity_tokens = uint256(int256(int256(totalTickets) / int256(100)) * int256(45));
            dao_tokens = uint256((int256(totalTickets) - (int256(winner_tokens) + int256(charity_tokens))));
        }

        blotToken.transfer(winner, winner_tokens);

        emit TicketTransferred(s_lottery_id, winner, winner_tokens); 

        if (charity_tokens > 0) {
            blotToken.transfer(s_charityAddress, charity_tokens);
            blotToken.transfer(s_daoAddress, dao_tokens);

            emit TicketTransferred(s_lottery_id, s_charityAddress, charity_tokens); 
            emit TicketTransferred(s_lottery_id, s_daoAddress, dao_tokens); 
        }

        s_lastTimeStamp = block.timestamp;
        delete s_ticketAddresses;
        s_lottery_id++;
        s_lotteryStateOpen = true;
    }

    function getTokenAllowance() external view returns (uint256) {
        return blotToken.allowance(_msgSender(), address(this));
    }
 
    function getRandomWords() public view returns (uint256) {
        return s_randomWords;
    }

    function getBlotTokenAddress() public view returns (address) {
        return address(blotToken);
    }

    function getLotteryId() public view returns (uint16) {
        return s_lottery_id;
    }

    function getCharityAddress() public view returns (address) {
        return s_charityAddress;
    }

    function getDaoAddress() public view returns (address) {
        return s_daoAddress;
    }

    function getLastWinner() public view returns (address) {
        return s_lastWinner;
    }

    function getTokenBalanceSender() public view returns (uint256) {
        return blotToken.balanceOf(_msgSender());
    }

    function getTokenBalanceContract() public view returns (uint256) {
        return blotToken.balanceOf(address(this));
    }

    function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getLotteryState() public view returns (bool) {
        return s_lotteryStateOpen;
    }

    function getBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }


    receive() external payable {} // to support receiving ETH by default
    fallback() external payable {}
    function supportsInterface(bytes4 interfaceID) external pure { }
    function decimals() external pure { }
    function symbol() external pure { }
    function name() external pure { }
}
