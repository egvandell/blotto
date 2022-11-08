// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Context.sol";

error Lottery_NotEnoughTokensSent();
error Lottery_NeedMoreTokensInsufficientBalance();
error Lottery_LotteryNotOpen();

interface Token {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (uint256);    
}

contract Blotto is Pausable, Ownable, ReentrancyGuard {
    enum LotteryState {
        Open,
        Drawing
    }

    struct TicketInfo {
        uint16 lottery_id;
        uint256 purchaseTS;
        uint256 amount;
        bool winner;
    }

    Token private blotToken;
    LotteryState public s_lotteryState;
    uint16 public storage s_lottery_id;     // needs to be incremented for each lottery    

    event BoughtTicket(address indexed from, uint256 amount);

    mapping(address => uint256) public addressToken;

    mapping(address => TicketInfo) public ticketinfos;  // need to review this data structure

/* a lottery is the data structure thats mapped
n lotteries

lottery_id
lottery_date
lottery_winner

ticket_id
ticket_purchase_date
lottery_id
total tickets purchased?

 need to determine how the winner wins.  is it a 1-1 on a token?  token price can change


*/
    constructor(Token _tokenAddress) {
        require(address(_tokenAddress) != address(0),"Token Address cannot be address 0");                
        blotToken = _tokenAddress;
        s_lotteryState = LotteryState.Open;
    }

    function buyTicket(uint256 tokenAmount) external payable whenNotPaused {
        if (tokenAmount == 0) { revert Lottery_NotEnoughTokensSent(); }
        if (blotToken.balanceOf(_msgSender()) >= tokenAmount) { revert Lottery_NeedMoreTokensInsufficientBalance(); }
        if (s_lotteryState != LotteryState.Open) { revert Lottery_LotteryNotOpen(); }

        blotToken.transferFrom(_msgSender(), address(this), tokenAmount);
        addressToken[_msgSender()] += tokenAmount;

        emit BoughtTicket(_msgSender(), tokenAmount);
    }

//    function drawing() {}


    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}