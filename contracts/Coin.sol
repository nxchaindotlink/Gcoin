// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract coin is ERC20 {

    constructor()ERC20("Coin", "CON"){
        _mint(msg.sender, 20_000_000 *decimals());
    }


    function decimals() public pure override returns (uint8){
        return 2;
    }
}