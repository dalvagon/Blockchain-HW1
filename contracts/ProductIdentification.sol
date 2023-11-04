// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./utils/Owned.sol";
import "./ProductDeposit.sol";
import "./ProductIdentification.sol";

contract ProductIdentification is Owned {
    struct Producer {
        address payable account;
        string name;
    }
    struct Product {
        uint id;
        string name;
        string description;
        uint amount;
        address payable owner;
    }
    address private _owner;
    uint private _producerEnrollmentFee;
    address payable private _productDepositContractAddress;
    // address payable private _productIdentificationContractAddress;
    uint private _productCounter;
    mapping(uint => Product) private _products;
    mapping(address => Producer) private producers;

    constructor() {
        ProductDeposit productDepositContract = new ProductDeposit();
        _productDepositContractAddress = payable(
            address(productDepositContract)
        );
        // ProductIdentification productIdentificationContract = new ProductIdentification();
        // _productIdentificationContractAddress = payable(
        //     address(productIdentificationContract)
        // );
    }

    event ProductAdded(address indexed whom, uint productId, uint when);

    error OwnableUnauthorizedAccount(address account);
    error ProducerUnauthorizedAccount(address account);

    modifier onlyOwner() {
        if (msg.sender != _owner) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
        _;
    }

    modifier onlyProducer() {
        if (producers[msg.sender].account != msg.sender) {
            revert ProducerUnauthorizedAccount(msg.sender);
        }
        _;
    }

    function getOwner() external view returns (address) {
        return _owner;
    }

    function getProducerEnrollmentFee() external view returns (uint) {
        return _producerEnrollmentFee;
    }

    function setProducerEnrollmentFee(uint fee) external onlyOwner {
        _producerEnrollmentFee = fee;
    }

    function getProductDepositContractAddress()
        internal
        view
        returns (address payable)
    {
        return _productDepositContractAddress;
    }

    // function getProductIdentificationContractAddress()
    //     internal
    //     view
    //     returns (address payable)
    // {
    //     return _productIdentificationContractAddress;
    // }

    function enrollProducer(string memory name) external payable {
        require(
            msg.value == _producerEnrollmentFee,
            "ProductStore: enrollment fee is required"
        );
        producers[msg.sender] = Producer(payable(msg.sender), name);
    }

    function addProduct(
        string memory name,
        string memory description,
        uint price
    ) external payable onlyProducer {
        require(
            msg.value >= _producerEnrollmentFee,
            "ProductStore: enrollment fee is required"
        );
        _productCounter++;
        _products[_productCounter] = Product(
            _productCounter,
            name,
            description,
            price,
            payable(msg.sender)
        );
        (bool sent, bytes memory data) = address(this).call{
            value: _producerEnrollmentFee
        }("");
        require(sent, "Failed to send Ether");

        if (msg.value > _producerEnrollmentFee) {
            (bool returned, bytes memory returnedData) = msg.sender.call{
                value: msg.value - _producerEnrollmentFee
            }("");
            require(returned, "Failed to return Ether");
        }

        emit ProductAdded(msg.sender, _productCounter, block.timestamp);
    }
}
