var Drawer = {};
/* Canvas initialization */
Drawer.originalImageCanvas = document.getElementById("original-image-canvas");
Drawer.originalImageOverlayCanvas = document.getElementById("original-image-overlay-canvas");

Drawer.filteredImageCanvas = document.getElementById("filtered-image-canvas");

Drawer.originalRegionCanvas = document.getElementById("original-region-canvas");
Drawer.originalRegionWindowCanvas = document.getElementById("original-region-window-canvas");

Drawer.filteredRegionCanvas = document.getElementById("filtered-region-canvas");
Drawer.filteredRegionWindowCanvas = document.getElementById("filtered-region-window-canvas");

Drawer.originalImageCtx = Drawer.originalImageCanvas.getContext("2d");
Drawer.originalImageOverlayCtx = Drawer.originalImageOverlayCanvas.getContext("2d");

Drawer.filteredImageCtx = Drawer.filteredImageCanvas.getContext("2d");

Drawer.originalRegionCtx = Drawer.originalRegionCanvas.getContext("2d");
Drawer.originalRegionWindowCtx = Drawer.originalRegionWindowCanvas.getContext("2d");

Drawer.filteredRegionCtx = Drawer.filteredRegionCanvas.getContext("2d");
Drawer.filteredRegionWindowCtx = Drawer.filteredRegionWindowCanvas.getContext("2d");

/* Constants */
Drawer.PIXEL_SIZE = 10;
Drawer.MAX_IMAGE_WIDTH = 400;
Drawer.REGION_PIXEL_NUMBER = 40;
Drawer.AUTO_MOVE_INTERVAL_TIME = 10;

/* Global state */
Drawer.pixelData = [];
Drawer.windowPixelW = Drawer.REGION_PIXEL_NUMBER;
Drawer.windowPixelH = Drawer.REGION_PIXEL_NUMBER;
Drawer.selectedRegionX = 0;
Drawer.selectedRegionY = 0;
Drawer.enabledAutoMove = false;
Drawer.imgSrc = null;

Drawer.originalImageOverlayCanvas.onmousemove = highlight;
Drawer.originalImageOverlayCanvas.onmousedown = selectRegion;

Drawer.init = function() {
	var img = new Image();
	img.src = Drawer.imgSrc;
	img.crossOrigin="anonymous";
	img.onload = function(){ 
		let scale = Drawer.MAX_IMAGE_WIDTH/img.width;
		if( scale > 1) {
			scale = 1;
		}
		let w = img.width*scale;
		let h = img.height*scale;
		h = h - h % Drawer.PIXEL_SIZE;
		
		Drawer.originalImageCanvas.width = w;
		Drawer.originalImageCanvas.height = h;
		
		Drawer.originalImageOverlayCanvas.width = w;
		Drawer.originalImageOverlayCanvas.height = h;
		
		Drawer.filteredImageCanvas.width = w;
		Drawer.filteredImageCanvas.height = h;
		
		let regionSize = Drawer.PIXEL_SIZE*Drawer.REGION_PIXEL_NUMBER;
		
		Drawer.originalRegionCanvas.width = regionSize;
		Drawer.originalRegionCanvas.height = regionSize;
		
		Drawer.originalRegionWindowCanvas.height = regionSize;
		Drawer.originalRegionWindowCanvas.width = regionSize;
		
		Drawer.filteredRegionCanvas.width = regionSize;
		Drawer.filteredRegionCanvas.height = regionSize;
		
		Drawer.filteredRegionWindowCanvas.height = regionSize;
		Drawer.filteredRegionWindowCanvas.width = regionSize;
		
		let margin = 100;
		
		Drawer.originalImageCanvas.style.top = margin + "px";
		//Drawer.originalImageCanvas.style.left = margin + "px";
		
		Drawer.originalImageOverlayCanvas.style.top = margin + "px";
		//Drawer.originalImageOverlayCanvas.style.left = margin + "px";
		
		Drawer.filteredImageCanvas.style.top = margin + "px";
		Drawer.filteredImageCanvas.style.left = (w + /*margin*/ + 50) + "px";
		
		Drawer.originalRegionCanvas.style.top = (h + margin + 20) + "px";
		//Drawer.originalRegionCanvas.style.left = margin + "px";
		
		Drawer.originalRegionWindowCanvas.style.top = (h + margin + 20) + "px";
		//Drawer.originalRegionWindowCanvas.style.left = margin + "px";
		
		Drawer.filteredRegionCanvas.style.top = (h + margin + 20) + "px";
		Drawer.filteredRegionCanvas.style.left = (regionSize + /*margin*/ + 50) + "px";
		
		Drawer.filteredRegionWindowCanvas.style.top = (h + margin + 20) + "px";
		Drawer.filteredRegionWindowCanvas.style.left = (regionSize + /*margin*/ + 50) + "px";
		
		Drawer.originalImageCtx.drawImage(img,0,0, img.width, img.height, 0, 0, w, h);  
		obtainPixelData();
		Drawer.selectedRegionX = 0;
		Drawer.selectedRegionY = 0;
		render();
		Drawer.drawRegion(0, 0);
		Drawer.drawWindow(0, 0);
		Drawer.drawFilteredImage();
	}
}

