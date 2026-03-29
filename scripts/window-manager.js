class WindowManager{

constructor(){

this.stack=document.getElementById("window-manager")
this.windows={}
this.z=10

}

openTool(zone,tool){

const id=zone+"-"+tool

if(this.windows[id]){
this.focus(id)
return
}

const url="/decide.engine-tools/tools/"+zone+"/"+tool+"/index.html"

const win=document.createElement("div")
win.className="os-window"
win.style.left="120px"
win.style.top="100px"
win.style.zIndex=++this.z

const header=document.createElement("div")
header.className="window-header"

const title=document.createElement("span")
title.textContent=tool

const close=document.createElement("button")
close.textContent="✕"

close.onclick=()=>{
win.remove()
delete this.windows[id]
}

header.appendChild(title)
header.appendChild(close)

const frame=document.createElement("iframe")
frame.className="window-frame"
frame.src=url

frame.setAttribute(
"sandbox",
"allow-scripts allow-same-origin allow-forms"
)

win.appendChild(header)
win.appendChild(frame)

this.stack.appendChild(win)

this.windows[id]=win

this.drag(win,header)

}

focus(id){

const win=this.windows[id]
if(!win) return

win.style.zIndex=++this.z

}

drag(win,header){

let move=false
let ox=0
let oy=0

header.onmousedown=e=>{
move=true
ox=e.clientX-win.offsetLeft
oy=e.clientY-win.offsetTop
}

document.onmousemove=e=>{

if(!move) return

win.style.left=e.clientX-ox+"px"
win.style.top=e.clientY-oy+"px"

}

document.onmouseup=()=>{
move=false
}

}

}

window.WM=new WindowManager()
