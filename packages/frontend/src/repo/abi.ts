export const scholarshipAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_donaterNFTAddress",
        type: "address",
      }, {
        internalType: "address",
        name: "_studentNFTAddress",
        type: "address",
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  }, {
    inputs: [],
    name: "AccessControlBadConfirmation",
    type: "error",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      }, {
        internalType: "bytes32",
        name: "neededRole",
        type: "bytes32",
      }
    ],
    name: "AccessControlUnauthorizedAccount",
    type: "error",
  }, {
    inputs: [],
    name: "AlreadyApply",
    type: "error",
  }, {
    inputs: [],
    name: "AlreadyVote",
    type: "error",
  }, {
    inputs: [],
    name: "ApplicantNotEnough",
    type: "error",
  }, {
    inputs: [],
    name: "ArrayCannotEmpty",
    type: "error",
  }, {
    inputs: [],
    name: "CannotWithdrawNotInQuorum",
    type: "error",
  }, {
    inputs: [],
    name: "DonationIsNotEnough",
    type: "error",
  }, {
    inputs: [],
    name: "NotInMinimalAmount",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyApplicantCanWithdraw",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyCloseRole",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyDonateOnce",
    type: "error",
  }, {
    inputs: [
      {
        internalType: "enum ScholarshipStatus",
        name: "status",
        type: "uint8",
      }
    ],
    name: "OnlyInStatus",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyOpenDonationRole",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyOpenRole",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyValidApplicant",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyValidMilestone",
    type: "error",
  }, {
    inputs: [],
    name: "OnlyVoteRole",
    type: "error",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      }
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      }
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  }, {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  }, {
    inputs: [],
    name: "WithdrawMilestoneOnlyOnce",
    type: "error",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "address",
        name: "applicant",
        type: "address",
      }
    ],
    name: "AddMilestone",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "applicantAddress",
        type: "address",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }
    ],
    name: "ApplicantApplied",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "quromVote",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "applicantTarget",
        type: "uint256",
      }
    ],
    name: "BatchStarted",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "donater",
        type: "address",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      }
    ],
    name: "Donated",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        indexed: true,
        internalType: "uint256",
        name: "batch",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      }
    ],
    name: "MilestoneWithdrawed",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      }, {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      }
    ],
    name: "OwnershipTransferred",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        indexed: true,
        internalType: "bytes32",
        name: "previousAdminRole",
        type: "bytes32",
      }, {
        indexed: true,
        internalType: "bytes32",
        name: "newAdminRole",
        type: "bytes32",
      }
    ],
    name: "RoleAdminChanged",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      }, {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      }
    ],
    name: "RoleGranted",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        indexed: true,
        internalType: "address",
        name: "account",
        type: "address",
      }, {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      }
    ],
    name: "RoleRevoked",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "voter",
        type: "address",
      }, {
        indexed: false,
        internalType: "address",
        name: "applicant",
        type: "address",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }
    ],
    name: "Voted",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }
    ],
    name: "VotingCompleted",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }
    ],
    name: "VotingStarted",
    type: "event",
  }, {
    inputs: [],
    name: "CLOSE_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "DEFAULT_ADMIN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "MINIMAL_DONATION",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "OPEN_DONATION_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "OPEN_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "OPEN_VOTE_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "TRANSACTION_FEE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "appBatch",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "appStatus",
    outputs: [
      {
        internalType: "enum ScholarshipStatus",
        name: "",
        type: "uint8",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    name: "applicantSize",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256[]",
        name: "milestones_",
        type: "uint256[]",
      }, {
        internalType: "string",
        name: "uri",
        type: "string",
      }
    ],
    name: "applyApplicant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "closeBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "string",
        name: "uri",
        type: "string",
      }
    ],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "_applicantAddress",
        type: "address",
      }
    ],
    name: "getApplicant",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "applicantAddress",
            type: "address",
          }, {
            internalType: "uint256",
            name: "voteCount",
            type: "uint256",
          }
        ],
        internalType: "struct Applicant",
        name: "",
        type: "tuple",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "getApplicantSize",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "voter_",
        type: "address",
      }
    ],
    name: "getIsAlreadyVote",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }
    ],
    name: "getMilestone",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          }, {
            internalType: "string",
            name: "metadata",
            type: "string",
          }, {
            internalType: "address",
            name: "applicant",
            type: "address",
          }, {
            internalType: "bool",
            name: "isWithdrawed",
            type: "bool",
          }
        ],
        internalType: "struct ScholarshipMilestoneManagement.Milestone",
        name: "",
        type: "tuple",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "getNextMilestone",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }
    ],
    name: "getRoleAdmin",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        internalType: "address",
        name: "account",
        type: "address",
      }
    ],
    name: "grantRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        internalType: "address",
        name: "account",
        type: "address",
      }
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "openDonation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "openVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        internalType: "address",
        name: "callerConfirmation",
        type: "address",
      }
    ],
    name: "renounceRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      }, {
        internalType: "address",
        name: "account",
        type: "address",
      }
    ],
    name: "revokeRole",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "stackedToken",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "_quorum",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "_applicantTarget",
        type: "uint256",
      }
    ],
    name: "startApplication",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "bytes4",
        name: "interfaceId",
        type: "bytes4",
      }
    ],
    name: "supportsInterface",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      }
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "_applicantAddress",
        type: "address",
      }
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "batch",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        internalType: "string",
        name: "metadata",
        type: "string",
      }
    ],
    name: "withrawMilestone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const