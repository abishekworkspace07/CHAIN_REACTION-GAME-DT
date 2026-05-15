const grid = document.getElementById("grid");

var rows=12;
var cols=6


var gridMatrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
        own: null,
        val: 0,
        cap: 4
    }))
);

for (let i = 0; i < gridMatrix.length; i++) {
    for (let j = 0; j < gridMatrix[i].length; j++) {
        if(i==0 || i==rows-1 || j==0 || j==cols-1){
            gridMatrix[i][j].cap = 3;
        }
        if((i==0 || i==rows-1) && (j==0 || j==cols-1)){
            gridMatrix[i][j].cap = 2;
        }

    }
}

for (let i = 0; i < gridMatrix.length; i++) {
    const rowdiv = document.createElement("div")
    rowdiv.className = "line"
    for (let j = 0; j < gridMatrix[i].length; j++) {
        const button = document.createElement("div");
        button.className = "cell";
        button.id = `${i}_${j}`
        const id = button.id

        const img = document.createElement("img")
        //img.alt = '0'
        img.src = ''
        button.appendChild(img)
        //button.textContent = `0`;
        button.onclick = {}
        
        //button.style.backgroundColor = "grey"
        //button.style.borderColor = "black"

        rowdiv.appendChild(button);
    }
    grid.appendChild(rowdiv)
}

var move = 0;
var player = 0;
const color = {
    0:"red",
    1:"blue",
    2:"green",
    3:"yellow"
}
const resetplayers = () => ({spots:0,pts:0})
const players = {
    0:resetplayers(),
    1:resetplayers()//,
    //2:null,
    //3:null
}
//MAKE THIS INTO OBJECT OF OBJECTS
const spots = {
    0:0,
    1:0
}
const pts = {
    0:0,
    1:0
}


const reset = document.getElementById("reset")
reset.addEventListener('click',() => {resetgame();reset.style.display = "none"})
const strtbtn = document.getElementById("gamestart")
strtbtn.addEventListener('click', () => {gamestart();strtbtn.disabled = true} )

document.getElementById("result").textContent = 'PRESS START GAME TO START'


