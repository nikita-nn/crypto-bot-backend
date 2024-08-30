import { LogEvent } from "@/data/types.ts";
import {
  EtherScanResponse,
  fetchEtherScanApi,
} from "@/modules/fetchEtherScanAPI.ts";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function isContractAddress(address: string): Promise<boolean> {
  const result = await fetchEtherScanApi<string>(
    `module=proxy&action=eth_getCode&address=${address}`,
  );

  if (result.status == "0") {
    console.log(result);
  }

  return result.result !== "0x" && result.result !== "0x0";
}

async function getRealBuyers(result: EtherScanResponse<LogEvent[]>) {
  const realUserAddresses = new Set<{ wallet: string }>();
  for (const log of result.result) {
    if (
      log.topics[0] ==
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
    ) {
      realUserAddresses.add({
        wallet: "0x" + log.topics[2].slice(26),
      });
    }
  }
  return Array.from(realUserAddresses);
}

async function getRealBuyersCheckContract(
  result: EtherScanResponse<LogEvent[]>,
) {
  const realUserAddresses = new Set<{ wallet: string }>();
  const addressesToCheck: string[] = [];

  for (const log of result.result) {
    if (
      log.topics[0] ==
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
    ) {
      const address = "0x" + log.topics[2].slice(26);
      addressesToCheck.push(address);
    }
  }

  const batchSize = 5;
  for (let i = 0; i < addressesToCheck.length; i += batchSize) {
    const batch = addressesToCheck.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (address) => {
        const isContract = await isContractAddress(address);
        if (!isContract) {
          realUserAddresses.add({ wallet: address });
        }
      }),
    );

    if (i + batchSize < addressesToCheck.length) {
      await delay(1100);
    }
  }

  return Array.from(realUserAddresses);
}

/**
 2.1.3 Wallets: уникальные покупатели контрактов
 Функционал для анализа до трех разных контрактов, чтобы выявить кошельки,
 которые делали покупки в каждом из указанных контрактов.
 Бот возвращает список уникальных покупателей,
 пересекающихся во всех контрактах.
 */

export async function getUniqueBuyersInContracts(pairAddresseses: string[]) {
  if (pairAddresseses.length >= 2) {
    const logs1 = await fetchEtherScanApi<LogEvent[]>(
      `module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${pairAddresseses[0]}`,
    );
    const logs2 = await fetchEtherScanApi<LogEvent[]>(
      `module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${pairAddresseses[1]}`,
    );

    const result1 = await getRealBuyers(logs1);
    const result2 = await getRealBuyers(logs2);

    let result3: { wallet: string }[] | null = null;
    if (pairAddresseses.length === 3) {
      const logs3 = await fetchEtherScanApi<LogEvent[]>(
        `module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${pairAddresseses[2]}`,
      );
      result3 = await getRealBuyers(logs3);
    }

    const set1 = new Set(result1.map((buyer) => buyer.wallet));
    const set2 = new Set(result2.map((buyer) => buyer.wallet));

    let intersection = new Set([...set1].filter((wallet) => set2.has(wallet)));

    if (result3) {
      const set3 = new Set(result3.map((buyer) => buyer.wallet));
      intersection = new Set(
        [...intersection].filter((wallet) => set3.has(wallet)),
      );
    }

    const uniqueBuyers = [];
    for (let wallet of intersection) {
      const isContract = await isContractAddress(wallet);
      if (!isContract) {
        uniqueBuyers.push({ wallet });
      }
    }

    return uniqueBuyers;
  } else {
    throw new Error("You must provide at least 2 addresses.");
  }
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
  const result = await fetchEtherScanApi<LogEvent[]>(
    `module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${endBlock}&address=${pairAddress}`,
  );

  return await getRealBuyersCheckContract(result);
}
