// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library UserHelper {
    function getUsers()
        internal
        pure
        returns (address, address, address, address, address)
    {
        return (
            address(0x1),
            address(0x2),
            address(0x3),
            address(0x4),
            address(0x5)
        );
    }

    function getRoles() internal pure returns (bytes32, bytes32, bytes32) {
        return (
            keccak256("OPEN_ROLE"),
            keccak256("OPEN_VOTE_ROLE"),
            keccak256("OPEN_DONATION_ROLE")
        );
    }
}
