function createSquares(n) {
    const board = document.getElementById('board');
    const initialSize = 125;
    const sizeIncrement = 125;
    var game_list = [];
    
    for (let i = 0; i < n; i++) {
      const size = initialSize + i * sizeIncrement;
      const square = document.createElement('div');
      square.classList.add('square');
      square.style.width = `${size}px`;
      square.style.height = `${size}px`;
      square.style.left = `calc(50% - ${size / 2}px)`;
      square.style.top = `calc(50% - ${size / 2}px)`;
  
      // Function to create button centered at (x, y) relative to the square
      function createButton(i, x , y) {
        const button = document.createElement('div');
        button.id = i.toString().concat(x.toString().concat(y.toString()));
        button.classList.add('button');
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        square.appendChild(button);
        button.addEventListener('click', selectTile);
      }
  
      // Place buttons centered on edges and vertices of the square
      const halfSize = size / 2;
      createButton(i, 0, 0);                // Top-left corner
      createButton(i, size, 0);              // Top-right corner
      createButton(i, 0, size);              // Bottom-left corner
      createButton(i, size, size);           // Bottom-right corner
      createButton(i, halfSize, 0);          // Top-center
      createButton(i, halfSize, size);       // Bottom-center
      createButton(i, 0, halfSize);          // Left-center
      createButton(i, size, halfSize);       // Right-center
  
      board.appendChild(square);
      game_list.push(['empty','empty','empty','empty','empty','empty','empty','empty']);
    }
  }
  
  function setupPieces(playerId, pieceImage, count) {
    const container = document.getElementById(playerId);
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("img");
      piece.src = pieceImage;
      piece.classList.add("piece");
      container.appendChild(piece);
    }
  }
  
  function selectTile() {
    console.log(this.id);
  }
  
  // Run the function with a specified number of squares
  const n = 4;
  createSquares(n);
  const numPieces = 3 * n;
  setupPieces("red-pieces", "red_checker.png", numPieces);
  setupPieces("black-pieces", "black_checker.png", numPieces);
  