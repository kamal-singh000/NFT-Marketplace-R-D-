import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Header from "./Header";
import Web3 from "web3";
import dayjs from "dayjs";
import NFTFunc from "./ABI/DODONFT.json";
import NFTStakeFunc from "./ABI/ERC721Escrow.json";
import MDToken from "./ABI/MDToken.json";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
let web3Modal = new Web3Modal({
  network: "testnet",
  cacheProvider: true,
  providerOptions: {},
});
let web3 = new Web3(Web3.givenProvider);

const SuccessPopUp = ({ txn }) => {
  return (
    <>
      Transaction Successful! Check your transaction{" "}
      <a
        href={`https://testnet.bscscan.com/tx/${txn}`}
        rel="noreferrer"
        target="_blank"
      >
        Click here
      </a>
    </>
  );
};
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
  const [loading4, setLoading4] = useState(false);
  const [loading5, setLoading5] = useState(false);
  const [loading6, setLoading6] = useState(false);
  const [ownerList, setOwnerList] = useState([]);

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
  useEffect(() => {
    tokenOwner();
  }, []);
  const tokenOwner = async () => {
    let obj = [];
    let contractFunc = await new web3.eth.Contract(
      NFTFunc,
      "0xCCC6a1C8a4F4F17C07A7809f12cE8fB12506A022"
    );
    let res = await contractFunc.methods.totalSupply().call();
    for (let i = 0; i < res; i++) {
      const owner = await contractFunc.methods.ownerOf(i).call();
      obj.push({ TokenID: i, address: owner });
      // console.log("TokenID", i, "Owner", owner);
    }
    await setOwnerList(obj);
    // placeOrders();
  };

  // const placeOrders = async () => {
  //   let obj = [];
  //   ownerList.length > 0 &&
  //     ownerList.map(async (res) => {
  //       if (res.address == "0x6f0477AC6aB1715BbDab068c7BD55aF7E9523cCB") {
  // let contractFunc = await new web3.eth.Contract(
  //   NFTFunc,
  //   "0xCCC6a1C8a4F4F17C07A7809f12cE8fB12506A022"
  // );
  // let res = await contractFunc.methods.totalSupply().call();
  // for (let i = 0; i < res; i++) {
  //   const owner = await contractFunc.methods.ownerOf(i).call();
  //   obj.push({ OrderID:res.TokenID });
  //   console.log("TokenID", res.TokenID);
  // }
  //   await setOwnerList(obj);
  // }
  //     });
  // };

  const submitNFTMinting = async (e) => {
    try {
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
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          tokenOwner();
        });
      // .on("error", (error) => {
      //   console.log("error", error);
      //   setLoading1(false);
      //   toast.error("Transaction Failed");
      // });
    } catch (error) {
      setLoading1(false);
      toast.error("Transaction Failed!");
    }
  };

  const submitApprovalForAll = async (e) => {
    try {
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
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          tokenOwner();
        });
      // .on("error", (error) => {
      //   console.log("error", error);
      //   setLoading2(false);
      //   toast.error("Transaction Failed");
      // });
    } catch (error) {
      setLoading2(false);
      toast.error("Transaction Failed!");
    }
  };

  const submitNFTStaking = async (e) => {
    try {
      e.preventDefault();
      setLoading3(true);
      const data = new FormData(e.target);
      console.log("data3", data.get("tokenIds"));
      let obj = await [[data.get("tokenIds")], data.get("nftCollection")];
      console.log("data3", ...obj);
      let contractFunc = await new web3.eth.Contract(
        NFTStakeFunc,
        "0x6f0477AC6aB1715BbDab068c7BD55aF7E9523cCB"
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
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          tokenOwner();
        });
      // .on("error", (error) => {
      //   console.log("error", error);
      //   setLoading3(false);
      //   toast.error("Transaction Failed");
      // });
    } catch (error) {
      setLoading3(false);
      toast.error("Transaction Failed!");
    }
  };

  const approveAllowance = async (e) => {
    try {
      e.preventDefault();
      setLoading6(true);
      const data = new FormData(e.target);
      console.log("data3", data.get("spender"), data.get("amount"));
      let contractFunc = await new web3.eth.Contract(
        MDToken,
        "0x510601cb8Db1fD794DCE6186078b27A5e2944Ad6"
      );
      console.log("contractFunc", contractFunc);
      await contractFunc.methods
        .approve(data.get("spender"), data.get("amount"))
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          setLoading6(false);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          tokenOwner();
        });
      // .on("error", (error) => {
      //   console.log("error", error);
      //   setLoading6(false);
      //   toast.error("Transaction Failed");
      // });
    } catch (error) {
      setLoading6(false);
      toast.error("Transaction Failed!");
    }
  };

  const buyNFT = async (e) => {
    try {
      e.preventDefault();
      setLoading4(true);
      const data = new FormData(e.target);
      console.log("data3", data.get("orderId"), data.get("payAmount"));
      let contractFunc = await new web3.eth.Contract(
        NFTStakeFunc,
        "0x6f0477AC6aB1715BbDab068c7BD55aF7E9523cCB"
      );
      console.log("contractFunc", contractFunc);
      await contractFunc.methods
        .buyNowPayment(data.get("orderId"), data.get("payAmount"))
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          setLoading4(false);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          tokenOwner();
        });
      // .on("error", (error) => {
      //   console.log("error", error);
      //   setLoading4(false);
      //   toast.error("Transaction Failed");
      // });
    } catch (error) {
      setLoading4(false);
      toast.error("Transaction Failed!");
    }
  };
  const sellNFT = async (e) => {
    try {
      e.preventDefault();
      setLoading5(true);
      const data = new FormData(e.target);
      console.log(
        "data",
        data.get("tokenId"),
        data.get("pricePerNFT"),
        dayjs(data.get("startTime")).unix(),
        dayjs(data.get("endTime")).unix(),
        data.get("tokenIds").split(","),
        data.get("nftCollection")
      );
      let obj = await [
        // data.get("tokenId"),
        data.get("pricePerNFT"),
        dayjs(data.get("startTime")).unix(),
        dayjs(data.get("endTime")).unix(),
        data.get("tokenIds").split(","),
        data.get("nftCollection"),
      ];
      console.log("data3", ...obj);
      let contractFunc = await new web3.eth.Contract(
        NFTStakeFunc,
        "0x6f0477AC6aB1715BbDab068c7BD55aF7E9523cCB"
      );
      console.log("contractFunc", contractFunc);
      await contractFunc.methods
        .placeOrder(...obj)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          setLoading5(false);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          tokenOwner();
        });
      // .on("error", (error) => {
      //   console.log("error", error);
      //   toast.error("Transaction Failed");
      //   setLoading5(false);
      // });
    } catch (error) {
      toast.error("Transaction Failed!");
      setLoading5(false);
    }
  };
  return (
    <>
      <Header
        isConnect={isConnect}
        account={account}
        connectWallet={connectWallet}
        disConnectWallet={disConnectWallet}
      />
      <div className="container-fluid text-start">
        <div className="row p-4">
          <div className="col-8 px-5">
            <div className="row rowBG2 p-2">
              <div className="col-6 p-4">
                <div className="card cardBG border-0">
                  <div className="card-header cardHeaderBG text-light">
                    NFT Minting
                  </div>
                  <div className="card-body bg-transparent">
                    <form onSubmit={submitNFTMinting}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
              <div className="col-6 p-4">
                <div className="card cardBG border-0">
                  <div className="card-header cardHeaderBG text-light">
                    Set Approval For All
                  </div>
                  <div className="card-body bg-transparent">
                    <form onSubmit={submitApprovalForAll}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
                        <label
                          htmlFor="exampleInputPassword1"
                          className="form-label"
                        >
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
              <div className="col-6 p-4">
                <div className="card cardBG border-0">
                  <div className="card-header cardHeaderBG text-light">
                    Stake NFT
                  </div>
                  <div className="card-body  bg-transparent">
                    <form onSubmit={submitNFTStaking}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
              <div className="col-6 p-4">
                <div className="card cardBG border-0">
                  <div className="card-header cardHeaderBG text-light">
                    Approve Allowance
                  </div>
                  <div className="card-body  bg-transparent">
                    <form onSubmit={approveAllowance}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          spender (address)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="spender"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          amount (uint256)(in Ether)
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="amount"
                          required
                        />
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          disabled={loading6}
                          className="btn btn-primary"
                        >
                          {loading6 ? "Loading..." : "Approve Allowance"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-6 p-4">
                <div className="card cardBG border-0">
                  <div className="card-header cardHeaderBG text-light">
                    Buy NFT
                  </div>
                  <div className="card-body  bg-transparent">
                    <form onSubmit={buyNFT}>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          orderId
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="orderId"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          payAmount
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="payAmount"
                          required
                        />
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="submit"
                          disabled={loading4}
                          className="btn btn-primary"
                        >
                          {loading4 ? "Loading..." : "BUY NFT"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="col-6 p-4">
                <div className="card cardBG border-0">
                  <div className="card-header cardHeaderBG text-light">
                    Sell NFT
                  </div>
                  <div className="card-body  bg-transparent">
                    <form onSubmit={sellNFT}>
                      {/* <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">
                      _tokenId (uint256[])
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="tokenId"
                      required
                    />
                  </div> */}
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          _pricePerNFT (uint256)(in WEI)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="pricePerNFT"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          _startTime (uint256)
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="startTime"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          _endTime (uint256)
                        </label>
                        <input
                          type="datetime-local"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="endTime"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
                          _tokenIds (uint256[])
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="exampleInputEmail1"
                          aria-describedby="emailHelp"
                          name="tokenIds"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label
                          htmlFor="exampleInputEmail1"
                          className="form-label"
                        >
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
                          disabled={loading5}
                          className="btn btn-primary"
                        >
                          {loading5 ? "Loading..." : "SELL NFT"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-4 rowBG2 py-4">
            <table class="table">
              <thead class="cardHeaderBG">
                <tr>
                  <th scope="col text-center">Token ID</th>
                  <th scope="col">Owner Address</th>
                </tr>
              </thead>
              <tbody className="text-light">
                {ownerList.length > 0
                  ? ownerList.map((owner, key) => (
                      <tr key={key}>
                        <th className=" text-center">{owner.TokenID}</th>
                        <td>{owner.address}</td>
                      </tr>
                    ))
                  : ""}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
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
