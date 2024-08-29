import { LogEvent } from "@/data/types.ts";
import { fetchEtherScanApi } from "@/modules/fetchEtherScanAPI.ts";

async function isContractAddress(address: string): Promise<boolean> {
  const result = await fetchEtherScanApi<string>(
    `module=proxy&action=eth_getCode&address=${address}`,
  );

  return result.result !== "0x" && result.result !== "0x0";
}

export async function getRealUsersBuyingTokenFromPair(
  pairAddress: string,
  startBlock: number,
  endBlock: number,
) {
  const result = await fetchEtherScanApi<LogEvent[]>(
    `module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${endBlock}&address=${pairAddress}`,
  );
  console.log(
    `module=logs&action=getLogs&fromBlock=${startBlock}&toBlock=${endBlock}&address=${pairAddress}`,
  );

  const realUserAddresses = new Set<{ wallet: string; hash: string }>();
  for (const log of result.result) {
    if (
      log.topics[0] ==
      "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
    ) {
      const isContract = await isContractAddress(
        "0x" + log.topics[2].slice(26),
      );
      if (!isContract) {
        realUserAddresses.add({
          wallet: "0x" + log.topics[2].slice(26),
          hash: log.transactionHash,
        });
      }
    }
  }

  return Array.from(realUserAddresses);
}
