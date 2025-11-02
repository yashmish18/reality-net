module realitynet::real_token {
    use aptos_framework::coin::{Self, MintCapability, destroy_burn_cap, destroy_freeze_cap};
    use std::signer;
    use std::option;
    use std::string;
    use std::error;

    struct REAL has drop {}

    struct MintStore has key {
        mint_cap: MintCapability<REAL>,
    }

    fun init_module(deployer: &signer) {
        let deployer_addr = signer::address_of(deployer);
        
        // Only initialize coin if it doesn't already exist
        // If coin is already initialized (from previous deployment), skip initialization
        // BUT: if coin exists but MintStore doesn't, we can't create MintStore because
        // we don't have the mint capability (it was consumed/destroyed in the old code)
        // SOLUTION: Deploy to a NEW address OR ensure MintStore was created in first deployment
        if (!coin::is_coin_initialized<REAL>()) {
            // First time: Initialize the coin and store the capability
            let (burn_cap, freeze_cap, mint_cap) = coin::initialize<REAL>(
                deployer,
                string::utf8(b"RealityNet Token"),
                string::utf8(b"REAL"),
                9,
                true,  // monitor_supply
            );
            
            // Store the mint capability in our module so we can use it for user mints
            move_to(deployer, MintStore {
                mint_cap,
            });
            
            // Destroy unused capabilities (burn and freeze) since we only need mint
            coin::destroy_burn_cap(burn_cap);
            coin::destroy_freeze_cap(freeze_cap);
        };
        // If coin is already initialized, MintStore should exist from first deployment
        // If it doesn't exist, mint_coins will fail with a clear error message
    }

    public entry fun mint_coins(account: &signer, amount: u64) acquires MintStore {
        let deployer_addr = @realitynet;
        
        // Check if MintStore exists - if not, the contract needs to be freshly deployed
        assert!(
            exists<MintStore>(deployer_addr),
            error::not_found(1), // EMINT_STORE_NOT_FOUND
        );
        
        // Register coin stores first
        coin::register<REAL>(account);
        
        // Mint coins using the module's stored mint capability
        let mint_store = borrow_global<MintStore>(deployer_addr);
        let coins_minted = coin::mint(amount, &mint_store.mint_cap);
        coin::deposit(signer::address_of(account), coins_minted);
    }

    public fun get_supply(): u128 {
        option::extract(&mut coin::supply<REAL>())
    }
}
