const fs = require('fs')
const http = require('http')
const socketio = require('/usr/local/lib/node_modules/socket.io')
let check=0
let dict={}
let clients=[]
let spec=[]
let result=""
let games=[]

const readfile = f => new Promise((resolve,reject)=>
	fs.readFile(f,(e,d)=>e?reject(e):resolve(d)))

const server = http.createServer(async (req,resp)=>{
	console.log(req.url)
	try
	{
	resp.end(await readfile(req.url.substr(1)))
	console.log(req.url)
	}
	catch(e)
	{
		console.log("err ",req.url)
	}
	})
const io= socketio(server)
io.sockets.on('connection',socket=>{ 
	socket.on('mymsg', data =>{

		if(dict[socket.id][2]==0)
		{
			io.to(socket.id).emit('cheat')
		}
		else
		{
			dict[socket.id][2]=0
			dict[dict[socket.id][0]][2]=1
			dict[socket.id][1][data[0][0]][data[0][1]]=data[1]
			dict[dict[socket.id][0]][1][data[0][0]][data[0][1]]=data[1]
			
			dict[socket.id][4]=(dict[socket.id][4])-1
			dict[dict[socket.id][0]][4]=dict[dict[socket.id][0]][4]-1

			if (cond(data[0][0],data[0][1],data[1],dict[socket.id][1])==1)
			{
				io.to(socket.id).emit('won')
				io.to(dict[socket.id][0]).emit('lost')
				dict[socket.id][4]=42
				dict[dict[socket.id][0]][4]=42
				if(dict[socket.id][3].length!=0){
					dict[socket.id][3].map((x)=>{
					io.to(x).emit('spec_dec',[socket.id,data[1]])
					})
				}
				let matrix = new Array(7)
				for(var z=0;z<7;z++)
				{
					matrix[z]=new Array(6).fill(' ')
				}
				dict[socket.id][1]=matrix
				dict[dict[socket.id][0]][1]=matrix
				dict[socket.id][2]=1
				dict[dict[socket.id][0]][2]=0	
				if(games.indexOf(socket.id)>-1)
				{
					games.splice(games.indexOf(socket.id),1)
				}	
				else if(games.indexOf(dict[socket.id][0])>-1)
				{
					games.splice(games.indexOf(dict[socket.id][0]),1)
				}	
			}
			else if(dict[socket.id][4]==0)
			{
				io.to(socket.id).emit('draw')
				io.to(dict[socket.id][0]).emit('draw')
				if(dict[socket.id][3].length!=0){
					dict[socket.id][3].map((x)=>{
					io.to(x).emit('spec_dec_draw')
					})
				}
				let matrix = new Array(7)
				for(var z=0;z<7;z++)
				{
					matrix[z]=new Array(6).fill(' ')
				}
				dict[socket.id][1]=matrix
				dict[dict[socket.id][0]][1]=matrix
				dict[socket.id][2]=1
				dict[dict[socket.id][0]][2]=0	
				dict[socket.id][4]=42
				dict[dict[socket.id][0]][4]=42
				if(games.indexOf(socket.id)>-1)
				{
					games.splice(games.indexOf(socket.id),1)
				}	
				else if(games.indexOf(dict[socket.id][0])>-1)
				{
					games.splice(games.indexOf(dict[socket.id][0]),1)
				}

			}
			else
			{
				io.to(dict[socket.id][0]).emit('yourmsg',[dict[socket.id][1],1])
				if(dict[socket.id][3].length!=0){
					dict[socket.id][3].map((x)=>{
						io.to(x).emit('spec_update',dict[socket.id][1])
					})
				}
			}
		}
	})
	socket.on('restart',()=>{
		dict[socket.id][2]=1
		dict[dict[socket.id][0]][2]=0
		dict[socket.id][4]=42
		dict[dict[socket.id][0]][4]=42
		games.push(socket.id)
		io.to(dict[socket.id][0]).emit('start',dict[dict[socket.id][0]][2])
		io.to(socket.id).emit('start',dict[socket.id][2])})

	socket.on('game',()=>{
		if(check==0)
		{
			check=1
			clients.push(socket.id)
			io.to(socket.id).emit('turn',1)
		}
		else 
		{
			let matrix = new Array(7)
			for(var z=0;z<7;z++)
			{
				matrix[z]=new Array(6).fill(' ')
			}
			spec=[]
			count=42
			dict[clients[0]]=[socket.id,matrix,1,spec,count]
			dict[socket.id]=[clients[0],matrix,0,spec,count]
			io.to(socket.id).emit('start',0)
			io.to(clients[0]).emit('start',1)
			clients.shift()
			games.push(socket.id)
			check=0
		}
		console.log("Client joined",socket.id)
	})
	socket.on('spectate',()=>{
		io.to(socket.id).emit('players',games)
	})
	socket.on('spec_player',data =>{
		dict[data][3].push(socket.id)
		dict[dict[data][0]][3].push(socket.id)
		io.to(socket.id).emit('spec_update',dict[data][1])
	})
	socket.on('end_sp',data =>{
	dict[data][3].splice(dict[data][3].indexOf(socket.id),1)
	dict[dict[data][0]][3].splice(dict[dict[data][0]][3].indexOf(socket.id),1)
	})
})
server.listen(8000,()=> console.log('Started...'))

