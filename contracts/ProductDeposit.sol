// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./utils/Owned.sol";

contract ProductDeposit is Owned {
    uint private _productDepositFeePerUnit;
    uint private _productMaxAmount;

    function productDepositFeePerUnit() external view returns (uint) {
        return _productDepositFeePerUnit;
    }

    function productMaxAmount() external view returns (uint) {
        return _productMaxAmount;
    }

    function setProductDepositFeePerUnit(uint fee) external onlyOwner {
        require(fee > 0, "ProductDeposit: fee must be greater than 0");
        _productDepositFeePerUnit = fee;
    }

    function setProductMaxAmount(uint amount) external onlyOwner {
        require(
            amount > 0,
            "ProductDeposit: maximum amount must be greater than 0"
        );
        _productMaxAmount = amount;
    }
}
