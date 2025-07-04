// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../contracts/ScholarshipStruct.sol";

library MilestoneHelper {
    function generateMilestones(
        uint256 count
    ) internal pure returns (MilestoneInput[] memory milestones) {
        milestones = new MilestoneInput[](count);
        for (uint256 i = 0; i < count; i++) {
            milestones[i] = MilestoneInput({
                price: 0.5 ether,
                metadata: "QmDummyMetadata",
                templateId: 0,
                mType: MilestoneType.CUSTOM
            });
        }
    }
}
