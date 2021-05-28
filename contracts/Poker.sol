pragma solidity 0.5.16;
pragma experimental ABIEncoderV2;

contract Poker {

  event FinishedGame(address indexed _winner, uint _amount);

  uint countApproved = 0;
  uint countOfPlayers = 0;
  struct Player {
    string name;    
    uint totalAmount;
    bool exists;
    bool approved;
  }
  address payable winner;
  mapping(address => Player) players;
  uint minBet;

  constructor(uint _minBet) public {
    minBet = _minBet;
  }

  function register(string memory name) public payable returns(Player memory)
  {
    require(msg.value >= minBet, "You need to add the les amonut of the bet");
    require(!players[msg.sender].exists, "The Player already exist");
    Player memory player = Player(name, 0, true, false);
    player.totalAmount = msg.value;
    players[msg.sender] = player;
    ++countOfPlayers;
    return player;
  } 

  function getPlayerData(address _playerAddress) public view existPlayer(_playerAddress) returns (Player memory)
  {
    Player memory player = players[_playerAddress];
    return player;
  }

  function getMyData() public view existPlayer(msg.sender) returns (Player memory)
  {
    Player memory player = players[msg.sender];
    return player;
  }

  function win(address payable _playerAddress) public existPlayer(_playerAddress) returns (Player memory)
  {
    Player storage player = players[_playerAddress];
    winner = _playerAddress;
    players[msg.sender].approved = true;
    ++countApproved;
    emit FinishedGame(msg.sender,  address(this).balance);
    return player;
  }
  function getWinner() public view returns(address)
  {
    return winner;
  }
  function approve() public payable
  {
    require(!players[msg.sender].approved, "You already approved the game");
    players[msg.sender].approved = true;
    ++countApproved;
    if (countApproved == countOfPlayers)
    {
      winner.transfer(address(this).balance);
      // selfdestruct(); send the money to the bank
    }
  }

  function rebuy()  public existPlayer(msg.sender) payable returns(uint)
  {
    require(msg.value >= minBet, "You cant bet less than minimum");
    players[msg.sender].totalAmount += msg.value;
  }

  function getBalance() public view returns(uint)
  {
    return address(this).balance;
  }

  function getTotalPlayers() public view returns(uint)
  {
    return countOfPlayers;
  }


  modifier existPlayer(address _playerAddress) {
    require(players[_playerAddress].exists, "The player does not exist");
    _;
  }
}
