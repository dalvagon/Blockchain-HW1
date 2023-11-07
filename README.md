# Blockchain-HW1
The project was created using hardhat. It can be deployed to networks defined in hardhat.config.js (currently to ganache).
The contracts are located in the contracts folder. The contracts/utils folder contains contracts that I used in order to avoid duplication of code.
The test folder contains tests for the contracts The tests were developed using Mocha test framework and Chai assertion library.
The test report is at it follows:
<h2>Owned</h2>
    ✔ Should set the right owner

ProductDeposit
    ✔ Should set the right owner <br/>
    ✔ Owner should be able to set product deposit fee <br/>
    ✔ Non-owner should not be able to set product deposit fee per unit <br/>
    ✔ Owner should be able to set product max amount <br/>
    ✔ Non-owner should not be able to set product max amount <br/>
    ✔ Producer should be able to deposit product <br/>
    ✔ Should not be ablr to deposit product that does not exist <br/>
    ✔ Should only be able to deposit product with sufficient deposit fee (40ms) <br/>
    ✔ Should emit Received event when depositing product (41ms) <br/>
    ✔ Should not be able to deposit product more than max amount (44ms) <br/>
    ✔ Producer should be able to authorize store <br/>
    ✔ Only producer should be able to authorize store <br/>
    ✔ Producer should be able to withdraw product from deposit (45ms) <br/>
    ✔ Only producer should be able to withdraw product from deposit (44ms) <br/>
    ✔ Should not be able to withdraw product from deposit with insufficient stock (44ms) <br/>

<h2>ProductIdentification</h2>
    ✔ Should set the right owner <br/>
    ✔ Owner should be able to set producer enrollment fee <br/>
    ✔ Non-owner should not be able to set producer enrollment fee <br/>
    ✔ Should be able to enroll as producer <br/>
    ✔ Should require producer name when enrolling as producer <br/>
    ✔ Should not be able to enroll as producer with insufficient enrollment fee <br/>
    ✔ Should not be able to enroll as producer twice <br/>
    ✔ Should emit Received event when enrolling as producer <br/>
    ✔ Should require product name when registering product <br/>
    ✔ Only producer should be able to register products <br/>
    ✔ Should emit ProductRegistered event when registering product <br/>
    ✔ Should be able to get product details <br/>
    ✔ Should not be able to get product details for unregistered product <br/>
    ✔ Should be able to get producer for product <br/>

<h2>ProductStore</h2>
    ✔ Should set the right owner (45ms) <br/>
    ✔ Owner producer should be able to set product price per unit <br/>
    ✔ Product price per unit should be greater than zero <br/>
    ✔ Non-owner producer should not be able to set product price per unit <br/>
    ✔ Owner producer should be able to transfer product to store <br/>
    ✔ Non-owner producer should not be able to transfer product to store <br/>
    ✔ Should revert when transferring product to store with insufficient stock <br/>
    ✔ Should be able to see if product is available in store <br/>
    ✔ Should be able to see if product is authentic (60ms) <br/>
    ✔ Should be able to buy product <br/>
    ✔ Should revert when buying product with insufficient stock <br/>
    ✔ Should revert when buying product with insufficient payment <br/>
    ✔ Transfer amount should be greater than zero <br/>

File                        |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
----------------------------|----------|----------|----------|----------|----------------|
  ProductDeposit.sol        |      100 |      100 |      100 |      100 |                |
  ProductIdentification.sol |      100 |      100 |      100 |      100 |                |
  ProductStore.sol          |      100 |    93.75 |      100 |      100 |                |
  Owned.sol                 |      100 |      100 |      100 |      100 |                |
  Payable.sol               |      100 |       50 |      100 |      100 |                |
All files                   |      100 |    96.88 |      100 |      100 |                |