Drawer.drawFilteredImage = function() {
	let selecteFilterOption = document.getElementsByName("filters")[0].value;
	let mask = filters.mask[selecteFilterOption];
	let data = filters.applyFilter(mask);
	let newData = [];
	for(let i = 0; i < data.length; i++) {
		let val = data[i];
		newData.push(val);
		newData.push(val);
		newData.push(val);
		newData.push(255);
	}
	var imageData = Drawer.originalImageCtx.getImageData(0, 0, Drawer.originalImageCanvas.width, Drawer.originalImageCanvas.height);
	var d = imageData.data;
	
	for(let i = 0; i < d.length; i++) {
		d[i] = newData[i];
	}
	Drawer.filteredImageCtx.putImageData(imageData, 0, 0);
}

function obtainPixelData() {
	var imageData = Drawer.originalImageCtx.getImageData(0, 0, Drawer.originalImageCanvas.width, Drawer.originalImageCanvas.height);
	console.log(imageData);
        var data = imageData.data;
		Drawer.pixelData = []; //resets pixelData
		// convert to grayscale
        for(var i = 0; i < data.length; i += 4) {
          var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
          // red
          data[i] = brightness;
          // green
          data[i + 1] = brightness;
          // blue
          data[i + 2] = brightness;
		  Drawer.pixelData.push(brightness);
        }
	Drawer.originalImageCtx.putImageData(imageData, 0, 0);
}
function render() {
	let w = Drawer.originalImageOverlayCanvas.width;
	let h = Drawer.originalImageOverlayCanvas.height;
    Drawer.originalImageOverlayCtx.clearRect(0, 0, w, h);
	Drawer.originalImageOverlayCtx.beginPath();
    
		
		let columns = Math.ceil(w/Drawer.REGION_PIXEL_NUMBER);
		let rows = Math.ceil(h/Drawer.REGION_PIXEL_NUMBER);
		for(var x = 0; x < columns; x++) {
			Drawer.originalImageOverlayCtx.moveTo(x * Drawer.REGION_PIXEL_NUMBER, 0);
			Drawer.originalImageOverlayCtx.lineTo(x * Drawer.REGION_PIXEL_NUMBER, h);
		}
		for(var y = 0; y < rows; y++) {
			Drawer.originalImageOverlayCtx.moveTo(0, y * Drawer.REGION_PIXEL_NUMBER);
			Drawer.originalImageOverlayCtx.lineTo(w, y * Drawer.REGION_PIXEL_NUMBER);
		}
		
		Drawer.originalImageOverlayCtx.fillStyle = "rgba(255, 122, 64, 0.5)";
		Drawer.originalImageOverlayCtx.fillRect(Drawer.selectedRegionX * Drawer.REGION_PIXEL_NUMBER,
                 Drawer.selectedRegionY * Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER);
				 
		Drawer.originalImageOverlayCtx.strokeStyle="#FFF";
		Drawer.originalImageOverlayCtx.stroke();
}

