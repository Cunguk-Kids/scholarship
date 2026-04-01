export const committeeGovernanceAbi = [
    {
        "inputs":  [

                   ],
        "stateMutability":  "nonpayable",
        "type":  "constructor"
    },
    {
        "inputs":  [

                   ],
        "name":  "AccessControlBadConfirmation",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bytes32",
                           "name":  "neededRole",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "AccessControlUnauthorizedAccount",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "target",
                           "type":  "address"
                       }
                   ],
        "name":  "AddressEmptyCode",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyCommitteeMember",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyScored",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "AlreadyVotedOnDispute",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "implementation",
                           "type":  "address"
                       }
                   ],
        "name":  "ERC1967InvalidImplementation",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ERC1967NonPayable",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "FailedCall",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "InitiatorCannotBeCommittee",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "InvalidInitialization",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NotCommitteeMember",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "NotInitializing",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "OnlyInitiator",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "ScoreAlreadyFinalized",
        "type":  "error"
    },
    {
        "inputs":  [

                   ],
        "name":  "UUPSUnauthorizedCallContext",
        "type":  "error"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "slot",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "UUPSUnsupportedProxiableUUID",
        "type":  "error"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "member",
                           "type":  "address"
                       }
                   ],
        "name":  "CommitteeMemberAdded",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "member",
                           "type":  "address"
                       }
                   ],
        "name":  "CommitteeMemberRemoved",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "disputeId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "bountyHunterWon",
                           "type":  "bool"
                       }
                   ],
        "name":  "DisputeResolutionReached",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "disputeId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "member",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "bool",
                           "name":  "upholdDispute",
                           "type":  "bool"
                       }
                   ],
        "name":  "DisputeVoteCast",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  false,
                           "internalType":  "uint64",
                           "name":  "version",
                           "type":  "uint64"
                       }
                   ],
        "name":  "Initialized",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "applicant",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "member",
                           "type":  "address"
                       }
                   ],
        "name":  "MemberScoreSubmitted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "previousAdminRole",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "newAdminRole",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "RoleAdminChanged",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "RoleGranted",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       },
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "sender",
                           "type":  "address"
                       }
                   ],
        "name":  "RoleRevoked",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "applicant",
                           "type":  "address"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "avgAcademic",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "avgIncome",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "uint256",
                           "name":  "avgRecommend",
                           "type":  "uint256"
                       }
                   ],
        "name":  "ScoreFinalized",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "indexed":  false,
                           "internalType":  "address",
                           "name":  "applicant",
                           "type":  "address"
                       }
                   ],
        "name":  "TiebreakerRequired",
        "type":  "event"
    },
    {
        "anonymous":  false,
        "inputs":  [
                       {
                           "indexed":  true,
                           "internalType":  "address",
                           "name":  "implementation",
                           "type":  "address"
                       }
                   ],
        "name":  "Upgraded",
        "type":  "event"
    },
    {
        "inputs":  [

                   ],
        "name":  "DEFAULT_ADMIN_ROLE",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "UPGRADER_ROLE",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "UPGRADE_INTERFACE_VERSION",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "VERSION",
        "outputs":  [
                        {
                            "internalType":  "string",
                            "name":  "",
                            "type":  "string"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "member",
                           "type":  "address"
                       }
                   ],
        "name":  "addCommitteeMember",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "bounty",
        "outputs":  [
                        {
                            "internalType":  "contract ScholarshipBounty",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "core",
        "outputs":  [
                        {
                            "internalType":  "contract ScholarshipCore",
                            "name":  "",
                            "type":  "address"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "disputeVotesAgainst",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       }
                   ],
        "name":  "disputeVotesFor",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       }
                   ],
        "name":  "getCommitteeMembers",
        "outputs":  [
                        {
                            "internalType":  "address[]",
                            "name":  "",
                            "type":  "address[]"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       }
                   ],
        "name":  "getRoleAdmin",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "grantRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "hasRole",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "hasVotedOnDispute",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "admin",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_core",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "_bounty",
                           "type":  "address"
                       }
                   ],
        "name":  "initialize",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "isCommitteeMember",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "memberScores",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "academic",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "income",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "uint256",
                            "name":  "recommend",
                            "type":  "uint256"
                        },
                        {
                            "internalType":  "bool",
                            "name":  "submitted",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [

                   ],
        "name":  "proxiableUUID",
        "outputs":  [
                        {
                            "internalType":  "bytes32",
                            "name":  "",
                            "type":  "bytes32"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "member",
                           "type":  "address"
                       }
                   ],
        "name":  "removeCommitteeMember",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "callerConfirmation",
                           "type":  "address"
                       }
                   ],
        "name":  "renounceRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes32",
                           "name":  "role",
                           "type":  "bytes32"
                       },
                       {
                           "internalType":  "address",
                           "name":  "account",
                           "type":  "address"
                       }
                   ],
        "name":  "revokeRole",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "scoreCount",
        "outputs":  [
                        {
                            "internalType":  "uint256",
                            "name":  "",
                            "type":  "uint256"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "",
                           "type":  "address"
                       }
                   ],
        "name":  "scoreFinalized",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "programId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "address",
                           "name":  "applicant",
                           "type":  "address"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "academicScore",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "incomeScore",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "uint256",
                           "name":  "recommendScore",
                           "type":  "uint256"
                       }
                   ],
        "name":  "submitScore",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "bytes4",
                           "name":  "interfaceId",
                           "type":  "bytes4"
                       }
                   ],
        "name":  "supportsInterface",
        "outputs":  [
                        {
                            "internalType":  "bool",
                            "name":  "",
                            "type":  "bool"
                        }
                    ],
        "stateMutability":  "view",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "address",
                           "name":  "newImplementation",
                           "type":  "address"
                       },
                       {
                           "internalType":  "bytes",
                           "name":  "data",
                           "type":  "bytes"
                       }
                   ],
        "name":  "upgradeToAndCall",
        "outputs":  [

                    ],
        "stateMutability":  "payable",
        "type":  "function"
    },
    {
        "inputs":  [
                       {
                           "internalType":  "uint256",
                           "name":  "disputeId",
                           "type":  "uint256"
                       },
                       {
                           "internalType":  "bool",
                           "name":  "upholdDispute",
                           "type":  "bool"
                       }
                   ],
        "name":  "voteOnDispute",
        "outputs":  [

                    ],
        "stateMutability":  "nonpayable",
        "type":  "function"
    }
] as const;
