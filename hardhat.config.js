require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.19",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      accounts: ['0xcc3d4d62eea314e63566824e1e70498924c1b6a9c0af0caefc90ccf768e0eb1d']
    }
  },
};
