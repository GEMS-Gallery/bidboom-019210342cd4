export const idlFactory = ({ IDL }) => {
  const Time = IDL.Int;
  const Bid = IDL.Record({
    'timestamp' : Time,
    'amount' : IDL.Nat,
    'bidder' : IDL.Principal,
  });
  const Auction = IDL.Record({
    'id' : IDL.Nat,
    'title' : IDL.Text,
    'active' : IDL.Bool,
    'endTime' : Time,
    'owner' : IDL.Principal,
    'description' : IDL.Text,
    'highestBid' : IDL.Opt(Bid),
    'startPrice' : IDL.Nat,
  });
  return IDL.Service({
    'createAuction' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat, IDL.Nat],
        [IDL.Nat],
        [],
      ),
    'endAuction' : IDL.Func([IDL.Nat], [IDL.Bool], []),
    'getActiveAuctions' : IDL.Func([], [IDL.Vec(Auction)], ['query']),
    'getAllAuctions' : IDL.Func([], [IDL.Vec(Auction)], ['query']),
    'getAuction' : IDL.Func([IDL.Nat], [IDL.Opt(Auction)], ['query']),
    'placeBid' : IDL.Func([IDL.Nat, IDL.Nat], [IDL.Bool], []),
  });
};
export const init = ({ IDL }) => { return []; };
