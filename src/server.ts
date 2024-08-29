import express from "express";
import { getRealUsersBuyingTokenFromPair } from "@/modules/realActiveWalletsInTime.ts";
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

server.listen(3000);
