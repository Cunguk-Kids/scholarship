// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ScholarshipTypes} from "../libraries/ScholarshipTypes.sol";

// ════════════════════════════════════════════════════════════════════════
// IScholarshipCore
// ════════════════════════════════════════════════════════════════════════

interface IScholarshipCore {
    function getProgram(uint256 programId)
        external view returns (ScholarshipTypes.Program memory);

    function getScholar(address wallet, uint256 programId)
        external view returns (ScholarshipTypes.Scholar memory);

    function isStudentEligible(address wallet)
        external view returns (bool eligible, string memory reason);

    function slashScholar(
        address wallet,
        uint256 programId,
        ScholarshipTypes.DisputeType disputeType
    ) external;

    function freezeMilestone(uint256 milestoneId) external;
    function releaseMilestone(uint256 milestoneId) external;
    function getRemainingFund(address wallet, uint256 programId)
        external view returns (uint256);
}

// ════════════════════════════════════════════════════════════════════════
// IScholarshipTreasury
// ════════════════════════════════════════════════════════════════════════

interface IScholarshipTreasury {
    function depositProgramFund(uint256 programId, uint256 amount) external;

    function disburseMilestone(
        address scholar,
        uint256 programId,
        uint256 milestoneId,
        uint256 amount
    ) external;

    function slashAndDistribute(
        uint256 programId,
        address scholar,
        address bountyHunter,
        uint256 bhPercent,
        uint256 treasuryPercent,
        uint256 protocolPercent
    ) external returns (uint256 bhReward);

    function distributeYield(uint256 programId) external;

    function refundDonors(uint256 programId) external;

    function getProgramBalance(uint256 programId)
        external view returns (uint256);

    function getAccruedYield(uint256 programId)
        external view returns (uint256);
}

// ════════════════════════════════════════════════════════════════════════
// IScholarshipBounty
// ════════════════════════════════════════════════════════════════════════

interface IScholarshipBounty {
    function getDispute(uint256 disputeId)
        external view returns (ScholarshipTypes.Dispute memory);

    function resolveDispute(
        uint256 disputeId,
        bool bountyHunterWon
    ) external;
}

// ════════════════════════════════════════════════════════════════════════
// IScholarshipReputation
// ════════════════════════════════════════════════════════════════════════

interface IScholarshipReputation {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function lockVotingPower(address voter, uint256 duration) external;
}

// ════════════════════════════════════════════════════════════════════════
// ICommittee
// ════════════════════════════════════════════════════════════════════════

interface ICommittee {
    function isCommitteeMember(uint256 programId, address member)
        external view returns (bool);

    function submitScore(
        uint256 programId,
        address applicant,
        uint256 academicScore,
        uint256 incomeScore,
        uint256 recommendScore
    ) external;

    function voteOnDispute(uint256 disputeId, bool upholdDispute) external;
}
