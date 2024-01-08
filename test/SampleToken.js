const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;
const innitialSupply = 1000000;
const tokenPrice = 100;
const sampleTokens = 100;

describe("SampleToken", function () {
  async function deploySampleTokenFixture() {
    const [owner, account1, account2] = await ethers.getSigners();
    const SampleToken = await ethers.getContractFactory("SampleToken");
    const SampleTokenSale = await ethers.getContractFactory("SampleTokenSale");

    const sampleToken = await SampleToken.deploy(innitialSupply);
    const sampleTokenSale = await SampleTokenSale.deploy(
      await sampleToken.getAddress(),
      tokenPrice
    );
    return { sampleToken, sampleTokenSale, owner, account1, account2 };
  }

  it("Should return the name of the token", async function () {
    const { sampleToken } = await loadFixture(deploySampleTokenFixture);
    expect(await sampleToken.name()).to.equal("Sample Token");
  });

  it("Should return the symbol of the token", async function () {
    const { sampleToken } = await loadFixture(deploySampleTokenFixture);
    expect(await sampleToken.symbol()).to.equal("TOK");
  });

  it("Should return the total supply of the token", async function () {
    const { sampleToken } = await loadFixture(deploySampleTokenFixture);
    expect(await sampleToken.totalSupply()).to.equal(innitialSupply);
  });

  it("Should be able to transfer tokens", async function () {
    const { sampleToken, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.transfer(account1.address, sampleTokens);
    expect(await sampleToken.balanceOf(account1.address)).to.equal(
      sampleTokens
    );
  });

  it("Should not be able to transfer more tokens than you have", async function () {
    const { sampleToken, owner, account1, account2 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.transfer(account1.address, sampleTokens);
    await expect(
      sampleToken.connect(account1).transfer(account2.address, sampleTokens + 1)
    ).to.be.reverted;
  });

  it("Should be able to give allowance", async function () {
    const { sampleToken, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(account1.address, sampleTokens);
    expect(
      await sampleToken.allowance(owner.address, account1.address)
    ).to.equal(sampleTokens);
  });

  it("Should be able to transfer tokens from allowance", async function () {
    const { sampleToken, owner, account1, account2 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(account1.address, sampleTokens);
    await sampleToken
      .connect(account1)
      .transferFrom(owner.address, account2.address, sampleTokens);
    expect(await sampleToken.balanceOf(account2.address)).to.equal(
      sampleTokens
    );
  });

  it("Should not be able to transfer more tokens than you have in allowance", async function () {
    const { sampleToken, owner, account1, account2 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(account1.address, sampleTokens);
    await expect(
      sampleToken
        .connect(account1)
        .transferFrom(owner.address, account2.address, sampleTokens + 1)
    ).to.be.reverted;
  });

  it("Should not be able to transfer more tokens than you have to someone else", async function () {
    const { sampleToken, owner, account1, account2 } = await loadFixture(
      deploySampleTokenFixture
    );
    await expect(
      sampleToken.transferFrom(account1.address, account2.address, sampleTokens)
    ).to.be.reverted;
  });

  it("Should be able to buy tokens", async function () {
    const { sampleToken, sampleTokenSale, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(await sampleTokenSale.getAddress(), sampleTokens);
    await sampleTokenSale.connect(account1).buyTokens(sampleTokens, {
      value: sampleTokens * tokenPrice,
    });

    expect(await sampleToken.balanceOf(account1.address)).to.equal(
      sampleTokens
    );
  });

  it("Should not be able to buy more tokens than available", async function () {
    const { sampleToken, sampleTokenSale, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.transfer(
      await sampleTokenSale.getAddress(),
      sampleTokens
    );
    await expect(
      sampleTokenSale.connect(account1).buyTokens(sampleTokens + 1, {
        value: (sampleTokens + 1) * tokenPrice,
      })
    ).to.be.reverted;
  });

  it("Should be able to end sale", async function () {
    const { sampleToken, sampleTokenSale, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(await sampleTokenSale.getAddress(), sampleTokens);
    await sampleTokenSale.connect(account1).buyTokens(sampleTokens, {
      value: sampleTokens * tokenPrice,
    });
    await sampleTokenSale.connect(owner).endSale();
    expect(await sampleToken.balanceOf(owner.address)).to.equal(
      innitialSupply - sampleTokens
    );
  });

  it("Should not be able to end sale if not owner", async function () {
    const { sampleToken, sampleTokenSale, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.transfer(
      await sampleTokenSale.getAddress(),
      sampleTokens
    );
    await expect(sampleTokenSale.connect(account1).endSale()).to.be.reverted;
  });

  it("Should not be able to buy tokens when paying incorrect price", async function () {
    const { sampleToken, sampleTokenSale, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(await sampleTokenSale.getAddress(), sampleTokens);
    await expect(
      sampleTokenSale.connect(account1).buyTokens(sampleTokens, {
        value: 0,
      })
    ).to.be.reverted;
  });

  it("Should not be able to buy more tokens than the owner has", async function () {
    const { sampleToken, sampleTokenSale, owner, account1 } = await loadFixture(
      deploySampleTokenFixture
    );
    await sampleToken.approve(await sampleTokenSale.getAddress(), sampleTokens);
    await expect(
      sampleTokenSale.connect(account1).buyTokens(innitialSupply + 1, {
        value: (innitialSupply + 1) * tokenPrice,
      })
    ).to.be.revertedWith;
  });
});
