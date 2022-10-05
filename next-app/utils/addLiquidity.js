import { Contract, utils } from "ethers";
import {
  EXCHANGE_CONTRACT_ABI,
  EXCHANGE_CONTRACT_ADDRESS,
  ICO_CONTRACT_ABI,
  ICO_CONTRACT_ADDRESS,
} from "../constants";

export const addLiquidity = async (
  signer,
  addWSTAmountWei,
  addEtherAmountWei
) => {
  try {
    const exchangeContract = new Contract(
      EXCHANGE_CONTRACT_ADDRESS,
      EXCHANGE_CONTRACT_ABI,
      signer
    );

    const icoContract = new Contract(
      ICO_CONTRACT_ADDRESS,
      ICO_CONTRACT_ABI,
      signer
    );

    let txn = await icoContract.approve(
      EXCHANGE_CONTRACT_ADDRESS,
      addWSTAmountWei.toString()
    );
    await txn.wait();

    txn = await exchangeContract.addLiquidity(addWSTAmountWei, {
      value: addEtherAmountWei,
    });
    await txn.wait();
  } catch (error) {
    console.error(error);
  }
};

export const calculateWST = async (
  _addEther = "0",
  ethBalContract,
  wstTokenReserve
) => {
  const _addEtherAmountWei = utils.parseEther(_addEther);

  const wstTokenAmount = _addEtherAmountWei
    .mul(wstTokenReserve)
    .div(ethBalContract);

  return wstTokenAmount;
};
