class SpatialEngine{

constructor(){

this.nodes={}
this.macros={
"0,0|0,1|1,0":"decision-core",
"1,0|1,1|2,0":"creator-studio",
"-1,-1|-1,0|-1,1":"utility-subsystem",
"2,2|2,3|3,2":"analytics-bay"
}

}

registerNode(id,data){

this.nodes[id]=data

}

connect(a,b){

if(!this.nodes[a]||!this.nodes[b]) return

if(!this.nodes[a].out){
this.nodes[a].out=[]
}

this.nodes[a].out.push(b)

}

export(){

return JSON.stringify(this.nodes,null,2)

}

}

window.SpatialEngine=new SpatialEngine()
