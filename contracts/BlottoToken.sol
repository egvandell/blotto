// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BlottoToken is ERC20 {
    uint8 constant private c_decimals = 18;
    uint256 constant private c_totalSupply = 100 * (10**9) * 10**c_decimals;  // 100b tokens

    constructor() ERC20("Blotto", "BLOT") {
        _mint(msg.sender, c_totalSupply);
    }
}
