import express from "express";
import {
  getRealUsersBuyingTokenFromPair,
  getUniqueBuyersInContracts,
  getWalletsX2Profit,
} from "@/modules/realActiveWalletsInTime.ts";
import { db } from "@/data/settings.ts";
import { trackedAddresses, users } from "@/data/schema.ts";
import { and, eq } from "drizzle-orm";

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

server.post("/track_wallet", async (req, res) => {
  const { telegram_id, action, wallet } = req.body;

  if (!telegram_id || !action) {
    return res
      .status(400)
      .send({
        error: "Invalid Data: 'telegram_id' and 'action' are required.",
      });
  }

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.telegramId, telegram_id));

    if (user.length == 0) {
      return res.status(404).send({ error: "User Not Found" });
    }

    const userId = user[0].id;

    switch (action) {
      case "add":
        if (!wallet) {
          return res
            .status(400)
            .send({
              error: "Invalid Data: 'wallet' is required for 'add' action.",
            });
        }

        await db
          .insert(trackedAddresses)
          .values({ userId, walletAddress: wallet })
          .onConflictDoNothing();
        return res.status(200).send({ message: "Wallet added successfully." });

      case "delete":
        if (!wallet) {
          return res
            .status(400)
            .send({
              error: "Invalid Data: 'wallet' is required for 'delete' action.",
            });
        }

        await db
          .delete(trackedAddresses)
          .where(
            and(
              eq(trackedAddresses.userId, userId),
              eq(trackedAddresses.walletAddress, wallet),
            ),
          );
        return res
          .status(200)
          .send({ message: "Wallet deleted successfully." });

      case "list":
        const records = await db
          .select()
          .from(trackedAddresses)
          .where(eq(trackedAddresses.userId, userId));
        return res.status(200).send(records);

      default:
        return res
          .status(400)
          .send({
            error:
              "Invalid Action: 'action' should be 'add', 'delete', or 'track'.",
          });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send({ error: "Internal Server Error" });
  }
});

server.post("/activity_webhook", async (req, _) => {
  console.log(req.body);
});

server.listen(3000);
