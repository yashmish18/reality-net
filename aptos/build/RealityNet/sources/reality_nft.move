module realitynet::reality_nft {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_framework::timestamp;
    use aptos_framework::bcs;
    use std::vector;

    struct RealityNFT has key {}

    struct RealityMetadata has store, copy, drop {
        media_hash: String,
        ipfs_cid: String,
        latitude: u64,
        longitude: u64,
        timestamp: u64,
        event_type: String,
        description: String,
        verifier_count: u64,
        challenge_count: u64,
        verified: bool,
        creator: address,
    }

    #[event]
    struct MintEvent has drop, store {
        token_id: String,
        creator: address,
        timestamp: u64,
        media_hash: String,
    }

    #[event]
    struct VerificationEvent has drop, store {
        token_id: String,
        verifier: address,
        verified: bool,
        timestamp: u64,
    }

    fun init_module(deployer: &signer) {
    }

    public entry fun mint_reality_nft(
        creator: &signer,
        media_hash: vector<u8>,
        ipfs_cid: vector<u8>,
        latitude: u64,
        longitude: u64,
        event_type: vector<u8>,
        description: vector<u8>,
    ) {
        let timestamp = timestamp::now_seconds();
        let creator_addr = signer::address_of(creator);
        
        let metadata = RealityMetadata {
            media_hash: string::utf8(media_hash),
            ipfs_cid: string::utf8(ipfs_cid),
            latitude,
            longitude,
            timestamp,
            event_type: string::utf8(event_type),
            description: string::utf8(description),
            verifier_count: 0,
            challenge_count: 0,
            verified: false,
            creator: creator_addr,
        };

        // Generate unique token ID from creator address and timestamp
        let token_id_data = vector::empty<u8>();
        vector::append(&mut token_id_data, bcs::to_bytes(&creator_addr));
        vector::append(&mut token_id_data, bcs::to_bytes(&timestamp));
        let token_id_string = string::utf8(token_id_data);
        
        event::emit(MintEvent {
            token_id: copy token_id_string,
            creator: creator_addr,
            timestamp,
            media_hash: string::utf8(media_hash),
        });
    }

    public entry fun verify_reality(verifier: &signer, token_id: String) {
        let verifier_addr = signer::address_of(verifier);
        event::emit(VerificationEvent {
            token_id,
            verifier: verifier_addr,
            verified: true,
            timestamp: timestamp::now_seconds(),
        });
    }

    public entry fun challenge_reality(challenger: &signer, token_id: String) {
        let challenger_addr = signer::address_of(challenger);
        event::emit(VerificationEvent {
            token_id,
            verifier: challenger_addr,
            verified: false,
            timestamp: timestamp::now_seconds(),
        });
    }
}
