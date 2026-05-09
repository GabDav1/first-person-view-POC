import * as inpts from './inputs.js'
import {generateWalls} from './bckgds.js'

const canvas = document.getElementById("spaceArea");
const ctx = canvas.getContext("2d");

let x = 150;
let y = 200;
let radius = 15;
let speed = 0.5;
const fAngle = 90; //fixed angle
let cAngle = fAngle; //dynamic angle
const SCR_W = 900; //Screen width
const unitWx = SCR_W/fAngle; //position on the horizon line
let unitW = SCR_W/fAngle; 
const unitH = 50;
let lastPoint = null; // for drawing consecutive points

//used for wall smoothing
const prevIntersect = [];//smoothing array
for(let i=0; i<=99; i++ ){
	prevIntersect[i] = {height: 0};
}

//all points that form the walls
const pointsCol = generateWalls()[1];
const walls= generateWalls()[0];

//mouse-edit
window.addEventListener('click', function(e){
  let m_x = e.x;
  let m_y = e.y;

  //segment between 2 points
  if(lastPoint){
  	//need to fill in points between m_x and lastPoint.x
  	const steps = Math.sqrt(Math.pow(Math.abs(m_x - lastPoint.x), 2) + Math.pow(Math.abs(m_y - lastPoint.y), 2)); //Pythagora for "diagonal"
  	let m_ix = lastPoint.x, m_iy = lastPoint.y, u_ix, u_iy;
  	const x_incr = (m_x - lastPoint.x)/steps;
  	const y_incr = (m_y - lastPoint.y)/steps;

    //segment slope and color
    const dtY = Math.abs(m_y - lastPoint.y);
	const dtX = Math.abs(m_x - lastPoint.x);

	let mSlope = (dtY / dtX);
	if(dtY===0) mSlope = 0; //slope of horizontal line
	if(dtX===0) mSlope = 10; //slope of vertical line
	const s_color = 120 + (20*mSlope);
	const s_height = Math.floor(Math.random() * 50)+ 1;

  	for(let i=1; i<=steps; i++){
  		m_ix += x_incr;
  		m_iy += y_incr;
  		u_ix = Math.round(m_ix);
  		u_iy = Math.round(m_iy);
		pointsCol[`${u_ix}-${u_iy}`] = {color:s_color, slope:mSlope, _x:(u_ix), _y:-(u_iy), _height:s_height}; 
		pointsCol[`${u_ix}-${u_iy+1}`] = {color:s_color, slope:mSlope, _x:(u_ix), _y:-(u_iy+1), _height:s_height}; 
		//pointsCol[`${u_ix}-${u_iy}`] = {color:s_color, slope:mSlope, _x:(u_ix), _y:-(u_iy), _height:0}; 

		//console.log(Math.round(m_ix));
		//console.log(-Math.round(m_iy));
  	}
	lastPoint = null;
  } else{
  	//lastPoint.x = m_x;
  	//lastPoint.y = m_y;	
  	lastPoint = { x: m_x, y: m_y };
  }
});

//Game Loop
function drawSpace(){
    requestAnimationFrame(drawSpace);
    
	clearScreen();
	inputsa();
    backGd(250, 0);
	boundryCheck();
	
	getCircle(x, y, false);
	//getCircle(xo1, yo1, true);

};

