const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;

describe("ProductIdentification", function () {
  async function deployProductIdentificationFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const ProductIdentification = await ethers.getContractFactory(
      "ProductIdentification"
    );
    const productIdentification = await ProductIdentification.deploy();
    return { productIdentification, owner, otherAccount };
  }

  it("Should set the right owner", async function () {
    const { productIdentification, owner } = await loadFixture(
      deployProductIdentificationFixture
    );

    expect(await productIdentification.owner()).to.equal(owner.address);
  });

  it("Owner should be able to set producer enrollment fee", async function () {
    const { productIdentification, owner } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);

    expect(await productIdentification.producerEnrollmentFee()).to.equal(100);
  });

  it("Non-owner should not be able to set producer enrollment fee", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );

    await expect(
      productIdentification.connect(otherAccount).setProducerEnrollmentFee(100)
    ).to.be.revertedWithCustomError(
      productIdentification,
      "OwnableUnauthorizedAccount"
    );
  });

  it("Should be able to enroll as producer", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });

    expect(
      await productIdentification.isProducer(otherAccount.address)
    ).to.equal(true);
  });

  it("Should require producer name when enrolling as producer", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );

    await expect(
      productIdentification
        .connect(otherAccount)
        .enrollProducer("", { value: 100 })
    ).to.be.revertedWith("ProductIdentification: producer name is required");
  });

  it("Should not be able to enroll as producer with insufficient enrollment fee", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);

    await expect(
      productIdentification
        .connect(otherAccount)
        .enrollProducer("John Doe", { value: 99 })
    ).to.be.revertedWith(
      "ProductIdentification: producer enrollment fee is required"
    );
  });

  it("Should not be able to enroll as producer twice", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });

    await expect(
      productIdentification
        .connect(otherAccount)
        .enrollProducer("John Doe", { value: 100 })
    ).to.be.rejected;
  });

  it("Should emit Received event when enrolling as producer", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);

    await expect(
      productIdentification
        .connect(otherAccount)
        .enrollProducer("John Doe", { value: 102 })
    )
      .to.emit(productIdentification, "Received")
      .withArgs(await productIdentification.getAddress(), 100);
  });

  if (
    ("Should be able to register products",
    async function () {
      const { productIdentification, owner, otherAccount } = await loadFixture(
        deployProductIdentificationFixture
      );
      await productIdentification.setProducerEnrollmentFee(100);
      await productIdentification
        .connect(otherAccount)
        .enrollProducer("John Doe", { value: 100 });
      await productIdentification
        .connect(otherAccount)
        .registerProduct("Milk", "Cow milk", 100);

      expect(await productIdentification.isProductRegistered(1)).to.equal(true);
    })
  );

  it("Should require product name when registering product", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });

    await expect(
      productIdentification
        .connect(otherAccount)
        .registerProduct("", "Cow milk", 100)
    ).to.be.revertedWith("ProductIdentification: product name is required");
  });

  it("Only producer should be able to register products", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);

    await expect(
      productIdentification.registerProduct("Milk", "Cow milk", 100)
    ).to.be.revertedWithCustomError(
      productIdentification,
      "ProducerUnauthorizedAccount"
    );
  });

  it("Should emit ProductRegistered event when registering product", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });

    await expect(
      productIdentification
        .connect(otherAccount)
        .registerProduct("Milk", "Cow milk", 100)
    ).to.emit(productIdentification, "ProductRegistered");
  });

  it("Should be able to get product details", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow milk", 100);

    const productDetails = await productIdentification.getProduct(1);

    expect(productDetails[0]).to.equal(1);
    expect(productDetails[1]).to.equal("Milk");
    expect(productDetails[2]).to.equal("Cow milk");
    expect(productDetails[3]).to.equal(100);
    expect(productDetails[4]).to.equal(otherAccount.address);
  });

  it("Should not be able to get product details for unregistered product", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );

    await expect(productIdentification.getProduct(1)).to.be.revertedWith(
      "ProductIdentification: product is not registered"
    );
  });

  it("Should be able to get producer for product", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );
    await productIdentification.setProducerEnrollmentFee(100);
    await productIdentification
      .connect(otherAccount)
      .enrollProducer("John Doe", { value: 100 });
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow milk", 100);

    expect(await productIdentification.producerForProduct(1)).to.equal(
      otherAccount.address
    );
  });
});
