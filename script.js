const canvas = document.getElementById("spaceArea");
const ctx = canvas.getContext("2d");

let x = 150;
let y = 200;
let xo1 = x-1;//todo:maybe test different offsets???
let yo1 = y;
let radius = 15;
let speed = 0.5;
let cAngle = 90;
//position on the horizon line
const unitWx = 900/90;
const unitW = 10; //todo: play with width scale (catacombs3D columns)
const unitH = 50;

//const pointsCol = {};///points actually
const pointsCol = [];//points actually
const walls= [];

function generateRandomPoint() {
  const min = 25;
  const max = 250;
  
  const toX = Math.floor(Math.random() * max)+ min;
  const toY = Math.floor(Math.random() * max)+ min;
  
  let y = toY;
  let ny = toY;
  const height1 = 0;
  const height2 = 50;//0
  const height3 = 150;//0
  
  //calculate slope for each wall line here (slope m of each line segment)
  //const mls1 = ((toX - min + toY) - toY) / toX - min;
  //const mls11 = ((toX - min + toY + 1) - toY - 1) / toX - min;
  
  //pre-defined(hard coded for now) walls
  walls[0]=[], walls[1]=[], walls[2]=[], walls[3]=[], walls[4]=[], walls[5]=[];
  
  //keys are coords, value is properties object
  for (let x=min;x<toX;x++){
	  //first test wall
	  pointsCol[`${x}-${y}`] = {color:30, slope:90, _x:x, _y:y, _height:height1};
	  walls[0].push(pointsCol[`${x}-${y}`]);
	  pointsCol[`${x}-${y+1}`] = {color:30, slope:90, _x:x, _y:y+1, _height:height1};
	  walls[1].push(pointsCol[`${x}-${y+1}`]);
	  
	  //second test wall
	  pointsCol[`${x}-${toY}`] = {color:180, slope:90, _x:x, _y:toY, _height:height2};
	  walls[2].push(pointsCol[`${x}-${toY}`]);
	  pointsCol[`${x}-${toY+1}`] = {color:180, slope:90, _x:x, _y:toY+1, _height:height2};
	  walls[3].push(pointsCol[`${x}-${toY+1}`]);
	  
	  //third test wall(vertical)
	  pointsCol[`${min}-${ny}`] = {color:130, slope:90, _x:min, _y:ny, _height:height3};
	  walls[4].push(pointsCol[`${min}-${ny}`]);
	  pointsCol[`${min+1}-${ny}`] = {color:130, slope:90, _x:min+1, _y:ny, _height:height3};
	  walls[5].push(pointsCol[`${min+1}-${ny}`]);
	  
	  y++;
	  ny--;
  }
	  
  //calculate slope for each wall
  walls.forEach((wall)=>{
	const dtY = Math.max(wall[wall.length-1]._y, wall[0]._y) - Math.min(wall[wall.length-1]._y, wall[0]._y);
	const dtX = Math.max(wall[wall.length-1]._x, wall[0]._x) - Math.min(wall[wall.length-1]._x, wall[0]._x);
	
	let mSlope = Number((wall[wall.length-1]._y - wall[0]._y) / (wall[wall.length-1]._x - wall[0]._x));
	
	//slope of horizontal line
	if(dtY===0) mSlope = 0;
	//slope of vertical line
	if(dtX===0) mSlope = 100;
	
	wall.forEach((point)=> point.slope=mSlope);	
  });
  
}

generateRandomPoint();

//mouse-move(strafe, up-down)
/*window.addEventListener('mousemove', function(e){
  x = e.x;
  y = e.y;
});*/

let upArrowPressed = false; //has up been pressed - default state false
let downArrowPressed = false; //has down been pressed - default state false
let leftArrowPressed = false; //has left key been pressed - default state false
let rightArrowPressed = false; //has right key been pressed - default state false

//Game Loop
function drawSpace(){
    requestAnimationFrame(drawSpace);
    
	clearScreen();
	inputs();
    backGd(250, 0);
	boundryCheck();
	
	getCircle(x, y, false);
	//getCircle(xo1, yo1, true);
};

function backGd(xb, yb){
	// white/gray fpv screen
	ctx.fillStyle = "lightblue";
	ctx.fillRect( xb, yb, 900, 300 );
	ctx.fillStyle = "lightgreen";
	ctx.fillRect( xb, yb + 300, 900, 300 );
	
	//red walls
	ctx.fillStyle = "red";
		
	//new method
	const keys=Object.keys(pointsCol);
	for (let z=0; z<keys.length ;z++){
		//keys[z].split('-');//this is the pair of coords
		ctx.fillRect(Number(keys[z].split('-')[0]) ,Number(keys[z].split('-')[1]), 1, 1 );
		}
	
}

