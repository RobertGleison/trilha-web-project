let resolvePlayerAction;
var game_list = []; // contem todos os estados de todos os botoes
let placing_pieces = false; //variavel para ver se esta no estado de colocar as peças
let is_player_red = true; //variavel para determinar o turno
let selection_success = true; // variavel para determinar o sucesso de um loop na fase de colocar peças
let no_selected_button = true; //variavel para auxiliar a mover as peças na fase de mover
let move_phase = false; // variavel para determinar se esta na fase de mover as peças
let valid_moves_list = [] // lista de movimentos validos dado um certo botao/casa
let n = 2; // numero de quadrados no board
let choose_piece = false //retirar peças do board
var removedpieces = 0 // para ajustar o loop na hora de colocar as peças
let number_of_red_pieces = 0 // numero de peças vermelhas
let number_of_black_pieces = 0 // numero de peças pretas
let black_pieces_free_movement = false
let red_pieces_free_movement = false

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createSquares(n) {
    const board = document.getElementById('board');
    const initialSize = 125;
    const sizeIncrement = 125;
    
    for (let i = n; i > 0; i--) {
      const size = initialSize + i * sizeIncrement;
      const square = document.createElement('div');
      square.classList.add('square');
      square.style.width = `${size}px`;
      square.style.height = `${size}px`;
      square.style.left = `calc(50% - ${size / 2}px)`;
      square.style.top = `calc(50% - ${size / 2}px)`;
  
      // Function to create button centered at (x, y) relative to the square
      function createButton(i, x , y, n) {
        const button = document.createElement('div');
        button.id = i.toString().concat(n)
        button.classList.add('button');
        button.style.left = `${x}px`;
        button.style.top = `${y}px`;
        square.appendChild(button);
        button.addEventListener('click', selectTile);
      }
  
      // Place buttons centered on edges and vertices of the square
      const halfSize = size / 2;

    createButton(i, 0, 0, '1');                // Top-left corner
    createButton(i, halfSize, 0, '2');          // Top-center
    createButton(i, size, 0, '3');              // Top-right corner
    createButton(i, 0, halfSize, '4');          // Left-center
    createButton(i, size, halfSize, '5');       // Right-center
    createButton(i, 0, size, '6');              // Bottom-left corner
    createButton(i, halfSize, size, '7');       // Bottom-center
    createButton(i, size, size, '8');              // Bottom-left corner

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
  function removePile(playerId) {
    const container = document.getElementById(playerId);
    if (container.lastChild) {
      container.removeChild(container.lastChild);
    }
  }
  
  function waitPlayer() {
    return new Promise(resolve => {
      resolvePlayerAction = resolve; 
    });
  }
  
function selectTile(event) {

    const button = event.target;
    console.log(this.id)
    // Evita modificar o mesmo botão mais de uma vez
    if (!button.classList.contains('selected') && placing_pieces && !choose_piece) {
        console.log("trevor")
        const id = button.id.split('').map(Number);
        if(is_player_red && (game_list[id[0]-1][id[1]-1] == 'empty')){
            button.style.backgroundImage = 'url("red_checker.png")'; // Altera para a imagem do checker
            button.classList.add('selected'); // Marca o botão como selecionado para evitar cliques duplicados
            const id = button.id.split('').map(Number);
            game_list[id[0]-1][id[1]-1] = 'red'
            is_player_red = false
            removePile("red-pieces");  
            button.classList.remove('selected');
            selection_success = true
        }
        else if (game_list[id[0]-1][id[1]-1] == 'empty'){
            button.style.backgroundImage = 'url("black_checker.png")'; // Altera para a imagem do checker
            button.classList.add('selected'); // Marca o botão como selecionado para evitar cliques duplicados
            const id = button.id.split('').map(Number);
            game_list[id[0]-1][id[1]-1] = 'black'
            is_player_red = true;
            removePile("black-pieces");
            button.classList.remove('selected');
            selection_success = true
        }
        else{
            selection_success = false
        }
    }
    else if(move_phase && !choose_piece){ //para a fase de mover as pecinhas
        console.log("michael")
        const id = button.id.split('').map(Number);
        if(no_selected_button && ((game_list[id[0]-1][id[1]-1] == 'empty') || game_list[id[0]-1][id[1]-1] == 'black' && is_player_red || game_list[id[0]-1][id[1]-1] == 'red' && !is_player_red )){
            console.log(game_list[id[0]-1][id[1]-1])
            console.log("BBBBBBB")
            addGlowEffect("red");
                setTimeout(() => {
                    removeGlowEffect();
                    }, 1000);
        }
        else if(no_selected_button){ //se chegou aqui eh porque o botao clicado era valido
            console.log("Franklin")
            if(red_pieces_free_movement && is_player_red && !choose_piece){
                no_selected_button = false
                button.classList.add('original_selected'); // Marca o botão como selecionado para evitar cliques duplicados
                button.classList.add('glow_green');
                valid_moves_list = validMovesFreeMovement();
            }
            if(black_pieces_free_movement && !is_player_red && !choose_piece){
                no_selected_button = false
                button.classList.add('original_selected'); // Marca o botão como selecionado para evitar cliques duplicados
                button.classList.add('glow_green');
                valid_moves_list = validMovesFreeMovement();
            }
            else{
                valid_moves_list = validMoves(button);
                if(valid_moves_list.length == 0){
                    console.log("AAAAAAA")
                    addGlowEffect("red");
                    setTimeout(() => {
                        removeGlowEffect();
                        }, 1000);
                }
                else{
                    no_selected_button = false
                    button.classList.add('original_selected'); // Marca o botão como selecionado para evitar cliques duplicados
                    button.classList.add('glow_green');
                    valid_moves_list = validMoves(button);
                }
            }
        }
        else if(!no_selected_button){
            console.log("les not go")
            if(buttonIsValidMove(button)){
                const pbutton = document.querySelector('.original_selected')
                const pid= pbutton.id.split('').map(Number);
                const id= button.id.split('').map(Number);
                console.log(game_list[pid[0]-1][pid[1]-1])
                game_list[pid[0]-1][pid[1]-1] = 'empty'
                console.log(game_list[pid[0]-1][pid[1]-1])
                pbutton.classList.remove('glow_green')
                pbutton.classList.remove('original_selected')
                pbutton.style.backgroundImage = 'none'
                if(is_player_red){
                    game_list[id[0]-1][id[1]-1] = 'red'
                    button.style.backgroundImage = 'url("red_checker.png")';
                    is_player_red = false 
                    removeGlowEffect()
                    no_selected_button = true
                }
                else{
                    game_list[id[0]-1][id[1]-1] = 'black'
                    button.style.backgroundImage = 'url("black_checker.png")'; 
                    is_player_red = true
                    removeGlowEffect()
                    no_selected_button = true
                }
                checkBoard()
            }
            else{
                const pbutton = document.querySelector('.original_selected')
                pbutton.classList.remove('glow_green')
                pbutton.classList.remove('original_selected')
                no_selected_button = true
                console.log("CCCCCCC")
                addGlowEffect("red");
                setTimeout(() => {
                    removeGlowEffect();
                    }, 1000);
                valid_moves_list = []
            }
        }

    }
    else if(choose_piece){
       console.log("amanda")
       const id= button.id.split('').map(Number);
       if(button.classList.contains('removable')){
            removeGlowEffect()
            game_list[id[0]-1][id[1]-1] = 'empty'
            button.style.backgroundImage = 'none'
            removedpieces++
            const buttons = document.querySelectorAll('.button');
            buttons.forEach(sla => {
                sla.classList.remove('removable');
            
            });
            checkBoard()
            if(number_of_black_pieces == 3){
                black_pieces_free_movement = true
            }
            if(number_of_red_pieces == 3){
                red_pieces_free_movement = true
            }
            if(number_of_black_pieces < 3 || number_of_red_pieces < 3){
                console.log("game over")
              }
            move_phase = true
            choose_piece = false
            selection_success = true
       }
       else{
            addGlowEffect("red");
                setTimeout(() => {
                    removeGlowEffect();
                    }, 1000);
            selection_success = false
       }
    }
    if (resolvePlayerAction) {
      resolvePlayerAction();
      resolvePlayerAction = null;
    }
}
function buttonIsValidMove(button){
    if(valid_moves_list.length == 0){
        return false;
    }
    else{
        for(let i = 0; i <valid_moves_list.length;i++){
            if(button.id == valid_moves_list[i]){
            return true;
        }
    }
    return false;
}
}
function validMovesFreeMovement(){
    var valid_moves_list = []
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
        const id= button.id.split('').map(Number);
        if(game_list[id[0]-1][id[1]-1] == 'empty'){
            button.classList.add('glow_green');
            valid_moves_list.push(button.id)
        }
      });
      return valid_moves_list
}
function validMoves(button){
    var valid_moves_list = []
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(otherbutton => {
        if(isValidMove(button,otherbutton)){
            otherbutton.classList.add('glow_green');
            valid_moves_list.push(otherbutton.id)
        }
      });
      return valid_moves_list
}
function isValidMove(button, otherbutton){
    const id= button.id.split('').map(Number);
    const idOB = otherbutton.id.split('').map(Number);
    if(game_list[idOB[0]-1][idOB[1]-1] == 'empty' && isneighbor(id,idOB))//checa se a casa esta vazia
    { 
        return true
    }
}
function checkBoard(){ // bastante feio, alias bem feio, ta uma vergonha, nao to afim de arrumar agora talvez de para separar mais por funcoes
    for(let i = 0; i< n ;i++){
        //check for red horizontally
        if((game_list[i][0] == 'red' && !document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockHR"))) 
            && (game_list[i][1] == 'red' && !document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockHR"))) 
            && (game_list[i][2] == 'red' && !document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_horizontal")&& !document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("1"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("1"))?.classList.add((i+1).toString().concat("1_LockHR"))
                document.getElementById((i+1).toString().concat("2"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("2"))?.classList.add((i+1).toString().concat("2_LockHR"))
                document.getElementById((i+1).toString().concat("3"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("3"))?.classList.add((i+1).toString().concat("3_LockHR"))
                removePiece("black")
                console.log("entrou aq")
        }
        if((game_list[i][0] != 'red' && document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockHR"))) 
            || (game_list[i][1] != 'red' && document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockHR"))) 
            || (game_list[i][2] != 'red' && document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockHR")))){ //modificar true por indicador de mill
                console.log(document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockHR")))
                console.log("filha da puta")
                document.getElementById((i+1).toString().concat("1"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("1"))?.classList.remove((i+1).toString().concat("1_LockHR"))
                document.getElementById((i+1).toString().concat("2"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("2"))?.classList.remove((i+1).toString().concat("2_LockHR"))
                document.getElementById((i+1).toString().concat("3"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("3"))?.classList.remove((i+1).toString().concat("3_LockHR"))
                
        }
        if((game_list[i][5] == 'red' && !document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockHR"))) 
            && (game_list[i][6] == 'red' && !document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockHR"))) 
            && (game_list[i][7] == 'red' && !document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("6"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("6"))?.classList.add((i+1).toString().concat("6_LockHR"))
                document.getElementById((i+1).toString().concat("7"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("7"))?.classList.add((i+1).toString().concat("7_LockHR"))
                document.getElementById((i+1).toString().concat("8"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("8"))?.classList.add((i+1).toString().concat("8_LockHR"))
               removePiece("black")
        }
        if((game_list[i][5] != 'red' && document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockHR"))) 
            || (game_list[i][6] != 'red' && document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockHR"))) 
            || (game_list[i][7] != 'red' && document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("6"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("6"))?.classList.remove((i+1).toString().concat("6_LockHR"))
                document.getElementById((i+1).toString().concat("7"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("7"))?.classList.remove((i+1).toString().concat("7_LockHR"))
                document.getElementById((i+1).toString().concat("8"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("8"))?.classList.remove((i+1).toString().concat("8_LockHR"))
               
        }
        if(i + 2 < n){
            if((game_list[i][4] == 'red' && !document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockHR"))) 
            && (game_list[i+1][4] == 'red' && !document.getElementById((i+2).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+2).toString().concat("5"))?.classList.contains((i+2).toString().concat("5_LockHR"))) 
            && (game_list[i+2][4] == 'red' && !document.getElementById((i+3).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+3).toString().concat("5"))?.classList.contains((i+3).toString().concat("5_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("5"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("5"))?.classList.add((i+1).toString().concat("5_LockHR"))
                document.getElementById((i+2).toString().concat("5"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("5"))?.classList.add((i+2).toString().concat("5_LockHR"))
                document.getElementById((i+3).toString().concat("5"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("5"))?.classList.add((i+3).toString().concat("5_LockHR"))
                removePiece("black")
            }
            if((game_list[i][4] != 'red' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockHR"))) 
            || (game_list[i+1][4] != 'red' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+2).toString().concat("5"))?.classList.contains((i+2).toString().concat("5_LockHR"))) 
            || (game_list[i+2][4] != 'red' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+3).toString().concat("5"))?.classList.contains((i+3).toString().concat("5_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("5"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("5"))?.classList.remove((i+1).toString().concat("5_LockHR"))
                document.getElementById((i+2).toString().concat("5"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("5"))?.classList.remove((i+2).toString().concat("5_LockHR"))
                document.getElementById((i+3).toString().concat("5"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("5"))?.classList.remove((i+3).toString().concat("5_LockHR"))
                
            }
            if((game_list[i][3] == 'red' && !document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockHR"))) 
            && (game_list[i+1][3] == 'red' && !document.getElementById((i+2).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+2).toString().concat("4"))?.classList.contains((i+2).toString().concat("4_LockHR"))) 
            && (game_list[i+2][3] == 'red' && !document.getElementById((i+3).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+3).toString().concat("4"))?.classList.contains((i+3).toString().concat("4_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("4"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("4"))?.classList.add((i+1).toString().concat("4_LockHR"))
                document.getElementById((i+2).toString().concat("4"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("4"))?.classList.add((i+2).toString().concat("4_LockHR"))
                document.getElementById((i+3).toString().concat("4"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("4"))?.classList.add((i+3).toString().concat("4_LockHR"))
                removePiece("black")
            }
            if((game_list[i][3] != 'red' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockHR"))) 
            || (game_list[i+1][3] != 'red' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+2).toString().concat("4"))?.classList.contains((i+2).toString().concat("4_LockHR"))) 
            || (game_list[i+2][3] != 'red' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+3).toString().concat("4"))?.classList.contains((i+3).toString().concat("4_LockHR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("4"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("4"))?.classList.remove((i+1).toString().concat("4_LockHR"))
                document.getElementById((i+2).toString().concat("4"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("4"))?.classList.remove((i+2).toString().concat("4_LockHR"))
                document.getElementById((i+3).toString().concat("4"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("4"))?.classList.remove((i+3).toString().concat("4_LockHR"))
                
            }
            
        }
        //check for black horizontally
        if((game_list[i][0] == 'black' && !document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockHB"))) 
            && (game_list[i][1] == 'black' && !document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockHB"))) 
            && (game_list[i][2] == 'black' && !document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_horizontal")&& !document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("1"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("1"))?.classList.add((i+1).toString().concat("1_LockHB"))
                document.getElementById((i+1).toString().concat("2"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("2"))?.classList.add((i+1).toString().concat("2_LockHB"))
                document.getElementById((i+1).toString().concat("3"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("3"))?.classList.add((i+1).toString().concat("3_LockHB"))
                removePiece("red")
        }
        if((game_list[i][0] != 'black' && document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockHB"))) 
            || (game_list[i][1] != 'black' && document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockHB"))) 
            || (game_list[i][2] != 'black' && document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("1"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("1"))?.classList.remove((i+1).toString().concat("1_LockHB"))
                document.getElementById((i+1).toString().concat("2"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("2"))?.classList.remove((i+1).toString().concat("2_LockHB"))
                document.getElementById((i+1).toString().concat("3"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("3"))?.classList.remove((i+1).toString().concat("3_LockHB"))
                
        }
        if((game_list[i][5] == 'black' && !document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockHB"))) 
            && (game_list[i][6] == 'black' && !document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockHB"))) 
            && (game_list[i][7] == 'black' && !document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("6"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("6"))?.classList.add((i+1).toString().concat("6_LockHB"))
                document.getElementById((i+1).toString().concat("7"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("7"))?.classList.add((i+1).toString().concat("7_LockHB"))
                document.getElementById((i+1).toString().concat("8"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("8"))?.classList.add((i+1).toString().concat("8_LockHB"))
                removePiece("red")
        }
        if((game_list[i][5] != 'black' && document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockHB"))) 
            || (game_list[i][6] != 'black' && document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockHB"))) 
            || (game_list[i][7] != 'black' && document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("6"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("6"))?.classList.remove((i+1).toString().concat("6_LockHB"))
                document.getElementById((i+1).toString().concat("7"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("7"))?.classList.remove((i+1).toString().concat("7_LockHB"))
                document.getElementById((i+1).toString().concat("8"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("8"))?.classList.remove((i+1).toString().concat("8_LockHB"))
               
        }
        if(i + 2 < n){
            if((game_list[i][4] == 'black' && !document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockHB"))) 
            && (game_list[i+1][4] == 'black' && !document.getElementById((i+2).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+2).toString().concat("5"))?.classList.contains((i+2).toString().concat("5_LockHB"))) 
            && (game_list[i+2][4] == 'black' && !document.getElementById((i+3).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+3).toString().concat("5"))?.classList.contains((i+3).toString().concat("5_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("5"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("5"))?.classList.add((i+1).toString().concat("5_LockHB"))
                document.getElementById((i+2).toString().concat("5"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("5"))?.classList.add((i+2).toString().concat("5_LockHB"))
                document.getElementById((i+3).toString().concat("5"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("5"))?.classList.add((i+3).toString().concat("5_LockHB"))
                removePiece("red")
            }
            if((game_list[i][4] != 'black' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockHB"))) 
            || (game_list[i+1][4] != 'black' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+2).toString().concat("5"))?.classList.contains((i+2).toString().concat("5_LockHB"))) 
            || (game_list[i+2][4] != 'black' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+3).toString().concat("5"))?.classList.contains((i+3).toString().concat("5_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("5"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("5"))?.classList.remove((i+1).toString().concat("5_LockHB"))
                document.getElementById((i+2).toString().concat("5"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("5"))?.classList.remove((i+2).toString().concat("5_LockHB"))
                document.getElementById((i+3).toString().concat("5"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("5"))?.classList.remove((i+3).toString().concat("5_LockHB"))
                
            }
            if((game_list[i][3] == 'black' && !document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockHB"))) 
            && (game_list[i+1][3] == 'black' && !document.getElementById((i+2).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+2).toString().concat("4"))?.classList.contains((i+2).toString().concat("4_LockHB"))) 
            && (game_list[i+2][3] == 'black' && !document.getElementById((i+3).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && !document.getElementById((i+3).toString().concat("4"))?.classList.contains((i+3).toString().concat("4_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("4"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("4"))?.classList.add((i+1).toString().concat("4_LockHB"))
                document.getElementById((i+2).toString().concat("4"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("4"))?.classList.add((i+2).toString().concat("4_LockHB"))
                document.getElementById((i+3).toString().concat("4"))?.classList.add("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("4"))?.classList.add((i+3).toString().concat("4_LockHB"))
                removePiece("red")
            }
            if((game_list[i][3] != 'black' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockHB"))) 
            || (game_list[i+1][3] != 'black' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+2).toString().concat("4"))?.classList.contains((i+2).toString().concat("4_LockHB"))) 
            || (game_list[i+2][3] != 'black' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_horizontal") && document.getElementById((i+3).toString().concat("4"))?.classList.contains((i+3).toString().concat("4_LockHB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("4"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+1).toString().concat("4"))?.classList.remove((i+1).toString().concat("4_LockHB"))
                document.getElementById((i+2).toString().concat("4"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+2).toString().concat("4"))?.classList.remove((i+2).toString().concat("4_LockHB"))
                document.getElementById((i+3).toString().concat("4"))?.classList.remove("is_in_mill_horizontal")
                document.getElementById((i+3).toString().concat("4"))?.classList.remove((i+3).toString().concat("4_LockHB"))
                
            }
            
        }
        //check for red vertically
        if((game_list[i][0] == 'red' && !document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockVR"))) 
            && (game_list[i][3] == 'red' && !document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockVR"))) 
            && (game_list[i][5] == 'red' && !document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("1"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("1"))?.classList.add((i+1).toString().concat("1_LockVR"))
                document.getElementById((i+1).toString().concat("4"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("4"))?.classList.add((i+1).toString().concat("4_LockVR"))
                document.getElementById((i+1).toString().concat("6"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("6"))?.classList.add((i+1).toString().concat("6_LockVR"))
                removePiece("black")
        }
        if((game_list[i][0] != 'red' && document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockVR"))) 
            || (game_list[i][3] != 'red' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockVR"))) 
            || (game_list[i][5] != 'red' && document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("1"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("1"))?.classList.remove((i+1).toString().concat("1_LockVR"))
                document.getElementById((i+1).toString().concat("4"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("4"))?.classList.remove((i+1).toString().concat("4_LockVR"))
                document.getElementById((i+1).toString().concat("6"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("6"))?.classList.remove((i+1).toString().concat("6_LockVR"))
                
        }
        if((game_list[i][2] == 'red' && !document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockVR"))) 
            && (game_list[i][4] == 'red' && !document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_vertical")  && !document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockVR"))) 
            && (game_list[i][7] == 'red' && !document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_vertical")  && !document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("3"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("3"))?.classList.add((i+1).toString().concat("3_LockVR"))
                document.getElementById((i+1).toString().concat("5"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("5"))?.classList.add((i+1).toString().concat("5_LockVR"))
                document.getElementById((i+1).toString().concat("8"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("8"))?.classList.add((i+1).toString().concat("8_LockVR"))
                removePiece("black")
        }
        if((game_list[i][2] != 'red' && document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockVR"))) 
            || (game_list[i][4] != 'red' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockVR"))) 
            || (game_list[i][7] != 'red' && document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("3"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("3"))?.classList.remove((i+1).toString().concat("3_LockVR"))
                document.getElementById((i+1).toString().concat("5"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("5"))?.classList.remove((i+1).toString().concat("5_LockVR"))
                document.getElementById((i+1).toString().concat("8"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("8"))?.classList.remove((i+1).toString().concat("8_LockVR"))
  
        }
        if(i + 2 < n){
            if((game_list[i][1] == 'red' && !document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockVR"))) 
            && (game_list[i+1][1] == 'red' && !document.getElementById((i+2).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+2).toString().concat("2"))?.classList.contains((i+2).toString().concat("2_LockVR"))) 
            && (game_list[i+2][1] == 'red' && !document.getElementById((i+3).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+3).toString().concat("2"))?.classList.contains((i+3).toString().concat("2_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("2"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("2"))?.classList.add((i+1).toString().concat("2_LockVR"))
                document.getElementById((i+2).toString().concat("2"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("2"))?.classList.add((i+2).toString().concat("2_LockVR"))
                document.getElementById((i+3).toString().concat("2"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("2"))?.classList.add((i+3).toString().concat("2_LockVR"))
                removePiece("black")
            }
            if((game_list[i][1] != 'red' && document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockVR"))) 
            || (game_list[i+1][1] != 'red' && document.getElementById((i+2).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+2).toString().concat("2"))?.classList.contains((i+2).toString().concat("2_LockVR"))) 
            || (game_list[i+2][1] != 'red' && document.getElementById((i+3).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+3).toString().concat("2"))?.classList.contains((i+3).toString().concat("2_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("2"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("2"))?.classList.remove((i+1).toString().concat("2_LockVR"))
                document.getElementById((i+2).toString().concat("2"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("2"))?.classList.remove((i+2).toString().concat("2_LockVR"))
                document.getElementById((i+3).toString().concat("2"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("2"))?.classList.remove((i+3).toString().concat("2_LockVR"))
              
            }
            if((game_list[i][6] == 'red' && !document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockVR"))) 
            && (game_list[i+1][6] == 'red' && !document.getElementById((i+2).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+2).toString().concat("7"))?.classList.contains((i+2).toString().concat("7_LockVR"))) 
            && (game_list[i+2][6] == 'red' && !document.getElementById((i+3).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+3).toString().concat("7"))?.classList.contains((i+3).toString().concat("7_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("7"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("7"))?.classList.add((i+1).toString().concat("7_LockVR"))
                document.getElementById((i+2).toString().concat("7"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("7"))?.classList.add((i+2).toString().concat("7_LockVR"))
                document.getElementById((i+3).toString().concat("7"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("7"))?.classList.add((i+3).toString().concat("7_LockVR"))
                removePiece("black")
            }
            if((game_list[i][6] != 'red' && document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockVR"))) 
            || (game_list[i+1][6] != 'red' && document.getElementById((i+2).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+2).toString().concat("7"))?.classList.contains((i+2).toString().concat("7_LockVR"))) 
            || (game_list[i+2][6] != 'red' && document.getElementById((i+3).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+3).toString().concat("7"))?.classList.contains((i+3).toString().concat("7_LockVR")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("7"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("7"))?.classList.remove((i+1).toString().concat("7_LockVR"))
                document.getElementById((i+2).toString().concat("7"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("7"))?.classList.remove((i+2).toString().concat("7_LockVR"))
                document.getElementById((i+3).toString().concat("7"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("7"))?.classList.remove((i+3).toString().concat("7_LockVR"))
              
            }
        }
        //check for black vertically
        if((game_list[i][0] == 'black' && !document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockVB"))) 
            && (game_list[i][3] == 'black' && !document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockVB"))) 
            && (game_list[i][5] == 'black' && !document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockVB")))){ //modificar true por indicador de mill
                console.log("bang bang entrou aq")
                document.getElementById((i+1).toString().concat("1"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("1"))?.classList.add((i+1).toString().concat("1_LockVB"))
                document.getElementById((i+1).toString().concat("4"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("4"))?.classList.add((i+1).toString().concat("4_LockVB"))
                document.getElementById((i+1).toString().concat("6"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("6"))?.classList.add((i+1).toString().concat("6_LockVB"))
                removePiece("red")
        }
        if((game_list[i][0] != 'black' && document.getElementById((i+1).toString().concat("1"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("1"))?.classList.contains((i+1).toString().concat("1_LockVB"))) 
            || (game_list[i][3] != 'black' && document.getElementById((i+1).toString().concat("4"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("4"))?.classList.contains((i+1).toString().concat("4_LockVB"))) 
            || (game_list[i][5] != 'black' && document.getElementById((i+1).toString().concat("6"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("6"))?.classList.contains((i+1).toString().concat("6_LockVB")))){ //modificar true por indicador de mill
                console.log("bang entrou aq")
                document.getElementById((i+1).toString().concat("1"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("1"))?.classList.remove((i+1).toString().concat("1_LockVB"))
                document.getElementById((i+1).toString().concat("4"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("4"))?.classList.remove((i+1).toString().concat("4_LockVB"))
                document.getElementById((i+1).toString().concat("6"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("6"))?.classList.remove((i+1).toString().concat("6_LockVB"))
                
        }
        if((game_list[i][2] == 'black' && !document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockVB"))) 
            && (game_list[i][4] == 'black' && !document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_vertical")  && !document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockVB"))) 
            && (game_list[i][7] == 'black' && !document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_vertical")  && !document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockVB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("3"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("3"))?.classList.add((i+1).toString().concat("3_LockVB"))
                document.getElementById((i+1).toString().concat("5"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("5"))?.classList.add((i+1).toString().concat("5_LockVB"))
                document.getElementById((i+1).toString().concat("8"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("8"))?.classList.add((i+1).toString().concat("8_LockVB"))
                removePiece("red")
        }
        if((game_list[i][2] != 'black' && document.getElementById((i+1).toString().concat("3"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("3"))?.classList.contains((i+1).toString().concat("3_LockVB"))) 
            || (game_list[i][4] != 'black' && document.getElementById((i+1).toString().concat("5"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("5"))?.classList.contains((i+1).toString().concat("5_LockVB"))) 
            || (game_list[i][7] != 'black' && document.getElementById((i+1).toString().concat("8"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("8"))?.classList.contains((i+1).toString().concat("8_LockVB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("3"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("3"))?.classList.remove((i+1).toString().concat("3_LockVB"))
                document.getElementById((i+1).toString().concat("5"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("5"))?.classList.remove((i+1).toString().concat("5_LockVB"))
                document.getElementById((i+1).toString().concat("8"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("8"))?.classList.remove((i+1).toString().concat("8_LockVB"))
  
        }
        if(i + 2 < n){
            if((game_list[i][1] == 'black' && !document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockVB"))) 
            && (game_list[i+1][1] == 'black' && !document.getElementById((i+2).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+2).toString().concat("2"))?.classList.contains((i+2).toString().concat("2_LockVB"))) 
            && (game_list[i+2][1] == 'black' && !document.getElementById((i+3).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+3).toString().concat("2"))?.classList.contains((i+3).toString().concat("2_LockVB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("2"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("2"))?.classList.add((i+1).toString().concat("2_LockVB"))
                document.getElementById((i+2).toString().concat("2"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("2"))?.classList.add((i+2).toString().concat("2_LockVB"))
                document.getElementById((i+3).toString().concat("2"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("2"))?.classList.add((i+3).toString().concat("2_LockVB"))
                removePiece("red")
            }
            if((game_list[i][1] != 'black' && document.getElementById((i+1).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("2"))?.classList.contains((i+1).toString().concat("2_LockVB"))) 
            || (game_list[i+1][1] != 'black' && document.getElementById((i+2).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+2).toString().concat("2"))?.classList.contains((i+2).toString().concat("2_LockVB"))) 
            || (game_list[i+2][1] != 'black' && document.getElementById((i+3).toString().concat("2"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+3).toString().concat("2"))?.classList.contains((i+3).toString().concat("2_LockVB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("2"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("2"))?.classList.remove((i+1).toString().concat("2_LockVB"))
                document.getElementById((i+2).toString().concat("2"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("2"))?.classList.remove((i+2).toString().concat("2_LockVB"))
                document.getElementById((i+3).toString().concat("2"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("2"))?.classList.remove((i+3).toString().concat("2_LockVB"))
              
            }
            if((game_list[i][6] == 'black' && !document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockVB"))) 
            && (game_list[i+1][6] == 'black' && !document.getElementById((i+2).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+2).toString().concat("7"))?.classList.contains((i+2).toString().concat("7_LockVB"))) 
            && (game_list[i+2][6] == 'black' && !document.getElementById((i+3).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && !document.getElementById((i+3).toString().concat("7"))?.classList.contains((i+3).toString().concat("7_LockVB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("7"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("7"))?.classList.add((i+1).toString().concat("7_LockVB"))
                document.getElementById((i+2).toString().concat("7"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("7"))?.classList.add((i+2).toString().concat("7_LockVB"))
                document.getElementById((i+3).toString().concat("7"))?.classList.add("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("7"))?.classList.add((i+3).toString().concat("7_LockVB"))
                removePiece("red")
            }
            if((game_list[i][6] != 'black' && document.getElementById((i+1).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+1).toString().concat("7"))?.classList.contains((i+1).toString().concat("7_LockVB"))) 
            || (game_list[i+1][6] != 'black' && document.getElementById((i+2).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+2).toString().concat("7"))?.classList.contains((i+2).toString().concat("7_LockVB"))) 
            || (game_list[i+2][6] != 'black' && document.getElementById((i+3).toString().concat("7"))?.classList.contains("is_in_mill_vertical") && document.getElementById((i+3).toString().concat("7"))?.classList.contains((i+3).toString().concat("7_LockVB")))){ //modificar true por indicador de mill
                document.getElementById((i+1).toString().concat("7"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+1).toString().concat("7"))?.classList.remove((i+1).toString().concat("7_LockVB"))
                document.getElementById((i+2).toString().concat("7"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+2).toString().concat("7"))?.classList.remove((i+2).toString().concat("7_LockVB"))
                document.getElementById((i+3).toString().concat("7"))?.classList.remove("is_in_mill_vertical")
                document.getElementById((i+3).toString().concat("7"))?.classList.remove((i+3).toString().concat("7_LockVB"))
              
            }
        }
    }
}
function removePiece(color){
    if(color == "black"){
        console.log("mill_black")
        choose_piece = true
        if(placing_pieces){
            removeGlowEffect()
        }
        const buttons = document.querySelectorAll('.button'); 
            buttons.forEach(button => {
                const id= button.id.split('').map(Number);
                if(game_list[id[0]-1][id[1]-1] == 'black' && !(button.classList.contains("is_in_mill_horizontal") || button.classList.contains("is_in_mill_vertical" || !black_pieces_free_movement))){
                    button.classList.add('removable');
                }
            });
        number_of_black_pieces--
    }
    else if(color == "red"){
        console.log("mill_red")
        move_phase = false
        choose_piece = true
        if(placing_pieces){
            removeGlowEffect()
        }
        const buttons = document.querySelectorAll('.button'); 
            buttons.forEach(button => {
                const id= button.id.split('').map(Number);
                if(game_list[id[0]-1][id[1]-1] == 'red' && !(button.classList.contains("is_in_mill_horizontal") || button.classList.contains("is_in_mill_vertical" || !red_pieces_free_movement))){
                    button.classList.add('removable');
                }
            });
        number_of_red_pieces--
    }
    
}
function isneighbor(id, idOB){
    //checando para baixo
    if(((id[0] == idOB[0]) && 
    ((id[1] == 1 && idOB[1] == 4) || (id[1] == 3 && idOB[1] == 5) || (id[1] == 4 && idOB[1] == 6) || (id[1] == 5 && idOB[1] == 8))
    ) || (id[0] == idOB[0]-1 && id[1] == 7 && idOB[1] == 7) || (id[0]-1 == idOB[0] && id[1] == 2 && idOB[1] == 2)){
        console.log("baixo")
        return true;
    }
    //checa para cima
    if(((idOB[0] == id[0]) && 
    ((idOB[1] == 1 && id[1] == 4) || (idOB[1] == 3 && id[1] == 5) || (idOB[1] == 4 && id[1] == 6) || (idOB[1] == 5 && id[1] == 8))
    ) || (idOB[0] == id[0]-1 && idOB[1] == 7 && id[1] == 7) || (id[0] == idOB[0]-1 && id[1] == 2 && idOB[1] == 2)){
        console.log("cima")
        return true;
    }
    //checa para direita
    if(((id[0] == idOB[0]) && (id[1] + 1 == idOB[1] && (id[1] != 4 && idOB[1] != 4) && (id[1] != 5 && idOB[1] != 5))) || (id[0] == idOB[0]-1 && id[1] == 5 && idOB[1] == 5) || (id[0]-1 == idOB[0] && id[1] == 4 && idOB[1] == 4)){
        console.log("direita")
        return true
    }
    //checa para esquerda
    if(((idOB[0] == id[0]) && (idOB[1] + 1 == id[1] && (id[1] != 4 && idOB[1] != 4) && (id[1] != 5 && idOB[1] != 5))) || (idOB[0] == id[0]-1 && idOB[1] == 5 && id[1] == 5) || (idOB[0]-1 == id[0] && idOB[1] == 4 && id[1] == 4)){
        console.log("esquerda")
        return true
    }
    return false;
}


async function placePiecesHuman(n_pieces) {
    placing_pieces = true;
    for (let i = 0; i < n_pieces*2 + removedpieces; i++) {
      if(!choose_piece){
      addGlowEffect("green");
      }
      await waitPlayer(); 
      checkBoard()
      removeGlowEffect()
      if(!selection_success){
        i--
      }
    }
    placing_pieces = false
    move_phase = true
}

function addGlowEffect(color) {
    const buttons = document.querySelectorAll('.button');
    if(color == "green"){
        buttons.forEach(button => {
            if(placing_pieces){
                const id = button.id.split('').map(Number);
                if(game_list[id[0]-1][id[1]-1] == 'empty'){
                    button.classList.add('glow_green');
                }
            }
        });
    }
    if(color == "red"){
        buttons.forEach(button => {
            button.classList.add('glow_red');              
        });
    }
  }
  
function removeGlowEffect() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(button => {
      button.classList.remove('glow_green');
      button.classList.remove('glow_red');
    });
  }
  // Run the function with a specified number of squares
function run_game(){
  createSquares(n);
  const numPieces = 3 * n;
  number_of_black_pieces =  numPieces
  number_of_red_pieces = numPieces
  setupPieces("red-pieces", "red_checker.png", numPieces);
  setupPieces("black-pieces", "black_checker.png", numPieces);
  placePiecesHuman(numPieces)
}
run_game()

