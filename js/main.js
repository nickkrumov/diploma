var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = 934;
canvas.height = 622;


var background = new Image();
background.src = "images/charlie_grayscale.jpg";
background.crossOrigin="anonymous";

background.onload = function(){
    ctx.drawImage(background,0,0);   
	var pixelData = ctx.getImageData(166, 44, 1, 1).data;
	console.log(pixelData);
}

var canvas2 = document.getElementById("canvas2"),
    ctx2 = canvas2.getContext("2d");

canvas2.width = 300;
canvas2.height = 300;
ctx2.fillStyle = "#FF0000";
ctx2.fillRect(0,0,22,22);
