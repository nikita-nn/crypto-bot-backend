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

server.listen(3000);
