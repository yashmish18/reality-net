module realitynet::dao {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::coin;
    use realitynet::real_token::REAL;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::table;

    struct Proposal has store, drop {
        id: u64,
        proposer: address,
        title: String,
        description: String,
        votes_for: u64,
        votes_against: u64,
        start_time: u64,
        end_time: u64,
        executed: bool,
    }

    struct DAO has key {
        proposals: table::Table<u64, Proposal>,
        proposal_count: u64,
        min_proposal_stake: u64,
        voting_period: u64,
        voters: table::Table<u64, table::Table<address, bool>>,
    }

    #[event]
    struct VoteEvent has drop, store {
        proposal_id: u64,
        voter: address,
        vote: bool,
        stake: u64,
    }

    fun init_module(deployer: &signer) {
        move_to(deployer, DAO {
            proposals: table::new(),
            proposal_count: 0,
            min_proposal_stake: 1000000000,
            voting_period: 604800,
            voters: table::new(),
        });
    }

    public entry fun create_proposal(
        proposer: &signer,
        title: vector<u8>,
        description: vector<u8>,
    ) acquires DAO {
        let proposer_addr = signer::address_of(proposer);
        let dao = borrow_global_mut<DAO>(@realitynet);
        
        let balance = coin::balance<REAL>(proposer_addr);
        assert!(balance >= dao.min_proposal_stake, 1);
        
        let proposal_id = dao.proposal_count + 1;
        let now = timestamp::now_seconds();
        
        let proposal = Proposal {
            id: proposal_id,
            proposer: proposer_addr,
            title: string::utf8(title),
            description: string::utf8(description),
            votes_for: 0,
            votes_against: 0,
            start_time: now,
            end_time: now + dao.voting_period,
            executed: false,
        };
        
        table::add(&mut dao.proposals, proposal_id, proposal);
        table::add(&mut dao.voters, proposal_id, table::new());
        dao.proposal_count = proposal_id;
    }

    public entry fun vote_on_proposal(
        voter: &signer,
        proposal_id: u64,
        vote_for: bool,
        stake_amount: u64,
    ) acquires DAO {
        let voter_addr = signer::address_of(voter);
        let dao = borrow_global_mut<DAO>(@realitynet);
        
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        let now = timestamp::now_seconds();
        assert!(now < proposal.end_time, 2);
        assert!(!proposal.executed, 3);
        
        let voters_table = table::borrow_mut(&mut dao.voters, proposal_id);
        assert!(!table::contains(voters_table, voter_addr), 4);
        
        table::add(voters_table, voter_addr, true);
        
        if (vote_for) {
            proposal.votes_for = proposal.votes_for + stake_amount;
        } else {
            proposal.votes_against = proposal.votes_against + stake_amount;
        };
        
        event::emit(VoteEvent {
            proposal_id,
            voter: voter_addr,
            vote: vote_for,
            stake: stake_amount,
        });
    }

    public entry fun execute_proposal(proposal_id: u64) acquires DAO {
        let dao = borrow_global_mut<DAO>(@realitynet);
        let proposal = table::borrow_mut(&mut dao.proposals, proposal_id);
        
        let now = timestamp::now_seconds();
        assert!(now >= proposal.end_time, 5);
        assert!(!proposal.executed, 6);
        
        proposal.executed = true;
    }

    public fun get_proposal(proposal_id: u64): (String, String, u64, u64, bool) acquires DAO {
        let dao = borrow_global<DAO>(@realitynet);
        let proposal = table::borrow(&dao.proposals, proposal_id);
        (
            *&proposal.title,
            *&proposal.description,
            proposal.votes_for,
            proposal.votes_against,
            proposal.executed,
        )
    }
}
