// TODO: move to .env


const API_KEY = "1EX46BK7YXTZSGVVH8RFY9V2R931GYJB49";
const API_URL = "https://api.etherscan.io/api?";

interface EtherscanResponse<T> {
    status: string;
    message: string;
    result: T;
}

async function fetchEtherScanApi<T>(parameters: string): Promise<EtherscanResponse<T>> {
    const response = await fetch(API_URL + `apikey=${API_KEY}&` + parameters);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return await response.json();
}