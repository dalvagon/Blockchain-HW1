const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const innitialSupply = 1000000;
const tokenPrice = 100;
const sampleTokens = 100;
const producerEnrollmentFee = 100;

describe("ProductIdentification", function () {
  async function deployProductIdentificationFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const SampleToken = await ethers.getContractFactory("SampleToken");
    const SampleTokenSale = await ethers.getContractFactory("SampleTokenSale");
    const ProductIdentification = await ethers.getContractFactory(
      "ProductIdentification"
    );
    const sampleToken = await SampleToken.deploy(innitialSupply);
    const sampleTokenSale = await SampleTokenSale.deploy(
      await sampleToken.getAddress(),
      tokenPrice
    );
    const productIdentification = await ProductIdentification.deploy(
      await sampleTokenSale.getAddress()
    );
    return {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    };
  }

  async function enrollProducer(
    productIdentification,
    sampleToken,
    sampleTokenSale,
    account
  ) {
    await productIdentification.setProducerEnrollmentFee(producerEnrollmentFee);
    await sampleToken.approve(
      await sampleTokenSale.getAddress(),
      producerEnrollmentFee
    );
    await sampleTokenSale.connect(account).buyTokens(producerEnrollmentFee, {
      value: producerEnrollmentFee * tokenPrice,
    });
    await sampleToken
      .connect(account)
      .approve(await productIdentification.getAddress(), producerEnrollmentFee);
    await productIdentification.connect(account).enrollProducer("John Doe");
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
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await enrollProducer(
      productIdentification,
      sampleToken,
      sampleTokenSale,
      otherAccount
    );

    expect(
      await productIdentification.isProducer(otherAccount.address)
    ).to.equal(true);
  });

  it("Should require producer name when enrolling as producer", async function () {
    const { productIdentification, owner, otherAccount } = await loadFixture(
      deployProductIdentificationFixture
    );

    await expect(
      productIdentification.connect(otherAccount).enrollProducer("")
    ).to.be.revertedWith("ProductIdentification: producer name is required");
  });

  it("Should not be able to enroll as producer with insufficient enrollment fee", async function () {
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await productIdentification.setProducerEnrollmentFee(producerEnrollmentFee);
    await sampleToken.approve(
      await sampleTokenSale.getAddress(),
      producerEnrollmentFee
    );
    await sampleTokenSale
      .connect(otherAccount)
      .buyTokens(producerEnrollmentFee - 1, {
        value: (producerEnrollmentFee - 1) * tokenPrice,
      });
    await expect(
      productIdentification.connect(otherAccount).enrollProducer("John Doe")
    ).to.be.revertedWith(
      "ProductIdentification: producer enrollment fee is required"
    );
  });

  it("Should not be able to enroll as producer twice", async function () {
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await enrollProducer(
      productIdentification,
      sampleToken,
      sampleTokenSale,
      otherAccount
    );

    await expect(
      productIdentification.connect(otherAccount).enrollProducer("John Doe")
    ).to.be.rejected;
  });

  if (
    ("Should be able to register products",
    async function () {
      const {
        productIdentification,
        sampleToken,
        sampleTokenSale,
        owner,
        otherAccount,
      } = await loadFixture(deployProductIdentificationFixture);
      await enrollProducer(
        productIdentification,
        sampleToken,
        sampleTokenSale,
        otherAccount
      );
      await productIdentification
        .connect(otherAccount)
        .registerProduct("Milk", "Cow milk", 100);

      expect(await productIdentification.isProductRegistered(1)).to.equal(true);
    })
  );

  it("Should require product name when registering product", async function () {
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await enrollProducer(
      productIdentification,
      sampleToken,
      sampleTokenSale,
      otherAccount
    );

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
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await enrollProducer(
      productIdentification,
      sampleToken,
      sampleTokenSale,
      otherAccount
    );

    await expect(
      productIdentification
        .connect(otherAccount)
        .registerProduct("Milk", "Cow milk", 100)
    ).to.emit(productIdentification, "ProductRegistered");
  });

  it("Should be able to get product details", async function () {
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await enrollProducer(
      productIdentification,
      sampleToken,
      sampleTokenSale,
      otherAccount
    );
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
    const {
      productIdentification,
      sampleToken,
      sampleTokenSale,
      owner,
      otherAccount,
    } = await loadFixture(deployProductIdentificationFixture);
    await enrollProducer(
      productIdentification,
      sampleToken,
      sampleTokenSale,
      otherAccount
    );
    await productIdentification
      .connect(otherAccount)
      .registerProduct("Milk", "Cow milk", 100);

    expect(await productIdentification.producerForProduct(1)).to.equal(
      otherAccount.address
    );
  });
});
