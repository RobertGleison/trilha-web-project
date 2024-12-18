//import {boardUtils} from "./board_utils.js"
/*Teste para o envio de pacotes ao servidor, async para nao ficar feio */


function gameOver(winner) {
    console.log("Game Over");
    
    // Rest of your modal code...
    const modal = document.createElement('div');
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

    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        width: 90%;
    `;

    // Add content to modal
    modalContent.innerHTML = `
    <div>
        <h2 style="color: #009579; margin-bottom: 20px;">Game Over!</h2>
        <p id="winnerName" style="color: #555; font-size: 1.2rem; margin-bottom: 20px;"></p>
    </div>
    <button id="closeModal" style="
        background-color: #009579;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.3s;
    ">Back to Menu</button>
        `;

    // Add modal content to modal container
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);

    const winnerElement = document.getElementById("winnerName");
    winnerElement.textContent = `Winner: ${winner}`;

    // Function to handle game end
    const endGame = () => {
        document.body.removeChild(modal);
        sessionStorage.removeItem("gameSettings");
        sessionStorage.removeItem("game");
        window.Router.navigateTo("#");
    };

    // Close modal when clicking close button
    document.getElementById('closeModal').addEventListener('click', endGame);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            e.preventDefault();
            document.body.removeChild(modal);
            sessionStorage.removeItem("gameSettings");
            sessionStorage.removeItem("game");
            window.Router.navigateTo("#");
        }
    });
}
/*----------------------------------------------------------------------------------------
Função para se juntar a um jogo/ para criar uma sala para o jogo*/ 
async function requestJoin(group, nick, password, size) {
    try {
        const response = await fetch('http://twserver.alunos.dcc.fc.up.pt:8008/join', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ group, nick, password, size }),
        });

        if (response.ok) {
            const data = await response.json(); 
            return data; 
        } else {
            const errorText = await response.text(); 
            alert("Error, bad request");
            console.error('Error:', errorText);
            return null;
        }
    } catch (error) {
        alert(`Network error: ${error.message}`);
        console.error('Network error:', error);
        return null;
    }
}
/*-----------------------------------------------------------------------------------------
Debugging feito*/

/*----------------------------------------------------------------------------------------
Função para sair de um jogo, importante notar que apos 2 minutos um leave é executado automaticamente*/ 
async function requestLeave(nick, password, game){
    const response = await fetch('http://twserver.alunos.dcc.fc.up.pt:8008/leave', {
        method: 'POST',
        body: JSON.stringify({nick, password, game})
    })
}
/*-----------------------------------------------------------------------------------------
Debugging nao feito*/

/*----------------------------------------------------------------------------------------
Função para enviar ao servidor uma jogada*/ 
async function requestNotify(nick, password, game, square, position) {
    const cell = { square, position };
    
    try {
        const response = await fetch('http://twserver.alunos.dcc.fc.up.pt:8008/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nick, password, game, cell })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        console.error("Error in requestNotify:", error);
    }
}

/*-----------------------------------------------------------------------------------------
Debugging nao feito*/

/*----------------------------------------------------------------------------------------
Função para autualizar o tabuleiro do jogo*/ 
async function requestUpdate(game, nick, callback) {
    const params = new URLSearchParams({ game, nick });
    const url = `http://twserver.alunos.dcc.fc.up.pt:8008/update?${params.toString()}`;

    try {
        const eventSource = new EventSource(url);

        let gameEnded = false; // Flag to indicate if the game has ended
        let isMessageReceived = false;

        class Spinner {
            constructor(canvasId) {
                const canvas = document.getElementById(canvasId);
                this.ctx = canvas.getContext("2d");
                this.centerX = canvas.width / 2;
                this.centerY = canvas.height / 2;
                this.radius = 50;
                this.startAngle = 0;
            }

            draw() {
                const ctx = this.ctx;
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                ctx.beginPath();
                ctx.arc(
                    this.centerX,
                    this.centerY,
                    this.radius,
                    this.startAngle,
                    this.startAngle + Math.PI / 2
                );
                ctx.lineWidth = 8;
                ctx.strokeStyle = "#00FF7F";
                ctx.lineCap = "round";
                ctx.stroke();

                this.startAngle += 0.05;
                requestAnimationFrame(this.draw.bind(this));
            }

            start() {
                this.draw();
            }
        }

        function createPopupWithSpinner() {
            const popup = document.createElement("div");
            popup.id = "waiting-popup";
            popup.style.position = "fixed";
            popup.style.top = "50%";
            popup.style.left = "50%";
            popup.style.transform = "translate(-50%, -50%)";
            popup.style.backgroundColor = "white";
            popup.style.color = "black";
            popup.style.padding = "20px";
            popup.style.borderRadius = "10px";
            popup.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.5)";
            popup.style.textAlign = "center";
            popup.style.fontSize = "18px";
            popup.style.zIndex = "1000";

            const message = document.createElement("div");
            message.innerText = "Waiting for an opponent...";
            message.style.marginBottom = "20px";
            popup.appendChild(message);

            const canvas = document.createElement("canvas");
            canvas.id = "spinner-canvas";
            canvas.width = 120;
            canvas.height = 120;
            popup.appendChild(canvas);

            document.body.appendChild(popup);

            const spinner = new Spinner("spinner-canvas");
            spinner.start();
        }

        function removePopup() {
            const popup = document.getElementById("waiting-popup");
            if (popup) {
                popup.remove();
            }
        }

        async function executeWhileNoMessage() {
            createPopupWithSpinner();
            while (!isMessageReceived) {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            removePopup();
        }

        executeWhileNoMessage();

        eventSource.onmessage = (event) => {
            isMessageReceived = true;

            try {
                if (gameEnded) {
                    // Ignore further messages once the game ends
                    return;
                }

                const data = JSON.parse(event.data);

                if (data.winner) {
                    console.log(`Game over. Winner: ${data.winner}`);
                    gameEnded = true; // Mark the game as ended
                    eventSource.close(); // Close the EventSource
                    gameOver(data.winner); // Call the game-over callback
                } else {
                    if (callback) callback(data); // Process other game updates
                }
            } catch (error) {
                console.error("Error parsing server response:", error);
            }
        };

        eventSource.onerror = () => {
            console.error("Connection error.");
            gameEnded = true;
            isMessageReceived = true;
            eventSource.close();
            removePopup();
        };
    } catch (error) {
        console.error("Error initializing EventSource:", error);
    }
}



