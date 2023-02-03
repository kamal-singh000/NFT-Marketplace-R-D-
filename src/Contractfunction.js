import React, { useState } from "react";
import NFTFunc from "./ABI/DODONFT.json";
import NFTStakeFunc from "./ABI/ERC721Staking.json";
import Web3 from "web3";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
let web3 = new Web3(Web3.givenProvider);
const Contractfunction = () => {
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [loading3, setLoading3] = useState(false);

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
      .send({ from: "0xAf53AAF5A6cA0d55459AA8fC50069b4c9C70F94D" })
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
      .send({ from: "0xAf53AAF5A6cA0d55459AA8fC50069b4c9C70F94D" })
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
      .send({ from: "0xAf53AAF5A6cA0d55459AA8fC50069b4c9C70F94D" })
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
      <div class="container text-start">
        <div class="row mt-5">
          <div class="col m-4">
            <div class="card">
              <div class="card-header">NFT Minting</div>
              <div class="card-body">
                <form onSubmit={submitNFTMinting}>
                  <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">
                      uri (string)
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="uri"
                      required
                    />
                  </div>

                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading1}
                      class="btn btn-primary"
                    >
                      {loading1 ? "Loading..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="col m-4">
            <div class="card">
              <div class="card-header">Set Approval For All</div>
              <div class="card-body">
                <form onSubmit={submitApprovalForAll}>
                  <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">
                      operator (address)
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="operator"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="exampleInputPassword1" class="form-label">
                      approved (bool)
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="exampleInputPassword1"
                      name="approval"
                      required
                    />
                  </div>

                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading2}
                      class="btn btn-primary"
                    >
                      {loading2 ? "Loading..." : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="col m-4">
            <div class="card">
              <div class="card-header">Stake NFT</div>
              <div class="card-body">
                <form onSubmit={submitNFTStaking}>
                  <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">
                      _tokenIds (uint256[])
                    </label>
                    <input
                      type="number"
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="tokenIds"
                      required
                    />
                  </div>
                  <div class="mb-3">
                    <label for="exampleInputEmail1" class="form-label">
                      _nftCollection (address)
                    </label>
                    <input
                      type="text"
                      class="form-control"
                      id="exampleInputEmail1"
                      aria-describedby="emailHelp"
                      name="nftCollection"
                      required
                    />
                  </div>
                  <div class="d-grid gap-2">
                    <button
                      type="submit"
                      disabled={loading3}
                      class="btn btn-primary"
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
