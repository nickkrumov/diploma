
var Drawer = {};
Drawer.bgCanvas = document.getElementById("background-canvas");
Drawer.wCanvas = document.getElementById("window-canvas");
Drawer.bgCtx = Drawer.bgCanvas.getContext("2d");
Drawer.wCtx = Drawer.wCanvas.getContext("2d");
Drawer.pixelSize = 10;

Drawer.bgCanvas.width = 270;
Drawer.bgCanvas.height = 330;
Drawer.wCanvas.width = 270;
Drawer.wCanvas.height = 330;

Drawer.drawBg = function() {
	var bgImg = new Image();
	bgImg.src = "images/charlie_grayscale.jpg";
	bgImg.crossOrigin="anonymous";

	bgImg.onload = function(){
		Drawer.bgCtx.drawImage(bgImg,0,0);   
	}
}

Drawer.drawWindow = function(x, y) {
	let s = this.pixelSize;
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
	this.wCtx.clearRect(0, 0, this.wCanvas.width, this.wCanvas.height);
	this.drawWindow(x, y);
}

Drawer.exampleBg = function() {
	
}

Drawer.drawBg();
Drawer.drawWindow(60, 40);
setTimeout(function() {
	Drawer.moveWindow(111, 55);
}, 1000);
setTimeout(function() {
	Drawer.moveWindow(1, 55);
}, 2000);
