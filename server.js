const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const Run = require('run-sdk')
let game = null
let bsv = require('bsv')
const fetch = require('node-fetch');
let playerDataArray = []

run = new Run({
  purse: "Kxu7tqQSPDbbqX93X7SNBUScNyQMWRidHw8xqTMBX8drRRUoR5WU",
})
run.sync()

class Game extends Jig {
  init(player0, player1) {
    this.player0 = player0
   	this.player1 = player1
    this.player0DestroyerCount = 0
    this.player0SubmarineCount = 0
    this.player0CruiserCount = 0
    this.player0BattleshipCount = 0
    this.player0CarrierCount = 0
    this.player1DestroyerCount = 0
    this.player1SubmarineCount = 0
    this.player1CruiserCount = 0
    this.player1BattleshipCount = 0
    this.player1CarrierCount = 0
    this.winner = null
  }

  incrementPlayer0DestroyerCount() {
    this.player0DestroyerCount++
  }

  incrementPlayer0SubmarineCount() {
    this.player0SubmarineCount++
  }

  incrementPlayer0CruiserCount() {
    this.player0CruiserCount++
  }

  incrementPlayer0BattleshipCount() {
    this.player0BattleshipCount++
  }

  incrementPlayer0CarrierCount() {
    this.player0CarrierCount++
  }

  incrementPlayer1DestroyerCount() {
    this.player1DestroyerCount++
  }

  incrementPlayer1SubmarineCount() {
    this.player1SubmarineCount++
  }

  incrementPlayer1CruiserCount() {
    this.player1CruiserCount++
  }

  incrementPlayer1BattleshipCount() {
    this.player1BattleshipCount++
  }

  incrementPlayer1CarrierCount() {
    this.player1CarrierCount++
  }
}



// Set static folder
app.use(express.static(path.join(__dirname, "public")))

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))

// Handle a socket connection request from web client
const connections = [null, null]

io.on('connection', socket => {
  // console.log('New WS Connection')

  // Find an available player number
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i
      break
    }
  }

  // Tell the connecting client what player number they are
  socket.emit('player-number', playerIndex)

  console.log(`Player ${playerIndex} has connected`)

  // Ignore player 3
  if (playerIndex === -1) return

  connections[playerIndex] = false

  // Tell eveyone what player number just connected
  socket.broadcast.emit('player-connection', playerIndex)

  // Handle Diconnect

  
            //let { address } = await res.json();
            //let r = await this.broadcastTx(utxos, address, amount);

  socket.on('disconnect', async () => {
    console.log(`Player ${playerIndex} disconnected`)
    for (let i = 0; i < playerDataArray.length; i++) {
      let res = await fetch(`https://api.polynym.io/getAddress/${playerDataArray[i][1]}`);
      let { address } = await res.json();
      const refundTx = new bsv.Transaction()
      refundTx.to(address, 100000)
      const refundString = await run.purse.pay(refundTx.toString('hex'), [])
      await run.blockchain.broadcast(refundString)
      refundTxHash = refundTx.hash
      console.log(refundTxHash)
      await socket.broadcast.emit('players-refunded', refundTxHash)
    }  
    playerDataArray = []
    connections[playerIndex] = null
    //Tell everyone what player number just disconnected
    socket.broadcast.emit('player-connection', playerIndex)
    // Refund everyone?
  })

  // On Ready
  socket.on('player-ready', async (playerData) => {
    playerDataArray.push(playerData)
    console.log(playerDataArray)
    socket.broadcast.emit('enemy-ready', playerIndex)
    connections[playerIndex] = true
    if (playerDataArray.length === 2) {
      game = new Game(playerDataArray[0][1],playerDataArray[1][1])
      await run.sync()
      console.log(game)
      socket.emit('game-on', game) 
      socket.broadcast.emit('game-on', game) 
    }
  })

  // Check player connections
  socket.on('check-players', () => {
    const players = []
    for (const i in connections) {
      connections[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: connections[i]})
    }
    socket.emit('check-players', players)
  })

  // On Fire Received
  socket.on('fire', id => {
    console.log(`Shot fired from ${playerIndex}`, id)

    // Emit the move to the other player
    socket.broadcast.emit('fire', id)
  })

  // on Fire Reply
  socket.on('fire-reply', square => {
    console.log(square)

    // Forward the reply to the other player
    socket.broadcast.emit('fire-reply', square)
  })

  socket.on('destroyer-hit', async playerNum => {
    console.log(playerNum)
    if (playerNum === 0) {
      game.incrementPlayer0DestroyerCount()
      await run.sync()
    } else {
      game.incrementPlayer1DestroyerCount()
      await run.sync()
    }
    socket.emit('destroyer-hit-logged', game) 
  })

  socket.on('submarine-hit', async playerNum => {
    if (playerNum === 0) {
      game.incrementPlayer0SubmarineCount()
      await run.sync()
    } else {
      game.incrementPlayer1SubmarineCount()
      await run.sync()
      socket.emit('submarine-hit-logged', game) 
    }
  })

  socket.on('cruiser-hit', async playerNum => {
    if (playerNum === 0) {
      game.incrementPlayer0CruiserCount()
      await run.sync()
    } else {
      game.incrementPlayer1CruiserCount()
      await run.sync()
      socket.emit('cruiser-hit-logged', game) 
    }
  })

  socket.on('battleship-hit', async playerNum => {
    if (playerNum === 0) {
      game.incrementPlayer0BattleshipCount()
      await run.sync()
    } else {
      game.incrementPlayer1BattleshipCount()
      await run.sync()
    }
    socket.emit('battleship-hit-logged', game) 
  })

  socket.on('carrier-hit', async playerNum => {
    if (playerNum === 0) {
      game.incrementPlayer0CarrierCount()
      await run.sync()
    } else {
      game.incrementPlayer1CarrierCount()
      await run.sync()
    }
    socket.emit('carrier-hit-logged', game) 
  })

  socket.on('i-win', async playerNum => {

    const winner = playerDataArray.find(element => element[0] === playerNum);
    console.log("We got a winner:" + winner)
    let res = await fetch(`https://api.polynym.io/getAddress/${winner[1]}`);
      let { address } = await res.json();
    const winnerTx = new bsv.Transaction()
    winnerTx.to(address, 174000)
    const winnerPayout = await run.purse.pay(winnerTx.toString('hex'), [])
    await run.blockchain.broadcast(winnerPayout)
    winnerTxHash = winnerTx.txid
      socket.emit('you-won', winnerTxHash)
      var winnerTxLink = `https://whatsonchain.com/tx/${winnerTxHash}`
                  turnDisplay.innerHTML=`<p>You Win 1.74 MILLI (0.00174 BSV)! <a target="new" href = "${winnerTxLink}">View Transaction</a></p>`
    // Broadcast payout transaction message to both players and handle client side
    playerDataArray = []
  })

  // Timeout connection
  setTimeout(() => {
    connections[playerIndex] = null
    socket.emit('timeout')
    socket.disconnect()
    playerDataArray=[]
  }, 600000) // 10 minute limit per player
})
