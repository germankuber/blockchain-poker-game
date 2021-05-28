const Poker = artifacts.require("Poker");

module.exports = function (deployer) {
  deployer.deploy(Poker, 100);
};
