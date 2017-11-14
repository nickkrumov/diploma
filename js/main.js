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
Drawer.selectedMask = [];
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
		
		let matrix = document.getElementById("matrix");
		matrix.style.top = (regionSize + h + margin + 40) + "px";
		matrix.style.visibility = "visible";

		let kernel = document.getElementById("kernel");
		kernel.style.top = (regionSize + h + margin + 40) + "px";
		kernel.style.left = w + 40 + "px";
		kernel.style.visibility = "visible";
		
		Drawer.originalImageCtx.drawImage(img,0,0, img.width, img.height, 0, 0, w, h);  
		obtainPixelData();
		Drawer.selectedRegionX = 0;
		Drawer.selectedRegionY = 0;
		render();
		Drawer.drawFilteredImage();
		Drawer.drawRegion(0, 0);
		Drawer.drawWindow(0, 0);
		Drawer.drawFilteredRegion(0, 0);
		checkMode();
	}
}

function showCustomFilterInput() {
	let inputs = $(".num");
	for (var i = 0; i < inputs.length; i++) {
		inputs.get(i).disabled = false;
	}
	
	let button = document.getElementById("custom_filter_button");
	button.style.visibility = "visible";
}
function hideCustomFilterInput() {
	let inputs = $(".num");
	for (var i = 0; i < inputs.length; i++) {
		inputs.get(i).disabled = true;
	}

	let button = document.getElementById("custom_filter_button");
	button.style.visibility = "hidden";
}
function applyCustomFilter() {
	Drawer.drawFilteredImage();
}

Drawer.drawFilteredImage = function() {
	let selectedFilterOption = document.getElementsByName("filters")[0].value;
	let mask = [];
	if(selectedFilterOption == "custom") {
		let inputs = $(".num");
		
		for (var i = 0; i < inputs.length; i++) {
			mask.push(parseFloat(inputs.get(i).value));
		} 
	}
	else {
		mask = filters.mask[selectedFilterOption];
	}
	console.log(mask);
	Drawer.selectedMask = mask;
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
	if(Drawer.enabledAutoMove) {
		Drawer.filteredRegionCtx.clearRect(0, 0, Drawer.filteredRegionCanvas.width, Drawer.filteredRegionCanvas.height);
	}
	else {
		Drawer.drawFilteredRegion(xIndex*Drawer.REGION_PIXEL_NUMBER, yIndex*Drawer.REGION_PIXEL_NUMBER);
	}
	
	Drawer.selectedRegionX = xIndex;
	Drawer.selectedRegionY = yIndex;
	Drawer.moveWindow(0, 0);
	render();
	checkMode();
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
Drawer.drawFilteredRegion = function(startX, startY) {
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
	
	let filteredPixelData = Drawer.filteredImageCtx.getImageData(startX, startY, Drawer.REGION_PIXEL_NUMBER, Drawer.REGION_PIXEL_NUMBER).data;
	let filteredArr = [];
	let c = 0;
	let sum = 0;
	
	for(let i = 0; i < filteredPixelData.length; i++) {
		if(c < 3) {
			sum += filteredPixelData[i];
			c++;
		}
		else {
			filteredArr.push(Math.round(sum/3));
			sum = 0;
			c = 0;
		}
	}
	
	this.filteredRegionCtx.beginPath();
	
	let x = 0;
	let y = 0;
	c = 0;
	for(let i = 0; i < filteredArr.length; i++) {
		let val = filteredArr[i];
		if(val == undefined || val == null) {
			console.log("nqma pixel na: " + i);
		}
		this.filteredRegionCtx.fillStyle = 'rgb(' + [val, val, val] + ')'
		this.filteredRegionCtx.fillRect(x, y, s, s);
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
	Drawer.extractMatrix(x, y);
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

Drawer.extractMatrix = function(x, y) {
	let w = Drawer.originalImageCanvas.width;
	let offsetX = x/Drawer.PIXEL_SIZE;
	let offsetY = y/Drawer.PIXEL_SIZE;
	let realX = offsetX + Drawer.selectedRegionX*Drawer.REGION_PIXEL_NUMBER;
	let realY = offsetY + Drawer.selectedRegionY*Drawer.REGION_PIXEL_NUMBER;
	let selectedPixel = realY*w + realX;
	let currentPixels = [];
	let offset = 1;
	// console.log("x:" + realX + ", y: " + realY + ", " + selectedPixel);
	for(let row = -offset; row <= offset; row++) {
		for(let col = -offset; col <= offset; col++) {
			let index = selectedPixel + w*row + col;
			let p = Drawer.pixelData[index] || 0;
			if(selectedPixel % w == 0 && col < 0) {
				p = 0;
			}
			if((selectedPixel % w == (w-1)) && col > 0) {
				p = 0;
			}
			currentPixels.push(Math.round(p));
		}
	}
	Drawer.updateMatrix(currentPixels, Drawer.selectedMask);
	Drawer.updateKernel(Drawer.selectedMask);
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
	clearInterval(Drawer.autoMoveInterval);
	var x = 0;
	var y = 0;
	var s = Drawer.PIXEL_SIZE;
	Drawer.autoMoveInterval = setInterval(function() {
		Drawer.moveWindow(x, y);
		Drawer.drawFilteredPixel(x, y);
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

Drawer.drawFilteredPixel = function(x, y) {
	let offsetX = x/Drawer.PIXEL_SIZE;
	let offsetY = y/Drawer.PIXEL_SIZE;
	let realX = offsetX + Drawer.selectedRegionX*Drawer.REGION_PIXEL_NUMBER;
	let realY = offsetY + Drawer.selectedRegionY*Drawer.REGION_PIXEL_NUMBER;
	let pixelData = Drawer.filteredImageCtx.getImageData(realX, realY, 1, 1).data;
	let val = (pixelData[0] + pixelData[1] + pixelData[2] ) / 3;
	this.filteredRegionWindowCtx.beginPath();
	this.filteredRegionCtx.fillStyle = 'rgb(' + [val, val, val] + ')'
	this.filteredRegionCtx.fillRect(x, y, Drawer.PIXEL_SIZE, Drawer.PIXEL_SIZE);
	this.filteredRegionWindowCtx.closePath();
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
	// let selectedFilterOption = document.getElementsByName("filters")[0].value;
	if(this.value == "custom") {
		showCustomFilterInput();
	}
	else {
		hideCustomFilterInput();
		Drawer.drawFilteredImage();
	}
}
document.getElementsByName("speed")[0].onchange = function() {
	Drawer.AUTO_MOVE_INTERVAL_TIME = this.value;
}

$('input[type=radio][name=mode]').change(function() {
	if (this.value == 'manual') {
		Drawer.enabledAutoMove = false;
	} else if (this.value == 'auto') {
		Drawer.enabledAutoMove = true;
    }
	checkMode();
});

// add or remove this listener depending on enabledAutoMove
//document.addEventListener( "keydown", Drawer.arrowMove, true);
//Drawer.autoMove(500);
//Drawer.init();

function checkMode() {
	if(Drawer.enabledAutoMove) {
		Drawer.autoMove(Drawer.AUTO_MOVE_INTERVAL_TIME);
		document.removeEventListener("keydown", Drawer.arrowMove, true);
	} else {
		clearInterval(Drawer.autoMoveInterval);
		document.addEventListener("keydown", Drawer.arrowMove, true);
	}
}

Drawer.updateMatrix = function(a, f) {
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

Drawer.updateKernel = function(arr) {
	let inputs = $(".num");

	for (var i = 0; i < inputs.length; i++) {
		inputs.get(i).value = arr[i];
	}
}