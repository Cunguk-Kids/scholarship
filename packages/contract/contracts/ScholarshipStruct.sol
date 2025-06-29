// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// --- Enums ---

/**
 * @dev Represents the current status of the overall scholarship program.
 * Pending: Scholarship is set up, but applications haven't started.
 * OpenForApplications: Applications are being accepted.
 * VotingOpen: Applications are closed, and voting for candidates is active.
 * Completed: A winner has been announced, and the scholarship cycle is finished.
 */
enum ScholarshipStatus {
    Pending,
    OpenForApplications,
    VotingOpen,
    Completed
}


// --- Structs ---

/**
 * @dev Defines the structure for a scholarship applicant's data.
 * @param applicantAddress The blockchain address of the applicant.
 * @param voteCount The number of votes received by this applicant from donors.
 */
struct Applicant {
    address applicantAddress;
    uint256 voteCount;
}

/**
 * @dev Defines the structure for a donor's data.
 * @param contributedAmount The total amount of funds contributed by the donor.
 * @param votingPower The amount of voting power the donor possesses.
 * (e.g., 100 coin per donation as per workflow)
 */
struct Donor {
    uint256 contributedAmount;
    uint256 votingPower;
    bool hasClaimedDonorNFT; // Tracks if the donor has claimed their reward NFT
}