function formatTime(seconds) {

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

var time = 30;
let timeplayer = null;
function playertime(player){
    document.getElementById("result").textContent = `${color[player].toUpperCase()} PLAY`
    if(timeplayer!==null){clearInterval(timeplayer)}
    var pltime = 15;
    const plrtime = document.getElementById(`time_${player}`)
    plrtime.textContent = `${formatTime(pltime)}`
    timeplayer = setInterval(() => {

        pltime--

        if(pltime<=0){
            plrtime.textContent="TIMEOUT"
            plrtime.classList.add("text-danger")
            clearInterval(timeplayer)
            finishgame(1,player)
            return;
        }
        plrtime.textContent = `${formatTime(pltime)}`
    },1000)
}
let count = null;
function gamestart(){ //HAVE TO RESET
    resetgame()
    count = null;
    move=0
    player=0
    time = 120
    
    const gametime = document.getElementById("gametime");
    gametime.textContent = `${formatTime(time)}`
    if(count === null){
        count = setInterval(() => {
            time--;
            if(time<=0){
                clearInterval(count)
                gametime.textContent="0:00"
                finishgame(0)
            }
            gametime.textContent = `${formatTime(time)}`  
        },1000)
        console.log("START")

        playertime(player)
    }
}

function resetgame(){
    
    for (let i = 0; i < rows; i++) {
        for(let j = 0; j < cols; j++){
            gridMatrix[i][j].own = null
            gridMatrix[i][j].val=0

            const btn = document.getElementById(`${i}_${j}`)
            btn.onclick = () => place(`${i}_${j}`)
            btn.querySelector("img").src = ''

        }
    }

    document.getElementById("result").textContent = 'PRESS START GAME TO START'
    document.getElementById("gamestart").disabled = false;
    for(let p in players){
        players[p] = resetplayers();
        console.log(`outside ${p},${players[player].pts}`)

        plrtime = document.getElementById(`time_${p}`)
        plrpts = document.getElementById(`pts_${p}`)
        plrtime.textContent = "-:--"
        plrpts.textContent = "0"
    }
    document.getElementById("gametime").textContent = "-:--"


}




function place(id){
    const button = document.getElementById(id)
        
    const [r,c] = id.split("_").map(Number)
    var cell = gridMatrix[r][c]

    if(move<2){
        
        if(cell.own === null){
            if(timeplayer!==null){clearInterval(timeplayer);timeplayer=null}
            //button.style.backgroundColor = color[player]
            cell.own = player
            cell.val = cell.cap-1
            //console.log(players[player].pts,players[player].spots)
            players[player].spots=cell.val
            players[player].pts+=cell.val
            const image = button.querySelector(`img`)
            image.src = `./resources/${color[player]}${cell.val}.png`
            //button.textContent = `${cell.val}`
            
            updatePoints(player)
            if(checkavail()){
                player = (player+1)%2
                move++
                playertime(player);
            }
        }

    }
    else{
        if(cell.own === player){
            if(timeplayer!==null){clearInterval(timeplayer);timeplayer=null}
            cell.val++
            if(cell.val <cell.cap){
                //button.textContent = `${cell.val}`
                players[player].spots++
                players[player].pts++
                const image = button.querySelector(`img`)
                image.src = `./resources/${color[player]}${cell.val}.png`
            }
            else{
                explode(r,c)
                players[player].spots++
            }
            updatePoints(player)
            if(checkavail()){
                player = (player+1)%2
                move++
                playertime(player);
            }
        }
    
    }
}

function explode(r,c){
    //make r,c cell nulled
    var cell = gridMatrix[r][c]
    cell.own=null
    cell.val=0

    const btn=document.getElementById(`${r}_${c}`)
    const img = btn.querySelector("img")
    img.src = ''
    players[player].pts+=(1+cell.cap)

    //make changes to adjacents
    const adj = [[-1, 0],[1, 0],[0, -1],[0, 1]];

    for (const [i, j] of adj) {

        const r1 = r + i;
        const c1 = c + j;

        if (r1 >= 0 &&r1 < rows &&c1 >= 0 &&c1 < cols) {
            var cell = gridMatrix[r1][c1] 
            if(cell.own!==null){players[cell.own].spots-=cell.val}
            players[player].spots+=cell.val
            cell.own=player 
            cell.val++
            if(cell.val<cell.cap){
                const btn=document.getElementById(`${r1}_${c1}`) 
                const img1 = btn.querySelector("img")
                img1.src = `./resources/${color[player]}${cell.val}.png`
            }
            else{
                explode(r1,c1)
            }
        }
    }
    
}

function checkavail(){
    if(move >= 2){
        for(const i in spots){
        
            if(players[i].spots===0){
                finishgame(2,i)
                return false
            }
        }
    }
    return true
}

function updatePoints(player){
    pt=document.getElementById(`pts_${player}`)
    console.log(`inside ${player},${players[player].pts}`)
    pt.textContent =  players[player].pts
}

function finishgame(code,player=null){
    if(count){clearInterval(count)}
    clearInterval(timeplayer)
    document.getElementById("reset").style.display = "inline-block"
    for (let i = 0; i < gridMatrix.length; i++) {
        for (let j = 0; j < gridMatrix[i].length; j++) {
            var btn = document.getElementById(`${i}_${j}`)
            btn.onclick={};
        }
    }
    var win = null
    const res=document.getElementById("result")
    if(code===0){
        const mscore = Math.max(...Object.values(pts));
        const win = Object.keys(pts).filter(key => pts[key] === mscore);
        res.textContent="GAME TIME OVER."
        if(win.length===1){
            res.textContent += `${color[win[0]].toUpperCase()} WINS`
        }
        else{
            const clrs = win.map(key => color[key].toUpperCase())
            res.textContent += `${clrs.join(" AND ")} WIN`
        }
    }
    else if(code===1){
        player=Number(player)
        win=color[(player+1)%2]
        res.textContent=`PLAYER TIME OVER. ${win.toUpperCase()} WINS`
    }
    else{
        player=Number(player)
        win=color[(player+1)%2]
        console.log(win,player)
        res.textContent=`BOARD DOMINATED. ${win.toUpperCase()} WINS`
    }
}