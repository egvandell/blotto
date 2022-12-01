// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BlottoToken.sol";
import "hardhat/console.sol";


contract Blotto2 is Ownable {
    address[] private s_ticketAddresses;

    struct TicketInfo {
        uint16 lottery_id;
        uint256 totalTokens;
    }

    BlottoToken public blotToken;
    bool public s_lotteryStateOpen;
    uint16 private s_lottery_id;

    address private CHARITY_ADDRESS_HERE;
    address private DAO_ADDRESS_HERE;

    mapping(uint16 => mapping(address => TicketInfo)) private s_ticketInfos;
    mapping(uint16 => uint256) private s_ticketsBought;

//    mapping(address => uint256) public addressToken;

    event BoughtTicket(uint16 indexed s_lottery_id, address indexed from, uint256 amount);
    event WinnerPicked(uint16 indexed s_lottery_id, address indexed winner);

    uint256 public immutable i_entryMinimum;
    uint256 public immutable i_interval;
    bytes32 public immutable i_gasLane;
    uint64 public immutable i_subscription_id;
    uint32 public immutable i_callbackGasLimit;

    constructor(address _tokenAddress,
        uint256 entryMinimum,
        uint256 interval,
        address vrfCoordinatorV2,
        bytes32 gasLane, //keyhash - decide on how much gas
        uint64 subscription_id,
        uint32 callbackGasLimit
    ) {
        blotToken = BlottoToken(_tokenAddress);
        i_entryMinimum = entryMinimum;
        i_interval = interval;
        i_gasLane = gasLane;
        i_subscription_id = subscription_id;
        i_callbackGasLimit = callbackGasLimit;
        require(address(_tokenAddress) != address(0),"Token Address cannot be address 0");                
        s_lotteryStateOpen = true;
    }

    function getBlockNumber1() public view returns (uint256) {
        return block.number;
    }

    function getTokenAllowance() public view returns (uint256) {
        console.log("_msgSender() = %s", _msgSender());
        console.log("address(this) = %s", address(this));
        console.log( blotToken.allowance(_msgSender(), address(this)));
        
        return blotToken.allowance(_msgSender(), address(this));
    }

    function approveTokens(uint256 tokenAmount) public {
//        if (tokenAmount == 0) { revert Lottery_NoTokensSentForApproval(); }
        bool approved = blotToken.approve (address(this), tokenAmount);
        require (approved, "approve failed");
        
        console.log("msg.sender = %s", msg.sender);
        console.log("address(this) = %s", address(this));
        console.log("tokenAmount = %s", tokenAmount);
        console.log("blotToken = %s", address(blotToken));
        console.log("approved = %s", approved);

        console.log("blotToken.allowance(_msgSender(), address(this)) = %s", 
            blotToken.allowance(_msgSender(), address(this)));

    }

    function buyTicket(uint256 tokenAmount) public payable {   
//        bool approved = blotToken.approve(msg.sender, tokenAmount);
//        require (approved, "Was not approved");
        console.log("msg.sender = %s", _msgSender());
        console.log("tokenAmount = %s", tokenAmount);
//        console.log("blotToken.allowance(_msgSender(), address(this)) = %s", 
           // blotToken.allowance(_msgSender(), address(this)));

        console.log("blotToken.balanceOf(_msgSender() = %s", blotToken.balanceOf(_msgSender()));

//        bool approved = blotToken.approve (address(this), tokenAmount);
//        require (approved, "approve failed");
//        console.log("approved = %s", approved);

        blotToken.transferFrom(msg.sender, address(this), tokenAmount);
    }

    function getBlotTokenAddress() public view returns (address) {
        return address(blotToken);
    }

    function getLotteryId() public view returns (uint16) {
        return s_lottery_id;
    }

    function getTokenBalanceSender() public view returns (uint256) {
        return blotToken.balanceOf(_msgSender());
    }

    function getTokenBalanceContract() public view returns (uint256) {
        return blotToken.balanceOf(address(this));
    }

    receive() external payable {} // to support receiving ETH by default
    fallback() external payable {}
    function supportsInterface(bytes4 interfaceID) external pure { }
    function decimals() external pure { }
    function symbol() external pure { }
    function name() external pure { }
}