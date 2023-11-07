const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");
const provider = ethers.provider;

describe("ProductIdentification", function () {
    async function deployOwnedFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const ProductIdentification = await ethers.getContractFactory("ProductIdentification");
        const productIdentification = await ProductIdentification.deploy();
        return { productIdentification, owner, otherAccount };
    }

    it("Should set the right owner", async function () {
        const { productIdentification, owner } = await loadFixture(deployOwnedFixture);

        expect(await productIdentification.owner()).to.equal(owner.address);
    });

    it("Owner should be able to set producer enrollment fee", async function () {
        const { productIdentification, owner } = await loadFixture(deployOwnedFixture);

        await productIdentification.setProducerEnrollmentFee(100);

        expect(await productIdentification.producerEnrollmentFee()).to.equal(100);
    });

    it("Non-owner should not be able to set producer enrollment fee", async function () {
        const { productIdentification, owner, otherAccount } = await loadFixture(deployOwnedFixture);

        await expect(productIdentification.connect(otherAccount).setProducerEnrollmentFee(100)).to.be.revertedWithCustomError(productIdentification, "OwnableUnauthorizedAccount");
    });

    it("Should be able to enroll as producer", async function () {
        const { productIdentification, owner, otherAccount } = await loadFixture(deployOwnedFixture);

        await productIdentification.setProducerEnrollmentFee(100);
        await productIdentification.connect(otherAccount).enrollProducer("John Doe", { value: 100 });

        expect(await productIdentification.isProducer(otherAccount.address)).to.equal(true);
    });

    it("Should not be able to enroll as producer with insufficient enrollment fee", async function () {
        const { productIdentification, owner, otherAccount } = await loadFixture(deployOwnedFixture);

        await productIdentification.setProducerEnrollmentFee(100);

        await expect(productIdentification.connect(otherAccount).enrollProducer("John Doe", { value: 99 })).to.be.revertedWith("ProductIdentification: producer enrollment fee is required");
    });

    it("Should not be able to enroll as producer twice", async function () {
        const { productIdentification, owner, otherAccount } = await loadFixture(deployOwnedFixture);

        await productIdentification.setProducerEnrollmentFee(100);
        await productIdentification.connect(otherAccount).enrollProducer("John Doe", { value: 100 });

        await expect(productIdentification.connect(otherAccount).enrollProducer("John Doe", { value: 100 })).to.be.revertedWith("ProductIdentification: producer already enrolled");
    });

    it("Should emit Received event when enrolling as producer", async function () {
        const { productIdentification, owner, otherAccount } = await loadFixture(deployOwnedFixture);

        await productIdentification.setProducerEnrollmentFee(100);

        await expect(productIdentification.connect(otherAccount).enrollProducer("John Doe", { value: 102 }))
            .to.emit(productIdentification, "Received");
    });
});