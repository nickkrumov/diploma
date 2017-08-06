
var Drawer = {};
Drawer.bgCanvas = document.getElementById("background-canvas");
Drawer.oCanvas = document.getElementById("overlay-canvas");
Drawer.rCanvas = document.getElementById("region-canvas");
Drawer.wCanvas = document.getElementById("window-canvas");
Drawer.oCtx = Drawer.oCanvas.getContext("2d");
Drawer.bgCtx = Drawer.bgCanvas.getContext("2d");
Drawer.wCtx = Drawer.wCanvas.getContext("2d");
Drawer.rCtx = Drawer.rCanvas.getContext("2d");
Drawer.PIXEL_SIZE = 1;
Drawer.MAX_IMAGE_WIDTH = 240;
Drawer.REGION_PIXEL_NUMBER = 50;
Drawer.oCanvas.onmousemove = highlight;
Drawer.oCanvas.onmousedown = selectRegion;
Drawer.selectedRegionX = 0;
Drawer.selectedRegionY = 0;

Drawer.drawBg = function() {
	var bgImg = new Image();
	bgImg.src = "images/lion.jpg";
	bgImg.crossOrigin="anonymous";
	bgImg.onload = function(){ 
		let scale = Drawer.MAX_IMAGE_WIDTH/bgImg.width;
		if( scale > 1) {
			scale = 1;
		}
		let newW = bgImg.width*scale;
		let newH = bgImg.height*scale;
		newH = newH - newH % Drawer.PIXEL_SIZE;
		
		Drawer.bgCanvas.width = newW;
		Drawer.bgCanvas.height = newH;
		Drawer.oCanvas.width = newW;
		Drawer.oCanvas.height = newH;
		
		Drawer.bgCtx.drawImage(bgImg,0,0, bgImg.width, bgImg.height, 0, 0, newW, newH);  
		render();
		Drawer.drawRegion(0, 0);
	}
}
function render() {
	let w = Drawer.oCanvas.width;
	let h = Drawer.oCanvas.height;
    Drawer.oCtx.clearRect(0, 0, w, h);
	Drawer.oCtx.beginPath();
    
		
		let columns = Math.round(w/Drawer.REGION_PIXEL_NUMBER);
		let rows = Math.round(h/Drawer.REGION_PIXEL_NUMBER);
		
		for(var x = 0; x < columns; x++) {
			Drawer.oCtx.moveTo(x * Drawer.REGION_PIXEL_NUMBER, 0);
			Drawer.oCtx.lineTo(x * Drawer.REGION_PIXEL_NUMBER, h);
		}
		for(var y = 0; y < rows; y++) {
			Drawer.oCtx.moveTo(0, y * Drawer.REGION_PIXEL_NUMBER);
			Drawer.oCtx.lineTo(w, y * Drawer.REGION_PIXEL_NUMBER);
		}
		
		Drawer.oCtx.fillStyle = "rgba(255, 122, 64, 0.5)";
		Drawer.oCtx.fillRect(Drawer.selectedRegionX * Drawer.REGION_PIXEL_NUMBER,
                 Drawer.selectedRegionY * Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER);
				 
		Drawer.oCtx.strokeStyle="#FFFFFF";
		Drawer.oCtx.stroke();
}

