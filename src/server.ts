import express from "express";
import {
  getRealUsersBuyingTokenFromPair,
  getUniqueBuyersInContracts,
  getWalletsX2Profit,
} from "@/modules/realActiveWalletsInTime.ts";
const server = express();
server.use(express.json());

server.post("/wallets2", async (req, res) => {
  const { pair, start, end } = req.body;
  if (!pair || !start || !end) {
    res.status(400).send({ error: "Invalid Data" });
    return;
  }

  const realWallets = await getRealUsersBuyingTokenFromPair(pair, start, end);
  res.status(200).send(realWallets);
});

server.post("/wallets3", async (req, res) => {
  const { contracts } = req.body;
  if (!Array.isArray(contracts) || !contracts) {
    res.status(400).send({ error: "Invalid Data" });
    return;
  }
  const uniqueBuyers = await getUniqueBuyersInContracts(contracts);
  res.status(200).send(uniqueBuyers);
});

server.post("/wallets1", async (req, res) => {
  const { pair } = req.body;
  if (!pair) {
    res.status(400).send({ error: "Invalid Data" });
    return;
  }
  const walletData = await getWalletsX2Profit(pair);
  res.status(200).send(walletData);
});

server.listen(3000);
