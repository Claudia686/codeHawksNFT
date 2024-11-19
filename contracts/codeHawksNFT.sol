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
  /// @notice A value of `true` means the user is registered
  mapping(address => bool) public userRegistered;

  /// @notice Emit event for submission being created
  event SubmissionCreated(address contributor);

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
      totalCounter++;

      Submission memory newSubmission = Submission({
          contributor: msg.sender,
          poc: _poc,
          level: _level
      });
      userSubmissions[msg.sender].push(newSubmission);
      emit SubmissionCreated(msg.sender);
  }

  /// @dev Returns total submissions
  function getUserSubmissions(address _user) public view returns (Submission[] memory) {
      return userSubmissions[_user];
  }   
}

