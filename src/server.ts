import express from "express";
import {
  getRealUsersBuyingTokenFromPair,
  getUniqueBuyersInContracts,
} from "@/modules/realActiveWalletsInTime.ts";
const server = express();
server.use(express.json());

server.post("/wallets2", async (req, res) => {
  const { pair, start, end } = req.body;
  if (!pair || !start || !end) {
    res.status(400).send({ error: "Invalid Data" });
  }

  const realWallets = await getRealUsersBuyingTokenFromPair(pair, start, end);
  res.status(200).send(realWallets);
});

server.post("/wallets3", async (_, res) => {
  const uniqueBuyers = await getUniqueBuyersInContracts([
    "0x5aD516C3FeFFFCe5B108479C3FC50228e5da47d4",
    "0x19a59f62150586dd5de380f96f34651f1d2044e9",
    "0xe8f2bc22dac68a6b537e7391abb785d477fa8dca",
  ]);
  res.status(200).send(uniqueBuyers);
});

server.listen(3000);
