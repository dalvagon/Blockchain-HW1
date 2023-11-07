// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Payable {
    event Received(address, uint);

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function _send(address payable to, uint amount) internal {
        (bool sent, bytes memory data) = to.call{value: amount}("");
        require(sent, "Payable: failed to send Ether");
    }
}
