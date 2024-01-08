const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;

describe("ProductStore", function () {
  async function deployProductStoreFixture() {
    const [owner, otherAccount, otherAccount1] = await ethers.getSigners();
    const ProductIdentification = await ethers.getContractFactory(
      "ProductIdentification"
    );
    const ProductDeposit = await ethers.getContractFactory("ProductDeposit");
    const ProductStore = await ethers.getContractFactory("ProductStore");
    const productIdentification = await ProductIdentification.deploy();
    const productDeposit = await ProductDeposit.deploy(
      await productIdentification.getAddress()
    );
    const productStore = await ProductStore.connect(otherAccount).deploy(
      await productIdentification.getAddress(),
      await productDeposit.getAddress()
    );
    return {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    };
  }

  it("Should set the right owner", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);

    expect(await productIdentification.owner()).to.equal(owner.address);
    expect(await productDeposit.owner()).to.equal(owner.address);
    expect(await productStore.owner()).to.equal(otherAccount.address);
  });

  it("Owner producer should be able to set product price per unit", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);
    await productStore.connect(otherAccount).setProductPricePerUnit(100);

    expect(await productStore.productPricePerUnit()).to.equal(100);
  });

  it("Product price per unit should be greater than zero", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);

    await expect(
      productStore.connect(otherAccount).setProductPricePerUnit(0)
    ).to.be.revertedWith(
      "ProductStore: product price per unit must be greater than zero"
    );
  });

  it("Non-owner producer should not be able to set product price per unit", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);

    await expect(
      productStore.connect(owner).setProductPricePerUnit(100)
    ).to.be.revertedWithCustomError(productStore, "OwnableUnauthorizedAccount");
  });

  it("Owner producer should be able to transfer product to store", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 100, { value: 200 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());
    await productStore.connect(otherAccount).transferProductToStore(1, 40);

    expect(await productDeposit.productStock(1)).to.equal(60);
    expect(await productStore.productStock(1)).to.equal(40);
  });

  it("Non-owner producer should not be able to transfer product to store", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);

    await expect(
      productStore.connect(owner).transferProductToStore(1, 40)
    ).to.be.revertedWithCustomError(productStore, "OwnableUnauthorizedAccount");
  });

  it("Should revert when transferring product to store with insufficient stock", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);

    await expect(
      productStore.connect(otherAccount).transferProductToStore(1, 40)
    ).to.be.revertedWith("ProductStore: product is not available in deposit");
  });

  it("Should be able to see if product is available in store", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 100, { value: 200 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());
    await productStore.connect(otherAccount).transferProductToStore(1, 40);

    expect(await productStore.isProductAvailable(1)).to.equal(true);
  });

  it("Should be able to see if product is authentic", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductStoreFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 100, { value: 200 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());
    await productStore.connect(otherAccount).transferProductToStore(1, 40);

    expect(await productStore.isProductAuthentic(1)).to.equal(true);
  });

  it("Should be able to buy product", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductStoreFixture);

    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 100, { value: 200 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());
    await productStore.connect(otherAccount).transferProductToStore(1, 40);
    await productStore.connect(otherAccount).setProductPricePerUnit(20);
    await productStore.connect(otherAccount1).buyProduct(1, { value: 20 });

    expect(await productStore.productStock(1)).to.equal(39);
  });

  it("Should revert when buying product with insufficient stock", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductStoreFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 100, { value: 200 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());
    await productStore.connect(otherAccount).transferProductToStore(1, 1);
    await productStore.connect(otherAccount).setProductPricePerUnit(20);
    productStore.connect(otherAccount1).buyProduct(1, { value: 20 });

    await expect(
      productStore.connect(otherAccount1).buyProduct(1, { value: 20 })
    ).to.be.revertedWith("ProductStore: product is not available");
  });

  it("Should revert when buying product with insufficient payment", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductStoreFixture);

    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 100, { value: 200 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());
    await productStore.connect(otherAccount).transferProductToStore(1, 40);
    await productStore.connect(otherAccount).setProductPricePerUnit(20);

    await expect(
      productStore.connect(otherAccount1).buyProduct(1, { value: 19 })
    ).to.be.revertedWith("ProductStore: insufficient payment");
  });

  it("Transfer amount should be greater than zero", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductStoreFixture);

    await expect(
      productStore.connect(otherAccount).transferProductToStore(1, 0)
    ).to.be.revertedWith(
      "ProductStore: transfer amount must be greater than zero"
    );
  });
});