function getCircle(xo, yo, isOffset){
	//const diffColor = isOffset? 127:255;
	let xi = xo;
	let yi = yo;
	let m = 1;
	let isInter = false;
	let addNoise = 0, hOffset = 0, diffColor = 0;
	
	//each FPV ray
	for(let i=cAngle-90; i<=cAngle; i++ ){
		isInter= false;
		
		//each point on the current player-arc line
		for(let j = 190; j >0; --j){
		
		//test width=inverse of distance from object
		//let unitW = ((190-j)/90)*unitWx;
		
		hOffset = 900/j + 600/j + 300/j + 100/j + 1200/j + 1500/j + 2700/j; //todo: height harmonic -> thousands range

		//test rays		
		ctx.fillStyle = "rgb(" + (255/190)*j + ", " + 100 + ", 100)";
		if(!isInter) ctx.fillRect( parseInt(Math.sin(i*Math.PI/180)*j+xo), parseInt(-Math.cos(i*Math.PI/180)*j+yo), 1, 1);
		
			//size of object
			//const unitH = 300/j;
			//if(upArrowPressed){console.log("height is "+unitH+" and x pos is "+(m*unitWx+240));}
			xi = parseInt(Math.sin(i*Math.PI/180)*j+xo);
			yi = parseInt(-Math.cos(i*Math.PI/180)*j+yo);
			
			//wall loop intersect (ray tracing)
				if(pointsCol[`${xi}-${yi}`]){
				
					//calculate slope of ray
					let mRay = (yi-yo) / (xi-xo);
					if(yi-yo===0) mRay = 0;
					if(xi-xo===0) mRay = 100;

					//let unitW = m<45?m:(90-m);
					addNoise = pointsCol[`${xi}-${yi}`]._height;
				
					//wall color
					diffColor = pointsCol[`${xi}-${yi}`].color;
					
					ctx.fillStyle = "rgb(" + (255/90)*i + ", " + (255/190)*j + `, ${diffColor})`;
					
					//correct the overflow bug
					//if((m*unitWx+240 + unitW)>1155) unitW=0;
					
					//render the wall
					ctx.fillRect( m*unitWx+240, 300 + (hOffset)/2, unitW, -1*(hOffset + addNoise));
					
					ctx.fillStyle = "white";
					ctx.font= "9px serif";
					
					//slope of corresponding wall
					//ctx.fillText(pointsCol[`${xi}-${yi}`].slope, m*unitWx+240, 150 + 7*(m%2));
					
					//slope of corresponding ray
					ctx.fillText(mRay, m*unitWx+240, 150 + 7*(m%2));
					
					//distance to each column
					//ctx.fillText(j, m*unitWx+240, 150 + 7*(m%2));
					
					isInter=true;
				}
			
			//if isInterrupted
			//if (isInter) break; turn off depth interrupt
		}
		m++;//m just maps i from 1 to angle
	}
}



//_______________________________________________________________________________________________________



function inputs(){
    if(upArrowPressed){
        //y-=speed;
		//ctx.lineTo( Math.sin(i*Math.PI/180)*190+x, -Math.cos(i*Math.PI/180)*190+y);
		x = Math.sin((cAngle-45)*Math.PI/180)*speed+x;
		y = -Math.cos((cAngle-45)*Math.PI/180)*speed+y;
		//isUp = true;
		xo1 = x-1;
		yo1 = y;
    }
    if(downArrowPressed){
        //y+=speed;
		x = Math.sin((cAngle+135)*Math.PI/180)*speed+x;
		y = -Math.cos((cAngle+135)*Math.PI/180)*speed+y;
		//isUp = false;
		xo1 = x-1;
		yo1 = y;
    }
    if(leftArrowPressed){
        //x-=speed;
		cAngle--;
		
		//isRight = false;
    }
    if(rightArrowPressed){
        //x+=speed;
		cAngle++;
		//strafe right:x = Math.sin((cAngle+45)*Math.PI/180)*speed+x; y = -Math.cos((cAngle+45)*Math.PI/180)*speed+y;
		//isRight = true;
    }
}

function boundryCheck(){
    //up bounce if(y < radius){ y+=35; }
    
	//down
    if(y > canvas.height - radius){ y = canvas.height - radius; }
    //left
    if(x < radius){ 
		x=radius;
	}
    //right
    if(x > canvas.width - radius){  
		x = canvas.width - radius;
	}
}

function clearScreen(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0, canvas.width, canvas.height);
};

document.body.addEventListener("keydown", keyDown); //press key
document.body.addEventListener("keyup", keyUp); //release key

function keyDown(event){
    if(event.keyCode == 38){
        upArrowPressed = true; // keycode value for up arrow 38
    }
    if(event.keyCode == 40){
        downArrowPressed = true; //keycode value for down arrow 40
    }
    if(event.keyCode == 37){
        leftArrowPressed = true; //keycode value for left arrow 37
    }
    if(event.keyCode == 39){
        rightArrowPressed = true; //keycode value for right arrow 39
    }
};

function keyUp(event){
    if(event.keyCode == 38){
        upArrowPressed = false;
    }
    if(event.keyCode == 40){
        downArrowPressed = false; 
    }
    if(event.keyCode == 37){
        leftArrowPressed = false; 
    }
    if(event.keyCode == 39){
        rightArrowPressed = false; 
    }
};

drawSpace();