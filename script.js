const canvas = document.getElementById("spaceArea");
const ctx = canvas.getContext("2d");

let x = 150;
let y = 200;
let xo1 = x-1;//todo:maybe test different offsets???
let yo1 = y;
let radius = 15;
let speed = 1;
let cAngle = 90;
//position on the horizon line
const unitWx = 900/90;

//let xCreste = xo< (xo + 90)? true : false;
//let isRight = true;
//let yCreste = yo< (yo + 90)? true : false;
//let isUp = true;

//build the walls!!!
let wall =[];
for (let k=0;k<50;k++){
	wall[k] = 50 - k;
	//wall[k+1] = 50 - k;
	wall[50+k] = 25 + k;
	//wall[50+k] = 25 + k;
	wall[100+k] = 125 + k;
	//wall[100+k] = 125 + k;
	wall[150+k] = 195 + k; //todo:parametrize this, all k locations
	//wall[150+2*k] = 195 + k;
}

//mouse-move(strafe, up-down)
window.addEventListener('mousemove', function(e){
 // x = e.x;
 // y = e.y;
});

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
	for (let k=0;k<250;k++){ctx.fillRect( k+20, wall[k] , 1, 1 );}
	
	//gray/gray lines to circle
	for(let i=cAngle-90; i<=cAngle; i+=15 ){
		ctx.beginPath();
		i>(cAngle-45)? ctx.strokeStyle = "gray" : ctx.strokeStyle = "gray";
		ctx.moveTo(x,y);
		//if(i==cAngle-45) ctx.strokeStyle = "red";
		ctx.lineTo( Math.sin(i*Math.PI/180)*190+x, -Math.cos(i*Math.PI/180)*190+y);
		ctx.stroke();

		//red line for 1px to the right offset
		/*ctx.beginPath();
		i>(cAngle-45)? ctx.strokeStyle = "red" : ctx.strokeStyle = "red";
		ctx.moveTo(xo1,yo1);
		//if(i==cAngle-45) ctx.strokeStyle = "red";
		ctx.lineTo( Math.sin(i*Math.PI/180)*190+xo1, -Math.cos(i*Math.PI/180)*190+yo1);
		ctx.stroke();*/
	}
	
}

function getCircle(xo, yo, isOffset){
	//const diffColor = isOffset? 127:255;
	let xi = xo;
	let yi = yo;
	let m = 1;
	let isInter = false;
	//each FPV ray
	for(let i=cAngle-90; i<=cAngle; i++ ){
		isInter= false;
		
		//width is narrower at the edges
		//Math.abs(45-m);//higher at the edges
		let unitW = m<45?m:(90-m);
		const hOffset = 0;//unitW;
		//each point on the current player-arc line
		for(let j = 1; j <190; ++j){
		
		//test rays		
		//ctx.fillStyle = "rgb(" + (255/190)*j + ", " + 100 + ", 100)";
		//ctx.fillRect( parseInt(Math.sin(i*Math.PI/180)*j+xo), parseInt(-Math.cos(i*Math.PI/180)*j+yo), 1, 1);
		
			//size of object
			let unitH = 300/j;
			//if(upArrowPressed){console.log("height is "+unitH+" and x pos is "+(m*unitWx+240));}
			xi = parseInt(Math.sin(i*Math.PI/180)*j+xo);
			yi = parseInt(-Math.cos(i*Math.PI/180)*j+yo);
			//color test
			const diffColor = i%2===0? 127:255;
			//wall loop intersect (ray tracing)
			for (let k=0;k<200;k++){
				if(((k+20) == xi) && yi == wall[k]){//collision
					ctx.fillStyle = "rgb(" + (255/90)*i + ", " + (255/190)*j + `, ${diffColor})`;
					//try solving the melting edges bug and filling gaps
					unitW= unitW<10?(10-unitW)*unitW:unitW;
					unitW=unitW>35?(48-unitW)*5:unitW;
					
					ctx.fillRect( m*unitWx+240, 300 - (unitH+hOffset), unitW+10, (unitH+hOffset)*2 );

					//exit for
					isInter=true;
					break;
				}
			}
			//if isInterrupted break
			if (isInter) break;
		}
		m++;//m just maps i from 1 to angle
	}
}

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