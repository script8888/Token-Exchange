import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  ICO_CONTRACT_ABI,
  ICO_CONTRACT_ADDRESS,
} from "../constants";

export const getAmountOfTokensReceivedFromSwap = async (
  provider,
  _swapAmountWei,
  ethSelected,
  ethBal,
  reservedWST
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    provider
  );

  let amountOfTokens;
  if (ethSelected) {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      ethBal,
      reservedWST
    );
  } else {
    amountOfTokens = await exchangeContract.getAmountOfTokens(
      _swapAmountWei,
      reservedWST,
      ethBal
    );
  }
  return amountOfTokens;
};

export const swapTokens = async (
  signer,
  amountInWei,
  ethSelected,
  tokenToBeReceivedAfterSwap
) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );

  const tokenContract = new Contract(
    ICO_CONTRACT_ADDRESS,
    ICO_CONTRACT_ABI,
    signer
  );

  let swap;
  if (ethSelected) {
    swap = await exchangeContract.ethToWstToken(tokenToBeReceivedAfterSwap, {
      value: amountInWei,
    });
  } else {
    swap = await tokenContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      amountInWei.toString()
    );
    await swap.wait();

    swap = await exchangeContract.wstTokenToEth(
      amountInWei,
      tokenToBeReceivedAfterSwap
    );
  }
  await swap.wait();
};