function selectRegion(e) {
	let w = Drawer.originalImageOverlayCanvas.width;
	let h = Drawer.originalImageOverlayCanvas.height;

    var rect = Drawer.originalImageOverlayCanvas.getBoundingClientRect(),
        mx = e.clientX - rect.left,
        my = e.clientY - rect.top,
        
	/// get index from mouse position
	xIndex = Math.round((mx - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER),
	yIndex = Math.round((my - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER);
	Drawer.drawRegion(xIndex*Drawer.REGION_PIXEL_NUMBER, yIndex*Drawer.REGION_PIXEL_NUMBER);
	
	Drawer.selectedRegionX = xIndex;
	Drawer.selectedRegionY = yIndex;
	Drawer.moveWindow(0, 0);
	if(Drawer.enabledAutoMove) {
		Drawer.autoMove(Drawer.AUTO_MOVE_INTERVAL_TIME);
	}
}
function highlight(e) {
	let w = Drawer.originalImageOverlayCanvas.width;
	let h = Drawer.originalImageOverlayCanvas.height;

    var rect = Drawer.originalImageOverlayCanvas.getBoundingClientRect(),
        mx = e.clientX - rect.left,
        my = e.clientY - rect.top,
        
        /// get index from mouse position
        xIndex = Math.round((mx - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER),
        yIndex = Math.round((my - Drawer.REGION_PIXEL_NUMBER * 0.5) / Drawer.REGION_PIXEL_NUMBER);

    render();
    Drawer.originalImageOverlayCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
    Drawer.originalImageOverlayCtx.fillRect(xIndex * Drawer.REGION_PIXEL_NUMBER,
                 yIndex * Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER,
                 Drawer.REGION_PIXEL_NUMBER);

}

Drawer.scalePreserveAspectRatio = function(imgW,imgH,maxW,maxH){
  return(Math.min((maxW/imgW),(maxH/imgH)));
}

Drawer.drawRegion = function(startX, startY) {
	let s = this.PIXEL_SIZE;
	let origW = Drawer.originalImageCanvas.width;
	let origH = Drawer.originalImageCanvas.height;
	if(startX + Drawer.REGION_PIXEL_NUMBER > origW) {
		Drawer.windowPixelW = Drawer.REGION_PIXEL_NUMBER - ((startX + Drawer.REGION_PIXEL_NUMBER) - origW);
	}
	else {
		Drawer.windowPixelW = Drawer.REGION_PIXEL_NUMBER;
	}
	
	if(startY + Drawer.REGION_PIXEL_NUMBER > origH) {
		Drawer.windowPixelH = Drawer.REGION_PIXEL_NUMBER - ((startY + Drawer.REGION_PIXEL_NUMBER) - origH);
	}
	else {
		Drawer.windowPixelH = Drawer.REGION_PIXEL_NUMBER;
	}
	console.log(Drawer.windowPixelW)
	console.log(Drawer.windowPixelH)
	
	let pixelData = Drawer.originalImageCtx.getImageData(startX, startY, Drawer.REGION_PIXEL_NUMBER, Drawer.REGION_PIXEL_NUMBER).data;
	let realArr = [];
	let c = 0;
	let sum = 0;
	for(let i = 0; i < pixelData.length; i++) {
		if(c < 3) {
			sum += pixelData[i];
			c++;
		}
		else {
			realArr.push(Math.round(sum/3));
			sum = 0;
			c = 0;
		}
	}
	
	this.originalRegionCtx.beginPath();
	
	let x = 0;
	let y = 0;
	c = 0;
	for(let i = 0; i < realArr.length; i++) {
		let val = realArr[i];
		if(val == undefined || val == null) {
			console.log("nqma pixel na: " + i);
		}
		this.originalRegionCtx.fillStyle = 'rgb(' + [val, val, val] + ')'
		this.originalRegionCtx.fillRect(x, y, s, s);
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
	this.originalRegionCtx.closePath();
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
	this.originalRegionWindowCtx.beginPath();
	for (let i = 0; i < 3; i++, drawX += s) {
		let drawY = y-s;	
		for (let z = 0; z < 3; z++, drawY += s) {
			if(drawX < 0 || drawX > this.originalRegionWindowCanvas.width) {
				continue;
			}
			if(drawY < 0 || drawY > this.originalRegionWindowCanvas.height) {
				continue;
			}
			this.originalRegionWindowCtx.rect(drawX,drawY,s,s);
		}
	}
	this.originalRegionWindowCtx.closePath();
	this.originalRegionWindowCtx.strokeStyle="#FF0000";
	this.originalRegionWindowCtx.stroke();
	
	this.filteredRegionWindowCtx.beginPath();
	this.filteredRegionWindowCtx.rect(x,y,s,s);
	this.filteredRegionWindowCtx.closePath();
	this.filteredRegionWindowCtx.strokeStyle="#FF0000";
	this.filteredRegionWindowCtx.stroke();
}

Drawer.moveWindow = function(x, y) {
	this.originalRegionWindowCtx.clearRect(0, 0, this.originalRegionWindowCanvas.width, this.originalRegionWindowCanvas.height);
	this.filteredRegionWindowCtx.clearRect(0, 0, this.filteredRegionWindowCanvas.width, this.filteredRegionWindowCanvas.height);
	this.drawWindow(x, y);
}

Drawer.randomBg = function() {
	let s = this.PIXEL_SIZE;
	this.originalImageCtx.beginPath();
	for(let x = 0; x < this.originalImageCanvas.width; x+=s) {
		for(let y = 0; y < this.originalImageCanvas.height; y+=s) {
			let val = Math.floor(Math.random() * 256);
			this.originalImageCtx.fillStyle = 'rgb(' + [val, val, val] + ')'
			this.originalImageCtx.fillRect(x, y, s, s);
		}
	}
	this.originalImageCtx.closePath();
}

Drawer.arrowMove = function(e) {
	let s = Drawer.PIXEL_SIZE;
	let x = Drawer.window.x;
	let y = Drawer.window.y;
	// A
	if(e.keyCode == 65) {	
		if(x > 0) {
			Drawer.moveWindow(x-s, y);
		}
	}
	// D
	if(e.keyCode == 68) {	
		if(x < Drawer.windowPixelW*s-s) {
			Drawer.moveWindow(x+s, y);
		}
	}
	
	// W
	if(e.keyCode == 87) {	
		if(y > 0) {
			Drawer.moveWindow(x, y-s);
		}
	}
	// S
	if(e.keyCode == 83) {	
		if(y < Drawer.windowPixelH*s-s) {
			Drawer.moveWindow(x, y+s);
		}
	}
}
Drawer.autoMove = function(time) {
	//TODO: disable arrow move!!!
	clearInterval(Drawer.autoMoveInterval);
	var x = 0;
	var y = 0;
	var s = Drawer.PIXEL_SIZE;
	Drawer.autoMoveInterval = setInterval(function() {
		console.log("move");
		Drawer.moveWindow(x, y);
		if(y >= Drawer.windowPixelH*s - s && x >= Drawer.windowPixelW*s - s) {
			clearInterval(Drawer.autoMoveInterval);
		}
		if(x >= Drawer.windowPixelW*s - s) {
			y += s;
			x = 0;
		}
		else {
			x += s;
		}
	}, time);
}

function loadImg(input) {
	if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
			Drawer.imgSrc = e.target.result;
			Drawer.init();
        }
        reader.readAsDataURL(input.files[0]);
    }
}

document.getElementById("img_upload").onchange = function() {
	loadImg(this);
}

document.getElementsByName("filters")[0].onchange = function() {
	Drawer.drawFilteredImage();
}

// add or remove this listener depending on enabledAutoMove
document.addEventListener( "keydown", Drawer.arrowMove, true);
//Drawer.autoMove(500);
//Drawer.init();


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