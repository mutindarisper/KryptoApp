//https://eth-goerli.alchemyapi.io/v2/IDQ1UP5z_MtMLZGFzgYQTPivpoRttI-U

require('@nomiclabs/hardhat-waffle')

module.exports = {
  solidity: '0.8.0',
  networks: {
    goerli: {
      url:'https://eth-goerli.alchemyapi.io/v2/IDQ1UP5z_MtMLZGFzgYQTPivpoRttI-U',
      accounts: ['02b878bdb8dbfd23d0a930247d30501ae2a5df34d91f749fba6ce8b29f776a29']
    }
  }
}