let cond = (r,c,di,matrix) =>
{
	check = 1
	for(y=1;y<4;y++)//checks rows
	{
		if((r+y)!=7 && (matrix[r+y][c]==di))
		{
			check=1
		}
		else {check=0;break;}		
	}
	if(check==1){result="YOU WIN!!";return 1}
	//------------------------------------------
	
	for(y=1;y<4;y++)//checks coloumns
	{
		if((c+y)!=6 && (matrix[r][c+y]==di))
		{
			check=1
		}
		else{check=0;break;}
	}
	if(check==1){result="YOU WIN!!";return 1}
	//------------------------------------------
	
	for(y=1;y<4;y++)//checks coloumns
	{
		if((c-y)!=-1 && (matrix[r][c-y]==di))
		{
			check=1
		}
		else{check=0;break;}
	}
	if(check==1){result="YOU WIN!!";return 1}	
	//-----------------------------------------
	
	check=1
	if(check==1 &&(c-1)!=-1 && (matrix[r][c-1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c-2)!=-1 && (matrix[r][c-2]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c+1)!=6 && (matrix[r][c+1]==di))
	{
		check=1
	}
	else{check=0;}

	if(check==1){result="YOU WIN!!";return 1}
	//---------------------------------------
	check=1;
	if(check==1 && (c+1)!=6 && (matrix[r][c+1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 && (c+2)!=6 && (matrix[r][c+2]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 && (c-1)!=-1 && (matrix[r][c-1]==di))
	{
		check=1
	}
	else{check=0;}

	if(check==1){result="YOU WIN!!";return 1}
	//---------------------------------------

	//CHECK DIAGONALS
	  //
	 //
	//
	for(y=1;y<4;y++)
	{
		if((r+y)!=7 &&(c-y)!=-1 && (matrix[r+y][c-y]==di))
		{
			check=1
		}
		else {check=0;break;}
	}
	if(check==1){result="YOU WINN!!";return 1}
	
	for(y=1;y<4;y++)
	{
		if((r-y)!=-1 &&(c+y)!=6 && (matrix[r-y][c+y]==di))
		{

			check=1
		}
		else {check=0;break;}
	}
	if(check==1){result="YOU WINN!!";return 1}
	//-----------------------------------------------------

	check=1;
	if(check==1 &&(c-1)!=-1 && (r+1)!=7  && (matrix[r+1][c-1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c-2)!=-1 && (r+2)!=7  && (matrix[r+2][c-2]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c+1)!=6 && (r-1)!=-1  && (matrix[r-1][c+1]==di))
	{
		check=1
	}
	else{check=0;}

	if(check==1){result="YOU WINN!!";return 1}
	//--------------------------------------------

	check=1;
	if(check==1 &&(c-1)!=-1 && (r+1)!=7  && (matrix[r+1][c-1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c+1)!=6 && (r-1)!=-1  && (matrix[r-1][c+1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&check==1 &&(c+2)!=6 && (r-2)!=-1  && (matrix[r-2][c+2]==di))
	{
		check=1
	}
	else{check=0;}

	if(check==1){result="YOU WINN!!";return 1}
	//----------------------------------------------------

	//CHECK DIAGONALS
	 //
	  //
	   //
	for(y=1;y<4;y++)
	{
		if((r+y)!=7 &&(c+y)!=6 && (matrix[r+y][c+y]==di))
		{
			check=1
		}
		else {check=0;break;}	
	}
	if(check==1){result="YOU WINN!!";return 1}
	
	for(y=1;y<4;y++)//checks rows
	{
		if((r-y)!=-1 &&(c-y)!=-1 && (matrix[r-y][c-y]==di))
		{
			check=1
		}
		else {check=0;break;}
	}
	if(check==1){result="YOU WINN!!";return 1}
	//-----------------------------------------------------

	check=1;
	if(check==1 &&(c-1)!=-1 && (r-1)!=-1  && (matrix[r-1][c-1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c-2)!=-1 && (r-2)!=-1  && (matrix[r-2][c-2]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c+1)!=6 && (r+1)!=7  && (matrix[r+1][c+1]==di))
	{
		check=1
	}
	else{check=0;}

	if(check==1){result="YOU WINN!!";return 1}
	//--------------------------------------------

	check=1;
	if(check==1 &&(c+1)!=6 && (r+1)!=7  && (matrix[r+1][c+1]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c+2)!=6 && (r+2)!=7  && (matrix[r+2][c+2]==di))
	{
		check=1
	}
	else{check=0}
	if(check==1 &&(c-1)!=-1 && (r-1)!=-1  && (matrix[r-1][c-1]==di))
	{
		check=1
	}
	else{check=0;}

	if(check==1){result="YOU WINN 13!!";return 1}

	return 0
}