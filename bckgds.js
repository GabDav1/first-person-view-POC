export function generateWalls() {
  const min = 25;
  const max = 250;
  
  const toX = Math.floor(Math.random() * max)+ min;
  const toY = Math.floor(Math.random() * max)+ min;
  
  let y = toY;
  let ny = toY;
  const height1 = 0;
  const height2 = 0;
  const height3 = 0;
  
  const pointsCol = [];
	const walls = [];
  //calculate slope for each wall line here (slope m of each line segment)
  //const mls1 = ((toX - min + toY) - toY) / toX - min;
  //const mls11 = ((toX - min + toY + 1) - toY - 1) / toX - min;
  
  //pre-defined(hard coded for now) walls
  walls[0]=[], walls[1]=[], walls[2]=[], walls[3]=[], walls[4]=[], walls[5]=[];
  
  //keys are coords, value is properties object
  for (let x=min;x<toX;x++){
	  //first test wall
	  pointsCol[`${x}-${y}`] = {color:120, slope:90, _x:x, _y:y, _height:height1};
	  walls[0].push(pointsCol[`${x}-${y}`]);
	  pointsCol[`${x}-${y+1}`] = {color:120, slope:90, _x:x, _y:y+1, _height:height1};
	  walls[1].push(pointsCol[`${x}-${y+1}`]);
	  
	  //second test wall
	  pointsCol[`${x}-${toY}`] = {color:120, slope:90, _x:x, _y:toY, _height:height2};
	  walls[2].push(pointsCol[`${x}-${toY}`]);
	  pointsCol[`${x}-${toY+1}`] = {color:120, slope:90, _x:x, _y:toY+1, _height:height2};
	  walls[3].push(pointsCol[`${x}-${toY+1}`]);
	  
	  //third test wall(vertical)
	  pointsCol[`${min}-${ny}`] = {color:120, slope:90, _x:min, _y:ny, _height:height3};
	  walls[4].push(pointsCol[`${min}-${ny}`]);
	  pointsCol[`${min+1}-${ny}`] = {color:120, slope:90, _x:min+1, _y:ny, _height:height3};
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
	if(dtX===0) mSlope = 10;
	
	wall.forEach((point)=> point.slope=mSlope);	
  });
  
  const returnable = [];
  returnable[0] = walls;
  returnable[1] = pointsCol;

  return returnable;
}