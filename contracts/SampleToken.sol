// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract SampleToken {
    string private _name = "Sample Token";
    string private _symbol = "TOK";

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowed;
    uint256 private _totalSupply;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    constructor(uint256 _initialSupply) {
        _balances[msg.sender] = _initialSupply;
        _totalSupply = _initialSupply;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }

    function name() public view returns (string memory) {
        return _name;
    }

    function symbol() public view returns (string memory) {
        return _symbol;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return _balances[_owner];
    }

    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= _balances[msg.sender]);
        require(_to != address(0));

        _balances[msg.sender] -= _value;
        _balances[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= _balances[_from], "Insufficient balance");
        require(
            _value <= _allowed[_from][msg.sender],
            "Insufficient allowance"
        );
        require(_to != address(0));

        _balances[_from] -= _value;
        _balances[_to] += _value;
        _allowed[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        require(_spender != address(0));

        _allowed[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(
        address _owner,
        address _spender
    ) public view returns (uint256 remaining) {
        return _allowed[_owner][_spender];
    }
}

contract SampleTokenSale {
    SampleToken private _tokenContract;
    uint256 private _tokenPrice;
    address private _owner;

    uint256 private _tokensSold;

    event Sell(address indexed _buyer, uint256 indexed _amount);

    constructor(SampleToken _contract, uint256 _price) {
        _owner = msg.sender;
        _tokenContract = _contract;
        _tokenPrice = _price;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value >= _numberOfTokens * _tokenPrice);
        require(_tokenContract.balanceOf(_owner) >= _numberOfTokens);
        require(
            _tokenContract.transferFrom(_owner, msg.sender, _numberOfTokens)
        );
        _tokensSold += _numberOfTokens;
        if (msg.value > _numberOfTokens * _tokenPrice) {
            payable(msg.sender).transfer(
                msg.value - _numberOfTokens * _tokenPrice
            );
        }
        emit Sell(msg.sender, _numberOfTokens);
    }

    function tokensSold() public view returns (uint256) {
        return _tokensSold;
    }

    function setTokenPrice(uint256 _price) public {
        require(msg.sender == _owner);
        _tokenPrice = _price;
    }

    function endSale() public {
        require(msg.sender == _owner);
        require(
            _tokenContract.transfer(
                _owner,
                _tokenContract.balanceOf(address(this))
            )
        );
        payable(msg.sender).transfer(address(this).balance);
    }

    function token() public view returns (SampleToken) {
        return _tokenContract;
    }

    function owner() public view returns (address) {
        return _owner;
    }
}
