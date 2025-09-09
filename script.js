// ------------------ HOMEPAGE LOGIC ------------------

// Get the form where players select number of players
const playerForm = document.getElementById("playerForm");

if (playerForm) {
  // When the form is submitted
  playerForm.addEventListener("submit", function (e) {
    e.preventDefault(); // prevent page reload

    // Get the selected radio button value (number of players)
    const players = document.querySelector('input[name="players"]:checked').value;

    // Save chosen players count to localStorage so game page can use it
    localStorage.setItem("players", players);

    // Redirect to the actual game page
    window.location.href = "snakes_ladders.html";
  });
}



// ------------------ GAME PAGE LOGIC ------------------

const board = document.getElementById("board");

if (board) {
  // Number of players (from localStorage), default is 2 if missing
  const playerCount = parseInt(localStorage.getItem("players")) || 2;

  // Game UI elements
  const turnInfo = document.getElementById("turnInfo");
  const rollBtn = document.getElementById("rollBtn");
  const diceResult = document.getElementById("diceResult");

  // ------------------ BOARD CREATION ------------------

  for (let row = 9; row >= 0; row--) {
    for (let col = 0; col < 10; col++) {
      let num =
        row % 2 === 0
          ? row * 10 + col + 1
          : row * 10 + (10 - col);

      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = "cell-" + num;
      board.appendChild(cell);
    }
  }

  // ------------------ PLAYER STATE ------------------

  let players = [];
  // Player colors (matching your CSS .player1, .player2 etc.)
const playerColors = ["red", "blue", "green", "orange"];
const playerNames  = ["Red", "Blue", "Green", "Orange"];

  for (let i = 1; i <= playerCount; i++) {
    players.push({ id: i, pos: 0, entered: false });
  }

  let currentPlayer = 0;

  // ------------------ SNAKES & LADDERS ------------------

  const snakes = { 99: 41, 89: 53, 76: 58, 66: 45, 54: 31, 43: 18, 40: 3, 27: 5 };
  const ladders = { 4: 25, 13: 46, 33: 49, 50: 69, 42: 63, 62: 81, 74: 92 };

  // ------------------ RENDER TOKENS ------------------

  function renderTokens() {
  players.forEach((p) => {
    const token = document.getElementById("p" + p.id); // existing token

    if (p.pos === 0) {
      // Stay in lobby
      document.querySelector("#lobby .tokens").appendChild(token);
    } else {
      // Move onto the board
      const cell = document.getElementById("cell-" + p.pos);
      cell.appendChild(token);
    }
  });
}




  // ------------------ TURN HANDLING ------------------

 function showTurn() {
  const name  = playerNames[currentPlayer];
  const color = playerColors[currentPlayer];

  turnInfo.textContent = `${name}'s Turn 🎯`;
  turnInfo.style.color = color;  // set text color to match token
}


function nextTurn() {
  setTimeout(() => {
    currentPlayer = (currentPlayer + 1) % playerCount;
    showTurn();
  }, 1000); // ⏳ 1 second delay before showing next turn
}


  // ------------------ ROLL DICE & MOVE ------------------

// ----- animated dice roll handler -----
rollBtn.addEventListener("click", function () {
  const dice = document.getElementById("dice");
  const resultText = diceResult; // already defined
  const sound = document.getElementById("diceSound"); // 🎵 audio element

  if (!dice || !rollBtn) return;

  // Play rolling sound
  sound.currentTime = 0; // restart from beginning
  sound.play();

  // disable button while animating
  rollBtn.disabled = true;
  dice.classList.add("animating");

  // quick face-cycling animation
  let cycles = 0;
  const maxCycles = 10;        // ~10 frames of random faces
  const intervalMs = 80;       // time per face

  const animInterval = setInterval(() => {
    const randomFace = Math.floor(Math.random() * 6) + 1;
    dice.className = "dice show-" + randomFace + " animating";
    cycles++;
    if (cycles >= maxCycles) {
      clearInterval(animInterval);

      // small timeout so the animation class can finish its shake
      setTimeout(() => {
        dice.classList.remove("animating");

        // final roll result
        const roll = Math.floor(Math.random() * 6) + 1;
        dice.className = "dice show-" + roll;

        // update textual result (optional)
        resultText.textContent = `🎲 Rolled: ${roll}`;

        // --- existing game logic (preserved) ---
        let player = players[currentPlayer];

        // Rule: must roll 6 to enter the board
        if (!player.entered) {
          if (roll === 6) {
            player.entered = true;
            player.pos = 1;
            renderTokens();
            showTurn();
            rollBtn.disabled = false;
            setTimeout(showTurn, 1000); // ⏳ delay before showing again
            return;
          } else {
            nextTurn();
            rollBtn.disabled = false;
            return;
          }
        }

        // Normal move
        let newPos = player.pos + roll;
        

        if (newPos <= 100) {
          if (snakes[newPos]) newPos = snakes[newPos];
          if (ladders[newPos]) newPos = ladders[newPos];
          player.pos = newPos;
        }

        renderTokens();

        // Check winning condition
        if (player.pos === 100) {
          const name = playerNames[currentPlayer];
          alert(`🎉 ${name} Wins!`);
          rollBtn.disabled = true;
          return;
        }

        // If roll is 6, same player plays again
        if (roll === 6) {
          showTurn();
        } else {
          nextTurn();
        }

        // re-enable button (unless game ended)
        rollBtn.disabled = false;

      }, 180); // wait a tiny bit so shake looks smooth
    }
  }, intervalMs);
});



  // ------------------ INITIAL SETUP ------------------

  showTurn();
  
  renderTokens();
}
