/*Teste para o envio de pacotes ao servidor, async para nao ficar feio */

/*----------------------------------------------------------------------------------------
Função para registrar e logar um usuario, recebe o nickname do usuario e sua respectiva senha*/ 
async function requestRegister(nick, password){
    try{
    const response = await fetch('http://twserver.alunos.dcc.fc.up.pt:8008/register', {
        method: 'POST',
        body: JSON.stringify({nick, password})
    })
    } catch (error) {
    alert(`Network error: ${error.message}`);
    console.error('Network error:', error);
    }
    /* para testar o sucesso de envio
    if(response.ok){
        alert("Success")
    }
    else{
        alert("Error, bad request")
    }
    */
}
/*-----------------------------------------------------------------------------------------
Debugging feito*/ 

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
            alert("Success");
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
        body: JSON.stringify({group,nick, password, game})
    })
    /* para testar o sucesso de envio
    if(response.ok){
        alert("success")
    }
    else{
        alert("Error, bad request")
    }
    */
}
/*-----------------------------------------------------------------------------------------
Debugging nao feito*/

/*----------------------------------------------------------------------------------------
Função para enviar ao servidor uma jogada*/ 
async function requestNotify(nick, password, game, move){
    const response = await fetch('http://twserver.alunos.dcc.fc.up.pt:8008/notify', {
        method: 'POST',
        body: JSON.stringify({nick, password, game, move})
    })
    /* para testar o sucesso de envio
    if(response.ok){
        alert("success")
    }
    else{
        alert("Error, bad request")
    }
    */
}
/*-----------------------------------------------------------------------------------------
Debugging nao feito*/

/*----------------------------------------------------------------------------------------
Função para autualizar o tabuleiro do jogo*/ 
async function requestUpdate(nick, game){
    const response = await fetch(`http://twserver.alunos.dcc.fc.up.pt:8008/update?nick=${nick}&game=${game}`, {
        method: 'GET',
    })
    // /* para testar o sucesso de envio
    if(response.ok){
        alert("Success")
    }
    else{
        alert("Error, bad request")
    }
    // */
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
/*-----------------------------------------------------------------------------------------
Debugging feito*/


/*Quando for testar o codigo por ser async eh importante que, primeiro a função chamada
para testar seja async, depois, quando for feito um request, esperar ele ter sua promessa resolvida, que 
em termos praticos significa: colocar um await na frente do nome da função chamada*/

async function main() {
    try {
        await requestRegister("Eris!", "eriswasekainoichibankirei"); 
        const teste = await requestJoin(24, "Eris!", "eriswasekainoichibankirei", 3); 
        console.log('Response from requestJoin:', teste); 
        const teste_rankings = await requestRanking(24, 5)
        console.log(`Response from requestRankings`, teste_rankings)
    } catch (error) {
        console.error('An error occurred in main:', error.message);
    }
}
main();



