//console.log("hellooooo")
let temp=0
let matrix = new Array(7)
for(var z=0;z<7;z++)
{
	matrix[z]=new Array(6).fill(' ')
}
//var io = require('/usr/local/lib/node_modules/socket.io')
const socket = io()
let turn = 0;
let result=""
let init_turn=0;
let enem_dice='A'
let my_dice='B'
let init_enem='A'
let init_my='B'

socket.on('yourmsg',data=>
{
	matrix=data[0]
	turn = data[1]
	result="YOUR TURN"
	console.log("checkkk")
	redraw()	
})
socket.on('cheat',()=>
{
	result="ILLEGAL MOVE"
	turn=0
	redraw()
})

socket.on('start',data=>
{
	console.log("player connected")
	temp=0
	matrix = new Array(7)
	for(var z=0;z<7;z++)
	{
		matrix[z]=new Array(6).fill(' ')
	}
	turn = data;
	if(data==1)
	{
		result="YOUR TURN"
	}
	else
	{
		result="OPPONENTS TURN"
	}
	enem_dice=init_enem
	my_dice=init_my
	redraw()
})
socket.on('lost',data=>
{
	console.log("you lost")
	ReactDOM.render(
	React.createElement("div",null
			,React.createElement('text',{style:{color:"yellow"}},"YOU LOST..."),
			React.createElement("button",
			{onClick:ev=>
				restart()	
			},
			"restart"))
	,document.getElementById('rahij'))
})
socket.on('won',data=>
{
	console.log("you won")
	result="YOU WIN!!"
	redraw_end()
})
socket.on('draw',data=>
{
	
	result="DRAW :("
	redraw_end()
})
socket.on('turn',data=>
{
	console.log("turn decidedd")
	turn = data
	init_turn=turn
	init_enem='B'
	init_my='A'
	enem_dice='B'
	my_dice='A'
})
const formSubmit = event=>
{
	turn=0
	result="OPPONENTS TURN"
	socket.emit('mymsg',[event,my_dice])

	redraw()
}
const redraw_end = () =>
{
	ReactDOM.render(
		React.createElement("div",null,
				
				React.createElement('text',{style:{color:"yellow"}},result),
				React.createElement("button",
				{onClick:ev=>
					restart()	
				},
				"restart"))
		,document.getElementById('rahij'))
}
const choose = () =>
{
	ReactDOM.render(
	React.createElement("div",null,
			
		React.createElement("text",{style:{color:"yellow"}},"Do You want to SPECTATE?"),
		React.createElement("button",
		{onClick:ev=>
			spectate()	
		},
		"YES"),
		React.createElement("button",
		{onClick:ev=>
			redraw_wait()	
		},
		"NO"))
		,document.getElementById('rahij'))
}
const restart = () =>
{
	temp=0
	matrix = new Array(7)
	for(var z=0;z<7;z++)
	{
		matrix[z]=new Array(6).fill(' ')
	}
	msgList=[]
	turn = init_turn;
	result=""
	socket.emit('restart')

}
const redraw_wait = () =>
{
	ReactDOM.render(
		React.createElement("div",null,
				
			React.createElement("text",{style:{color:"yellow"}},"Waiting for player to connect...")
			),document.getElementById('rahij')
	)
	socket.emit('game')
}
const redraw = () =>{
	temp=0;
	ReactDOM.render(
		React.createElement("div",null,
				
			React.createElement(
			"style",
			{style:{color:"white"}},
			"table, th, td  {border: 0.1px solid black;border-color:blue;background-color:transparent} "
			),
				React.createElement('input',
				{type:'image',width:"400",height:"100",src:"\\connect4logo.png"}),
				React.createElement('h6',{style:{color:"yellow"}},"Rahij Gillani"),
				React.createElement(
			  		"table",
			  		{ id: "myTable",width:"400",height:"400"},
			  		matrix.map((x,i1)=>
			  			React.createElement(
							"tr",
						    {onMouseover:ev=>console.log("ndnnnn")},
			    			x.map((y, i)=>
			    				React.createElement(
			    			  		"th",
			      					{id:temp++,height:"10",onClick:ev=>{
			      						if(turn==1)
			      						{
			      							for(x=6;x>=0;x--)
			      							{
			    	      						if (matrix[x][i]==' ')
				      							{
				      								r=x
				      								c=i
				      								matrix[x][i]=my_dice
				      								break	
			      								}
			      							}
				      						formSubmit([r,c])
			      						}
			      						else
			      						{
			      							result="NOT YOUR TURN"
			      							redraw()
			      						}
			      					},
			      					width:"100",
			      						onMouseOver:ev=>{
			      							m=-1
			      							emp=-1
			      							for(k=6;k>=0;k--)
			      							{
			      								if(matrix[k][i]==' '){
			      									emp = k
			      									break;
			      								}
			      							}
			      							if (emp!=0 && emp!=-1 && cond(emp-1,i,enem_dice)==1)
			      							{
			      								m=ev.target.id
			      								result = ""
			      							}
			      							let t=(ev.target.id%6)
			      							
			      							for(it=0;it<7;it++)
			      							{
			      								if(m!=-1)
			      									document.getElementById(t).style="background: red"
			      								else
			      									document.getElementById(t).style="background: green"
			      								t=t+6;
			      							}
			      						},
			      							onMouseOut: ev=>{
												let t=(ev.target.id%6)
			      								for(it=0;it<7;it++)
			      								{
			      									document.getElementById(t).style="background: transparent"
			      									t=t+6;
			      								}
			      							}
			      					},
			      					React.createElement('input',
			      						{type:'image',width:"20",height:"20",src:im(y)})
			      						,
			    				))
			  )))
				,React.createElement('h4',{style:{color:"yellow"}},result))
		,document.getElementById('rahij'))
}
let im= (y) =>
{
	if(y=='B'){return "\\bb1.png"}
	else if(y=='A'){return "\\red.png"}
	else{return y}
}

let cond = (r,c,di) =>
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
}

choose();
//redraw()