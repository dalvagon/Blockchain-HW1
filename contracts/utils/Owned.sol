// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Owned {
    address private _owner;

    constructor() {
        _owner = msg.sender;
    }

    error OwnableUnauthorizedAccount(address account);

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
        _;
    }

    function owner() public view returns (address) {
        return _owner;
    }
}
