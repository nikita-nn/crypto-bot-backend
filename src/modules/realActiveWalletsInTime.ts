import {Alchemy, Log, Network} from "alchemy-sdk";
import 'dotenv/config'
import * as process from "node:process";

const ALCHEMY_SETTINGS = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const alchemy = new Alchemy(ALCHEMY_SETTINGS);

async function isContract(address: string) {
  try {
    const code = await alchemy.core.getCode(address);
    return code !== "0x";
  } catch (error) {
    console.error(`Error checking if address is a contract: ${address}`, error);
    return false;
  }
}

/**
 2.1.4 Wallets: узнать доходность кошелька
 Функционал для оценки доходности указанного кошелька за последние 3 месяца.
 Пользователь вводит адрес кошелька, а бот анализирует его активность и рассчитывает доходность.
 */

export async function getWalletsX2Profit(_: string) {

}

/**
 2.1.3 Wallets: уникальные покупатели контрактов
 Функционал для анализа до трех разных контрактов, чтобы выявить кошельки,
 которые делали покупки в каждом из указанных контрактов.
 Бот возвращает список уникальных покупателей,
 пересекающихся во всех контрактах.
 */

async function getUniqueWalletsWithoutCheck(logs: Log[]) {
  const wallets = new Set<string>();

  logs.forEach((log) => {
    const toWallet = `0x${log.topics[2].slice(26)}`;
    wallets.add(toWallet);
  });

  return Array.from(wallets);
}

async function getUniqueWalletsWithCheck(logs: Log[]) {
  const wallets = new Set<string>();

  const checks = logs.map(async (log) => {
    const toWallet = `0x${log.topics[2].slice(26)}`;
    const isContractAccount = await isContract(toWallet);

    if (!isContractAccount) {
      wallets.add(toWallet);
    }
    await delay(100);
  });

  await Promise.all(checks);
  return Array.from(wallets);
}

export async function getUniqueBuyersInContracts(pairAddresses: string[]) {
  if (pairAddresses.length < 2) {
    throw new Error("You must provide 2/3 pairs");
  }
  const logs1 = await alchemy.core.getLogs({
    address: pairAddresses[0],
    fromBlock: 0x0,
    toBlock: "0x10ef5af",
    topics: [
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    ],
  });

  const uniqWallets1 = await getUniqueWalletsWithoutCheck(logs1);

  const logs2 = await alchemy.core.getLogs({
    address: pairAddresses[1],
    fromBlock: 0x0,
    toBlock: "0x10ef5af",
    topics: [
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    ],
  });

  const uniqWallets2 = await getUniqueWalletsWithoutCheck(logs2);

  const logs3 = await alchemy.core.getLogs({
    address: pairAddresses[2],
    fromBlock: 0x0,
    toBlock: "0x10ef5af",
    topics: [
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    ],
  });

  const uniqWallets3 = await getUniqueWalletsWithoutCheck(logs3);

  const set1 = new Set(uniqWallets1);
  const set2 = new Set(uniqWallets2);
  const set3 = new Set(uniqWallets3);

  const intersection = [...set1].filter(
    (wallet) => set2.has(wallet) && set3.has(wallet),
  );
  const results = await Promise.all(
    intersection.map(async (wallet) => {
      const isContractWallet = await isContract(wallet);
      return !isContractWallet ? wallet : null;
    }),
  );

  return results.filter((wallet) => wallet !== null);
}

/**
 2.1.2 Wallets: кто покупал в фикс интервале
 Функционал для анализа контракта токена с целью выявления кошельков,
 которые покупали токен в указанном интервале времени.
 Пользователь задает временной промежуток,
 а бот предоставляет список активных в этот период кошельков.
 */

export async function getRealUsersBuyingTokenFromPair(
  pairAddress: string,
  startBlock: number,
  endBlock: number,
) {
  const logs = await alchemy.core.getLogs({
    address: pairAddress,
    fromBlock: `0x${startBlock.toString(16)}`,
    toBlock: `0x${endBlock.toString(16)}`,
    topics: [
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822",
    ],
  });

  const wallets = await getUniqueWalletsWithCheck(logs);

  return Array.from(wallets);
}
