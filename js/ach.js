function generateACH(mask) {
	var a = mask[0],
		b = mask[1],
		c = mask[2],
		d = mask[3],
		e = mask[4],
		f = mask[5],
		g = mask[6],
		h = mask[7],
		k = mask[8];
		
	var Wm = [];

	for (var i = -Math.PI; i <= Math.PI; i += 0.1) {
		Wm.push(i);
	}

	var x = [];
	for (var i = 0; i < 63; i++) {
		x[i] = new Array();
		for (var j = -Math.PI; j <= Math.PI; j += 0.1) {
			x[i].push(j);
		}
	}

	function transpose(a) {
		return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
		// or in more modern dialect
		// return a[0].map((_, c) => a.map(r => r[c]));
	}

	var y = transpose(x);

	x = math.matrix(x);
	y = math.matrix(y);

	var r1 = math.multiply(a, math.cos(math.add(x, y)));
	var r2 = math.multiply(b, math.cos(y));
	var r3 = math.multiply(c, math.cos(math.subtract(x, y)));
	var r4 = math.multiply(d, math.cos(x));
	var r5 = e;
	var r6 = math.multiply(f, math.cos(x));
	var r7 = math.multiply(g, math.cos(math.subtract(x, y)));
	var r8 = math.multiply(h, math.cos(y));
	var r9 = math.multiply(k, math.cos(math.add(x, y)));

	var r = math.add(r1, r2, r3, r4, r5, r6, r7, r8, r9);

	var i1 = math.multiply(-1, a, math.sin(math.add(x, y)));
	var i2 = math.multiply(-1, b, math.sin(y));
	var i3 = math.multiply(c, math.sin(math.subtract(x, y)));
	var i4 = math.multiply(-1, d, math.sin(x));
	var i6 = math.multiply(f, math.sin(x));
	var i7 = math.multiply(-1, g, math.sin(math.subtract(x, y)));
	var i8 = math.multiply(h, math.sin(y));
	var i9 = math.multiply(k, math.sin(math.add(x, y)));

	var i = math.add(i1, i2, i3, i4, i6, i7, i8, i9);

	var m = (math.sqrt(math.add(math.dotMultiply(r, r),math.dotMultiply(i, i))));

	Wn = Wm;

	//______________________________________________________________________________________

	// Create and populate a data table.
		var data = new vis.DataSet();
		var counter = 0;
		var axisMax = 4;
		var axisMin = -4;

		for (var i = 0;  i < Wm.length; i ++) {
			var x = Wm[i];
			for (var j = 0; j < Wm.length; j++) {
				var y = Wn[j];
				var value = m._data[i][j];
				data.add({id:counter++,x:x,y:y,z:value,style:value});
			}
		}
		console.log(data);

		// specify options
		var options = {
			width:  '500px',
			height: '552px',
			style: 'grid', //'surface'
			showPerspective: true,
			showGrid: true,
			showShadow: false,
			keepAspectRatio: true,
			verticalRatio: 0.5
		};

		// Instantiate the graph object.
		var container = document.getElementById('visualization');
		var graph3d = new vis.Graph3d(container, data, options);
}
generateACH(window.opener.Drawer.selectedMask);
//generateACH([-1, -1, -1, -1, 8, -1, -1, -1, -1]);