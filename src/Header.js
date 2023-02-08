import React from "react";

const Header = (props) => {
  const { isConnect, account, connectWallet, disConnectWallet } = props;
  return (
    <>
      <nav className="navbar navbar-expand-lg cardHeaderBG">
        <div className="container">
          <a className="navbar-brand fs-1 text-white" href="#">
            NFT Marketplace (R&D)
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <div
                  className="nav-link text-white active"
                  aria-current="page"
                  href="#"
                >
                  {account ? "Account: " + account : "Connect Metamask"}
                </div>
              </li>
            </ul>
            <button
              className={`btn ${
                !isConnect ? "btn-primary" : "btn-success"
              } ms-3`}
              onClick={!isConnect ? connectWallet : disConnectWallet}
            >
              {!isConnect ? "Connect Wallet" : "Disconnect Wallet"}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
