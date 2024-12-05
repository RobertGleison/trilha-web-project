/*Quando for testar o codigo por ser async eh importante que, primeiro a função chamada
para testar seja async, depois, quando for feito um request, esperar ele ter sua promessa resolvida, que 
em termos praticos significa: colocar um await na frente do nome da função chamada*/

import * as serverRequests from "./pacotes_teste.js" 

async function main() {
    try {
        await serverRequests.requestRegister("Roxy!", "mizumajutsushi"); 
        const teste = await serverRequests.requestJoin(24,"Roxy!", "mizumajutsushi", 3); 
        console.log('Response from requestJoin:', teste); 
        serverRequests.requestUpdate(teste.game, "Eris!", (data) => {
            console.log("Received data:", data);
            serverRequests.processCollectedData(data.board);
        });
    } catch (error) {
        console.error('An error occurred in main:', error.message);
    }
    try {
        await serverRequests.requestRegister("Eris!", "eriswasekainoichibankirei"); 
        const teste = await serverRequests.requestJoin(24, "Eris!", "eriswasekainoichibankirei", 3); 
        console.log('Response from requestJoin:', teste); 
        await serverRequests.requestNotify("Roxy!", "mizumajutsushi", String(teste.game), 0, 0)
        await serverRequests.requestNotify("Eris!", "eriswasekainoichibankirei", String(teste.game), 0, 1)
        const teste_rankings = await serverRequests.requestRanking(24, 5)
        console.log(`Response from requestRankings`, teste_rankings)
       
    } catch (error) {
        console.error('An error occurred in main:', error.message);
    }
   
}

function assignDataToBoard(data){

}
main();