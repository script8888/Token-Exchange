import { Contract } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  ICO_CONTRACT_ABI,
  ICO_CONTRACT_ADDRESS,
} from "../constants";

export const getEtherBalance = async (provider, address, contract = false) => {
  try {
    if (contract) {
      const contractBal = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
      return contractBal;
    } else {
      const userBal = await provider.getBalance(address);
      return userBal;
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
};

export const getWstTokensBal = async (provider, address) => {
  try {
    const tokenContract = new Contract(
      ICO_CONTRACT_ADDRESS,
      ICO_CONTRACT_ABI,
      provider
    );
    const tokenBal = await tokenContract.balanceOf(address);
    return tokenBal;
  } catch (error) {
    console.error(error);
  }
};

export const getLpTokenBal = async (provider, address) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const lpBal = await exchangeContract.balanceOf(address);
    return lpBal;
  } catch (error) {
    console.error(error);
  }
};

export const getReserveWSTTokens = async (provider) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      provider
    );
    const reserveBal = await exchangeContract.getReserve();
    return reserveBal;
  } catch (error) {
    console.error(error);
  }
};
