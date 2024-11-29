const {
  ethers
} = require("hardhat");
const {
  expect
} = require("chai");

const name = "CodeHawksNFT"
const symbol = "CH"

describe("CodeHawksNFT", () => {
  let codeHawksNFT, owner

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
        await expect(codeHawksNFT.registerUser(user.address)).
        to.be.revertedWith("CodeHawksNFT: User already registered");
      })
    })
  })

  describe("Submit vulnerability", () => {
    describe("Success", () => {
      let poc1, severity1, poc2, severity2, poc3, severity3

      beforeEach(async () => {
        poc1 = "Unauthorized access in admin function"
        severity1 = "low"

        poc2 = "Missing input validation in user registration"
        severity2 = "medium"

        poc3 = "Reentrancy attack in withdrawal function"
        severity3 = "high"

        // User register
        await codeHawksNFT.registerUser(user.address)
        // Submit vulnerability
        await codeHawksNFT.connect(user).submitVulnerability(poc1, severity1)
      })

      // Fetch user submissions
      it("Allows a registered user to submit a vulnerability", async () => {
        const submissions = await codeHawksNFT.connect(user).getUserSubmissions()
        expect(submissions.length).to.equal(1)
        expect(submissions[0].contributor).to.equal(user.address)
        expect(submissions[0].poc).to.equal(poc1)
        expect(submissions[0].level).to.equal(severity1)
      })

      // Check for SubmissionCreated event
      it("Check for submission created event", async () => {
        await expect(codeHawksNFT.connect(user).submitVulnerability(poc1, severity1)).
        to.emit(codeHawksNFT, "SubmissionCreated").withArgs(user.address)
      })

      // Owner submit multiple vulnerabilities
      it("Submit multiple vulnerabilities", async () => {
        // Register owner
        await codeHawksNFT.connect(owner).registerUser(owner.address)

        // Submit vulnerabilities 
        await codeHawksNFT.connect(owner).submitVulnerability(poc2, severity2)
        await codeHawksNFT.connect(owner).submitVulnerability(poc3, severity3)
        const ownerSubmissions = await codeHawksNFT.connect(owner).getUserSubmissions()

        // Check owner submission for poc2
        expect(ownerSubmissions.length).to.equal(2)
        expect(ownerSubmissions[0].contributor).to.equal(owner.address)
        expect(ownerSubmissions[0].poc).to.equal(poc2)
        expect(ownerSubmissions[0].level).to.equal(severity2)

        // Check owner submission for poc3
        expect(ownerSubmissions[1].contributor).to.equal(owner.address)
        expect(ownerSubmissions[1].poc).to.equal(poc3)
        expect(ownerSubmissions[1].level).to.equal(severity3)
      })
    })

    describe("Failure", () => {
      // Revert if user is not registered 
      it("Reverts when unregistered user submits vulnerability", async () => {
        const poc1 = "Unauthorized access in admin function"
        const severity1 = "low"
        await expect(codeHawksNFT.connect(owner).submitVulnerability(poc1, severity1)).
        to.be.revertedWith("CodeHawksNFT: User must be registered");
      })
    })
  })

  describe("Approve submissions", () => {
    describe("Success", () => {
      let poc1, severity1, poc2, severity2

      beforeEach(async () => {
        poc1 = "Unauthorized access in admin function"
        severity1 = "low"

        poc2 = "Missing input validation in user registration"
        severity2 = "medium"

        // User register
        await codeHawksNFT.connect(user).registerUser(user.address)
        await codeHawksNFT.connect(owner).registerUser(owner.address)

      })

      // Approve and mint
      it("Owner approves submissions and mint", async () => {
        // User and owner submits new vulnerabilities
        await codeHawksNFT.connect(user).submitVulnerability(poc1, severity1)
        await codeHawksNFT.connect(user).submitVulnerability(poc2, severity2)
        await codeHawksNFT.connect(owner).submitVulnerability(poc2, severity2)

        // Check user balance before approval
        const userBalanceBefore = await codeHawksNFT.balanceOf(user.address)

        // Check owner balance before approval
        const ownerBalanceBefore = await codeHawksNFT.balanceOf(owner.address)

        // Check counter before approval
        const counterBefore = await codeHawksNFT.totalCounter()
        expect(counterBefore).to.equal(0)

        // Approve all submissions
        await codeHawksNFT.connect(owner).approveSubmissions(user.address, 0)
        expect(await codeHawksNFT.isApproved(user.address, 0)).to.be.true

        await codeHawksNFT.connect(owner).approveSubmissions(user.address, 1)
        expect(await codeHawksNFT.isApproved(user.address, 1)).to.be.true

        await codeHawksNFT.connect(owner).approveSubmissions(owner.address, 0)
        expect(await codeHawksNFT.isApproved(owner.address, 0)).to.be.true

        // Check total counter after approval
        const counterAfter = await codeHawksNFT.totalCounter()
        expect(counterAfter).to.equal(3)

        // Check user balance after approval
        const userBalanceAfter = await codeHawksNFT.balanceOf(user.address)
        expect(userBalanceAfter).to.be.greaterThan(userBalanceBefore)

        // Check owner balance after approval
        const ownerBalanceAfter = await codeHawksNFT.balanceOf(owner.address)

        // Verifty ownership of the NFT for user address
        const userNFT = await codeHawksNFT.ownerOf(1)
        expect(userNFT).to.equal(user.address)

        // Verifty ownership of the NFT for owner address
        const ownerNft = await codeHawksNFT.ownerOf(2)
        expect(ownerNft).to.equal(owner.address)
      })

      // Check for Approved event
      it("Should emit approved event", async () => {
        // User submits a vulnerability
        await codeHawksNFT.connect(user).submitVulnerability(poc1, severity1)
        // Emit event with user address and tokenId
        await expect(codeHawksNFT.connect(owner).approveSubmissions(user.address, 0)).
        to.emit(codeHawksNFT, "Approved").withArgs(user.address, 0)
      })
    })

    describe("Failure", () => {
      let poc1, severity1
      beforeEach(async () => {
        poc1 = "Unauthorized access in admin function"
        severity1 = "low"
        // User register
        await codeHawksNFT.connect(user).registerUser(user.address)
      })

      // Revert dublicate submissions
      it("Should not allow duplicate submissions", async () => {
        // User submits a vulnerability
        await codeHawksNFT.connect(user).submitVulnerability(poc1, severity1)

        // Dublicate submissions
        await codeHawksNFT.connect(owner).approveSubmissions(user.address, 0)
        await expect(codeHawksNFT.connect(owner).approveSubmissions(user.address, 0)).
        to.be.revertedWith("CodeHawksNFT: Submission already approved");
      })

      // Revert invalid ID
      it("Revert invalid submission id", async () => {
        const invalidId = 10
        // User submits a vulnerability
        await codeHawksNFT.connect(user).submitVulnerability(poc1, severity1)

        // Approve submission with an invalid ID
        await expect(codeHawksNFT.connect(owner).approveSubmissions(user.address, invalidId)).
        to.be.revertedWith("CodeHawksNFT: Invalid submission ID");
      })
    })
  })
})