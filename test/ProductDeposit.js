const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;

describe("ProductDeposit", function () {
  async function deployProductDepositFixture() {
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
    const productStore = await ProductStore.deploy(
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
    const { productIdentification, productDeposit, productStore, owner } =
      await loadFixture(deployProductDepositFixture);

    expect(await productIdentification.owner()).to.equal(owner.address);
    expect(await productDeposit.owner()).to.equal(owner.address);
  });

  it("Owner should be able to set product deposit fee", async function () {
    const { productIdentification, productDeposit, productStore, owner } =
      await loadFixture(deployProductDepositFixture);
    await productDeposit.setProductDepositFeePerUnit(100);

    expect(await productDeposit.productDepositFeePerUnit()).to.equal(100);
  });

  it("Non-owner should not be able to set product deposit fee per unit", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);

    await expect(
      productDeposit.connect(otherAccount).setProductDepositFeePerUnit(100)
    ).to.be.revertedWithCustomError(
      productDeposit,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Owner should be able to set product max amount", async function () {
    const { productIdentification, productDeposit, productStore, owner } =
      await loadFixture(deployProductDepositFixture);
    await productDeposit.setProductMaxAmount(100);

    expect(await productDeposit.productMaxAmount()).to.equal(100);
  });

  it("Non-owner should not be able to set product max amount", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);

    await expect(
      productDeposit.connect(otherAccount).setProductMaxAmount(100)
    ).to.be.revertedWithCustomError(
      productDeposit,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Producer should be able to deposit product", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);
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

    expect(await productDeposit.productStock(1)).to.equal(100);
  });

  it("Should not be ablr to deposit product that does not exist", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });

    await expect(
      productDeposit
        .connect(otherAccount)
        .depositProduct(1, 100, { value: 200 })
    ).to.be.revertedWith("ProductIdentification: product is not registered");
  });

  it("Should only be able to deposit product with sufficient deposit fee", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(100);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);

    await expect(
      productDeposit
        .connect(otherAccount)
        .depositProduct(1, 100, { value: 199 })
    ).to.be.revertedWith("ProductDeposit: product deposit fee is required");
  });

  it("Should not be able to deposit product more than max amount", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);
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

    await expect(
      productDeposit.connect(otherAccount).depositProduct(1, 1, { value: 2 })
    ).to.be.revertedWith("ProductDeposit: product stock is full");
  });

  it("Producer should be able to authorize store", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productDeposit
      .connect(otherAccount)
      .authorizeStore(await productStore.getAddress());

    expect(
      await productDeposit.connect(otherAccount).authorizedStore()
    ).to.equal(await productStore.getAddress());
  });

  it("Only producer should be able to authorize store", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductDepositFixture);

    await expect(
      productDeposit
        .connect(otherAccount1)
        .authorizeStore(await productStore.getAddress())
    ).to.be.revertedWith("ProductDeposit: only producer can authorize store");
  });

  it("Producer should be able to withdraw product from deposit", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
    } = await loadFixture(deployProductDepositFixture);
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

    await productDeposit.connect(otherAccount).withdrawProduct(1, 1);

    expect(await productDeposit.productStock(1)).to.equal(99);
  });

  it("Only producer should be able to withdraw product from deposit", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductDepositFixture);
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

    await expect(
      productDeposit.connect(otherAccount1).withdrawProduct(1, 1)
    ).to.be.revertedWith("ProductDeposit: not authorized producer for product");
  });

  it("Should not be able to withdraw product from deposit with insufficient stock", async function () {
    const {
      productIdentification,
      productDeposit,
      productStore,
      owner,
      otherAccount,
      otherAccount1,
    } = await loadFixture(deployProductDepositFixture);
    await productDeposit.setProductDepositFeePerUnit(1);
    await productDeposit.setProductMaxAmount(1);
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 101 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow Milk", 2);
    await productDeposit
      .connect(otherAccount)
      .depositProduct(1, 1, { value: 101 });

    await expect(
      productDeposit.connect(otherAccount).withdrawProduct(1, 2)
    ).to.be.revertedWith("ProductDeposit: insufficient product stock");
  });
});
