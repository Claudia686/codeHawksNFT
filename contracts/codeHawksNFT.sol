// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CodeHawksNFT is ERC721 {
    address public owner;
    uint256 public totalCounter = 0;

    struct Submission {
      address contributor;
      string poc;
      string level;
  }

  /// @notice Stores submissions made by users
  /// @notice Each user can have multiple submissions
  mapping(address => Submission[]) public userSubmissions;

  /// @notice Tracks whether a user is registered to submit vulnerabilities
  /// @notice A value of true means the user is registered
  mapping(address => bool) public userRegistered;

  /// @notice Checks if submissions was approved
  mapping(address => mapping(uint256 => bool)) public isApproved;

  /// @notice store and retrieve all token IDs minted for each user
  mapping(address => uint256[]) public userTokenIds;

  /// @notice Emit event for submission being created
  event SubmissionCreated(address contributor);
  /// @notice Emit event for approved submissions
  event Approved(address user, uint256 tokenId);

  modifier onlyOwner() {
      require(msg.sender == owner, "CodeHawksNFT: Only owner can call this function");
    _;
  }

  /// @dev Initializes the contract by setting a name and symbol for tokens
  constructor(
      string memory name, 
      string memory symbol
  ) ERC721(name, symbol) {
      owner = msg.sender;
  }

  /// @dev Users must be registered first before submitting a vulnerability 
  /// @notice User should register only once
  function registerUser(address _user) public {
      require(!userRegistered[_user], "CodeHawksNFT: User already registered");
      userRegistered[_user] = true;
  } 

  /// @notice Allows a registered user to submit a vulnerability
  /// @dev Ensures that the user is registered before allowing the submission
  /// @dev The submission includes details of the vulnerability and its severity level
  /// @param _poc The details of the vulnerability (proof of concept)
  /// @param _level The severity level of the vulnerability (e.g., low, medium, or high)
  function submitVulnerability(
      string memory _poc, 
      string memory _level
  ) public {
      require(userRegistered[msg.sender], "CodeHawksNFT: User must be registered");
      Submission memory newSubmission = Submission({
          contributor: msg.sender,
          poc: _poc,
          level: _level
      });
      userSubmissions[msg.sender].push(newSubmission);
      emit SubmissionCreated(msg.sender);
  }

  /// @dev Returns total submissions
  function getUserSubmissions() public view returns (Submission[] memory) {
      return userSubmissions[msg.sender];
  } 

  /// @dev onlyOwner can approve submissions
  /// @param user, Is user address
  /// @param tokenId, Is uniq token id
  /// @notice Checks if ID is valid
  /// @notice Check that submission is not yet approved
  /// @notice Sets submission to true, meaning submission was approved by the owner
  /// @dev Once approved NFTs are minted based on the severity level
  /// @notice Emit approved event with user and tokenId
  function approveSubmissions(address user, uint256 tokenId) public onlyOwner {
      require(tokenId < userSubmissions[user].length, "CodeHawksNFT: Invalid submission ID");
      Submission storage submission = userSubmissions[user][tokenId];
      require(!isApproved[user][tokenId], "CodeHawksNFT: Submission already approved");
      isApproved[user][tokenId] = true;

      uint256 nftCount = 0;
      if (keccak256(bytes(submission.level)) == keccak256(bytes("Low"))) {
          nftCount = 1;
      } else if (keccak256(bytes(submission.level)) == keccak256(bytes("Medium"))) {
          nftCount = 2;
      } else if (keccak256(bytes(submission.level)) == keccak256(bytes("High"))) {
          nftCount = 3;
      }
      
      uint256 newTokenId = totalCounter;
      totalCounter++;
      _mint(user, newTokenId);
      userTokenIds[user].push(newTokenId);
      emit Approved(user, tokenId);
  }
}