

var rows=0;
var cols=0

document.getElementById('selectmode').addEventListener('click',(event) => {
    const mode = event.target.closest('button');
  
  if (mode) {
    const pnum = mode.id;
    console.log("Clicked Button ID:", pnum);
    //pnum=Number(pnum)
    initgame(pnum)
  }
})

document.getElementById("griddetails").addEventListener('click',() => {
    var r1=Number(document.getElementById("rows").value)
    var c1=Number(document.getElementById("cols").value)
    console.log("gridinit run",r1,c1)
    gridinit(r1,c1)
    document.getElementById("rows").value="12"
    document.getElementById("cols").value="6"
})

document.addEventListener('DOMContentLoaded',() =>{
    const plrmodal = new bootstrap.Modal(document.getElementById("playerselect"))
    plrmodal.show()
})


var gridMatrix = null

function gridinit(r=12,c=6){
    rows=r
    cols=c
    const grid = document.getElementById("grid");
    if(gridMatrix){
        for(let i=0;i<gridMatrix.length;i++){
            const rowdiv = document.getElementsByClassName("line")
            for(let row of rowdiv){
                grid.removeChild(row)
            }
        }
    }
    gridMatrix = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => ({
            own: null,
            val: 0,
            cap: 4
        }))
    )

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

    for (let i = 0; i < rows; i++) {
        const rowdiv = document.createElement("div")
        rowdiv.className = "line"
        rowdiv.style["grid-template-columns"] = `repeat(${cols},50px)`
        for (let j = 0; j < cols; j++) {
            const button = document.createElement("div");
            button.className = "cell";
            button.id = `${i}_${j}`
            const img = document.createElement("img")
            img.src = ''
            button.appendChild(img)
            button.onclick = {}
            rowdiv.appendChild(button);
        }
        grid.appendChild(rowdiv)
    }
}

var move = 0;
var currp = 0;
const color = {
    0:"red",
    1:"blue",
    2:"green",
    3:"yellow"
}
const resetplayers = () => ({spots:0,pts:0})
let active=null;
var totplayers=2;
const players = {
    0:resetplayers(),
    1:resetplayers(),
    2:resetplayers(),
    3:resetplayers()
}



const reset = document.getElementById("reset")
reset.addEventListener('click',() => {reset.style.display = "none"})
const strtbtn = document.getElementById("gamestart")
strtbtn.addEventListener('click', () => {gamestart();strtbtn.disabled = true;strtbtn.textContent="GAME IN PROGRESS"} )

document.getElementById("result").textContent = 'PRESS \"START GAME\" TO START'


function formatTime(seconds) {

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function initgame(pnum){
    for(let p in players){
    const plrinfo = document.getElementById(`info_${p}`)
    plrinfo.style.display="none"
    }
    totplayers=pnum
    active = Array.from({length:pnum},(_,i) => i)
    console.log("number of players",active.length)
    
    resetgame()
}

var time = null;
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
            eliminateplayer(player,0)
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
    currp=0
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

        playertime(currp)
    }
}

function resetgame(){
    
    console.log(rows,cols,"rows and columns")
    for (let i = 0; i < rows; i++) {
        for(let j = 0; j < cols; j++){
            gridMatrix[i][j].own = null
            gridMatrix[i][j].val=0
            const btn = document.getElementById(`${i}_${j}`)
            btn.onclick = () => {place(`${i}_${j}`)}
            btn.querySelector("img").src = ''

        }
    }

    document.getElementById("result").textContent = 'PRESS \"START GAME\" TO START'
    document.getElementById("gamestart").disabled = false;
    document.getElementById("gamestart").textContent = "START GAME";
    for(let p in active){

        players[p] = resetplayers();

        plrtime = document.getElementById(`time_${p}`)
        plrpts = document.getElementById(`pts_${p}`)
        plrtime.textContent = "-:--"
        plrtime.classList.remove("text-danger")
        plrpts.textContent = "0"

        const plrinfo = document.getElementById(`info_${p}`)
        plrinfo.style.display="block"
    }
    document.getElementById("gametime").textContent = "-:--"


}


