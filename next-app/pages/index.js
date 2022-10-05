import { useRef, useState, useEffect } from "react";
import Head from "next/head";
import Web3Modal from "web3modal";
import { BigNumber, providers, utils } from "ethers";
import { addLiquidity, calculateWST } from "../utils/addLiquidity";
import {
  getEtherBalance,
  getLpTokenBal,
  getReserveWSTTokens,
  getWstTokensBal,
} from "../utils/getAmounts";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
import {
  removeLiquidity,
  getTokensAfterRemove,
} from "../utils/removeLiquidity";
import styles from "../styles/Home.module.css";

export default function Home() {
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  // We have two tabs in this dapp, Liquidity Tab and Swap Tab. This variable
  // keeps track of which Tab the user is on. If it is set to true this means
  // that the user is on `liquidity` tab else he is on `swap` tab
  const [liquidityTab, setLiquidityTab] = useState(true);
  // This variable is the `0` number in form of a BigNumber
  const zero = BigNumber.from(0);
  /** Variables to keep track of amount */
  // `ethBalance` keeps track of the amount of Eth held by the user's account
  const [ethBalance, setEtherBalance] = useState(zero);
  // `reservedCD` keeps track of the WST tokens Reserve balance in the Exchange contract
  const [reservedWST, setReservedWST] = useState(zero);
  // Keeps track of the ether balance in the contract
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  // cdBalance is the amount of `CD` tokens help by the users account
  const [wstBalance, setWstBalance] = useState(zero);
  // `lpBalance` is the amount of LP tokens held by the users account
  const [lpBalance, setLPBalance] = useState(zero);
  /** Variables to keep track of liquidity to be added or removed */
  // addEther is the amount of Ether that the user wants to add to the liquidity
  const [addEther, setAddEther] = useState(zero);
  // addCDTokens keeps track of the amount of CD tokens that the user wants to add to the liquidity
  // in case when there is no initial liquidity and after liquidity gets added it keeps track of the
  // CD tokens that the user can add given a certain amount of ether
  const [addWSTTokens, setAddWSTTokens] = useState(zero);
  // removeEther is the amount of `Ether` that would be sent back to the user based on a certain number of `LP` tokens
  const [removeEther, setRemoveEther] = useState(zero);
  // removeCD is the amount of `WST` tokens that would be sent back to the user based on a certain number of `LP` tokens
  // that he wants to withdraw
  const [removeWst, setRemoveWst] = useState(zero);
  // amount of LP tokens that the user wants to remove from liquidity
  const [removeLPTokens, setRemoveLPTokens] = useState("0");
  /** Variables to keep track of swap functionality */
  // Amount that the user wants to swap
  const [swapAmount, setSwapAmount] = useState("");
  // This keeps track of the number of tokens that the user would receive after a swap completes
  const [tokenToBeReceivedAfterSwap, settokenToBeReceivedAfterSwap] =
    useState(zero);
  // Keeps track of whether  `Eth` or `WST` token is selected. If `Eth` is selected it means that the user
  // wants to swap some `Eth` for some `WST` tokens and vice versa if `Eth` is not selected
  const [ethSelected, setEthSelected] = useState(true);

  const getProviderOrSigner = async (needSigner = false) => {
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Switch to Goerli network");
      throw new Error("Switch to Goerli network");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();

      const etherBal = await getEtherBalance(provider, address);
      const etherBalContract = await getEtherBalance(provider, address, true);
      const wstTokenBal = await getWstTokensBal(provider, address);
      const lpBal = await getLpTokenBal(provider, address);
      const reserveTokenBal = await getReserveWSTTokens(provider);
      setEtherBalance(etherBal);
      setEtherBalanceContract(etherBalContract);
      setWstBalance(wstTokenBal);
      setLPBalance(lpBal);
      setReservedWST(reserveTokenBal);
    } catch (error) {
      console.error(error);
    }
  };

  const swap = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);

      setLoading(true);
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        await swapTokens(
          signer,
          swapAmount,
          ethSelected,
          tokenToBeReceivedAfterSwap
        );
        await getAmounts();
        setSwapAmount("");
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      setSwapAmount("");
    }
  };

  const _getAmountOfTokensReceivedFromSwap = async (swapAmount) => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount.toString());
      if (!swapAmountWei.eq(zero)) {
        const provider = await getProviderOrSigner();
        const _ethBal = await getEtherBalance(provider, null, true);
        const token = await getAmountOfTokensReceivedFromSwap(
          provider,
          swapAmountWei,
          ethSelected,
          _ethBal,
          reservedWST
        );
        settokenToBeReceivedAfterSwap(token);
      } else {
        settokenToBeReceivedAfterSwap(zero);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const _addLiquidity = async () => {
    try {
      const etherWei = utils.parseEther(addEther.toString());

      if (!etherWei.eq(zero) && !addWSTTokens.eq(zero)) {
        setLoading(true);
        const signer = await getProviderOrSigner(true);
        await addLiquidity(signer, addWSTTokens, etherWei);
        await getAmounts();
        setAddWSTTokens(zero);
      } else {
        setAddWSTTokens(zero);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setAddWSTTokens(zero);
      setLoading(false);
    }
  };

  const _removeLiquidity = async () => {
    try {
      const amountWei = utils.parseEther(removeLPTokens);
      if (!amountWei.eq(zero)) {
        setLoading(true);
        const signer = await getProviderOrSigner(true);
        await removeLiquidity(signer, amountWei);
        await getAmounts();
      }
      setRemoveLPTokens(zero);
      setRemoveEther(zero);
    } catch (error) {
      setRemoveLPTokens(zero);
      setRemoveEther(zero);
      console.error(error);
      setLoading(false);
    }
  };

  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLpTokensWei = utils.parseEther(_removeLPTokens);
      const _ethBal = await getEtherBalance(provider, null, true);
      const _wstToken = await getReserveWSTTokens(provider);

      const { _removeEther, _removeWST } = await getTokensAfterRemove(
        provider,
        removeLpTokensWei,
        _ethBal,
        _wstToken
      );
      setRemoveEther(_removeEther);
      setRemoveWst(_removeWST);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!walletConnected) {
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });

      connectWallet();
      getAmounts();
    }
  }, [walletConnected]);

  const renderButton = () => {
    // If wallet is not connected, return a button which allows them to connect their wllet
    if (!walletConnected) {
      return (
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet
        </button>
      );
    }

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }

    if (liquidityTab) {
      return (
        <div>
          <div className={styles.description}>
            You have:
            <br />
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {utils.formatEther(wstBalance)} WST Tokens
            <br />
            {utils.formatEther(ethBalance)} Ether
            <br />
            {utils.formatEther(lpBalance)} WST Liquidity Pool tokens
          </div>
          <div>
            {/* If reserved CD is zero, render the state for liquidity zero where we ask the user
          how much initial liquidity he wants to add else just render the state where liquidity is not zero and
          we calculate based on the `Eth` amount specified by the user how much `CD` tokens can be added */}
            {utils.parseEther(reservedWST.toString()).eq(zero) ? (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={(e) => setAddEther(e.target.value || "0")}
                  className={styles.input}
                />
                <input
                  type="number"
                  placeholder="Amount of WST tokens"
                  onChange={(e) =>
                    setAddWSTTokens(
                      BigNumber.from(utils.parseEther(e.target.value || "0"))
                    )
                  }
                  className={styles.input}
                />
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="number"
                  placeholder="Amount of Ether"
                  onChange={async (e) => {
                    setAddEther(e.target.value || "0");
                    // calculate the number of CD tokens that
                    // can be added given  `e.target.value` amount of Eth
                    const _addWSTTokens = await calculateWST(
                      e.target.value || "0",
                      etherBalanceContract,
                      reservedWST
                    );
                    setAddWSTTokens(_addWSTTokens);
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                  {`You will need ${utils.formatEther(addWSTTokens)} WST
                Tokens`}
                </div>
                <button className={styles.button1} onClick={_addLiquidity}>
                  Add
                </button>
              </div>
            )}
            <div>
              <input
                type="number"
                placeholder="Amount of LP Tokens"
                onChange={async (e) => {
                  setRemoveLPTokens(e.target.value || "0");
                  // Calculate the amount of Ether and WST tokens that the user would receive
                  // After he removes `e.target.value` amount of `LP` tokens
                  await _getTokensAfterRemove(e.target.value || "0");
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                {`You will get ${utils.formatEther(
                  removeWst || zero
                )} WST Tokens and ${utils.formatEther(
                  removeEther || zero
                )} Eth`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidity}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <input
            type="number"
            placeholder="Amount"
            onChange={async (e) => {
              setSwapAmount(e.target.value || "");
              // Calculate the amount of tokens user would receive after the swap
              await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
            }}
            className={styles.input}
            value={swapAmount}
          />
          <select
            className={styles.select}
            name="dropdown"
            id="dropdown"
            onChange={async () => {
              setEthSelected(!ethSelected);
              // Initialize the values back to zero
              await _getAmountOfTokensReceivedFromSwap(0);
              setSwapAmount("");
            }}
          >
            <option value="eth">Ethereum</option>
            <option value="wstToken">WST Token</option>
          </select>
          <br />
          <div className={styles.inputDiv}>
            {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
            {ethSelected
              ? `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} WST Tokens`
              : `You will get ${utils.formatEther(
                  tokenToBeReceivedAfterSwap
                )} Eth`}
          </div>
          <button className={styles.button1} onClick={swap}>
            Swap
          </button>
        </div>
      );
    }
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Token Exchange</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to WanShiTong Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; WST Tokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(true);
              }}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./Owl.jpg" />
        </div>
      </div>

      <footer className={styles.footer}>Made with &#10084; by Script</footer>
    </div>
  );
}
