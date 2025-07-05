export const scholarshipAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_programImplementation",
        type: "address",
      }, {
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
    name: "AlreadyMint",
    type: "error",
  }, {
    inputs: [],
    name: "DonationFailed",
    type: "error",
  }, {
    inputs: [],
    name: "FailedDeployment",
    type: "error",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      }
    ],
    name: "InsufficientBalance",
    type: "error",
  }, {
    inputs: [],
    name: "InvalidInitialization",
    type: "error",
  }, {
    inputs: [],
    name: "NotAcceptingDonations",
    type: "error",
  }, {
    inputs: [],
    name: "NotAllowedToMint",
    type: "error",
  }, {
    inputs: [],
    name: "NotInitializing",
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
    name: "ProgramNotFound",
    type: "error",
  }, {
    inputs: [],
    name: "ReentrancyGuardReentrantCall",
    type: "error",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      }, {
        indexed: true,
        internalType: "address",
        name: "applicant",
        type: "address",
      }
    ],
    name: "Applied",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      }, {
        indexed: true,
        internalType: "address",
        name: "donor",
        type: "address",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      }
    ],
    name: "Donated",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      }
    ],
    name: "Initialized",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "programId",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "milestoneId",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address",
      }
    ],
    name: "MilestoneClaimed",
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
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "address",
        name: "programContract",
        type: "address",
      }, {
        indexed: true,
        internalType: "address",
        name: "initiator",
        type: "address",
      }, {
        indexed: false,
        internalType: "string",
        name: "programMetadataCID",
        type: "string",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "targetApplicant",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      }
    ],
    name: "ProgramCreated",
    type: "event",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        components: [
          {
            internalType: "enum MilestoneType",
            name: "mType",
            type: "uint8",
          }, {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "templateId",
            type: "uint256",
          }, {
            internalType: "string",
            name: "metadata",
            type: "string",
          }
        ],
        internalType: "struct MilestoneInput[]",
        name: "milestone",
        type: "tuple[]",
      }
    ],
    name: "applyToProgram",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "batch",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "milestone",
        type: "uint256",
      }
    ],
    name: "claimMilestone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "string",
        name: "cid",
        type: "string",
      }, {
        internalType: "uint256",
        name: "target",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "start",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "end",
        type: "uint256",
      }
    ],
    name: "createProgram",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      }, {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    name: "createdContractsByUser",
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
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }
    ],
    name: "donateToProgram",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  }, {
    inputs: [],
    name: "getAllPrograms",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          }, {
            internalType: "address",
            name: "initiatorAddress",
            type: "address",
          }, {
            internalType: "string",
            name: "programMetadataCID",
            type: "string",
          }, {
            internalType: "uint256",
            name: "targetApplicant",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "startDate",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "endDate",
            type: "uint256",
          }, {
            internalType: "address",
            name: "programContractAddress",
            type: "address",
          }
        ],
        internalType: "struct ScholarshipProgramDetails[]",
        name: "list",
        type: "tuple[]",
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
    name: "getApplicants",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
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
    name: "getContractBalance",
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
        name: "id",
        type: "uint256",
      }
    ],
    name: "getDonators",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "offset",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "limit",
        type: "uint256",
      }
    ],
    name: "getOpenProgramsSummaryPaged",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "programAddress",
            type: "address",
          }, {
            internalType: "uint256",
            name: "balance",
            type: "uint256",
          }, {
            internalType: "address[]",
            name: "applicants",
            type: "address[]",
          }, {
            internalType: "string",
            name: "metadataCID",
            type: "string",
          }
        ],
        internalType: "struct ProgramSummary[]",
        name: "",
        type: "tuple[]",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "getProgramCreator",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
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
    name: "getProgramData",
    outputs: [
      {
        internalType: "contract ScholarshipProgram",
        name: "program",
        type: "address",
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
    name: "getProgramDetails",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          }, {
            internalType: "address",
            name: "initiatorAddress",
            type: "address",
          }, {
            internalType: "string",
            name: "programMetadataCID",
            type: "string",
          }, {
            internalType: "uint256",
            name: "targetApplicant",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "startDate",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "endDate",
            type: "uint256",
          }, {
            internalType: "address",
            name: "programContractAddress",
            type: "address",
          }
        ],
        internalType: "struct ScholarshipProgramDetails",
        name: "",
        type: "tuple",
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
    name: "getProgramStatus",
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
        internalType: "string",
        name: "uri",
        type: "string",
      }, {
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }
    ],
    name: "mintDonaterNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "string",
        name: "uri",
        type: "string",
      }, {
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }
    ],
    name: "mintStudentNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "nextProgramId",
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
    name: "programImplementation",
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
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    name: "programs",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        internalType: "address",
        name: "initiatorAddress",
        type: "address",
      }, {
        internalType: "string",
        name: "programMetadataCID",
        type: "string",
      }, {
        internalType: "uint256",
        name: "targetApplicant",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      }, {
        internalType: "address",
        name: "programContractAddress",
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
        internalType: "uint256",
        name: "id",
        type: "uint256",
      }, {
        internalType: "address",
        name: "applicant",
        type: "address",
      }
    ],
    name: "voteApplicant",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }
] as const
export const scholarshipProgramAbi = [
  {
    inputs: [],
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
    name: "InvalidInitialization",
    type: "error",
  }, {
    inputs: [],
    name: "NotInMinimalAmount",
    type: "error",
  }, {
    inputs: [],
    name: "NotInitializing",
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
        name: "applicant",
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
        indexed: false,
        internalType: "address",
        name: "caller",
        type: "address",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      }
    ],
    name: "DebugDonateCalled",
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
        name: "amount",
        type: "uint256",
      }
    ],
    name: "Donated",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint64",
        name: "version",
        type: "uint64",
      }
    ],
    name: "Initialized",
    type: "event",
  }, {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "batchId",
        type: "uint256",
      }, {
        indexed: true,
        internalType: "uint256",
        name: "templateId",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      }, {
        indexed: false,
        internalType: "string",
        name: "metadata",
        type: "string",
      }
    ],
    name: "MilestoneTemplateAdded",
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
    name: "_getAllApplicantsWithVotes",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      }, {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
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
        internalType: "address",
        name: "_applicant",
        type: "address",
      }, {
        components: [
          {
            internalType: "enum MilestoneType",
            name: "mType",
            type: "uint8",
          }, {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "templateId",
            type: "uint256",
          }, {
            internalType: "string",
            name: "metadata",
            type: "string",
          }
        ],
        internalType: "struct MilestoneInput[]",
        name: "milestoneIds",
        type: "tuple[]",
      }
    ],
    name: "applyProgram",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        components: [
          {
            internalType: "enum MilestoneType",
            name: "mType",
            type: "uint8",
          }, {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "templateId",
            type: "uint256",
          }, {
            internalType: "string",
            name: "metadata",
            type: "string",
          }
        ],
        internalType: "struct MilestoneInput[]",
        name: "milestoneIds",
        type: "tuple[]",
      }
    ],
    name: "applyProgramContract",
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
    inputs: [],
    name: "closeDonation",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        components: [
          {
            internalType: "enum MilestoneType",
            name: "mType",
            type: "uint8",
          }, {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          }, {
            internalType: "uint256",
            name: "templateId",
            type: "uint256",
          }, {
            internalType: "string",
            name: "metadata",
            type: "string",
          }
        ],
        internalType: "struct MilestoneInput",
        name: "milestoneInput",
        type: "tuple",
      }
    ],
    name: "createTemplateMilestone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "address",
        name: "donator",
        type: "address",
      }
    ],
    name: "donate",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  }, {
    inputs: [],
    name: "donateContract",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  }, {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      }
    ],
    name: "donators",
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
    name: "endDate",
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
    name: "getAllMilestoneTemplates",
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
          }
        ],
        internalType: "struct MilestoneTemplate[]",
        name: "",
        type: "tuple[]",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "getAppBatch",
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
    name: "getAppStatus",
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
    inputs: [],
    name: "getApplicants",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      }
    ],
    stateMutability: "view",
    type: "function",
  }, {
    inputs: [],
    name: "getBalance",
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
    name: "getDonators",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
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
        name: "batch",
        type: "uint256",
      }, {
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
          }, {
            internalType: "enum MilestoneType",
            name: "mType",
            type: "uint8",
          }
        ],
        internalType: "struct Milestone",
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
    inputs: [
      {
        internalType: "string",
        name: "_programMetadataCID",
        type: "string",
      }, {
        internalType: "address",
        name: "_initiatorAddress",
        type: "address",
      }, {
        internalType: "uint256",
        name: "_targetApplicant",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "_startDate",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "_endDate",
        type: "uint256",
      }
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "initiatorAddress",
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
    inputs: [
      {
        internalType: "uint256",
        name: "batch",
        type: "uint256",
      }
    ],
    name: "isCanWithdraw",
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
        name: "batchId",
        type: "uint256",
      }, {
        internalType: "uint256",
        name: "templateId",
        type: "uint256",
      }
    ],
    name: "milestoneTemplates",
    outputs: [
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      }, {
        internalType: "string",
        name: "metadata",
        type: "string",
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
    name: "programMetadataCID",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
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
        name: "_applicantTarget",
        type: "uint256",
      }
    ],
    name: "startApplication",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    inputs: [],
    name: "startDate",
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
    inputs: [],
    name: "targetApplicant",
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
        name: "voter",
        type: "address",
      }, {
        internalType: "address",
        name: "applicant",
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
        internalType: "address",
        name: "applicant",
        type: "address",
      }
    ],
    name: "voteContract",
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
      }
    ],
    name: "withrawMilestone",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  }, {
    stateMutability: "payable",
    type: "receive",
  }
] as const