function place(id){
    const button = document.getElementById(id)
        
    const [r,c] = id.split("_").map(Number)
    var cell = gridMatrix[r][c]

    if(move<active.length){
        
        if(cell.own === null){
            if(timeplayer!==null){clearInterval(timeplayer);timeplayer=null}
            //button.style.backgroundColor = color[currp]
            cell.own = currp
            cell.val = cell.cap-1
            players[currp].spots=cell.val
            players[currp].pts+=cell.val
            const image = button.querySelector(`img`)
            image.src = `./resources/${color[currp]}${cell.val}.png`
            //button.textContent = `${cell.val}`
            
            updatePoints(currp)
            if(checkavail()){
                currp = active[(active.indexOf(currp)+1)%active.length]
                move++
                playertime(currp);
            }
        }

    }
    else{
        if(cell.own === currp){
            if(timeplayer!==null){clearInterval(timeplayer);timeplayer=null}
            cell.val++
            if(cell.val <cell.cap){
                //button.textContent = `${cell.val}`
                players[currp].spots++
                players[currp].pts++
                const image = button.querySelector(`img`)
                image.src = `./resources/${color[currp]}${cell.val}.png`
            }
            else{
                explode(r,c)
                players[currp].spots++
            }
            updatePoints(currp)
            if(checkavail()){
                currp = active[(active.indexOf(currp)+1)%active.length]
                move++
                playertime(currp);
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
    players[currp].pts+=(1+cell.cap)
    //make changes to adjacents
    const adj = [[-1, 0],[1, 0],[0, -1],[0, 1]];

    for (const [i, j] of adj) {

        const r1 = r + i;
        const c1 = c + j;

        if (r1 >= 0 &&r1 < rows &&c1 >= 0 &&c1 < cols) {
            var cell = gridMatrix[r1][c1] 
            if(cell.own!==null){players[cell.own].spots-=cell.val}
            players[currp].spots+=cell.val
            players[currp].pts+=cell.val
            cell.own=currp 
            cell.val++
            if(cell.val<cell.cap){
                const btn=document.getElementById(`${r1}_${c1}`) 
                const img1 = btn.querySelector("img")
                img1.src = `./resources/${color[currp]}${cell.val}.png`
            }
            else{
                explode(r1,c1)
            }
        }
    }
    
}

function checkavail(){
    if(move >= totplayers){
        console.log("active now",active.join(','))
        for(const i of active){
            if((players[i].spots===0)){
                if(eliminateplayer(Number(i),1)){
                    return false
                }
            }
        }
    }
    return true
}

function updatePoints(player){
    pt=document.getElementById(`pts_${player}`)
    pt.textContent =  players[player].pts
}

function eliminateplayer(player,code){
    console.log("eliminating",player)
    nextp = active[(active.indexOf(player)+1)%active.length]
    active = active.filter(plr => plr!==player)
    if(code==1){
        const plr = document.getElementById(`time_${player}`)
        plr.textContent = "ELIMINATED"
        plr.classList.add("text-danger")
    }
    if(active.length<2){
        finishgame(1,active[0])
        return true
    }
    currp=nextp
    playertime(nextp)
    return false
}

function finishgame(code,player=null){
    if(count){clearInterval(count)}
    clearInterval(timeplayer)
    document.getElementById("reset").style.display = "inline-block"
    document.getElementById("gamestart").textContent = "GAME END";
    for (let i = 0; i < gridMatrix.length; i++) {
        for (let j = 0; j < gridMatrix[i].length; j++) {
            var btn = document.getElementById(`${i}_${j}`)
            btn.onclick={};
        }
    }
    var win = null
    const res=document.getElementById("result")
    if(code===0){
        const mscore = Math.max(...Object.entries(players).map(([id,data]) => data.pts));
        const win = Object.entries(players).filter(([id, data]) => (data.pts === mscore) && active.includes(Number(id)))
        .map(([id, data]) => id);
        res.innerHTML="TICK-TOCK, TIME'S UP. <br>"
        if(win.length===1){
            res.innerHTML += `${color[win[0]].toUpperCase()} WINS`
        }
        else{
            const clrs = win.map(key => color[key].toUpperCase())
            res.innerHTML += `${clrs.join(" AND ")} WIN`
        }
    }
    else{
        win=color[Number(player)]
        res.innerHTML=`LONE SURVIVOR. <br> ${win.toUpperCase()} WINS`
    }
}
