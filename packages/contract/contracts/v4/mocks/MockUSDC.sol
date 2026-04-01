// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title  MockUSDC
 * @notice Fake USDC for local development and testnet deployments.
 *
 * @dev    • 6 decimals (matches real USDC)
 *         • Anyone can call mint() — useful for test wallets
 *         • Capped at 1,000,000 USDC per mint to prevent abuse
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant _DECIMALS = 6;

    uint256 public constant MAX_MINT = 1_000_000 * 1e6; // 1M USDC per call

    event Minted(address indexed to, uint256 amount);

    constructor() ERC20("Mock USD Coin", "USDC") Ownable(msg.sender) {
        // Pre-mint 10M USDC to deployer for seeding test environments
        _mint(msg.sender, 10_000_000 * 1e6);
    }

    /**
     * @notice Permissionless faucet — useful for local dev and test wallets.
     * @param to     Recipient address.
     * @param amount Amount in USDC (6-decimal). Max 1M per call.
     */
    function mint(address to, uint256 amount) external {
        require(amount <= MAX_MINT, "MockUSDC: exceeds max mint per call");
        _mint(to, amount);
        emit Minted(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return _DECIMALS;
    }
}
