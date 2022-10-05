import { Contract, providers, utils, BigNumber } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
} from "../constants";

export const removeLiquidity = async (signer, removeLpTokensWei) => {
  const exchangeContract = new Contract(
    EXCHANGE_CONTRACT_ADDRESS,
    EXCHANGE_CONTRACT_ABI,
    signer
  );

  const txn = await exchangeContract.removeLiquidity(removeLpTokensWei);
  await txn.wait();
};

export const getTokensAfterRemove = async (
  provider,
  removeLpTokensWei,
  _ethBal,
  wstTokenReserve
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );

    const _totalSupply = await exchangeContract.totalSupply();

    const _removeEther = _ethBal.mul(removeLpTokensWei).div(_totalSupply);
    const _removeToken = wstTokenReserve
      .mul(removeLpTokensWei)
      .div(_totalSupply);

    return { _removeEther, _removeToken };
  } catch (error) {
    console.error(error);
  }
};
