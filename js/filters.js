var filters = {};

filters.applyFilter = function(mask) {
	let w = Drawer.originalImageCanvas.width;
	let h = Drawer.originalImageCanvas.height;
	let maskSize = Math.sqrt(mask.length);
	let offset = Math.floor(maskSize / 2);
	var newPixelData = [];
	for(let i = 0; i < Drawer.pixelData.length; i++) {	
		let currentPixels = [];
		for(let row = -offset; row <= offset; row++) {
			for(let col = -offset; col <= offset; col++) {
				let p = Drawer.pixelData[i + w*row + col] || 0;
				currentPixels.push(p);
			}
		}
		let res = 0;
		for (let j = 0; j < mask.length; j++) {
		  res += currentPixels[j] * mask[j];
		}	
		if(res > 255) {
			res = 255;
		}
		if(res < 0) {
			res = 0
		}
		newPixelData.push(res);
	}
	return newPixelData;
}

filters.mask = {
	sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
	blur: [0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625],
	outline: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
	emboss: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
	identity: [0, 0, 0, 0, 1, 0, 0, 0, 0],
	leftsobel: [1, 0, -1, 2, 0, -2, 1, 0, -1],
	rightsobel: [-1, 0, 1, -2, 0, 2, -1, 0, 1],
	bottomsobel: [-1, -2, -1, 0, 0, 0, 1, 2, 1],
	topsobel: [1, 2, 1, 0, 0, 0, -1, -2, -1]
};