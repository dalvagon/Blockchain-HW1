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
    uint private _productPricePerUnit;
    address private _productIdentificationAddress;
    address private _productDepositAddress;
    mapping(uint => ProductStock) private _productStocks;

    constructor(
        address productIdentificationAddress,
        address productDepositAddress
    ) {
        _productIdentificationAddress = productIdentificationAddress;
        _productDepositAddress = productDepositAddress;
        _productPricePerUnit = 1; // defaults to 1 if not set
    }

    event ProductStocked(uint productId, uint amount, uint when);
    event ProductBought(address indexed buyer, uint productId, uint when);

    function productPricePerUnit() external view returns (uint) {
        return _productPricePerUnit;
    }

    function setProductPricePerUnit(uint price) external onlyOwner {
        require(
            price > 0,
            "ProductStore: product price per unit must be greater than zero"
        );
        _productPricePerUnit = price;
    }

    function transferProductToStore(
        uint productId,
        uint amount
    ) external onlyOwner {
        require(
            ProductDeposit(payable(_productDepositAddress)).productStock(
                productId
            ) >= amount,
            "ProductStore: product is not available in deposit"
        );
        require(
            amount > 0,
            "ProductStore: transfer amount must be greater than zero"
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

    function productStock(uint productId) external view returns (uint) {
        return _productStocks[productId].amount;
    }

    function buyProduct(uint productId) external payable {
        require(
            _productStocks[productId].amount > 0,
            "ProductStore: product is not available"
        );
        require(
            msg.value >= _productPricePerUnit,
            "ProductStore: insufficient payment"
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
