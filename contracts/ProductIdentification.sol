// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./utils/Owned.sol";
import "./utils/Payable.sol";
import "./ProductDeposit.sol";
import "./ProductIdentification.sol";
import "./SampleToken.sol";

contract ProductIdentification is Owned, Payable {
    struct Producer {
        address account;
        string name;
    }
    struct Product {
        uint id;
        string name;
        string description;
        uint volume;
        address payable producer;
    }
    uint private _producerEnrollmentFee; // defaults to 0 if not set
    uint private _productCounter;
    SampleToken private sampleToken;
    SampleTokenSale private sampleTokenSale;
    mapping(uint => Product) private _products;
    mapping(address => Producer) private producers;

    constructor(address sampleTokenSaleAddress) {
        sampleTokenSale = SampleTokenSale(sampleTokenSaleAddress);
        sampleToken = sampleTokenSale.token();
    }

    event ProducerEnrolled(address indexed whom, uint when);
    event ProductRegistered(address indexed whom, uint productId, uint when);

    error ProducerUnauthorizedAccount(address account);

    modifier onlyProducer() {
        if (producers[msg.sender].account != msg.sender) {
            revert ProducerUnauthorizedAccount(msg.sender);
        }
        _;
    }

    function producerEnrollmentFee() external view returns (uint) {
        return _producerEnrollmentFee;
    }

    function setProducerEnrollmentFee(uint fee) external onlyOwner {
        _producerEnrollmentFee = fee;
    }

    function enrollProducer(string memory name) external {
        require(
            bytes(name).length > 0,
            "ProductIdentification: producer name is required"
        );
        require(
            producers[msg.sender].account == address(0),
            "ProductIdentification: producer already enrolled"
        );
        require(
            sampleToken.balanceOf(msg.sender) >= _producerEnrollmentFee,
            "ProductIdentification: producer enrollment fee is required"
        );
        bool transferred = sampleToken.transferFrom(
            msg.sender,
            owner(),
            _producerEnrollmentFee
        );
        require(
            transferred,
            "ProductIdentification: producer enrollment fee transfer failed"
        );
        producers[msg.sender] = Producer(msg.sender, name);
        emit ProducerEnrolled(msg.sender, block.timestamp);
    }

    function registerProduct(
        string memory name,
        string memory description,
        uint volume
    ) external payable onlyProducer {
        require(
            bytes(name).length > 0,
            "ProductIdentification: product name is required"
        );
        _productCounter++;
        _products[_productCounter] = Product(
            _productCounter,
            name,
            description,
            volume,
            payable(msg.sender)
        );
        emit ProductRegistered(msg.sender, _productCounter, block.timestamp);
    }

    function isProducer(address addr) external view returns (bool) {
        return producers[addr].account == addr;
    }

    function isProductRegistered(uint productId) external view returns (bool) {
        return _products[productId].id != 0;
    }

    function getProduct(
        uint productId
    )
        external
        view
        returns (
            uint id,
            string memory name,
            string memory description,
            uint volume,
            address payable producer
        )
    {
        require(
            _products[productId].id != 0,
            "ProductIdentification: product is not registered"
        );
        return (
            _products[productId].id,
            _products[productId].name,
            _products[productId].description,
            _products[productId].volume,
            _products[productId].producer
        );
    }

    function producerForProduct(
        uint productId
    ) external view returns (address) {
        require(
            _products[productId].id != 0,
            "ProductIdentification: product is not registered"
        );
        return _products[productId].producer;
    }

    function productVolume(uint productId) external view returns (uint) {
        return _products[productId].volume;
    }

    function token() external view returns (SampleToken) {
        return sampleToken;
    }

    function tokenSale() external view returns (SampleTokenSale) {
        return sampleTokenSale;
    }
}
