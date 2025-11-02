module realitynet::real_token {
    use aptos_framework::coin::{Self, MintCapability, destroy_burn_cap, destroy_freeze_cap};
    use std::signer;
    use std::option;
    use std::string;

    struct REAL has drop {}

    struct MintStore has key {
        mint_cap: MintCapability<REAL>,
    }

    fun init_module(deployer: &signer) {
        // Initialize the coin using coin module directly to get capabilities
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
    }

    public entry fun mint_coins(account: &signer, amount: u64) acquires MintStore {
        // Register coin stores first
        coin::register<REAL>(account);
        
        // Mint coins using the module's stored mint capability
        let mint_store = borrow_global<MintStore>(@realitynet);
        let coins_minted = coin::mint(amount, &mint_store.mint_cap);
        coin::deposit(signer::address_of(account), coins_minted);
    }

    public fun get_supply(): u128 {
        option::extract(&mut coin::supply<REAL>())
    }
}
