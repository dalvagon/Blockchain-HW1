# Blockchain-HW1
The project was created using hardhat. It can be deployed to networks defined in hardhat.config.js (currently to ganache).
The contracts are located in the contracts folder. The contracts/utils folder contains contracts that I used in order to avoid duplication of code.
The test folder contains tests for the contracts The tests were developed using Mocha test framework and Chai assertion library.
The test report is at it follows:
Owned
    ✔ Should set the right owner (48ms)

  ProductDeposit
    ✔ Should set the right owner (59ms)
    ✔ Owner should be able to set product deposit fee
    ✔ Non-owner should not be able to set product deposit fee per unit
    ✔ Owner should be able to set product max amount
    ✔ Non-owner should not be able to set product max amount
    ✔ Producer should be able to deposit product (55ms)
    ✔ Should not be ablr to deposit product that does not exist
    ✔ Should only be able to deposit product with sufficient deposit fee (40ms)
    ✔ Should emit Received event when depositing product (41ms)
    ✔ Should not be able to deposit product more than max amount (44ms)
    ✔ Producer should be able to authorize store
    ✔ Only producer should be able to authorize store
    ✔ Producer should be able to withdraw product from deposit (45ms)
    ✔ Only producer should be able to withdraw product from deposit (44ms)
    ✔ Should not be able to withdraw product from deposit with insufficient stock (44ms)

  ProductIdentification
    ✔ Should set the right owner
    ✔ Owner should be able to set producer enrollment fee
    ✔ Non-owner should not be able to set producer enrollment fee
    ✔ Should be able to enroll as producer
    ✔ Should require producer name when enrolling as producer
    ✔ Should not be able to enroll as producer with insufficient enrollment fee
    ✔ Should not be able to enroll as producer twice
    ✔ Should emit Received event when enrolling as producer
    ✔ Should require product name when registering product
    ✔ Only producer should be able to register products
    ✔ Should emit ProductRegistered event when registering product
    ✔ Should be able to get product details
    ✔ Should not be able to get product details for unregistered product
    ✔ Should be able to get producer for product

  ProductStore
    ✔ Should set the right owner (45ms)
    ✔ Owner producer should be able to set product price per unit
    ✔ Product price per unit should be greater than zero
    ✔ Non-owner producer should not be able to set product price per unit
    ✔ Owner producer should be able to transfer product to store (59ms)
    ✔ Non-owner producer should not be able to transfer product to store
    ✔ Should revert when transferring product to store with insufficient stock
    ✔ Should be able to see if product is available in store (57ms)
    ✔ Should be able to see if product is authentic (60ms)
    ✔ Should be able to buy product (64ms)
    ✔ Should revert when buying product with insufficient stock (68ms)
    ✔ Should revert when buying product with insufficient payment (60ms)
    ✔ Transfer amount should be greater than zero


  43 passing (1s)

----------------------------|----------|----------|----------|----------|----------------|
File                        |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------------|----------|----------|----------|----------|----------------|
 contracts\                 |      100 |    98.33 |      100 |      100 |                |
  ProductDeposit.sol        |      100 |      100 |      100 |      100 |                |
  ProductIdentification.sol |      100 |      100 |      100 |      100 |                |
  ProductStore.sol          |      100 |    93.75 |      100 |      100 |                |
 contracts\utils\           |      100 |       75 |      100 |      100 |                |
  Owned.sol                 |      100 |      100 |      100 |      100 |                |
  Payable.sol               |      100 |       50 |      100 |      100 |                |
----------------------------|----------|----------|----------|----------|----------------|
All files                   |      100 |    96.88 |      100 |      100 |                |
----------------------------|----------|----------|----------|----------|----------------|