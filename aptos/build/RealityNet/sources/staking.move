module realitynet::staking {
    use std::signer;
    use aptos_framework::coin::{Self};
    use realitynet::real_token::REAL;
    use std::string::{Self, String};
    use aptos_framework::event;
    use aptos_std::table;

    struct StakingPool has key {
        total_staked: u64,
        stakers: table::Table<address, u64>,
        rewards: table::Table<address, u64>,
    }

    #[event]
    struct StakeEvent has drop, store {
        staker: address,
        amount: u64,
        token_id: String,
        action: u8,
    }

    fun init_module(deployer: &signer) {
        move_to(deployer, StakingPool {
            total_staked: 0,
            stakers: table::new(),
            rewards: table::new(),
        });
    }

    public entry fun stake_for_verification(
        staker: &signer,
        amount: u64,
        token_id: String,
    ) acquires StakingPool {
        let staker_addr = signer::address_of(staker);
        let coins = coin::withdraw<REAL>(staker, amount);
        
        let pool = borrow_global_mut<StakingPool>(@realitynet);
        if (!table::contains(&pool.stakers, staker_addr)) {
            table::add(&mut pool.stakers, staker_addr, 0);
            table::add(&mut pool.rewards, staker_addr, 0);
        };
        
        let current_stake = *table::borrow(&pool.stakers, staker_addr);
        table::upsert(&mut pool.stakers, staker_addr, current_stake + amount);
        pool.total_staked = pool.total_staked + amount;
        
        coin::deposit(@realitynet, coins);
        
        event::emit(StakeEvent {
            staker: staker_addr,
            amount,
            token_id,
            action: 0,
        });
    }

    public entry fun unstake_after_consensus(
        staker: &signer,
        amount: u64,
    ) acquires StakingPool {
        let staker_addr = signer::address_of(staker);
        let pool = borrow_global_mut<StakingPool>(@realitynet);
        
        let current_stake = *table::borrow(&pool.stakers, staker_addr);
        assert!(current_stake >= amount, 1);
        
        table::upsert(&mut pool.stakers, staker_addr, current_stake - amount);
        pool.total_staked = pool.total_staked - amount;
        
        // Note: In production, you'd need a proper mechanism to transfer coins back
        // For now, this tracks the unstake but actual transfer needs admin action
        coin::register<REAL>(staker);
        
        event::emit(StakeEvent {
            staker: staker_addr,
            amount,
            token_id: string::utf8(b""),
            action: 1,
        });
    }

    public fun distribute_rewards(winner: address, reward_amount: u64) acquires StakingPool {
        let pool = borrow_global_mut<StakingPool>(@realitynet);
        if (!table::contains(&pool.rewards, winner)) {
            table::add(&mut pool.rewards, winner, 0);
        };
        let current_reward = *table::borrow(&pool.rewards, winner);
        table::upsert(&mut pool.rewards, winner, current_reward + reward_amount);
    }

    public entry fun claim_rewards(staker: &signer) acquires StakingPool {
        let staker_addr = signer::address_of(staker);
        let pool = borrow_global_mut<StakingPool>(@realitynet);
        
        if (!table::contains(&pool.rewards, staker_addr)) {
            return
        };
        
        let reward = *table::borrow(&pool.rewards, staker_addr);
        if (reward > 0) {
            table::upsert(&mut pool.rewards, staker_addr, 0);
            coin::register<REAL>(staker);
            // Note: Reward distribution needs admin action or proper treasury mechanism
            // For now, this tracks the reward claim
        };
    }
}
