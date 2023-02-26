export const Polygon = (gl, program) => {
	let vertices = [];
	let copyVertices = [];
	
	let cornerDistance = 0;
	let colors = [];
	let selectedColors = [
	  { r: 0, g: 0, b: 0 },
	  { r: 0, g: 0, b: 0 },
	];
  
	let translateOrigin = [];
  
	for (let i = 0; i < selectedColors.length; i++) {
	  colors.push(selectedColors[i].r);
	  colors.push(selectedColors[i].g);
	  colors.push(selectedColors[i].b);
	}
  
	const getVertices = () => vertices;
	const setVertices = (v) => vertices = v;
	const getColors = () => colors;
	const setColors = (c) => colors = c;
	const getShape = () => "polygon";
  
	const addVertices = (centerPoint, sides) => {
	  const tempVertices = calculatePolygonVertices(sides, 0.2, centerPoint)
	  for (let i=0; i<tempVertices.length; i++){
		vertices[i] = tempVertices[i]
	  }
	};

	const addNewVertex = (v) => {
		vertices.push[v]
	}

	const deleteVertex = (idx) => {
		vertices.splice(idx)
	}
	
	/*
	Fungsi untuk mengembalikan vertices polygon yang simetris
	*/
	function calculatePolygonVertices(n, radius, center) {
		const tempVertices = []
		const angle = (2 * Math.PI) / n;
		
		for (let i = 0; i < n; i++) {
		  const x = center[0] + radius * Math.cos(i * angle);
		  const y = center[1] + radius * Math.sin(i * angle);
		  tempVertices.push([x, y]);
		}
		return tempVertices;
	}

	const updateVertices = (newVertex, idx) => {
		vertices[idx] = newVertex;
	}

	function isInRangeCorner(vAcuan,vtarget){
		// range yang dipakai adalah 0.2
		return (vtarget[0] <= vAcuan[0] + 0.2 && vtarget[0] >= vAcuan[0] - 0.2) && (vtarget[1] <= vAcuan[1] + 0.2 && vtarget[1] >= vAcuan[1] - 0.2)
	}

	function nearestVertex(v){
		for (let i = 0; i < vertices.length; i++){
			if(isInRangeCorner(vertices[i], v)){
				return [true, i]
			}
		}
		return [false, -1]
	}
	
	const addColors = (changeColor) => {
	  colors = [];
	  
	  for (let i = 0; i < changeColor.length; i++) {
		colors.push(changeColor[i].r);
		colors.push(changeColor[i].g);
		colors.push(changeColor[i].b);
	  }
	}
  
	const translateVertices = (v) => {
		if (translateOrigin.length === 0) {
			translateOrigin[0] = v[0];
			translateOrigin[1] = v[1];
		} else {
			for(let i = 0; i<vertices.length; i++){
				for(let j=0; j<vertices[i].length; j++){
					vertices[i][j] = vertices[i][j] + v[j] - translateOrigin[j]; 
				}
			}
			translateOrigin[0] = v[0];
			translateOrigin[1] = v[1];
		}
	};
	// Masih ngebug, bingung
	const dilateVertices = (scale) => {
		if (copyVertices.length === 0) {
			copyVertices = vertices
		}
		const center = copyVertices.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]).map(val => val / copyVertices.length);
		console.log(copyVertices);
		console.log("HMM");
		for(let i = 0; i < copyVertices.length; i++){
			for(let j=0; j < copyVertices[i].length; j++){
				vertices[i][j] = center[j] + (copyVertices[i][j] - center[j]) * scale
				console.log(vertices[i][j]);
			}
		}
	}

	function isPointInsidePolygon(point) {
	// point adalah titik koordinat dalam format [x, y]
	// polygon adalah array yang berisi titik sudut poligon dalam format [[x1, y1], [x2, y2], [x3, y3], ..., [xn, yn]]
	
	// Menghitung jumlah sudut pada poligon
	const numVertices = vertices.length;
	
	// Menginisialisasi variabel penampung
	let inside = false;
	
	// Menghitung koordinat sudut terakhir
	let lastVertex = vertices[numVertices - 1];
	let lastX = lastVertex[0];
	let lastY = lastVertex[1];
	
	// Melakukan perulangan untuk setiap sudut poligon
	for (let i = 0; i < numVertices; i++) {
		let currentVertex = vertices[i];
		let currentX = currentVertex[0];
		let currentY = currentVertex[1];
		
		// Memeriksa apakah titik koordinat berada pada garis yang menghubungkan dua sudut poligon
		if ((currentY > point[1]) != (lastY > point[1]) &&
			point[0] < ((lastX - currentX) * (point[1] - currentY)) / (lastY - currentY) + currentX) {
		inside = !inside;
		}
		
		// Menyimpan sudut terakhir
		lastX = currentX;
		lastY = currentY;
  	}
	// Mengembalikan boolean apakah titik koordinat berada di dalam area poligon atau tidak
	return inside;
}
  
	const isObjectSelected = (v) => {
	  return isPointInsidePolygon(v)
	}
  
	const cleanTempData = () => {
	  copyVertices = [];
	  translateOrigin = [];
	}
  
	const draw = () => {
		const polygonVertices = []
		for(let i=0; i<vertices.length; i++){
			//console.log(vertices[i][0],vertices[i][1]);
			polygonVertices.push(vertices[i][0])
			polygonVertices.push(vertices[i][1])
		}
		// Create a vertex buffer
		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(
			gl.ARRAY_BUFFER,
			new Float32Array(polygonVertices),
			gl.STATIC_DRAW
		);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		const colorBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	
		// Enable the vertex buffer
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		const coordinates = gl.getAttribLocation(program, "coordinates");
		gl.vertexAttribPointer(coordinates, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(coordinates);
	
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		const programColor = gl.getAttribLocation(program, "color");
		gl.vertexAttribPointer(programColor, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(programColor);
	
		// Draw the polygon
		gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices.length);
	}
  
	return {
	  isObjectSelected,
	  cleanTempData,
	  getVertices,
	  getColors,
	  getShape,
	  setVertices,
	  setColors,
	  addVertices,
	  dilateVertices,
	  draw,
	  addColors,
	  translateVertices,
	  updateVertices,
	  nearestVertex,
	  deleteVertex,
	  addNewVertex,
	}
  }