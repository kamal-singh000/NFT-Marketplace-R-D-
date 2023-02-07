import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Header from "./Header";
import Web3 from "web3";
import NFTFunc from "./ABI/DODONFT.json";
import NFTStakeFunc from "./ABI/ERC721Staking.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
let web3Modal = new Web3Modal({
  network: "testnet",
  cacheProvider: true,
  providerOptions: {},
});
let web3 = new Web3(Web3.givenProvider);
const Contractfunction = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [chainId, setChainId] = useState();
  const [isConnect, setConnect] = useState(false);
  const [balance, setBalance] = useState("-");
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect("walletconnect");
      const library = new ethers.providers.Web3Provider(provider);
      const signer = await library.getSigner();
      localStorage.setItem("modalProvider", 1);
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      let accBalance = await signer.getBalance();
      accBalance = ethers.utils.formatEther(accBalance);
      setBalance(accBalance);
      setProvider(provider);
      setSigner(signer);
      if (accounts) {
        let account = await Web3.utils.toChecksumAddress(accounts[0]);
        setAccount(account);
        setConnect(true);
      }
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = async () => {
    setAccount();
    setChainId();
    setBalance();
  };
  useEffect(() => {
    (async () => {
      if (localStorage.getItem("modalProvider")) await connectWallet();
    })();
  }, []);
  const disConnectWallet = async () => {
    await web3Modal.clearCachedProvider();
    localStorage.removeItem("modalProvider");
    refreshState();
    setConnect(false);
  };
  useEffect(() => {
    (async () => {
      let data = [];
      if (chainId !== 0x61 && isConnect) {
        data = [
          {
            chainId: "0x61",
            chainName: "Smart Chain - Testnet",
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            rpcUrls: ["https://bsc-testnet.public.blastapi.io/"],
            blockExplorerUrls: ["https://testnet.bscscan.com"],
          },
        ];
        console.log("chainId", chainId);

        try {
          await window.ethereum
            .request({
              method: "wallet_addEthereumChain",
              params: data,
            })
            .then((resp) => {
              console.log("resp", resp);
              connectWallet();
            });
        } catch {
          console.log("catched");
        }
      }
    })();
  }, [chainId]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = async (accounts) => {
        connectWallet();

        if (accounts) {
          let account = await Web3.utils.toChecksumAddress(accounts[0]);
          setAccount(account);
        }
      };

      const handleChainChanged = (_hexChainId) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        disConnectWallet();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  const submitNFTMinting = async (e) => {
    e.preventDefault();
    setLoading1(true);
    const data = new FormData(e.target);
    let uri = await data.get("uri");
    let contractFunc = await new web3.eth.Contract(
      NFTFunc,
      "0xCCC6a1C8a4F4F17C07A7809f12cE8fB12506A022"
    );
    await contractFunc.methods
      .mint(uri)
      .send({ from: account })
      .on("transactionHash", (hash) => {
        console.log("progress", hash);
        toast.info("Transaction is Processing...");
      })
      .on("receipt", (receipt) => {
        console.log("complete", receipt);
        setLoading1(false);
        toast.success("Transaction Successful!");
      })
      .on("error", (error) => {
        console.log("error", error);
        setLoading1(false);
        toast.error("Transaction Failed");
      });
  };

  const submitApprovalForAll = async (e) => {
    e.preventDefault();
    setLoading2(true);
    const data = new FormData(e.target);
    let obj = await [data.get("operator"), data.get("approval")];
    console.log("data2", obj);
    let contractFunc = await new web3.eth.Contract(
      NFTFunc,
      "0xCCC6a1C8a4F4F17C07A7809f12cE8fB12506A022"
    );
    await contractFunc.methods
      .setApprovalForAll(...obj)
      .send({ from: account })
      .on("transactionHash", (hash) => {
        console.log("progress", hash);
        toast.info("Transaction is Processing...");
      })
      .on("receipt", (receipt) => {
        console.log("complete", receipt);
        setLoading2(false);
        toast.success("Transaction Successful!");
      })
      .on("error", (error) => {
        console.log("error", error);
        setLoading2(false);
        toast.error("Transaction Failed");
      });
  };

  const submitNFTStaking = async (e) => {
    e.preventDefault();
    setLoading3(true);
    const data = new FormData(e.target);
    console.log("data3", data.get("tokenIds"));
    let obj = await [[data.get("tokenIds")], data.get("nftCollection")];
    console.log("data3", ...obj);
    let contractFunc = await new web3.eth.Contract(
      NFTStakeFunc,
      "0x74869452f793C9Ad62Cd83Ee2f69d88B17DA17CC"
    );
    console.log("contractFunc", contractFunc);
    await contractFunc.methods
      .stake(...obj)
      .send({ from: account })
      .on("transactionHash", (hash) => {
        console.log("progress", hash);
        toast.info("Transaction is Processing...");
      })
      .on("receipt", (receipt) => {
        console.log("complete", receipt);
        setLoading3(false);
        toast.success("Transaction Successful!");
      })
      .on("error", (error) => {
        console.log("error", error);
        setLoading3(false);
        toast.error("Transaction Failed");
      });
  };
  return (
    <>
      <Header
        isConnect={isConnect}
        account={account}
        connectWallet={connectWallet}
        disConnectWallet={disConnectWallet}
      />
      <div className="container text-start">
        <div className="row mt-5">
          <div className="col m-4">
            <div className="card">
              <div className="card-header">NFT Minting</div>
              <div className="card-body">
                <form onSubmit={submitNFTMinting}>
                  <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">
                      uri (string)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="uri"
                      required
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading1}
                      className="btn btn-primary"
                    >
                      {loading1 ? "Loading..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col m-4">
            <div className="card">
              <div className="card-header">Set Approval For All</div>
              <div className="card-body">
                <form onSubmit={submitApprovalForAll}>
                  <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">
                      operator (address)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="operator"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label for="exampleInputPassword1" className="form-label">
                      approved (bool)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputPassword1"
                      name="approval"
                      required
                    />
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading2}
                      className="btn btn-primary"
                    >
                      {loading2 ? "Loading..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col m-4">
            <div className="card">
              <div className="card-header">Stake NFT</div>
              <div className="card-body">
                <form onSubmit={submitNFTStaking}>
                  <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">
                      _tokenIds (uint256[])
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="tokenIds"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label for="exampleInputEmail1" className="form-label">
                      _nftCollection (address)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="nftCollection"
                      required
                    />
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading3}
                      className="btn btn-primary"
                    >
                      {loading3 ? "Loading..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};

export default Contractfunction;
