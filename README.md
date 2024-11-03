# Nine Men's Morris Game

A web-based implementation of the classic board game Nine Men's Morris.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Git](https://git-scm.com/)
- [NVM (Node Version Manager)](https://github.com/nvm-sh/nvm)

## Node.js Setup with NVM

1. **Install NVM**
   ```bash
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   ```

2. **Set up NVM in your terminal**
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
   ```

3. **Install and use Node.js v20.18**
   ```bash
   nvm install 20.18
   nvm use 20.18
   ```

4. **Set as default (optional)**
   ```bash
   nvm alias default 20.18
   ```

5. **Verify installation**
   ```bash
   node --version   # Should show v20.18.x
   npm --version    # Should show the latest npm version
   ```



## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/trilha-web-project.git
   cd trilha-web-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Open the game**
   - Open your browser and navigate to `http://localhost:3000`
   - The game should now be running and ready to play!

## How to Play

1. The game starts with an empty board
2. Players take turns placing pieces (9 each)
3. After all pieces are placed, players move pieces to adjacent spots
4. Creating a "mill" (3 pieces in a row) allows you to remove an opponent's piece
5. A player wins when their opponent has only 2 pieces left or can't make a legal move

## Game Controls

- Click on a spot to place or move a piece
- When a mill is formed, click on an opponent's piece to remove it