function backGd(xb, yb){
	// white/gray fpv screen
	ctx.fillStyle = "lightblue";
	ctx.fillRect( xb, yb, SCR_W, 300 );
	ctx.fillStyle = "lightgreen";
	ctx.fillRect( xb, yb + 300, SCR_W, 300 );
	
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
	let isInter = false;
	let hOffset = 0, diffColor = 0;

	let m = 0;
	//const prevIntersect = [];
	let addHeight = 0, lastSegment = 0;
	let toIncr = false;

	//each FPV ray
	for(let i=cAngle-fAngle; i<=cAngle; i++ ){

		isInter= false;
		//each point on the current player-arc line
		for(let j=200; j>0; j--){
		
			hOffset = 3600/(j);
			//if(j<20) hOffset = 9000/(j + j/2);

			//test rays		
			ctx.fillStyle = "rgb(" + (255/190)*j + ", " + 100 + ", 100)";
			if(m%5 === 0) ctx.fillRect( (Math.sin(i*Math.PI/180)*j+xo), (-Math.cos(i*Math.PI/180)*j+yo), 1, 1);//parseInt(Math.sin(i*Math.PI/180)*j+xo), parseInt(-Math.cos
			//console.log(Math.round(Math.sin(i*Math.PI/180)*j+xo)); //x
			//console.log(Math.round(-Math.cos(i*Math.PI/180)*j+yo)); //y
			
			xi = Math.round(Math.sin(i*Math.PI/180)*j+xo);//parseInt(Math
			yi = Math.round(-Math.cos(i*Math.PI/180)*j+yo);//parseInt(-Math
				

			//wall loop intersect (ray tracing)
			if(pointsCol[`${xi}-${yi}`]){
						
						//for adjusting segment height to make a smooth wall
						prevIntersect[m] = {height: j};

						if(m > 0) {
							const curHt = prevIntersect[m].height;
							const prevHt = prevIntersect[m-1].height;
							if(lastSegment===0) lastSegment = curHt; //init lastSegment

								//same wall
								if(curHt<20) {
									// same height for 2 consecutive segments
									if(curHt === prevHt){
										//toIncr ? addHeight+=2 : addHeight-=2;
										//lastSegment > curHt ?  addHeight+=3 : addHeight-=3;
									} else {
										addHeight = 0;
										lastSegment = prevHt;
									} 
									
								}	
							
						}
						
						//calculate slope of ray
						let mRay = (yi-yo) / (xi-xo);
						if(yi-yo===0) mRay = 0;
						if(xi-xo===0) mRay = 10;

						// handle wall slope exceptions
						if(pointsCol[`${xi}-${yi}`].slope === 10 && (mRay >= 0.99 || mRay <= -0.99)) mRay = 0.9;
						if(pointsCol[`${xi}-${yi}`].slope === 1 && (mRay >= 0.99 || mRay <= -0.99)) mRay /= 10;

						//wall color
						diffColor = pointsCol[`${xi}-${yi}`].color;
						//angle between ray and wall
						const tanphi = Math.atan(Math.abs(mRay - pointsCol[`${xi}-${yi}`].slope / (1 + mRay * pointsCol[`${xi}-${yi}`].slope))) * (180 / Math.PI)
						const colorMltpl = tanphi * 2;
						
						ctx.fillStyle = "rgb(" + (35 + colorMltpl) + ", " + (35 + colorMltpl) + `, ${(diffColor + colorMltpl)})`;
						
						//render the wall
						//hOffset +=  pointsCol[`${xi}-${yi}`]._height;
						ctx.fillRect(m*unitWx+240, 300 + 4*((hOffset + addHeight) / 2), unitW, -1*(hOffset + addHeight));//parametrise this?!?!
						
						ctx.fillStyle = "white";
						ctx.font= "9px serif";

						//test smoothing array
						//ctx.fillText(parseInt(m), m*unitWx+240, 200 + 7*(m%2));
						//ctx.fillText(addHeight, m*unitWx+240, 225 + 7*(m%2));
						//slope of corresponding wall
						ctx.fillText(pointsCol[`${xi}-${yi}`].slope, m*unitWx+240, 275 + 7*(m%2));
						//slope of corresponding ray
						//ctx.fillText(mRay, m*unitWx+240, 250 + 7*(m%2));
						//distance to each column
						//ctx.fillText(prevIntersect[m].height, m*unitWx+240, 250 + 7*(m%2));
						//ctx.fillText(lastSegment, m*unitWx+240, 275 + 7*(m%2));
						//angle
						//ctx.fillText(tanphi, m*unitWx+240, 300 + 17*(m%2));
						
						isInter=true;
					}
				//if(isInter) break;
		}
		m++;//m just maps i from 1 to angle
	}
}



//_______________________________________________________________________________________________________


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

inpts.bindListener()

function inputsa(){
    if(inpts.upArrowPressed){
        //y-=speed;
		//ctx.lineTo( Math.sin(i*Math.PI/180)*190+x, -Math.cos(i*Math.PI/180)*190+y);
		x = Math.sin((cAngle-fAngle/2)*Math.PI/180)*speed+x;
		y = -Math.cos((cAngle-fAngle/2)*Math.PI/180)*speed+y;
    }

    if(inpts.downArrowPressed){
        //y+=speed;
		//x = Math.sin((cAngle+fAngle/2+fAngle)*Math.PI/180)*speed+x;
		x = Math.sin((cAngle+135)*Math.PI/180)*speed+x;
		//y = -Math.cos((cAngle+fAngle/2+fAngle)*Math.PI/180)*speed+y;
		y = -Math.cos((cAngle+135)*Math.PI/180)*speed+y;
    }

    //strafe right:x = Math.sin((cAngle+45)*Math.PI/180)*speed+x; y = -Math.cos((cAngle+45)*Math.PI/180)*speed+y;
    if(inpts.leftArrowPressed){	cAngle--;}
    if(inpts.rightArrowPressed){ cAngle++;}
}

drawSpace();