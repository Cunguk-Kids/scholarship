export const abi = [
  {
    "type": "constructor",
    "name": "",
    "inputs": [
      {
        "name": "_erc20Address",
        "type": "address"
      },
      {
        "name": "_applicantNFTAddress",
        "type": "address"
      },
      {
        "name": "_programCreatorNFTAddresss",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "error",
    "name": "AccessControlBadConfirmation",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "AccessControlUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address"
      },
      {
        "name": "neededRole",
        "type": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "AlreadyApplied",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "AlreadyVoted",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "ApplicantAlreadyWithdrawFund",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "CanOnlyWithdrawOnDeadline",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "CannotCreateProgramInThePast",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "DateIsNotSequential",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "MilestoneAlreadyApproved",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "MilestoneNotAllCompleted",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "NotOnMinimalFund",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyApplicant",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyApplicantOrProgramCreator",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyMilestoneCreator",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyMintIfMilestoneCompleted",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyNotVoted",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyOnVoting",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyProgramCreator",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyValidMilestone",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "OnlyValidProgram",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "ProgramNotClosed",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "ProgramNotOngoing",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "ProgramNotOpen",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "error",
    "name": "WithdrawMilestoneOnlyWorkOnFixedAllocation",
    "inputs": [],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "ApplicantRegistered",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "applicantAddress",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "ApproveMilestone",
    "inputs": [
      {
        "name": "milestoneId",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "MilestoneAdded",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "creator",
        "type": "address"
      },
      {
        "name": "amount",
        "type": "uint256"
      },
      {
        "name": "metadataCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "OnVoted",
    "inputs": [
      {
        "name": "voter",
        "type": "address"
      },
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "applicant",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "ProgramCreated",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "totalFund",
        "type": "uint256"
      },
      {
        "name": "creator",
        "type": "address"
      },
      {
        "name": "allocation",
        "type": "uint8"
      },
      {
        "name": "metadataCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "RoleAdminChanged",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "previousAdminRole",
        "type": "bytes32"
      },
      {
        "name": "newAdminRole",
        "type": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "RoleGranted",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "account",
        "type": "address"
      },
      {
        "name": "sender",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "RoleRevoked",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "account",
        "type": "address"
      },
      {
        "name": "sender",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "SubmitMilestone",
    "inputs": [
      {
        "name": "milestoneId",
        "type": "uint256"
      },
      {
        "name": "proveCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "event",
    "name": "WithdrawMilestone",
    "inputs": [
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "applicantId",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": ""
  },
  {
    "type": "function",
    "name": "DEFAULT_ADMIN_ROLE",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "PROGRAM_CONTROL",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "VOTE_CONTROL",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "applyAppplicant",
    "inputs": [
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "milestones",
        "type": "tuple[]"
      },
      {
        "name": "metadataCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "approveMilestone",
    "inputs": [
      {
        "name": "milestoneId",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "changeMilestoneStatus",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "status",
        "type": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "changeProgramStatus",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "status",
        "type": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createProgram",
    "inputs": [
      {
        "name": "totalFund",
        "type": "uint256"
      },
      {
        "name": "dates",
        "type": "uint256[4]"
      },
      {
        "name": "metadataCID",
        "type": "string"
      },
      {
        "name": "allocation",
        "type": "uint8"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getProgram",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getRoleAdmin",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "grantRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "account",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "hasRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "account",
        "type": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "mintApplicant",
    "inputs": [
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "metadataCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "mintProgramCreator",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      },
      {
        "name": "metadataCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "recoverProgramFund",
    "inputs": [
      {
        "name": "id",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "callerConfirmation",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "revokeRole",
    "inputs": [
      {
        "name": "role",
        "type": "bytes32"
      },
      {
        "name": "account",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "submitMilestone",
    "inputs": [
      {
        "name": "milestoneId",
        "type": "uint256"
      },
      {
        "name": "proveCID",
        "type": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportsInterface",
    "inputs": [
      {
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "voteApplicant",
    "inputs": [
      {
        "name": "programId",
        "type": "uint256"
      },
      {
        "name": "voter",
        "type": "address"
      },
      {
        "name": "applicantAddress",
        "type": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "withdrawMilestone",
    "inputs": [
      {
        "name": "programId",
        "type": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];
