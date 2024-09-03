import express from "express";
import {
  getRealUsersBuyingTokenFromPair,
  getUniqueBuyersInContracts,
  getWalletsX2Profit,
} from "@/modules/realActiveWalletsInTime.ts";
import { db } from "@/data/settings.ts";
import { users } from "@/data/schema.ts";
import { eq } from "drizzle-orm";
import {
  deleteAction,
  developersAction,
  influencersAction,
  listAction,
  whalesAction,
} from "@/modules/trackWallets.ts";

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
  const {
    telegram_id,
    action,
    wallet,
    category,
    name,
    socialLink,
    zerionLink1,
    zerionLink2,
    previousWallet1,
    previousWallet2,
    dexScreenerLink1,
    dexScreenerLink2,
    xQuantity1,
    xQuantity2,
    riskEntry,
  } = req.body;

  if (!telegram_id || !action) {
    return res.status(400).send({
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
        if (!wallet || !category || !name || !zerionLink1) {
          return res.status(400).send({
            error:
              "Invalid Data: 'wallet' 'zerionLink1' 'category' and 'name' is required for 'add' action.",
          });
        }

        switch (category) {
          case "developers":
            if (
              !(
                zerionLink2 &&
                previousWallet1 &&
                previousWallet2 &&
                dexScreenerLink1 &&
                dexScreenerLink2 &&
                xQuantity1 &&
                xQuantity2 &&
                riskEntry
              )
            ) {
              return res.status(400).send({ error: "Invalid data" });
            }
            await developersAction(
              userId,
              category,
              zerionLink1,
              zerionLink2,
              name,
              wallet,
              previousWallet1,
              previousWallet2,
              dexScreenerLink1,
              dexScreenerLink2,
              xQuantity1,
              xQuantity2,
              riskEntry,
            );
            break;
          case "whales": {
            await whalesAction(userId, category, zerionLink1, name, wallet);
            break;
          }
          case "influencers":
            if (!socialLink) {
              return res.status(400).send({ error: "Invalid data" });
            }
            await influencersAction(
              userId,
              category,
              zerionLink1,
              name,
              wallet,
              socialLink,
            );
            break;
          default:
            return res.status(400).send({
              error:
                "Invalid Data: category must be 'devs' 'whales' or 'influencers' ",
            });
        }
        return res.status(200).send({ message: "Wallet added successfully." });

      case "delete":
        if (!wallet) {
          return res.status(400).send({
            error: "Invalid Data: 'wallet' is required for 'delete' action.",
          });
        }

        await deleteAction(userId, wallet);
        return res
          .status(200)
          .send({ message: "Wallet deleted successfully." });

      case "list":
        const records = await listAction(userId);
        return res.status(200).send(records);

      default:
        return res.status(400).send({
          error:
            "Invalid Action: 'action' should be 'add', 'delete', or 'list'.",
        });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send({ error: "Database Error" });
  }
});

server.post("/activity_webhook", async (req, _) => {
  console.log(req.body);
});

server.post("/register", async (req, res) => {
  const { telegram_id } = req.body;
  if (!telegram_id || !telegram_id) {
    return res
      .status(400)
      .send({ error: "Invalid Data: 'telegram_id' is required." });
  }
  try {
    await db.insert(users).values({ telegramId: telegram_id });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).send({ error: "Database Error" });
  }
  res.status(200).send({ message: "Registered successfully." });
});

server.listen(3000);
