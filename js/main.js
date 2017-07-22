
var Drawer = {};
Drawer.bgCanvas = document.getElementById("background-canvas");
Drawer.wCanvas = document.getElementById("window-canvas");
Drawer.bgCtx = Drawer.bgCanvas.getContext("2d");
Drawer.wCtx = Drawer.wCanvas.getContext("2d");
Drawer.pixelSize = 20;

Drawer.bgCanvas.width = 300;
Drawer.bgCanvas.height = 300;
Drawer.wCanvas.width = 300;
Drawer.wCanvas.height = 300;

Drawer.drawBg = function() {
	var bgImg = new Image();
	bgImg.src = "images/charlie_grayscale.jpg";
	bgImg.crossOrigin="anonymous";

	bgImg.onload = function(){
		Drawer.bgCtx.drawImage(bgImg,0,0);   
	}
}

Drawer.window = {
	x: 0,
	y: 0
};
Drawer.drawWindow = function(x, y) {
	let s = this.pixelSize;
	x = x - x%s;	
	y = y - y%s;
	this.window.x = x;
	this.window.y = y;
	let drawX = x-s;
	this.wCtx.beginPath();
	for (let i = 0; i < 3; i++, drawX += s) {
		let drawY = y-s;	
		for (let z = 0; z < 3; z++, drawY += s) {
			if(drawX < 0 || drawX > this.wCanvas.width) {
				continue;
			}
			if(drawY < 0 || drawY > this.wCanvas.height) {
				continue;
			}
			this.wCtx.rect(drawX,drawY,s,s);
		}
	}
	this.wCtx.closePath();
	this.wCtx.strokeStyle="#FF0000";
	this.wCtx.stroke();
}

Drawer.moveWindow = function(x, y) {
	console.log("move x: " + x + ", y: " + y);
	this.wCtx.clearRect(0, 0, this.wCanvas.width, this.wCanvas.height);
	this.drawWindow(x, y);
}

Drawer.randomBg = function() {
	let s = this.pixelSize;
	this.bgCtx.beginPath();
	for(let x = 0; x < this.bgCanvas.width; x+=s) {
		for(let y = 0; y < this.bgCanvas.height; y+=s) {
			let val = Math.floor(Math.random() * 256);
			this.bgCtx.fillStyle = 'rgb(' + [val, val, val] + ')'
			this.bgCtx.fillRect(x, y, s, s);
		}
	}
	this.bgCtx.closePath();
}

Drawer.arrowMove = function(e) {
	console.log(Drawer.window.x);
	let s = Drawer.pixelSize;
	let x = Drawer.window.x;
	let y = Drawer.window.y;
	// left arrow
	if(e.keyCode == 37) {	
		if(x > 0) {
			Drawer.moveWindow(x-s, y);
		}
	}
	// right arrow
	if(e.keyCode == 39) {	
		if(x < Drawer.wCanvas.width-s) {
			Drawer.moveWindow(x+s, y);
		}
	}
	
	// up arrow
	if(e.keyCode == 38) {	
		if(y > 0) {
			Drawer.moveWindow(x, y-s);
		}
	}
	// down arrow
	if(e.keyCode == 40) {	
		if(y < Drawer.wCanvas.height-s) {
			Drawer.moveWindow(x, y+s);
		}
	}
}
document.addEventListener( "keydown", Drawer.arrowMove, true);

Drawer.randomBg();
Drawer.drawWindow(60, 40);
