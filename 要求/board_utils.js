export class BoardUtils{
    /* Converte o formato do board dado pelo servidor para o formato 
       do board usado na logica do jogo no board*/
    convertBoardFormat(serverboard){
        const newboard = serverboard
        for(let i = 0;i < serverboard.length; i++){
            newboard[i][3] = serverboard[i][7]
            newboard[i][4] = serverboard[i][3]
            newboard[i][5] = serverboard[i][6]
            newboard[i][6] = serverboard[i][5]
            newboard[i][7] = serverboard[i][4]
        }
        return newboard
    }
    /* Atualiza o board de acordo com a resposta do servidor*/
    redrawBoard(nserverboard){
        const buttons = document.querySelectorAll('.button');
        buttons.forEach(button => {
            const id= button.id.split('').map(Number);
            if(nserverboard[id[0]-1][id[1]-1] == `empty`){
                button.style.backgroundImage = 'none'
            }
            else if(nserverboard[id[0]-1][id[1]-1] == `blue`){
                /**button.style.backgroundImage = 
                * @param {caminho para a peça preta}
                */
            }
            else if(nserverboard[id[0]-1][id[1]-1] == `red`){
                /**button.style.backgroundImage = 
                * @param {caminho para a peça vermeleha}
                */
            }
        });
    }
}