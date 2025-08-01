import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { pokemons, pokeballs,loadImages } from './imgs.mjs'

const sock = io();
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d');
const font = new FontFace("ARCADECLASSIC", "url(/public/ARCADECLASSIC.ttf)");


let players =[]
let player = null;
let collectible;
let rank;
let endGame;
let touchStartX = 0;
let touchStartY = 0;
let touchThreshold = 30;
let isTouching = false; 
let currentTouchX = 0; 
let currentTouchY = 0; 

//Dimentions
const pad_top = 40;
const pad_left = 5;
const pad_border = 2;
const player_size = 50;
const collectible_size = 20;



// Helper Functions

const randomLocation = (size,X,Y) => {
    let x = Math.floor(pad_left + pad_border + (X+100) * (canvas.width - 2*(pad_left + pad_border) - size));
    let y = Math.floor(pad_top + pad_border +  (Y+100) * (canvas.height - pad_top - pad_left - 2*pad_border - size));
    return {x,y}
}

const newPlayer = (X,Y,id) => {
    const dir={up:false,down:false,left:false,right:false}
    let {x,y} = randomLocation(player_size,X,Y);
    let playerObj = {x:x, y:y, score:0, id:id, speed:1, dir:dir};
    return new Player(playerObj)
}

const newCollectble = (X,Y,id,value) => {
    let {x,y} = randomLocation(collectible_size,X,Y);
    let CollectibleObj = {x:x, y:y, value:value, id:id,state: false}
    return new Collectible(CollectibleObj)
}

const updateDirection = (dir,isPressed = false) =>{
    switch (dir){
        case'ArrowUp' :
          player.dir.up = isPressed
          break;
        case'ArrowDown' :
        player.dir.down = isPressed
          break;
        case'ArrowLeft' :
        player.dir.left = isPressed
          break;
        case'ArrowRight' :
        player.dir.right = isPressed
          break;
      }
}

//Board Functions
const getBoard = () => {

    const draw = () => {
        if (players.length) {    
            players.forEach(player => {
                let img = pokemons.find(pok => pok.id === player.id)?.img;
                if (img) {
                    ctx.drawImage(img, player.x, player.y, player_size, player_size);
                }
            });
        }
        
        if (collectible && collectible.x !== undefined && collectible.y !== undefined) {
            let img = pokeballs.find(ball => ball.id === collectible.id)?.img;
            if (img) {
                ctx.drawImage(img, collectible.x, collectible.y, collectible_size, collectible_size);
            }
        }
    };
    

    const layout = () => {
        font.load().then(function(loadedFont) {
            document.fonts.add(loadedFont);
            ctx.font = '12pt ARCADECLASSIC'
            ctx.fillStyle = 'white';
            ctx.fillText('Controls:      WASD/Arrow Keys', 10, 30);
            if (player && typeof player.score !== 'undefined') { // Check if player exists AND has a score
                ctx.fillText(`Score: ${player.score}`, 450, 30);
            } else {
                ctx.fillText(`Score: 0`, 450, 30); // Show 0 or nothing if player isn't ready yet
}
            ctx.fillText(`${rank}`, 530, 30);
            ctx.font = '20pt ARCADECLASSIC';
            ctx.fillText('COIN     RACE', 250, 30);
            if (endGame){ctx.fillText(endGame, 110, 100);}
        })
        canvas.style.background = 'rgb(35,43,43, 0.7)';
        ctx.fillStyle = '#bbbbbb';
        ctx.fillRect(pad_left,pad_top,canvas.width - 2*pad_left, canvas.height - pad_top - pad_left)
        ctx.fillStyle = '#232b2b';
        ctx.fillRect(pad_left + pad_border, pad_top + pad_border, canvas.width - 2*(pad_left+pad_border), canvas.height - pad_top - pad_left - 2*pad_border)
    }
    
    // Ensure these are at the top level of game.mjs (outside any function)
    let lastPlayerUpdateTime = 0;
    const playerUpdateInterval = 20; // milliseconds, for ~20 updates/sec (1000/50)

    // ... (rest of your game.mjs code)

    const updatePlayer = ()=>{
        // This 'if (player)' check is essential to prevent errors if 'player' is null
        if (player){
            // Player movement logic (your existing code, leave as is)
            if(player.dir.right && player.x < canvas.width - pad_border - pad_left - player_size){player.movePlayer('right',player.speed)}
            if(player.dir.left && player.x > pad_border + pad_left){player.movePlayer('left',player.speed)}
            if(player.dir.up && player.y > pad_border + pad_top){player.movePlayer('up',player.speed)}
            if(player.dir.down && player.y < canvas.height - pad_border - pad_left - player_size){player.movePlayer('down',player.speed)}
            
            // Collision detection and score update logic (your existing code, leave as is)
            if(collectible.x && player.collision(collectible, collectible_size, player_size)){
                player.score += collectible.value ;
                if(player.score >= 50){sock.emit('win',player.id)}
                collectible = {};
                sock.emit('collision'); 
            }

                    // --- NEW CONTINUOUS TOUCH MOVEMENT LOGIC ---
        if (isTouching) {
            const centerX = canvas.width / 2; // Or dynamically calculate center of player/screen for joystick-like control
            const centerY = canvas.height / 2;

            // For simplicity, let's assume moving finger right of center moves right, etc.
            // A more sophisticated approach would be a virtual joystick, but this is a start.
            // Let's use the player's actual position for a 'virtual joystick' relative to player.
            const playerCenterX = player.x + player_size / 2;
            const playerCenterY = player.y + player_size / 2;

            const deltaX = currentTouchX - playerCenterX;
            const deltaY = currentTouchY - playerCenterY;

            // Define a dead zone or sensitivity (adjust as needed)
            const deadZone = 50; // Pixels from player center

            // Reset all directions first to prevent sticking
            updateDirection('ArrowUp', false);
            updateDirection('ArrowDown', false);
            updateDirection('ArrowLeft', false);
            updateDirection('ArrowRight', false);

            if (Math.abs(deltaX) > Math.abs(deltaY)) { // More horizontal movement
                if (deltaX > deadZone) {
                    updateDirection('ArrowRight', true);
                } else if (deltaX < -deadZone) {
                    updateDirection('ArrowLeft', true);
                }
            } else { // More vertical movement
                if (deltaY > deadZone) {
                    updateDirection('ArrowDown', true);
                } else if (deltaY < -deadZone) {
                    updateDirection('ArrowUp', true);
                }
            }
        }
        // --- END NEW CONTINUOUS TOUCH MOVEMENT LOGIC ---

            // --- THIS IS THE ONLY 'player update' EMIT, AND IT'S THROTTLED ---
            const currentTime = Date.now();
            if (currentTime - lastPlayerUpdateTime > playerUpdateInterval) {
                sock.emit('player update', player); // This is the ONLY place this emit should be
                lastPlayerUpdateTime = currentTime;
            }
            // --- END OF THROTTLED EMIT BLOCK ---
        }
        // No code here related to player update, outside the if(player) block
    }

    const animate = () => {
        requestAnimationFrame(animate);
        ctx.clearRect(0,0,canvas.width,canvas.height);
        layout();

        updatePlayer();
        if(!endGame){draw()}
    }
    
    return{animate,draw}
}


