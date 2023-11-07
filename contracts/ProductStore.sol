// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./utils/Owned.sol";
import "./utils/Payable.sol";
import "./ProductIdentification.sol";
import "./ProductDeposit.sol";

contract ProductStore is Owned, Payable {
    struct ProductStock {
        uint productId;
        uint amount;
    }
    uint private _productPricePerUnit; // defaults to 0 if not set
    address private _productIdentificationAddress;
    address private _productDepositAddress;
    mapping(uint => ProductStock) private _productStocks;

    constructor(
        address productIdentificationAddress,
        address productDepositAddress
    ) {
        _productIdentificationAddress = productIdentificationAddress;
        _productDepositAddress = productDepositAddress;
    }

    event ProductStocked(uint productId, uint amount, uint when);
    event ProductBought(address indexed buyer, uint productId, uint when);

    function productPricePerUnit() external view returns (uint) {
        return _productPricePerUnit;
    }

    function setProductPricePerUnit(uint price) external onlyOwner {
        _productPricePerUnit = price;
    }

    function transferProductToStore(
        uint productId,
        uint amount
    ) external onlyOwner {
        require(
            _productIdentificationAddress != address(0),
            "ProductStore: product identification address must be set"
        );
        require(
            _productDepositAddress != address(0),
            "ProductStore: product deposit address must be set"
        );
        require(
            ProductDeposit(payable(_productDepositAddress)).amountForProduct(
                productId
            ) >= amount,
            "ProductStore: product deposit amount must be greater than zero"
        );
        bool withdrawn = ProductDeposit(payable(_productDepositAddress))
            .withdrawProduct(productId, amount);
        require(withdrawn, "ProductStore: product deposit withdraw failed");
        _productStocks[productId].productId = productId;
        _productStocks[productId].amount += amount;
        emit ProductStocked(productId, amount, block.timestamp);
    }

    function isProductAvailable(uint productId) external view returns (bool) {
        return _productStocks[productId].amount > 0;
    }

    function isProductAuthentic(uint productId) external view returns (bool) {
        return
            ProductIdentification(payable(_productIdentificationAddress))
                .isProductRegistered(productId);
    }

    function buyProduct(uint productId) external payable {
        require(
            _productPricePerUnit > 0,
            "ProductStore: product price per unit must be set"
        );
        require(
            _productStocks[productId].amount > 0,
            "ProductStore: product stock must be greater than zero"
        );
        require(
            msg.value >= _productPricePerUnit,
            "ProductStore: product price must be paid"
        );
        _productStocks[productId].amount -= 1;
        uint feeToProducer = _productPricePerUnit / 2;
        _send(payable(msg.sender), msg.value - feeToProducer);
        _send(
            payable(
                ProductIdentification(payable(_productIdentificationAddress))
                    .producerForProduct(productId)
            ),
            feeToProducer
        );
        emit ProductBought(msg.sender, productId, block.timestamp);
    }
}
