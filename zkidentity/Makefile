# zkIdentity Makefile
# Provides convenient targets for building, testing, and deploying the zkIdentity program

.PHONY: help build test deploy-testnet deploy-mainnet clean install-leo

# Default target
help:
	@echo "zkIdentity Build and Deployment Targets"
	@echo "========================================"
	@echo ""
	@echo "Building:"
	@echo "  make build              - Build the Leo program"
	@echo "  make clean              - Clean build artifacts"
	@echo ""
	@echo "Testing:"
	@echo "  make test               - Run Leo tests (placeholder)"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy-testnet     - Deploy to Aleo testnet"
	@echo "  make deploy-mainnet     - Deploy to Aleo mainnet (requires confirmation)"
	@echo ""
	@echo "Setup:"
	@echo "  make install-leo        - Install Leo compiler"
	@echo "  make check-env          - Check environment variables"
	@echo ""
	@echo "Configuration:"
	@echo "  Set ADMIN_ADDRESS in .env file for deployment"
	@echo "  Set NETWORK (testnet/mainnet) for network selection"

# Build the program
build:
	@echo "Building zkIdentity program..."
	leo build

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	leo clean
	rm -rf build/

# Run tests (placeholder - Leo tests need to be expanded)
test:
	@echo "Running tests..."
	@echo "Note: Leo test framework is limited. Use manual testing with 'leo run' commands."
	@echo "See EXAMPLES.md for test cases."

# Check environment configuration
check-env:
	@echo "Checking environment configuration..."
	@if [ ! -f .env ]; then \
		echo "ERROR: .env file not found. Copy .env.example to .env and configure."; \
		exit 1; \
	fi
	@if [ -z "$${ADMIN_ADDRESS}" ]; then \
		echo "WARNING: ADMIN_ADDRESS not set in environment."; \
		echo "Set it in .env file for deployment."; \
	else \
		echo "ADMIN_ADDRESS: $${ADMIN_ADDRESS}"; \
	fi
	@if [ -z "$${NETWORK}" ]; then \
		echo "NETWORK not set, defaulting to testnet"; \
	else \
		echo "NETWORK: $${NETWORK}"; \
	fi

# Deploy to Aleo testnet
deploy-testnet: build check-env
	@echo "Deploying to Aleo testnet..."
	@if [ -z "$${ADMIN_ADDRESS}" ]; then \
		echo "ERROR: ADMIN_ADDRESS must be set for deployment."; \
		echo "Set ADMIN_ADDRESS in .env file."; \
		exit 1; \
	fi
	@echo "This will deploy zkidentity.aleo to testnet with admin: $${ADMIN_ADDRESS}"
	@echo "Deployment command:"
	@echo "  snarkos developer deploy zkidentity.aleo --private-key <YOUR_PRIVATE_KEY> --query https://api.explorer.aleo.org/v1 --broadcast https://api.explorer.aleo.org/v1/testnet/transaction/broadcast --priority-fee 0"
	@echo ""
	@echo "After deployment, register admin with constructor:"
	@echo "  leo run constructor $${ADMIN_ADDRESS}"
	@echo ""
	@echo "Note: Actual deployment requires snarkos CLI and private key."
	@echo "See DEPLOYMENT.md for detailed instructions."

# Deploy to Aleo mainnet (requires explicit confirmation)
deploy-mainnet: build check-env
	@echo "============================================"
	@echo "WARNING: MAINNET DEPLOYMENT"
	@echo "============================================"
	@echo ""
	@echo "You are about to deploy to Aleo mainnet."
	@echo "This is a production deployment and will incur real costs."
	@echo ""
	@read -p "Are you sure you want to deploy to mainnet? (yes/no): " confirm; \
	if [ "$$confirm" != "yes" ]; then \
		echo "Mainnet deployment cancelled."; \
		exit 1; \
	fi
	@if [ -z "$${ADMIN_ADDRESS}" ]; then \
		echo "ERROR: ADMIN_ADDRESS must be set for deployment."; \
		exit 1; \
	fi
	@echo "Deploying to Aleo mainnet..."
	@echo "Deployment command:"
	@echo "  snarkos developer deploy zkidentity.aleo --private-key <YOUR_PRIVATE_KEY> --query https://api.explorer.aleo.org/v1 --broadcast https://api.explorer.aleo.org/v1/mainnet/transaction/broadcast --priority-fee <FEE>"
	@echo ""
	@echo "After deployment, run constructor:"
	@echo "  leo run constructor $${ADMIN_ADDRESS}"
	@echo ""
	@echo "Note: See DEPLOYMENT.md for detailed mainnet deployment guide."

# Install Leo (if not already installed)
install-leo:
	@echo "Installing Leo..."
	@if command -v leo >/dev/null 2>&1; then \
		echo "Leo is already installed: $$(leo --version)"; \
	else \
		echo "Leo not found. Installing..."; \
		curl -L https://raw.githubusercontent.com/AleoHQ/leo/testnet/install.sh | bash; \
		echo "Please restart your terminal or source your shell profile."; \
	fi

# Verify deployment (check program exists on chain)
verify-deployment:
	@echo "Verifying deployment..."
	@if [ -z "$${NETWORK}" ]; then \
		NETWORK="testnet"; \
	fi
	@echo "Checking zkidentity.aleo on $${NETWORK}..."
	@echo "Command: curl https://api.explorer.aleo.org/v1/$${NETWORK}/program/zkidentity.aleo"
	@echo ""
	@echo "Note: Use this after successful deployment to verify."
