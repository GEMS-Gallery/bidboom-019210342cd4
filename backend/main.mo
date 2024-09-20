import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Text "mo:base/Text";

import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Map "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Nat "mo:base/Nat";

actor {
    type Auction = {
        id: Nat;
        owner: Principal;
        title: Text;
        description: Text;
        startPrice: Nat;
        endTime: Time.Time;
        highestBid: ?Bid;
        active: Bool;
    };

    type Bid = {
        bidder: Principal;
        amount: Nat;
        timestamp: Time.Time;
    };

    stable var auctionIdCounter: Nat = 0;
    let auctions = Map.HashMap<Nat, Auction>(0, Nat.equal, Nat.hash);

    public shared(msg) func createAuction(title: Text, description: Text, startPrice: Nat, duration: Nat) : async Nat {
        let owner = msg.caller;
        let id = auctionIdCounter;
        auctionIdCounter += 1;

        let auction: Auction = {
            id;
            owner;
            title;
            description;
            startPrice;
            endTime = Time.now() + duration * 1_000_000_000;
            highestBid = null;
            active = true;
        };

        auctions.put(id, auction);
        id
    };

    public shared(msg) func placeBid(auctionId: Nat, amount: Nat) : async Bool {
        switch (auctions.get(auctionId)) {
            case (null) {
                Debug.print("Auction not found");
                false
            };
            case (?auction) {
                if (Time.now() > auction.endTime or not auction.active) {
                    Debug.print("Auction has ended");
                    false
                } else if (amount <= auction.startPrice or Option.isSome(auction.highestBid) and amount <= Option.get(auction.highestBid, {bidder = Principal.fromText(""); amount = 0; timestamp = 0}).amount) {
                    Debug.print("Bid too low");
                    false
                } else {
                    let bid: Bid = {
                        bidder = msg.caller;
                        amount;
                        timestamp = Time.now();
                    };
                    let updatedAuction = {
                        id = auction.id;
                        owner = auction.owner;
                        title = auction.title;
                        description = auction.description;
                        startPrice = auction.startPrice;
                        endTime = auction.endTime;
                        highestBid = ?bid;
                        active = auction.active;
                    };
                    auctions.put(auctionId, updatedAuction);
                    true
                }
            };
        }
    };

    public shared(msg) func endAuction(auctionId: Nat) : async Bool {
        switch (auctions.get(auctionId)) {
            case (null) {
                Debug.print("Auction not found");
                false
            };
            case (?auction) {
                if (msg.caller != auction.owner) {
                    Debug.print("Only the owner can end the auction");
                    false
                } else if (not auction.active) {
                    Debug.print("Auction already ended");
                    false
                } else {
                    let updatedAuction = {
                        id = auction.id;
                        owner = auction.owner;
                        title = auction.title;
                        description = auction.description;
                        startPrice = auction.startPrice;
                        endTime = auction.endTime;
                        highestBid = auction.highestBid;
                        active = false;
                    };
                    auctions.put(auctionId, updatedAuction);
                    true
                }
            };
        }
    };

    public query func getAuction(auctionId: Nat) : async ?Auction {
        auctions.get(auctionId)
    };

    public query func getAllAuctions() : async [Auction] {
        Iter.toArray(auctions.vals())
    };

    public query func getActiveAuctions() : async [Auction] {
        let activeAuctions = Iter.toArray(auctions.vals());
        Array.filter(activeAuctions, func (a: Auction) : Bool { a.active and Time.now() <= a.endTime })
    };
};