function processDataPeriodically(callback) {
    let latestData = null; // Armazena apenas o último pacote

    setInterval(() => {
        if (latestData !== null) {
            callback(latestData); // Processa apenas o último pacote
            latestData = null; // Limpa após processar
        }
    }, 1000);

    return (data) => {
        latestData = data; // Substitui pelo pacote mais recente
    };
}


/*-----------------------------------------------------------------------------------------
Debugging feito, no caso de nao existir o jogo o codigo funciona*/

/*----------------------------------------------------------------------------------------
Função retorna a tabela de classificação com os top 10 jogadores*/ 
async function requestRanking(group, size) {
    try {
        const response = await fetch('http://twserver.alunos.dcc.fc.up.pt:8008/ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ group, size }),
        });

        if (response.ok) {
            const data = await response.json(); // Parse the JSON response
            alert("Success");
            return data; // Return the parsed response
        } else {
            const errorText = await response.text(); // Read the error response
            alert("Error, bad request");
            console.error('Error:', errorText);
            return null;
        }
    } catch (error) {
        alert(`Network error: ${error.message}`);
        console.error('Network error:', error);
        return null;
    }
}



export {
    requestJoin,
    requestLeave,
    requestNotify,
    requestUpdate,
    processDataPeriodically,
    requestRanking
};

/*-----------------------------------------------------------------------------------------
Debugging feito*/



