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
		vertices = vertices.map((vertex, index) => {
		  if (index % 2 === 0) {
			return vertex + v[0] - translateOrigin[0];
		  } else {
			return vertex + v[1] - translateOrigin[1];
		  }
		});
  
		translateOrigin[0] = v[0];
		translateOrigin[1] = v[1];
	  }
	};
  
	const dilateVertices = (scale) => {
	  if (copyVertices.length === 0) {
		copyVertices = vertices
	  }
  
	  vertices = copyVertices.map((vertex, index) => {
		if (index == 0) {
		  return vertex - cornerDistance[0] * (scale - 1);
		} else if (index == 1) {
		  return vertex - cornerDistance[1] * (scale - 1);
		} else if (index == 2) {
		  return vertex + cornerDistance[0] * (scale - 1);
		} else if (index == 3) {
		  return vertex + cornerDistance[1] * (scale - 1);
		}
	  });
  
	}
  
	const isObjectSelected = (v) => {
	  let orderedVertices = []
  
	  if (vertices[0] < vertices[2]) {
		orderedVertices[0] = vertices[0];
		orderedVertices[2] = vertices[2];
	  } else {
		orderedVertices[0] = vertices[2];
		orderedVertices[2] = vertices[0];
	  }
  
	  if (vertices[1] < vertices[3]) {
		orderedVertices[1] = vertices[1];
		orderedVertices[3] = vertices[3];
	  } else {
		orderedVertices[1] = vertices[3];
		orderedVertices[3] = vertices[1];
	  }
	  
	  if (v[0] > orderedVertices[0] && v[0] < orderedVertices[2] && v[1] > orderedVertices[1] && v[1] < orderedVertices[3]) {
		return true;
	  } else {
		return false;
	  }
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
	}
  }