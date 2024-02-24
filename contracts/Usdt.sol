// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Usdt is ERC20{

    address public immutable owner;
    
    
    constructor()ERC20("USDT TOKEN", "USDT"){
        owner = msg.sender;
        _mint(owner, 20_000_000 *10 **decimals());

    }


    function decimals() public pure override returns (uint8){
    return 6;
    }
}