// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "./utils/Owned.sol";
import "./ProductDeposit.sol";
import "./ProductIdentification.sol";

contract ProductIdentification is Owned {
    struct Producer {
        address account;
        string name;
    }
    struct Product {
        uint id;
        string name;
        string description;
        uint amount;
        address payable owner;
    }
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

    event Received(address, uint);
    event ProducerEnrolled(address indexed whom, uint when);
    event ProductAdded(address indexed whom, uint productId, uint when);

    error ProducerUnauthorizedAccount(address account);

    modifier onlyProducer() {
        if (producers[msg.sender].account != msg.sender) {
            revert ProducerUnauthorizedAccount(msg.sender);
        }
        _;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    function producerEnrollmentFee() external view returns (uint) {
        return _producerEnrollmentFee;
    }

    function setProducerEnrollmentFee(uint fee) external onlyOwner {
        require(fee > 0, "ProductIdentification: fee must be greater than 0");
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
            bytes(name).length > 0,
            "ProductIdentification: name is required"
        );
        require(
            producers[msg.sender].account == address(0),
            "ProductIdentification: producer already enrolled"
        );
        require(
            msg.value >= _producerEnrollmentFee,
            "ProductIdentification: producer enrollment fee is required"
        );
        (bool sent, bytes memory data) = payable(address(this)).call{
            value: _producerEnrollmentFee
        }("");
        require(sent, "Failed to send Ether");

        if (msg.value > _producerEnrollmentFee) {
            (bool returned, bytes memory returnedData) = msg.sender.call{
                value: msg.value - _producerEnrollmentFee
            }("");
            require(returned, "Failed to return Ether");
        }
        producers[msg.sender] = Producer(msg.sender, name);
        emit ProducerEnrolled(msg.sender, block.timestamp);
    }

    function addProduct(
        string memory name,
        string memory description,
        uint amount
    ) external payable onlyProducer {
        require(
            msg.value >= _producerEnrollmentFee,
            "ProductIdentification: producer enrollment fee is required"
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

        _productCounter++;
        _products[_productCounter] = Product(
            _productCounter,
            name,
            description,
            amount,
            payable(msg.sender)
        );
        emit ProductAdded(msg.sender, _productCounter, block.timestamp);
    }

    function isProducer(address addr) external view returns (bool) {
        return producers[addr].account == addr;
    }

    function productExists(uint productId) external view returns (bool) {
        return _products[productId].id != 0;
    }
}
