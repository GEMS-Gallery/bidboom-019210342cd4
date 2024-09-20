import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Auction {
  'id' : bigint,
  'title' : string,
  'active' : boolean,
  'endTime' : Time,
  'owner' : Principal,
  'description' : string,
  'highestBid' : [] | [Bid],
  'startPrice' : bigint,
}
export interface Bid {
  'timestamp' : Time,
  'amount' : bigint,
  'bidder' : Principal,
}
export type Time = bigint;
export interface _SERVICE {
  'createAuction' : ActorMethod<[string, string, bigint, bigint], bigint>,
  'endAuction' : ActorMethod<[bigint], boolean>,
  'getActiveAuctions' : ActorMethod<[], Array<Auction>>,
  'getAllAuctions' : ActorMethod<[], Array<Auction>>,
  'getAuction' : ActorMethod<[bigint], [] | [Auction]>,
  'placeBid' : ActorMethod<[bigint, bigint], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
