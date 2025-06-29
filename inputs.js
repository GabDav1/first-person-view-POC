export let upArrowPressed = false; //has up been pressed - default state false
export let downArrowPressed = false; //has down been pressed - default state false
export let leftArrowPressed = false; //has left key been pressed - default state false
export let rightArrowPressed = false; //has right key been pressed - default state false

export function bindListener(){
	document.body.addEventListener("keydown", keyDown); //press key
	document.body.addEventListener("keyup", keyUp); //release key
}

export function keyDown(event){
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

export function keyUp(event){
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
