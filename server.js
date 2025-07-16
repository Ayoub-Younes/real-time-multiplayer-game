require('dotenv').config();
const path = require('path')
const http = require('http')
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const security = require("./security.js");


const app = express();
//Add security features
security(app);
//app.use(express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const server = http.createServer(app);
const io = socket(server)


let players = [];
let pokeball;
const generatePokeball = () => {
  let ballId = Math.floor(Math.random() * 2) + 1
  return {id:ballId ,x:Math.random()-100, y:Math.random()-100,value:ballId };
}

// Handling IDs
const availableIds = [1, 2, 3, 4];

// Function to assign an available ID
const assignId = () => {
    if (availableIds.length > 0) {
        return availableIds.shift(); // Get and remove the smallest available ID
    }
    return null; // No available ID
};

// Function to return an ID to the available list
const releaseId = (id) => {
    if (id && !availableIds.includes(id)) {
        availableIds.push(id); // Add ID back to the available list
        availableIds.sort((a, b) => a - b); // Optional: Sort to maintain order
    }
};

io.on('connection',(sock) => {
  if(!pokeball) {
    pokeball = generatePokeball();
    io.emit('new pokeball',pokeball)
  }
  console.log(pokeball);
  const playerId = assignId();
    if (playerId === null) {
        sock.emit('connection error', 'No available slots');
        sock.disconnect(); // Disconnect if no ID is available
        return;
    }

  sock.on('new connection', () => {
    io.emit('pokeball display',pokeball);
    console.log(`User ${playerId} connected`);
    let player = {id:playerId,x:Math.random()-100, y:Math.random()-100,score:0};
    players.push(player);
    sock.emit('new player',player);
    io.emit('players display', players);
  })

  sock.on('pokeball registered', collectible => {
    pokeball = collectible;
    pokeball.state = true;
    setTimeout(() => io.emit('pokeball display',pokeball),100);
  });
  
  sock.on('player registred',pokemon => {
    let index = players.findIndex(pok => pok.id == pokemon.id)
    players[index] = pokemon;
    io.emit('players display', players);
    io.emit('pokeball display',pokeball);
  })
  sock.on('player update',pokemon => {
    let index = players.findIndex(pok => pok.id == pokemon.id)
    players[index] = pokemon;
    io.emit('players display', players);
  })

  sock.on('collision',()=>{
    pokeball = generatePokeball();
    io.emit('new pokeball',pokeball)
  })

  sock.on('win',id => {
    io.emit('end game', id)
  })

  sock.on('disconnect', () => {
    console.log(`User ${playerId} disconnected`);
    // Remove disconnected player from players array
    releaseId(playerId)
    players = players.filter(player => player.id !== playerId);
    // Emit updated players array to all clients
    io.emit('players display', players);
  });
})
// Set up server and tests
const portNum = process.env.PORT || 3000;
server.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
});

module.exports = app; // For testing
