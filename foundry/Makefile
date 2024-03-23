-include .env

.PHONY: all test clean deploy fund help install snapshot format anvil 

DEFAULT_ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

help:
	@echo "Usage:"
	@echo "  make deploy [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""
	@echo ""
	@echo "  make fund [ARGS=...]\n    example: make deploy ARGS=\"--network sepolia\""

all: clean remove install update build

# Clean the repo
clean  :; forge clean

# Remove modules
remove :; rm -rf .gitmodules && rm -rf .git/modules/* && rm -rf lib && touch .gitmodules && git add . && git commit -m "modules"

# Update Dependencies
update:; forge update

build:; forge build

test :; forge test 

snapshot :; forge snapshot

format :; forge fmt

anvil :; anvil -m 'test test test test test test test test test test test junk' --steps-tracing --block-time 1

coverage :; forge coverage > coverage.txt

NETWORK_ARGS := --rpc-url http://localhost:8545 --private-key $(DEFAULT_ANVIL_KEY) --broadcast

Zircuit:
	@forge script script/DeployFreedomDoves.s.sol:DeployFreedomDoves --rpc-url $(ZIRCUIT_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

ThunderCore:
	@forge script script/DeployFreedomDoves.s.sol:DeployFreedomDoves --rpc-url $(THUNDERCORE_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

Scroll:
	@forge script script/DeployFreedomDoves.s.sol:DeployFreedomDoves --rpc-url $(SCROLL_RPC_URL) --private-key $(PRIVATE_KEY) --legacy --broadcast

Optimism:
	@forge script script/DeployFreedomDoves.s.sol:DeployFreedomDoves --rpc-url $(OPTIMISM_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

Linea:
	@forge script script/DeployFreedomDoves.s.sol:DeployFreedomDoves --rpc-url $(LINEA_RPC_URL) --private-key $(PRIVATE_KEY) --broadcast