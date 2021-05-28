const truffleAssert = require('truffle-assertions');
let Poker = artifacts.require('./Poker.sol');

contract('Poker', accounts =>{

    let firstAccount;
    let pokerInstance;
    beforeEach(async ()=>{
        firstAccount = accounts[0];
        pokerInstance = await Poker.new(100);
    })
    it('register return new player', async ()=> {
        let playerResult = await pokerInstance.register.call("Germán Küber", { from : firstAccount , value : 100});
        expect(playerResult[0]).to.equal("Germán Küber");
    })
    it('register throw error, if player already exist', async ()=> {
        await pokerInstance.register("German", { value : 100 });
        await truffleAssert.reverts(pokerInstance.register("German", { value : 100 }),"The Player already exist");
    })
    it('register throw error, if player already exist', async ()=> {
        await truffleAssert.reverts(pokerInstance.register("German", { value : 50 }),"You need to add the les amonut of the bet");
    })
    it('register check if added to the contract', async ()=> {
        await pokerInstance.register("German", { value : 100 })
        let playerResult = await pokerInstance.getPlayerData.call(firstAccount);
        expect(playerResult[0]).to.equal("German", { value : 100 });
    })
    it('register plus total count of players', async ()=> {
        await pokerInstance.register("German", {from: accounts[0] , value : 100 })
        await pokerInstance.register("German 2", {from: accounts[1] , value : 100 })
        await pokerInstance.register("German 3", {from: accounts[2] , value : 100 })
        let totalPlayers = await pokerInstance.getTotalPlayers.call();
        expect(totalPlayers.toNumber()).to.equal(3);
    })
    it('getPlayerData throw error, if player does not exist', async ()=> {
        await pokerInstance.register("German",{ value : 100 })
        await truffleAssert.reverts(pokerInstance.getPlayerData(accounts[4]),"The player does not exist");
    })
    it('win throw error, if player does not exist', async ()=> {
        await truffleAssert.reverts(pokerInstance.win(accounts[6]),"The player does not exist");
    })
    it('win should add amount and set win', async ()=> {
        await pokerInstance.register("German", { from : firstAccount , value : 100});
        await pokerInstance.win(firstAccount);
        let playerResult = await pokerInstance.getWinner();
        expect(playerResult).to.equal(firstAccount);
    })
    it('rebuy, throw revert if the amount is less than minimum', async ()=> {
        await pokerInstance.register("German", { from : firstAccount , value : 100});
        await truffleAssert.reverts(pokerInstance.rebuy({ from : firstAccount , value : 90}),"You cant bet less than minimum");
    })
    it('rebuy add amount to the contract balance', async ()=> {
        await pokerInstance.register("German", { from : firstAccount , value : 100});
        await pokerInstance.register("German 2", { from : accounts[2] , value : 100});
        pokerInstance.rebuy({value: 100})
        pokerInstance.rebuy({value: 100})
        let balance = await pokerInstance.getBalance();
        expect(balance.toNumber()).to.equal(400);
    })
    it('rebuy add amount the players balance', async ()=> {
        await pokerInstance.register("German", { from : firstAccount , value : 100});
        await pokerInstance.register("German 2", { from : accounts[2] , value : 100});
        pokerInstance.rebuy({ from : firstAccount , value : 100});
        pokerInstance.rebuy({ from : firstAccount , value : 100});
        let player = await pokerInstance.getPlayerData(firstAccount);
        expect(player[1]).to.equal('300');
    })
    it('approve, throw rever if the game did not finish', async ()=> {
        await pokerInstance.register("German", { from : firstAccount , value : 100});
        await pokerInstance.register("German 2", { from : accounts[2] , value : 100});
        await pokerInstance.win(firstAccount);
        let previusBalance = await web3.eth.getBalance(firstAccount);
        let balance = await pokerInstance.getBalance();
        await pokerInstance.approve({ from : accounts[2] });
        let actualBalance = await web3.eth.getBalance(firstAccount);

        expect(parseInt(previusBalance) + balance.toNumber()).to.equal(parseInt(actualBalance));
    })
})