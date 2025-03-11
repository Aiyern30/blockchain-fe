export async function convertEthToUsd(ethAmount: number): Promise<number> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );
    const data = await response.json();

    const ethPrice = data.ethereum.usd;
    return ethAmount * ethPrice;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return 0;
  }
}
