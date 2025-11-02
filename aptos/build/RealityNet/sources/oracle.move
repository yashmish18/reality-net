module realitynet::oracle {
    use std::signer;
    use std::string::String;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_std::table;

    struct OracleValidator has key {
        validators: vector<address>,
        validator_reputation: table::Table<address, u64>,
    }

    struct ValidationResult has store, drop {
        token_id: String,
        validator: address,
        location_valid: bool,
        timestamp_valid: bool,
        media_hash_valid: bool,
        overall_valid: bool,
        confidence_score: u8,
    }

    #[event]
    struct ValidationEvent has drop, store {
        token_id: String,
        validator: address,
        result: bool,
        timestamp: u64,
    }

    fun init_module(deployer: &signer) {
        move_to(deployer, OracleValidator {
            validators: vector::empty(),
            validator_reputation: table::new(),
        });
    }

    public entry fun register_validator(validator: &signer) acquires OracleValidator {
        let validator_addr = signer::address_of(validator);
        let oracle = borrow_global_mut<OracleValidator>(@realitynet);
        
        if (!vector::contains(&oracle.validators, &validator_addr)) {
            vector::push_back(&mut oracle.validators, validator_addr);
            table::add(&mut oracle.validator_reputation, validator_addr, 100);
        };
    }

    public entry fun validate_reality_event(
        validator: &signer,
        token_id: String,
        expected_latitude: u64,
        expected_longitude: u64,
        expected_timestamp: u64,
        media_hash: vector<u8>,
    ) acquires OracleValidator {
        let validator_addr = signer::address_of(validator);
        
        let location_valid = true;
        let timestamp_valid = timestamp::now_seconds() >= expected_timestamp;
        let media_hash_valid = true;
        
        let overall_valid = location_valid && timestamp_valid && media_hash_valid;
        let confidence_score = if (overall_valid) 95 else 10;
        
        if (overall_valid) {
            update_validator_reputation(validator_addr, true);
        } else {
            update_validator_reputation(validator_addr, false);
        };
        
        event::emit(ValidationEvent {
            token_id,
            validator: validator_addr,
            result: overall_valid,
            timestamp: timestamp::now_seconds(),
        });
    }

    fun update_validator_reputation(validator_addr: address, correct: bool) acquires OracleValidator {
        let oracle = borrow_global_mut<OracleValidator>(@realitynet);
        if (table::contains(&oracle.validator_reputation, validator_addr)) {
            let rep = *table::borrow(&oracle.validator_reputation, validator_addr);
            let new_rep = if (correct) {
                if (rep < 200) rep + 1 else rep
            } else {
                if (rep > 0) rep - 1 else 0
            };
            table::upsert(&mut oracle.validator_reputation, validator_addr, new_rep);
        };
    }
}
