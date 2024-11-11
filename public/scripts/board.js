window.Board = (function () {
  // Variáveis globais
  let gameBoard = new Map();
  let currentPlayer;
  let players = {};
  let pieceRemovalAllowed = false;
  let resolvePlayerAction;
  let placingPiecesPhase = false;
  let movingPhase = false;
  let selectedPiece = null;
  let possibleMoves = [];
  let boardLevels; // Número de níveis (aros) do tabuleiro
  let gameSettingsGlobal; // Variável global para armazenar as configurações do jogo
  let gameOver = false; // Flag para indicar se o jogo acabou

  // Função utilitária para criar o tabuleiro
  function createBoard(levels) {
    boardLevels = levels; // Armazena o número de níveis do tabuleiro
    const board = document.getElementById("board");

    // Verifica se o elemento board existe
    if (!board) {
      console.error("Elemento com id 'board' não encontrado.");
      return;
    }

    const initialSize = 125;
    const sizeIncrement = 125;

    // Limpa o conteúdo anterior do tabuleiro
    board.innerHTML = "";

    for (let i = levels; i > 0; i--) {
      const size = initialSize + i * sizeIncrement;
      const square = document.createElement("div");
      square.classList.add("square");
      square.style.width = `${size}px`;
      square.style.height = `${size}px`;
      square.style.left = `calc(50% - ${size / 2}px)`;
      square.style.top = `calc(50% - ${size / 2}px)`;

      function createButton(level, x, y, position) {
        const id = `${level}${position}`;
        gameBoard.set(id, "empty");
        const button = document.createElement("div");
        button.id = id;
        button.classList.add("button");
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        square.appendChild(button);
        button.addEventListener("click", selectTile);
      }

      const halfSize = size / 2;

      // Criando os botões em cada posição
      createButton(i, 0, 0, "1");
      createButton(i, halfSize, 0, "2");
      createButton(i, size, 0, "3");
      createButton(i, size, halfSize, "4");
      createButton(i, size, size, "5");
      createButton(i, halfSize, size, "6");
      createButton(i, 0, size, "7");
      createButton(i, 0, halfSize, "8");

      board.appendChild(square);
    }
  }

  // Função para remover uma peça da pilha do jogador
  function removePieceFromPile(playerId) {
    const container = document.getElementById(playerId);
    if (container && container.lastChild) {
      container.removeChild(container.lastChild);
    }
  }

  // Função que retorna uma promessa que será resolvida quando o jogador realizar uma ação
  function waitForPlayerAction() {
    return new Promise((resolve) => {
      resolvePlayerAction = resolve;
    });
  }

  // Função chamada quando um tile é selecionado
  function selectTile(event) {
    if (gameOver) return; // Não permite ações se o jogo acabou

    let selectedButton = event.target;

    // Percorre a hierarquia do DOM até encontrar o elemento com a classe 'button'
    while (selectedButton && !selectedButton.classList.contains("button")) {
      selectedButton = selectedButton.parentElement;
    }

    // Verifica se encontrou o botão
    if (!selectedButton) {
      console.error("Elemento do botão não encontrado.");
      return;
    }

    selectionSuccess = false;

    // Ignora cliques se não for o turno do jogador humano
    if (
      !(
        (placingPiecesPhase || movingPhase || pieceRemovalAllowed) &&
        (gameSettingsGlobal.gameMode !== "pvc" ||
          currentPlayer.symbol !== "Black")
      )
    ) {
      return;
    }

    // Remoção de peça do oponente
    if (pieceRemovalAllowed) {
      const opponentId =
        currentPlayer.playerId === "red-pieces" ? "black-pieces" : "red-pieces";
      if (gameBoard.get(selectedButton.id) === opponentId) {
        removeOpponentPiece(selectedButton, opponentId);
        pieceRemovalAllowed = false;
        selectionSuccess = true;
        if (resolvePlayerAction) resolvePlayerAction();
        return;
      } else {
        console.log("Escolha uma peça válida do oponente para remover.");
        return;
      }
    }

    // Fase de posicionamento de peças
    if (placingPiecesPhase) {
      if (gameBoard.get(selectedButton.id) === "empty") {
        removePieceFromPile(currentPlayer.playerId);
        currentPlayer.piecesInHand--;
        currentPlayer.piecesOnBoard++;
        gameBoard.set(selectedButton.id, currentPlayer.playerId);

        const piece = document.createElement("img");
        piece.src =
          currentPlayer.symbol === "Red"
            ? "./assets/red_piece.png"
            : "./assets/black_piece.png";
        piece.classList.add("piece");
        selectedButton.appendChild(piece);

        if (checkForMill(selectedButton.id)) {
          console.log(
            "Trilho formado! Você pode remover uma peça do oponente."
          );
          updateRemovingPieceDisplay()
          pieceRemovalAllowed = true;
        } else {
          currentPlayer = getNextPlayer(currentPlayer); // Troca o turno se não formar um mill
        }

        selectionSuccess = true;
        if (resolvePlayerAction) resolvePlayerAction();
        return;
      } else {
        console.log("Este espaço já está ocupado. Escolha outro.");
        return;
      }
    }

    // Fase de movimentação de peças
    if (movingPhase) {
      if (!selectedPiece) {
        if (gameBoard.get(selectedButton.id) === currentPlayer.playerId) {
          selectedPiece = selectedButton.id;
          possibleMoves = getPossibleMoves(selectedPiece);
          if (possibleMoves.length === 0) {
            console.log(
              "Esta peça não tem movimentos possíveis. Selecione outra peça."
            );
            selectedPiece = null;
            return;
          }
          highlightPossibleMoves(possibleMoves);
        } else {
          console.log("Selecione uma de suas próprias peças para movimentar.");
        }
      } else {
        if (gameBoard.get(selectedButton.id) === currentPlayer.playerId) {
          // Permite que o jogador selecione outra peça
          removeHighlights();
          selectedPiece = selectedButton.id;
          possibleMoves = getPossibleMoves(selectedPiece);
          if (possibleMoves.length === 0) {
            console.log(
              "Esta peça não tem movimentos possíveis. Selecione outra peça."
            );
            selectedPiece = null;
            return;
          }
          highlightPossibleMoves(possibleMoves);
        } else if (possibleMoves.includes(selectedButton.id)) {
          movePiece(selectedPiece, selectedButton.id);
          removeHighlights();
          selectedPiece = null;
          possibleMoves = [];

          if (checkForMill(selectedButton.id)) {
            console.log(
              "Trilho formado! Você pode remover uma peça do oponente."
            );
            updateRemovingPieceDisplay()
            pieceRemovalAllowed = true;
          } else {
            currentPlayer = getNextPlayer(currentPlayer); // Troca o turno se não formar um mill
          }

          selectionSuccess = true;
          if (resolvePlayerAction) resolvePlayerAction();
          return;
        } else {
          console.log(
            "Escolha uma posição válida para mover a peça ou selecione outra peça."
          );
          return;
        }
      }
    }
  }

  // Função para mover uma peça
  function movePiece(fromId, toId) {
    const fromButton = document.getElementById(fromId);
    const toButton = document.getElementById(toId);

    const piece = fromButton.querySelector(".piece");
    fromButton.removeChild(piece);
    toButton.appendChild(piece);

    gameBoard.set(fromId, "empty");
    gameBoard.set(toId, currentPlayer.playerId);
  }

  // Função para obter movimentos possíveis
  function getPossibleMoves(pieceId) {
    const level = parseInt(pieceId[0], 10);
    const position = parseInt(pieceId[1], 10);

    const adjacentPositions = {
      1: [2, 8],
      2: [1, 3],
      3: [2, 4],
      4: [3, 5],
      5: [4, 6],
      6: [5, 7],
      7: [6, 8],
      8: [7, 1],
    };

    let moves = [];

    adjacentPositions[position].forEach((pos) => {
      const adjacentId = `${level}${pos}`;
      if (gameBoard.get(adjacentId) === "empty") {
        moves.push(adjacentId);
      }
    });

    if (position % 2 === 0) {
      if (level > 1) {
        const lowerLevelId = `${level - 1}${position}`;
        if (gameBoard.get(lowerLevelId) === "empty") {
          moves.push(lowerLevelId);
        }
      }
      if (level < boardLevels) {
        const upperLevelId = `${level + 1}${position}`;
        if (gameBoard.get(upperLevelId) === "empty") {
          moves.push(upperLevelId);
        }
      }
    }

    return moves;
  }

  // Função para remover a peça do oponente
  function removeOpponentPiece(selectedButton, opponentId) {
    selectedButton.removeChild(selectedButton.querySelector(".piece"));
    gameBoard.set(selectedButton.id, "empty");
    const opponent = players[opponentId === "red-pieces" ? "Red" : "Black"];
    opponent.piecesOnBoard--;

    if (checkWinCondition(opponent)) {
      console.log(`Jogador ${currentPlayer.symbol} venceu!`);
      finishGame(currentPlayer.symbol)
      gameOver = true; // O jogo acabou
      return;
    }

    currentPlayer = getNextPlayer(currentPlayer); // Troca o turno após remover a peça
  }

  // Função para verificar se um mill foi formado
  function checkForMill(buttonId) {
    const level = parseInt(buttonId[0], 10);
    const position = parseInt(buttonId[1], 10);

    if (position % 2 !== 0) {
      const horizontalMill = getHorizontalMill(level, position);
      const verticalMill = getVerticalMill(level, position);

      if (horizontalMill || verticalMill) {
        console.log(
          `Trilho formado por ${currentPlayer.symbol} na posição ${buttonId}`
        );
        return true;
      }
    } else {
      const crossMill = checkCrossMill(position);
      const levelMill = getLevelMill(level, position);

      if (crossMill || levelMill) {
        console.log(
          `Trilho formado por ${currentPlayer.symbol} na posição ${buttonId}`
        );
        return true;
      }
    }
    return false;
  }

  // Função para verificar trilhos horizontais em posições ímpares
  function getHorizontalMill(level, position) {
    const positions = [1, 3, 5, 7];
    if (!positions.includes(position)) return false;

    let trio;

    if (position === 1 || position === 3) {
      trio = [1, 2, 3];
    } else if (position === 5 || position === 7) {
      trio = [5, 6, 7];
    }

    return trio.every(
      (pos) => gameBoard.get(level.toString() + pos) === currentPlayer.playerId
    );
  }

  // Função para verificar trilhos verticais em posições ímpares
  function getVerticalMill(level, position) {
    const positions = [1, 3, 5, 7];
    if (!positions.includes(position)) return false;

    let trio;

    if (position === 1 || position === 7) {
      trio = [1, 8, 7];
    } else if (position === 3 || position === 5) {
      trio = [3, 4, 5];
    }

    return trio.every(
      (pos) => gameBoard.get(level.toString() + pos) === currentPlayer.playerId
    );
  }

  // Função para verificar trilhos cruzados em posições pares
  function checkCrossMill(position) {
    if (boardLevels <= 2) return false; // Não verifica se boardLevels é 2 ou menos

    return Array.from({ length: boardLevels }, (_, i) => i + 1).every(
      (level) =>
        gameBoard.get(level.toString() + position) === currentPlayer.playerId
    );
  }

  // Função para verificar trilhos no mesmo nível em posições pares
  function getLevelMill(level, position) {
    const positions = [2, 4, 6, 8];
    if (!positions.includes(position)) return false;

    let trio;

    if (position === 2) {
      trio = [1, 2, 3];
    } else if (position === 4) {
      trio = [3, 4, 5];
    } else if (position === 6) {
      trio = [5, 6, 7];
    } else if (position === 8) {
      trio = [7, 8, 1];
    }

    return trio.every(
      (pos) => gameBoard.get(level.toString() + pos) === currentPlayer.playerId
    );
  }

  // Função para inicializar um jogador
  function initializePlayer(playerId, symbol, initialPieces) {
    return {
      playerId,
      symbol,
      piecesInHand: initialPieces,
      piecesOnBoard: 0,
    };
  }

  // Função para configurar as peças iniciais de um jogador
  function setupPlayerPieces(playerId, count) {
    const container = document.getElementById(playerId);
    if (!container) {
      console.error(`Elemento com id '${playerId}' não encontrado.`);
      return;
    }

    // Find or create the pieces holder
    let piecesHolder = container.querySelector('.pieces-holder');
    if (!piecesHolder) {
        piecesHolder = document.createElement('div');
        piecesHolder.classList.add('pieces-holder');
        container.appendChild(piecesHolder);
    }

    piecesHolder.innerHTML = "";

    container.innerHTML = ""; // Limpa peças antigas
    const pieceImage = playerId.includes("Red")
      ? "./assets/red_piece.png"
      : "./assets/black_piece.png";
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("img");
      piece.src = pieceImage;
      piece.classList.add("piece");
      container.appendChild(piece);
    }
  }

  // Função para destacar possíveis movimentos
  function highlightPossibleMoves(moves) {
    moves.forEach((id) => {
      const button = document.getElementById(id);
      if (button) {
        button.classList.add("glow_green");
      }
    });
  }

  // Função para remover destaques
  function removeHighlights() {
    const buttons = document.querySelectorAll(".button");
    buttons.forEach((button) => {
      button.classList.remove("glow_green");
    });
  }

  // Função para verificar condição de vitória
  function checkWinCondition(player) {
    return player.piecesOnBoard < 3 && player.piecesInHand === 0;
  }

  // Função para obter o próximo jogador
  function getNextPlayer(player) {
    return player.playerId === "red-pieces" ? players.Black : players.Red;
  }

  // Função para obter o número inicial de peças baseado no tamanho do tabuleiro
  function getInitialNumberOfPieces(boardSize) {
    const multiplier = 3;
    return multiplier * boardSize;
  }


  function loadRankings() {
    const rankings = JSON.parse(localStorage.getItem("gameRankings")) || [];
    const tbody = document.querySelector(".ranking-table tbody");
    tbody.innerHTML = ""; // Clear existing rows
  
    rankings.forEach((ranking, index) => {
      const row = `
            <tr>
                <td><span class="rank rank-${index + 1}">${index + 1}</span></td>
                <td>${ranking.winner}</td>
                <td>${ranking.piecesLeft}</td>
                <td>${ranking.gameMode}</td>
                <td>${ranking.aiDifficulty}</td>
                <td>${ranking.score}</td>
            </tr>
        `;
      tbody.innerHTML += row;
    });
  }
  
  // Função para iniciar o jogo com configurações
  async function run_game(gameSettings = {}) {
    gameSettingsGlobal = gameSettings; // Armazena as configurações do jogo
    const levels = parseInt(gameSettings.boardSize) || 3; // Padrão é 3 níveis
    const initialPiecesAmount = getInitialNumberOfPieces(levels);
    players.Red = initializePlayer("red-pieces", "Red", initialPiecesAmount);
    players.Black = initializePlayer(
      "black-pieces",
      "Black",
      initialPiecesAmount
    );
    currentPlayer = players.Red;

    // Limpa o tabuleiro e redefine o estado do jogo
    gameBoard.clear();
    selectedPiece = null;
    possibleMoves = [];
    pieceRemovalAllowed = false;
    gameOver = false; // Reseta o estado do jogo

    createBoard(levels);
    setupPlayerPieces("red-pieces", initialPiecesAmount);
    setupPlayerPieces("black-pieces", initialPiecesAmount);

    // Adiciona informações sobre o jogador atual
    updateCurrentPlayerDisplay();

    await playGame();
  }

  // Função para atualizar a exibição do jogador atual
  function updateCurrentPlayerDisplay() {
    const currentPlayerDisplay = document.getElementById("current-player");
    const currentPlayerMessage = document.getElementById("game-message");

    if (currentPlayerDisplay) {
      currentPlayerDisplay.textContent = `Turno do jogador: ${currentPlayer.symbol}`;
      currentPlayerMessage.textContent = `Game in progress - ${currentPlayer.symbol} to move`;
    }
  }


  function updateRemovingPieceDisplay() {
    const currentPlayerMessage = document.getElementById("game-message");
    
    if (currentPlayer.symbol === "Red") {
      currentPlayerMessage.textContent = "Game in progress - Remove Black Piece";
    } else {
      currentPlayerMessage.textContent = "Game in progress - Remove Red Piece";
    }
  }


  // Modifica a função playGame para atualizar a exibição do jogador e adicionar movimentos do AI
  async function playGame() {
    while (!gameOver) {
      updateCurrentPlayerDisplay();

      selectionSuccess = false;

      if (
        gameSettingsGlobal.gameMode === "pvc" &&
        currentPlayer.symbol === "Black" &&
        gameSettingsGlobal.difficulty === "easy"
      ) {
        // Turno do AI
        if (currentPlayer.piecesInHand > 0) {
          placingPiecesPhase = true;
          await aiPlacePiece();
          placingPiecesPhase = false;
        } else {
          movingPhase = true;
          await aiMovePiece();
          movingPhase = false;
        }

        while (pieceRemovalAllowed) {
          console.log(
            `Jogador ${currentPlayer.symbol}, remova uma peça do oponente.`
          );
          await aiRemoveOpponentPiece();
        }
      } else {
        // Turno do jogador humano
        if (currentPlayer.piecesInHand > 0) {
          placingPiecesPhase = true;
          await waitForPlayerAction();
          placingPiecesPhase = false;
        } else {
          movingPhase = true;
          await waitForPlayerAction();
          movingPhase = false;
        }

        while (pieceRemovalAllowed) {
          console.log(
            `Jogador ${currentPlayer.symbol}, remova uma peça do oponente.`
          );
          await waitForPlayerAction();
        }
      }

      // A troca de turno agora ocorre dentro das funções de seleção e remoção de peças
    }
  }

  // Função para o AI colocar uma peça
  async function aiPlacePiece() {
    if (gameOver) return;
    // Obtém todas as posições vazias
    const emptyPositions = Array.from(gameBoard.entries())
      .filter(([key, value]) => value === "empty")
      .map(([key, value]) => key);

    // Escolhe uma posição aleatória
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    const selectedPositionId = emptyPositions[randomIndex];

    // Simula tempo de pensamento
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Destaca a posição selecionada
    const selectedButton = document.getElementById(selectedPositionId);
    selectedButton.classList.add("ai-selected");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simula colocar a peça
    removePieceFromPile(currentPlayer.playerId);
    currentPlayer.piecesInHand--;
    currentPlayer.piecesOnBoard++;
    gameBoard.set(selectedPositionId, currentPlayer.playerId);

    const piece = document.createElement("img");
    piece.src =
      currentPlayer.symbol === "Red"
        ? "./assets/red_piece.png"
        : "./assets/black_piece.png";
    piece.classList.add("piece");
    selectedButton.appendChild(piece);

    // Remove o destaque
    selectedButton.classList.remove("ai-selected");

    if (checkForMill(selectedPositionId)) {
      console.log("Trilho formado! AI irá remover uma peça do oponente.");
      updateRemovingPieceDisplay()
      pieceRemovalAllowed = true;
    } else {
      currentPlayer = getNextPlayer(currentPlayer); // Troca o turno se não formar um mill
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }


  

  
  // Função para o AI mover uma peça
  async function aiMovePiece() {
    if (gameOver) return;
    // Obtém todas as peças do AI no tabuleiro
    const aiPieces = Array.from(gameBoard.entries())
      .filter(([key, value]) => value === currentPlayer.playerId)
      .map(([key, value]) => key);

    // Para cada peça, obtém movimentos possíveis
    let movablePieces = [];
    aiPieces.forEach((pieceId) => {
      const moves = getPossibleMoves(pieceId);
      if (moves.length > 0) {
        movablePieces.push({ pieceId, moves });
      }
    });

    if (movablePieces.length === 0) {
      console.log("AI não tem movimentos possíveis. O jogo termina.");
      gameOver = true;
      return;
    }

    // Escolhe uma peça e um movimento aleatórios
    const randomPieceIndex = Math.floor(Math.random() * movablePieces.length);
    const selectedPieceInfo = movablePieces[randomPieceIndex];
    const selectedPieceId = selectedPieceInfo.pieceId;
    const possibleMoves = selectedPieceInfo.moves;

    const randomMoveIndex = Math.floor(Math.random() * possibleMoves.length);
    const selectedMoveId = possibleMoves[randomMoveIndex];

    // Simula tempo de pensamento
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Destaca a peça selecionada
    const selectedButton = document.getElementById(selectedPieceId);
    selectedButton.classList.add("ai-selected");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Destaca o movimento selecionado
    highlightPossibleMoves([selectedMoveId]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Move a peça
    movePiece(selectedPieceId, selectedMoveId);

    // Remove os destaques
    selectedButton.classList.remove("ai-selected");
    removeHighlights();

    if (checkForMill(selectedMoveId)) {
      console.log("Trilho formado! AI irá remover uma peça do oponente.");
      updateRemovingPieceDisplay()
      pieceRemovalAllowed = true;
    } else {
      currentPlayer = getNextPlayer(currentPlayer); // Troca o turno se não formar um mill
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Função para o AI remover uma peça do oponente
  async function aiRemoveOpponentPiece() {
    if (gameOver) return;
    const opponentId =
      currentPlayer.playerId === "red-pieces" ? "black-pieces" : "red-pieces";

    // Obtém todas as peças do oponente no tabuleiro
    const opponentPieces = Array.from(gameBoard.entries())
      .filter(([key, value]) => value === opponentId)
      .map(([key, value]) => key);

    if (opponentPieces.length === 0) {
      console.log("AI não encontrou peças do oponente para remover.");
      gameOver = true;
      return;
    }

    // Escolhe uma peça aleatória do oponente para remover
    const randomIndex = Math.floor(Math.random() * opponentPieces.length);
    const selectedPositionId = opponentPieces[randomIndex];

    // Simula tempo de pensamento
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Destaca a peça a ser removida
    const selectedButton = document.getElementById(selectedPositionId);
    selectedButton.classList.add("ai-selected");
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Remove a peça
    selectedButton.removeChild(selectedButton.querySelector(".piece"));
    gameBoard.set(selectedPositionId, "empty");
    const opponent = players[opponentId === "red-pieces" ? "Red" : "Black"];
    opponent.piecesOnBoard--;

    // Remove o destaque
    selectedButton.classList.remove("ai-selected");

    console.log(
      `AI removeu uma peça do oponente na posição ${selectedPositionId}`
    );

    // Verifica a condição de vitória
    if (checkWinCondition(opponent)) {
      console.log(`Jogador ${currentPlayer.symbol} venceu!`);
      finishGame(currentPlayer.symbol)
      gameOver = true;
      return;
    }

    pieceRemovalAllowed = false;
    currentPlayer = getNextPlayer(currentPlayer); // Troca o turno após remover a peça

    await new Promise((resolve) => setTimeout(resolve, 500));
  }



  function finishGame(winner) {
    // First, establish required variables that seem to be undefined
    const number_of_red_pieces = players.Red.piecesOnBoard;
    const number_of_black_pieces = players.Black.piecesOnBoard;
    const ai_options = gameSettingsGlobal.gameMode === "pvc" ? 1 : 0; // Assuming easy difficulty is 1

    // Create a score function since it was missing
    const score = () => {
        const basePieces = winner.includes("Red") ? number_of_red_pieces : number_of_black_pieces;
        const baseScore = basePieces * 100;
        const difficultyMultiplier = ai_options === 0 ? 1 : ai_options === 1 ? 1.2 : 1.5;
        return Math.round(baseScore * difficultyMultiplier);
    };

    // Create game result with proper conditional checks
    const gameResult = {
        winner: winner.includes("Red") 
            ? "Red Player" 
            : (gameSettingsGlobal.gameMode === "pvc" ? "Computer" : "Black Player"),
        piecesLeft: winner.includes("Red") 
            ? number_of_red_pieces 
            : number_of_black_pieces,
        gameMode: gameSettingsGlobal.gameMode === "pvc" ? "vs Computer" : "vs Player",
        aiDifficulty: gameSettingsGlobal.gameMode === "pvc" 
            ? gameSettingsGlobal.difficulty.charAt(0).toUpperCase() + gameSettingsGlobal.difficulty.slice(1)
            : "-",
        score: score()
    };

    // Get existing rankings with error handling
    let rankings = [];
    try {
        rankings = JSON.parse(localStorage.getItem("gameRankings")) || [];
    } catch (e) {
        console.error("Error loading rankings:", e);
    }

    // Add new ranking and sort
    rankings.push(gameResult);
    rankings.sort((a, b) => b.score - a.score);
    rankings = rankings.slice(0, 5);

    // Save rankings with error handling
    try {
        localStorage.setItem("gameRankings", JSON.stringify(rankings));
    } catch (e) {
        console.error("Error saving rankings:", e);
    }

    // Create modal with error handling
    try {
        const modal = document.createElement("div");
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const modalContent = document.createElement("div");
        modalContent.style.cssText = `
            background-color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            width: 90%;
        `;

        // Enhanced winner message
        const winnerMessage = winner.includes("Red") 
            ? "🔴 Red Player Wins!" 
            : (gameSettingsGlobal.gameMode === "pvc" ? "🤖 Computer Wins!" : "⚫ Black Player Wins!");

        modalContent.innerHTML = `
            <h2 style="color: #009579; margin-bottom: 20px;">Game Over!</h2>
            <p style="font-size: 1.2rem; margin-bottom: 20px;">${winnerMessage}</p>
            <div style="margin: 20px 0;">
                <p>Pieces Left: ${gameResult.piecesLeft}</p>
                <p>Score: ${gameResult.score}</p>
                <p>Game Mode: ${gameResult.gameMode}</p>
                ${gameResult.aiDifficulty !== "-" ? `<p>AI Difficulty: ${gameResult.aiDifficulty}</p>` : ''}
            </div>
            <button id="closeModal" style="
                background-color: #009579;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
                margin-top: 10px;
                transition: background-color 0.3s;
            ">Back to Menu</button>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        // Enhanced game end handling
        const endGame = () => {
            document.body.removeChild(modal);
            gameOver = true; // Ensure game is marked as over
            if (typeof reset === 'function') {
                reset(); // Only call reset if it exists
            }
            window.location.hash = "#"; // Return to menu
        };

        // Event listeners
        document.getElementById("closeModal").addEventListener("click", endGame);
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                endGame();
            }
        });

    } catch (e) {
        console.error("Error creating modal:", e);
        alert(`Game Over! ${winnerMessage}`); // Fallback if modal creation fails
    }
}

  
  return {
    run_game,
  };
})();

function addGlowEffect(color) {
  //
  const buttons = document.querySelectorAll(".button");
  if (color == "green") {
    buttons.forEach((button) => {
      if (placing_pieces) {
        const id = button.id.split("").map(Number);
        if (game_list[id[0] - 1][id[1] - 1] == "empty") {
          button.classList.add("glow_green");
        }
      }
    });
  }
  if (color == "red") {
    buttons.forEach((button) => {
      button.classList.add("glow_red");
    });
  }
}

function removeGlowEffect() {
  //
  const buttons = document.querySelectorAll(".button");
  buttons.forEach((button) => {
    button.classList.remove("glow_green");
    button.classList.remove("glow_red");
  });
}




