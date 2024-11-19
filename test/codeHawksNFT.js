const {
  ethers
} = require("hardhat");
const {
  expect
} = require("chai");

const name = "CodeHawksNFT"
const symbol = "CH"

describe("CodeHawksNFT", () => {
  let codeHawksNFT, owner, user

  beforeEach(async () => {
    [owner, user] = await ethers.getSigners()

    // Deplay contract
    const CodeHawksNFT = await ethers.getContractFactory("CodeHawksNFT")
    codeHawksNFT = await CodeHawksNFT.deploy(name, symbol)
    await codeHawksNFT.waitForDeployment()
  })

  describe("Deployment", () => {
    // Check for the name
    it("It has a name", async () => {
      expect(await codeHawksNFT.name()).to.equal(name)
    })

    // Check for the symbol
    it("It has a symbol", async () => {
      expect(await codeHawksNFT.symbol()).to.equal(symbol)
    })

    // Check for the owner
    it("It has a owner", async () => {
      expect(await codeHawksNFT.owner()).to.equal(owner.address)
    })
  })

  describe("Register User", () => {
    describe("Success", () => {
      // Register user
      it("Allow user to register", async () => {
        const tx = await codeHawksNFT.registerUser(user.address)
        const isRegistered = await codeHawksNFT.userRegistered(user.address)
        expect(isRegistered).to.equal(true);
      })
    })

    describe("Failure", () => {
      // Rejects if user already registered
      it("Revert if user already registered", async () => {
        const tx = await codeHawksNFT.registerUser(user.address)
        await expect(codeHawksNFT.registerUser(user.address))
          .to.be.revertedWith("CodeHawksNFT: User already registered");
      })
    })
  })
})