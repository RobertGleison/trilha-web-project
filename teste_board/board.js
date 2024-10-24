const NEIGHBOR_TABLE = [[B10,B11],[B10,B40],[B11,B21],
[B11,B12],[B12,B45],[B20,B41],[B20,B21],[B21,B31]
[B21,B22],[B22,B44],[B30,B42],[B30,B31],[B31,B32]
[B32,B43], [B40,B70],[B40,B41],[B41,B60],[B41,B42],
[B42,B50],[B43,B52],[B44,B62],[B44,B45],[B50,B51],
[B51,B52], [B51,B61],[B60,B61],[B61,B62],[B61,B71],
[B70,B71], [B71,B72]]

const MILL_TABLE = [[B10,B11,B12],[B10,B40,B70],[B11,B21,B31],
[B12,B45,B72],[B20,B21,B22],[B20,B41,B60],[B22,B44,B62],
[B30,B31,B32],[B30,B42,B50],[B32,B43,B52],[B40,B41,B42],
[B43,B44,B45],[B50,B51,B52], [B51,B61,B71],[B60,B61,B62]
[B70,B71,B72]]

window.onload = function() {
    setBoard();
}

function setBoard(){ 
    for (let x = 1; x < 8; x++){
        if(x == 4){
            for (let y = 0; y < 7; y++){
                let tile = document.createElement("div");
                tile.id = "b".concat(x.toString().concat(y.toString()));
                tile.addEventListener("click", selectTile);
                board.appendChild(tile);
            }
            continue;
        }
        for (let y = 0; y < 3; y++){
            let tile = document.createElement("div");
            tile.id = "b".concat(x.toString().concat(y.toString()));
            tile.addEventListener("click", selectTile);
            board.appendChild(tile);
        }
    }
}

function selectTile() {
    console.log(this.id)
}
