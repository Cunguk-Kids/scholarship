// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Forces Hardhat to compile ERC1967Proxy so the artifact is available
// for use in Ignition modules via m.contract("ERC1967Proxy", ...).
// Do not deploy this contract directly.

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";