(() => {
    const { animate, draw } = getBoard();
    loadImages().then(() => {
        let ballReady = false;

        // First, listen for pokeball and store it
        sock.on('new pokeball', pokeball => {
            collectible = newCollectble(pokeball.x, pokeball.y, pokeball.id, pokeball.value);
            sock.emit('pokeball registered', collectible);
            ballReady = true;
            trySpawnPlayer(); // only spawn if player is not created yet
        });

        // Second, listen for player data
        sock.on('new player', playerData => {
            player = newPlayer(playerData.x, playerData.y, playerData.id);
            sock.emit('player registered', player);
            trySpawnPlayer(); // only spawn if pokeball is already received
        });

        // Define this helper to check when both are ready
        function trySpawnPlayer() {
            if (player && collectible && !animate.started) {
                animate();
                animate.started = true;
            }
        }

        // Remaining listeners stay the same
        sock.on('players display', data => {
            players = data;
            rank = player.calculateRank(players);
        });

        sock.on('pokeball display', data => {
            collectible = data;
        });

        sock.on('end game', id => {
            let restart = 'Restart  and  try  again.';
            endGame = id == player.id ? 'You  win  !' + restart : 'You  lose!' + restart;
        });

        // Emit the connection request after handlers are set up!
        sock.emit('new connection');

    }).catch(error => {
        console.error('Error loading images:', error);
    });
})();


window.addEventListener("keydown", e => {
    updateDirection(e.code,true)
    //player.movePlayer(e.code,player.speed,true)
});
window.addEventListener("keyup", e => {
    updateDirection(e.code)
    //player.movePlayer(e.code,0,false)
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault(); // Prevent default browser touch behavior (like scrolling)
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault(); // Prevent default browser touch behavior
    // No action on move, we only care about start and end for simple swipes
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault(); // Prevent default browser touch behavior (like scrolling)
    isTouching = true;
    touchStartX = e.touches[0].clientX; // Capture start for potential reference (less critical for continuous)
    touchStartY = e.touches[0].clientY;
    currentTouchX = e.touches[0].clientX; // Initialize current position
    currentTouchY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault(); // Prevent default browser touch behavior
    if (isTouching) {
        currentTouchX = e.touches[0].clientX; // Update current position as finger moves
        currentTouchY = e.touches[0].clientY;
    }
});

canvas.addEventListener('touchend', e => {
    e.preventDefault(); // Prevent default browser touch behavior
    isTouching = false;
    // When finger lifts, stop all movement
    updateDirection('ArrowUp', false);
    updateDirection('ArrowDown', false);
    updateDirection('ArrowLeft', false);
    updateDirection('ArrowRight', false);
});
