var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = 934;
canvas.height = 622;


var background = new Image();
background.src = "images/lion,jpg";

background.onload = function(){
    ctx.drawImage(background,0,0);   
	var pixelData = canvas.getContext('2d').getImageData(34, 34, 1, 1).data;
	console.log(pixelData);
}

var canvas2 = document.getElementById("canvas2"),
    ctx2 = canvas2.getContext("2d");

canvas2.width = 300;
canvas2.height = 300;
ctx2.fillStyle = "#FF0000";
ctx2.fillRect(0,0,150,75);