function selectRegion(e) {
	let w = Drawer.oCanvas.width;
	let h = Drawer.oCanvas.height;

    var rect = Drawer.oCanvas.getBoundingClientRect(),
        mx = e.clientX - rect.left,
        my = e.clientY - rect.top,
        
        /// get index from mouse position
        xIndex = Math.round((mx - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER),
        yIndex = Math.round((my - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER);
		Drawer.drawRegion(xIndex*Drawer.REGION_PIXEL_NUMBER, yIndex*Drawer.REGION_PIXEL_NUMBER);
		
		Drawer.selectedRegionX = xIndex;
		Drawer.selectedRegionY = yIndex;
		
}
function highlight(e) {
	let w = Drawer.oCanvas.width;
	let h = Drawer.oCanvas.height;

    var rect = Drawer.oCanvas.getBoundingClientRect(),
        mx = e.clientX - rect.left,
        my = e.clientY - rect.top,
        
        /// get index from mouse position
        xIndex = Math.round((mx - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER),
        yIndex = Math.round((my - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER);

    render();
    Drawer.oCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    Drawer.oCtx.fillRect(xIndex * Drawer.REGION_PIXEL_NUMBER,
                 yIndex * Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER);

}

Drawer.scalePreserveAspectRatio = function(imgW,imgH,maxW,maxH){
  return(Math.min((maxW/imgW),(maxH/imgH)));
}

Drawer.drawRegion = function(startX, startY) {
	let s = this.PIXEL_SIZE;
	
	Drawer.rCanvas.width = s*Drawer.REGION_PIXEL_NUMBER;
	Drawer.rCanvas.height = s*Drawer.REGION_PIXEL_NUMBER;
	Drawer.wCanvas.height = s*Drawer.REGION_PIXEL_NUMBER;
	Drawer.wCanvas.width = s*Drawer.REGION_PIXEL_NUMBER;
	let pixelData = Drawer.bgCtx.getImageData(startX, startY, Drawer.REGION_PIXEL_NUMBER, Drawer.REGION_PIXEL_NUMBER).data;
	let realArr = [];
	let c = 0;
	let sum = 0;
	// pravilno po4ernqvane trqq da se napravi!
	for(let i = 0; i < pixelData.length; i++) {
		if(c < 3) {
			sum += pixelData[i];
			c++;
		}
		else {
			realArr.push(sum/3);
			sum = 0;
			c = 0;
		}
	}
	
	this.rCtx.beginPath();
	
	let x = 0;
	let y = 0;
	c = 0;
	for(let i = 0; i < realArr.length; i++) {
		let val = realArr[i];
		this.rCtx.fillStyle = 'rgb(' + [val, val, val] + ')'
		this.rCtx.fillRect(x, y, s, s);
		c++;
		if(c < Drawer.REGION_PIXEL_NUMBER) {
			x += s;
		}
		else {
			x = 0;
			y += s;
			c = 0;
		}
	}
	this.rCtx.closePath();
}
Drawer.window = {
	x: 0,
	y: 0
};
Drawer.drawWindow = function(x, y) {
	let s = this.PIXEL_SIZE;
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
	this.wCtx.clearRect(0, 0, this.wCanvas.width, this.wCanvas.height);
	this.drawWindow(x, y);
}

Drawer.randomBg = function() {
	let s = this.PIXEL_SIZE;
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
	let s = Drawer.PIXEL_SIZE;
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
Drawer.drawBg();
Drawer.drawWindow(60, 40);


function updateMatrix(a, f) {
	let cells = $(".cell");
	let filter = $(".filter_val");
	let res = document.getElementById("result_cell");
	let r = 0;
	let txt = "#fff";
	
	for (var i = 0; i < cells.length; i++) {
		let val = a[i] * f[i];
		r += val;
		
		if (a[i] > 255) { a[i] = 255; }
		if (a[i] > 130) { txt = "#000"; }
		
		cells.get(i).innerHTML = a[i];
		cells.get(i).style.backgroundColor = "rgb(" + [a[i], a[i], a[i]] + ")";
		cells.get(i).style.color = txt;
		filter.get(i).innerHTML = "x " + f[i];
		
		txt = "#fff";
	}
	
	if (r > 130) { txt = "#000"; }
	
	res.innerHTML = r;
	res.style.backgroundColor = "rgb(" + [r, r, r] + ")";
	res.style.color = txt;
}

updateMatrix([10,10,10,80,160,2,4,4,45],[1,1,1,2,2,2,-3,3,-6]);
