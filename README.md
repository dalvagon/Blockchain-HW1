# Blockchain-HW1
The project was created using hardhat. It can be deployed to networks defined in hardhat.config.js (currently to ganache). <br/>
The contracts are located in the contracts folder. The contracts/utils folder contains contracts that I used in order to avoid duplication of code. <br/>
The test folder contains tests for the contracts The tests were developed using Mocha test framework and Chai assertion library. <br/>
<h3>Test report</h3>

<h4>Owned</h4>
    ✔ Should set the right owner <br/>

<h4>ProductDeposit</h4>
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

<h4>ProductIdentification</h4>
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

<h4>ProductStore</h4>
    ✔ Should set the right owner <br/>
    ✔ Owner producer should be able to set product price per unit <br/>
    ✔ Product price per unit should be greater than zero <br/>
    ✔ Non-owner producer should not be able to set product price per unit <br/>
    ✔ Owner producer should be able to transfer product to store <br/>
    ✔ Non-owner producer should not be able to transfer product to store <br/>
    ✔ Should revert when transferring product to store with insufficient stock <br/>
    ✔ Should be able to see if product is available in store <br/>
    ✔ Should be able to see if product is authentic <br/>
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


<h3>Transaction costs</h3>
Transaction costs report using Remix IDE and Metamask.


Method                            |   Gas Cost   |   Gas cost(ETH)   |   Gas cost($)   |
----------------------------------|--------------|-------------------|-----------------|
Set producer enrollment fee       |    26073     |    0.00006518     |  0.1228629964   |
Enroll Producer                   |    80601     |    0.0002015      |  0.379716675    | 
Register Product                  |    162776    |    0.00040694     |  0.7668947076   | 
Set product deposit fee per unit  |    45974     |    0.00011493     |  0.2167131573   | 
Set product max amount            |    45885     |    0.00011471     |  0.2164015621   | 
Authorize store                   |    35421     |    0.0000885      |  0.16694817     | 
Deposit product                   |    59822     |    0.00014955     |  0.281566758    | 
Withdraw product                  |    40401     |    0.000101       |  0.19047489     | 
Set product price per unit        |    26052     |    0.00006513     |  0.12279414809  | 
Transfer product to store         |    63855     |    0.00015964     |  0.3011544744   | 
Buy product                       |    56369     |    0.0001409      |  0.265472141    | 

 
