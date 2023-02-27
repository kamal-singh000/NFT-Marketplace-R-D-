import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import Header from "./Header";
import Web3 from "web3";
import dayjs from "dayjs";
import NFTFunc from "./ABI/NFTToken.json";
import ERC1155Escrow from "./ABI/ERC1155Escrow.json";
import MDToken from "./ABI/MDToken.json";
import NFTListLoader from "./assets/loadernftlist.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import copy from "copy-to-clipboard";

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
  const [NFTLoadingList, setNFTLoadingList] = useState(true);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);
  const [loading4, setLoading4] = useState(false);
  const [loading5, setLoading5] = useState(false);
  const [loading6, setLoading6] = useState(false);
  const [ownerList, setOwnerList] = useState([]);
  const [token_id, setToken_id] = useState();
  const [nfts, setNfts] = useState([]);
  const [NFTDetails, setNFTDetails] = useState([]);

  const copyToClipboard = (address) => {
    copy(address);
    return toast.success(`${"Copied to Clipboard!"}`);
  };

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
    OrderId();
    getTokenDetails();
  }, [account]);

  const getTokenDetails = async () => {
    if (account) {
      let response = await axios.get(
        `https://deep-index.moralis.io/api/v2/${account}/nft?chain=0x61`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key":
              "Ayi9BO2JmXKMepqQBBS4rSQUFvHNc2A82sYE1Bd0S1tjVLoBbIbXmpBYSxncEkiw",
          },
        }
      );
      if (response.status === 200) {
        console.log("response.data.result : ", response.data.result);
        setNFTDetails(response.data.result);
      }
    }
  };

  const OrderId = async () => {
    let obj = [];
    let contractFunc = await new web3.eth.Contract(
      ERC1155Escrow,
      "0xd607728Ba4746B7309670863244f6E5743D80eAb"
    );
    let res = await contractFunc.methods.orderNonce().call();
    if (res >= 1)
      for (let i = 1; i <= res; i++) {
        const owner = await contractFunc.methods.order(i).call();
        console.log("escrowww", owner);
        obj.push({
          TokenID: owner.tokenId,
          seller: owner.seller,
          pricePerNFT: owner.pricePerNFT,
          endTime: owner.endTime,
          edition: owner.amount,
        });
      }
    await setNfts(obj);
    console.log("demo", obj);
  };

  const submitNFTMinting = async (e) => {
    try {
      e.preventDefault();
      setLoading1(true);
      const data = new FormData(e.target);
      let obj = await [
        data.get("edition"),
        data.get("tokenURI"),
        data.get("creator"),
        data.get("coCreator"),
        data.get("creatorPercent"),
        data.get("coCreatorPercent"),
        data.get("saleType"),
        data.get("timeline"),
        data.get("pricePerNFT"),
        data.get("adminPlatformFee"),
        data.get("tokenAddress"),
      ];
      let contractFunc = await new web3.eth.Contract(
        NFTFunc,
        "0xD4531a65A75D33De25D3B8e40da9d88939cd5CeA"
      );
      console.log("contractFunc:", contractFunc, "Obj:", obj);
      await contractFunc.methods
        .mintToken(...obj)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          setLoading1(false);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
          getTokenDetails();
        });
    } catch (error) {
      setLoading1(false);
      console.log("Error: ", error);
      toast.error("Transaction Failed!");
    }
  };

  const submitApprovalForAll = async (e) => {
    try {
      e.preventDefault();
      setLoading3(true);
      const data = new FormData(e.target);
      let obj = await [
        data.get("addressCreator"),
        data.get("tokenId"),
        data.get("editions"),
        data.get("pricePerNFT"),
        // web3.utils.toWei(data.get("pricePerNFT"), "ether"),
        data.get("saleType"),
        data.get("timeline"),
        data.get("adminPlatformFee"),
        data.get("addressPaymentToken"),
        // dayjs(data.get("startTime")).unix(),
        // dayjs(data.get("endTime")).unix(),
        // data.get("tokenIds").split(","),
        // data.get("nftCollection"),
      ];
      console.log("data2", obj);
      let contractFunc = await new web3.eth.Contract(
        NFTFunc,
        "0xD4531a65A75D33De25D3B8e40da9d88939cd5CeA"
      );
      let approval = await contractFunc.methods
        .isApprovedForAll(account, "0xd607728Ba4746B7309670863244f6E5743D80eAb")
        .call();
      console.log("Approval : ", approval);
      if (approval) {
        sellNFT(obj);
      } else {
        await contractFunc.methods
          .setApprovalForAll("0xd607728Ba4746B7309670863244f6E5743D80eAb", true)
          .send({ from: account })
          .on("transactionHash", (hash) => {
            console.log("progress", hash);
            toast.info("Transaction is Processing...");
          })
          .on("receipt", (receipt) => {
            console.log("complete", receipt);

            sellNFT(obj);
          });
      }
    } catch (error) {
      setLoading3(false);
      console.log("Error:", error);
      toast.error("Transaction Failed!");
    }
  };

  const approveAllowance = async (e) => {
    try {
      e.preventDefault();
      setLoading2(true);
      const data = new FormData(e.target);
      let payAmount = data.get("price");
      let obj = await [
        data.get("price"),
        data.get("orderNonce"),
        data.get("editionNumber"),
      ];
      // let orderId = data.get("orderId");
      console.log("data3", payAmount);
      let mdtTokenFunc = await new web3.eth.Contract(
        MDToken,
        "0x510601cb8Db1fD794DCE6186078b27A5e2944Ad6"
      );
      const approveStatus = await mdtTokenFunc.methods
        .allowance(account, "0xd607728Ba4746B7309670863244f6E5743D80eAb")
        .call();
      console.log("approveStatus", approveStatus);
      console.log("MDTcontractFunc", payAmount);
      approveStatus < payAmount
        ? await mdtTokenFunc.methods
            .approve("0xd607728Ba4746B7309670863244f6E5743D80eAb", payAmount)
            .send({ from: account })
            .on("transactionHash", (hash) => {
              console.log("progress", hash);
              toast.info("Transaction is Processing...");
            })
            .on("receipt", (receipt) => {
              console.log("complete", receipt);
              setLoading2(false);
              // toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
              buyNFT(obj);
            })
        : buyNFT(obj);
    } catch (error) {
      setLoading2(false);
      console.log("Error: ", error);
      toast.error("Transaction Failed!");
    }
  };

  const buyNFT = async (obj) => {
    try {
      console.log("1", obj[0], "2", obj[1], "3", obj[2]);
      // e.preventDefault();
      // setLoading2(true);
      // const data = new FormData(e.target);
      // let obj = await [
      //   data.get("price"),
      //   data.get("orderNonce"),
      //   data.get("editionNumber"),
      // ];

      let contractFunc = await new web3.eth.Contract(
        ERC1155Escrow,
        "0xd607728Ba4746B7309670863244f6E5743D80eAb"
      );
      const owner = await contractFunc.methods.order(obj[1]).call();
      if (owner.paymentToken == "0x0000000000000000000000000000000000000000") {
        await contractFunc.methods
          .buyNow(obj[1], obj[2])
          .send({
            from: account,
            value: obj[0],
          })
          .on("transactionHash", (hash) => {
            console.log("progress", hash);
            toast.info("Transaction is Processing...");
          })
          .on("receipt", (receipt) => {
            console.log("complete", receipt);
            toast.success(<SuccessPopUp txn={receipt.transactionHash} />);

            OrderId();
          });
      } else {
        await contractFunc.methods
          .buyNowToken(obj[1], obj[2])
          .send({
            from: account,
          })
          .on("transactionHash", (hash) => {
            console.log("progress", hash);
            toast.info("Transaction is Processing...");
          })
          .on("receipt", (receipt) => {
            console.log("complete", receipt);
            toast.success(<SuccessPopUp txn={receipt.transactionHash} />);

            OrderId();
          });
      }
      setLoading2(false);
    } catch (error) {
      setLoading2(false);
      console.log("Error: ", error);
      toast.error("Transaction Failed!");
    }
  };
  const sellNFT = async (obj) => {
    try {
      let contractFunc = await new web3.eth.Contract(
        ERC1155Escrow,
        "0xd607728Ba4746B7309670863244f6E5743D80eAb"
      );
      console.log("contractFunc", contractFunc, "data3", ...obj);
      await contractFunc.methods
        .placeOrder(...obj)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);

          OrderId();
          setLoading3(false);
        });
    } catch (error) {
      toast.error("Transaction Failed! 2");
      console.log("Error:", error);
      setLoading3(false);
    }
  };
  const claimBack = async (orderId, e) => {
    try {
      e.preventDefault();
      setLoading5(true);
      let contractFunc = await new web3.eth.Contract(
        ERC1155Escrow,
        "0xd607728Ba4746B7309670863244f6E5743D80eAb"
      );
      console.log("contractFunc", contractFunc);
      await contractFunc.methods
        .claimBack(orderId)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          setLoading5(false);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);

          OrderId();
        });
    } catch (error) {
      console.log("Error: ", error);
      toast.error("Transaction Failed!");
      setLoading5(false);
    }
  };
  const submitSecondHandOrder = async (e) => {
    try {
      e.preventDefault();
      setLoading4(true);
      const data = new FormData(e.target);
      let obj = await [
        data.get("tokenId"),
        data.get("editionNumber"),
        data.get("pricePerNFT"),
        data.get("saleType"),
        data.get("nftCollection"),
      ];
      console.log("data3", ...obj);
      let contractFunc = await new web3.eth.Contract(
        ERC1155Escrow,
        "0xd607728Ba4746B7309670863244f6E5743D80eAb"
      );
      console.log("contractFunc", contractFunc, "obj:", obj);
      await contractFunc.methods
        .placeSecondHandOrder(...obj)
        .send({ from: account })
        .on("transactionHash", (hash) => {
          console.log("progress", hash);
          toast.info("Transaction is Processing...");
        })
        .on("receipt", (receipt) => {
          console.log("complete", receipt);
          setLoading4(false);
          toast.success(<SuccessPopUp txn={receipt.transactionHash} />);
        });
    } catch (error) {
      setLoading4(false);
      console.log("Error: ", error);
      toast.error("Transaction Failed!");
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
      <div className="container-fluid row p-4">
        <div className="col-12">
          <table class="table ">
            <thead class="cardHeaderBG">
              <tr>
                <th scope="col  text-center">Token ID</th>
                <th scope="col">Token Address</th>
                <th scope="col">Token URI</th>
              </tr>
            </thead>
            <tbody
              className="text-light cardBG overflow"
              style={{ height: "100px" }}
            >
              {console.log(ownerList)}
              {NFTDetails.length > 0 ? (
                NFTDetails.map((NFT, key) => (
                  <tr key={key}>
                    <td className=" text-center">{NFT?.token_id}</td>
                    <td>
                      <span
                        style={{ cursor: "pointer" }}
                        onClick={() => copyToClipboard(NFT?.token_address)}
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        data-bs-title="Click to copy clipboard"
                      >
                        {NFT?.token_address}
                        {/* <RiFileCopy2Line /> */}
                      </span>
                    </td>
                    <td className="text-break">
                      {NFT?.token_uri ? NFT?.token_uri : "NULL"}
                    </td>
                  </tr>
                ))
              ) : (
                <td colSpan={3} className="text-center">
                  <div
                    className="fs-1 fw-bold"
                    style={{ color: "rgb(25, 54, 84)" }}
                  >
                    {" "}
                    No List Found{" "}
                  </div>
                </td>
              )}
            </tbody>
          </table>
        </div>
        {/* <div className="col-12">
          <table class="table">
            <thead class="cardHeaderBG">
              <tr>
                <th scope="col">Token ID</th>
                <th scope="col">Owner Address</th>
                <th scope="col">Token URI</th>
              </tr>
            </thead>
            <tbody className="text-light">
              {console.log(ownerList)}
              {ownerList.length > 0 ? (
                ownerList.map((owner, key) => (
                  <tr key={key}>
                    <td>{owner.TokenID}</td>
                    <td>{owner.address}</td>
                    <td>{owner.tokenUri}</td>
                  </tr>
                ))
              ) : NFTLoadingList ? (
                <td colSpan={2} className="text-center">
                  <img
                    src={"https://media.tenor.com/6tl1LLJfSWgAAAAi/loader.gif"}
                    alt="loader"
                  />
                  <br />
                  <div
                    className="fs-3 fw-bold"
                    style={{ color: "rgba(0, 102, 204,0.8)" }}
                  >
                    Loading...
                  </div>
                </td>
              ) : (
                <td colSpan={2} className="text-center">
                  <div
                    className="fs-1 fw-bold"
                    style={{ color: "rgb(25, 54, 84)" }}
                  >
                    {" "}
                    No List Found{" "}
                  </div>
                </td>
              )}
            </tbody>
          </table>
        </div> */}
        <div style={{ borderTop: "3px solid white", margin: "15px 0" }}></div>
        <div className="col-6">
          <div className="card cardBG border border-success">
            <div className="card-header cardHeaderBG text-light">
              Mint NFT Token
            </div>
            <div className="card-body bg-transparent">
              <form onSubmit={submitNFTMinting}>
                <div className="mb-3">
                  <label htmlFor="edition" className="form-label">
                    _editions (uint256)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="edition"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tokenURI" className="form-label">
                    _tokenURI (string)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="tokenURI"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="_creator" className="form-label">
                    _creator (address)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="creator"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="_coCreator" className="form-label">
                    _coCreator (address)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="coCreator"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="creatorPercent" className="form-label">
                    _creatorPercent (uint256)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="creatorPercent"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="coCreatorPercent" className="form-label">
                    _coCreatorPercent (uint256)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="coCreatorPercent"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="saleType" className="form-label">
                    _saleType (uint8)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="saleType"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="timeline" className="form-label">
                    _timeline (uint256)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="timeline"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="pricePerNFT" className="form-label">
                    _pricePerNFT (uint256)(in WEi)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="pricePerNFT"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="adminPlatformFee" className="form-label">
                    _adminPlatformFee (uint256)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="adminPlatformFee"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="tokenAddress" className="form-label">
                    tokenAddress (address)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="tokenAddress"
                    required
                  />
                </div>
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    disabled={loading1}
                    className="btn btn-primary"
                  >
                    {loading1 ? "Loading..." : "Mint NFT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {/* <div className="col-6"> */}

        {/* </div> */}
        <div className="col-6">
          <div className="card cardBG border border-success">
            <div className="card-header cardHeaderBG text-light">
              BUY NFT Token
            </div>
            <div className="card-body bg-transparent">
              <form onSubmit={approveAllowance}>
                <div className="mb-3">
                  <label htmlFor="orderNonce" className="form-label">
                    Price(in Wei)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="price"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="orderNonce" className="form-label">
                    _orderNonce (uint256)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="orderNonce"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="editionNumber" className="form-label">
                    _editionNumber (uint256)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="editionNumber"
                    required
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    disabled={loading2}
                    className="btn btn-primary"
                  >
                    {loading2 ? "Loading..." : "Buy NFT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
          {/* <div className="card cardBG border border-success">
            <div className="card-header cardHeaderBG text-light">Sell NFT</div>
            <div className="card-body  bg-transparent ">
              <form onSubmit={submitApprovalForAll}>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    Address_creator
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="addressCreator"
                    required
                  />
                </div>
                <div className="">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _tokenId
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="tokenId"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _editions
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="editions"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _pricePerNFT (uint256)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="pricePerNFT"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _saleType
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="saleType"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _timeline
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="timeline"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _adminPlatformFee
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="adminPlatformFee"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    Address _paymentToken
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="addressPaymentToken"
                    required
                  />
                </div>
                {/* <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
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
                    {loading3 ? "Loading..." : "SELL NFT"}
                  </button>
                </div>
              </form>
            </div>
          </div> */}
          <div className="card cardBG border mt-4 border-success">
            <div className="card-header cardHeaderBG text-light">
              Place SecondHand Order
            </div>
            <div className="card-body  bg-transparent ">
              <form onSubmit={submitSecondHandOrder}>
                <div className="mb-3 ">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _tokenId
                  </label>
                  <input
                    // disabled
                    type="text"
                    // value={token_id}
                    placeholder="Enter TokenId"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="tokenId"
                    required
                  />
                </div>
                <div className="mb-3 ">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _editionNumber
                  </label>
                  <input
                    // disabled
                    type="text"
                    // value={token_id}
                    placeholder="Enter editionNumber"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="editionNumber"
                    required
                  />
                </div>
                <div className="mb-3 ">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _pricePerNFT (uint256)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-control"
                    // id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="pricePerNFT"
                    required
                  />
                </div>
                <div className="mb-3 ">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    _saleType
                  </label>
                  <input
                    // disabled
                    type="text"
                    // value={token_id}
                    placeholder="Enter SaleType"
                    className="form-control"
                    id="exampleInputEmail1"
                    aria-describedby="emailHelp"
                    name="saleType"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
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

                <div className="d-grid gap-2 pb-3">
                  <button
                    type="submit"
                    disabled={loading4}
                    className="btn btn-primary"
                  >
                    {loading4 ? "Loading..." : "Sell SecondHand NFT"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid white", margin: "15px 0" }}></div>
        <div className=" col-12">
          <table class="container-fluid table border border-success text-center">
            <thead class="cardHeaderBG">
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Edition</th>
                <th scope="col">Seller</th>
                <th scope="col">pricePerNFT</th>
                <th scope="col">TokenID</th>
                {/* <th scope="col">BUY Action</th>
                <th scope="col">CLAIM Action</th> */}
              </tr>
            </thead>
            <tbody className="cardBG">
              {console.log(nfts)}
              {nfts.length > 0
                ? nfts.map((owner, key) =>
                    owner.seller !=
                    "0x0000000000000000000000000000000000000000" ? (
                      <tr key={key}>
                        <td className="">{key + 1}</td>
                        <td className="">{owner.edition}</td>
                        <td>{owner.seller}</td>
                        <td>
                          {web3.utils.fromWei(owner.pricePerNFT, "ether")} BNB
                        </td>
                        <td>{owner.TokenID}</td>
                        {/* <td>
                          <button
                            type="submit"
                            disabled={loading1}
                            className="btn btn-primary"
                            onClick={() =>
                              approveAllowance(
                                key + 1,
                                owner.edition,
                                owner.pricePerNFT
                              )
                            }
                          >
                            buyNFT
                          </button>
                        </td>
                        <td>
                          <button
                            type="submit"
                            disabled={loading1}
                            className="btn btn-primary text-center"
                            onClick={() => claimBack(key + 1, owner.edition)}
                          >
                            claimBack
                          </button>
                        </td> */}
                      </tr>
                    ) : (
                      ""
                    )
                  )
                : ""}
            </tbody>
          </table>
        </div>
        {/*  */}
        {/* <div style={{ borderTop: "1px solid white", margin: "15px 0" }}></div> */}
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
