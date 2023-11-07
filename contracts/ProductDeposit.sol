// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./utils/Owned.sol";
import "./utils/Payable.sol";
import "./ProductIdentification.sol";

contract ProductDeposit is Owned, Payable {
    struct ProducStock {
        uint productId;
        uint amount;
    }
    uint private _productDepositFeePerVolumeUnit; // defaults to 0 if not set
    uint private _productMaxAmount; // defaults to 0 if not set
    address private _productIdentificationAddress;
    mapping(uint => ProducStock) private _productStocks;
    mapping(address => address) private _authorizedStores;

    constructor(address productIdentificationAddress) {
        _productIdentificationAddress = productIdentificationAddress;
    }

    event ProductDeposited(
        address indexed producer,
        uint productId,
        uint amount,
        uint when
    );

    modifier onlyProducer() {
        ProductIdentification productIdentification = ProductIdentification(
            payable(_productIdentificationAddress)
        );
        require(
            productIdentification.isProducer(msg.sender),
            "ProductDeposit: only producer can authorize store"
        );
        _;
    }

    modifier onlyAuthorizedStore() {
        require(
            _authorizedStores[msg.sender] != address(0),
            "ProductDeposit: only authorized store can withdraw product"
        );
        _;
    }

    modifier onlyProducerForProduct(uint productId) {
        require(
            msg.sender ==
                ProductIdentification(payable(_productIdentificationAddress))
                    .producerForProduct(productId),
            "ProductDeposit: only authorized producer can deposit product"
        );
        _;
    }

    function productDepositFeePerUnit() external view returns (uint) {
        return _productDepositFeePerVolumeUnit;
    }

    function productMaxAmount() external view returns (uint) {
        return _productMaxAmount;
    }

    function setProductDepositFeePerUnit(uint fee) external onlyOwner {
        _productDepositFeePerVolumeUnit = fee;
    }

    function setProductMaxAmount(uint amount) external onlyOwner {
        _productMaxAmount = amount;
    }

    function depositProduct(
        uint productId,
        uint amount
    ) external payable onlyProducerForProduct(productId) {
        require(
            _productExists(productId),
            "ProductDeposit: product does not exist"
        );
        require(
            _productStocks[productId].amount + amount <= _productMaxAmount,
            "ProductDeposit: product stock is full"
        );
        ProductIdentification productIdentification = ProductIdentification(
            payable(_productIdentificationAddress)
        );
        uint productDepositFee = _productDepositFeePerVolumeUnit *
            productIdentification.productVolume(productId) *
            amount;
        require(
            msg.value >= productDepositFee,
            "ProductDeposit: product deposit fee is required"
        );

        _send(payable(address(this)), productDepositFee);

        if (msg.value > productDepositFee) {
            _send(payable(msg.sender), msg.value - productDepositFee);
        }

        _productStocks[productId].productId = productId;
        _productStocks[productId].amount += amount;
        emit ProductDeposited(msg.sender, productId, amount, block.timestamp);
    }

    function authorizeStore(address storeAddress) external onlyProducer {
        _authorizedStores[msg.sender] = storeAddress;
    }

    function withdrawProduct(
        uint productId,
        uint amount
    )
        external
        onlyProducerForProduct(productId)
        onlyAuthorizedStore
        returns (bool)
    {
        require(
            _productExists(productId),
            "ProductDeposit: product does not exist"
        );
        require(
            _productStocks[productId].amount >= amount,
            "ProductDeposit: product stock is empty"
        );
        _productStocks[productId].amount -= amount;
        return true;
    }

    function amountForProduct(uint productId) external view returns (uint) {
        return _productStocks[productId].amount;
    }

    function _productExists(uint productId) private view returns (bool) {
        ProductIdentification productIdentification = ProductIdentification(
            payable(_productIdentificationAddress)
        );
        return productIdentification.isProductRegistered(productId);
    }
}
