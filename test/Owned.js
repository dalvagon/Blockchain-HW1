const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Owned", function () {
    async function deployOwnedFixture() {
        const [owner, otherAccount] = await ethers.getSigners();
        const Owned = await ethers.getContractFactory("Owned");
        const owned = await Owned.deploy();
        return { owned, owner, otherAccount };
    }

    it("Should set the right owner", async function () {
        const { owned, owner } = await loadFixture(deployOwnedFixture);

        expect(await owned.owner()).to.equal(owner.address);
    });
});