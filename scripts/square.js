export const Square = (gl, program) => {
  let vertices = [];
  let halfSide = 0.1;

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
  const getShape = () => "square";

  const getSize = () => halfSide * 2;
  const setSize = (size) => {
    halfSide = size / 2000;
  }

  const addVertices = (vertex) => {
    vertices[0] = vertex[0];
    vertices[1] = vertex[1];
  }

	const updateVertices = (newVertex, idx) => {
		vertices[idx] = newVertex[0];
    vertices[idx + 1] = newVertex[1];
	}

	function isInRangeCorner(vAcuan,vtarget){
		return (vtarget[0] <= vAcuan[0] + 0.05 && vtarget[0] >= vAcuan[0] - 0.05) && (vtarget[1] <= vAcuan[1] + 0.05 && vtarget[1] >= vAcuan[1] - 0.05)
	}

	function nearestVertex(v){
		for (let i = 0; i < vertices.length; i += 2){
			if(isInRangeCorner([vertices[i], vertices[i + 1]], v)){
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
    halfSide = 0.1 * scale;
  }

  const cleanTempData = () => {
    translateOrigin = [];
  }

  const isObjectSelected = (vertex) => {
    if (vertex[0] >= vertices[0] - halfSide &&
        vertex[0] <= vertices[0] + halfSide &&
        vertex[1] >= vertices[1] - halfSide &&
        vertex[1] <= vertices[1] + halfSide) {
      return true;
    } else {
      return false;
    }
  }

  const draw = () => {
    const squareVertices = [
      vertices[0] - halfSide,
      vertices[1] - halfSide,
      vertices[0] + halfSide,
      vertices[1] - halfSide,
      vertices[0] + halfSide,
      vertices[1] + halfSide,
      vertices[0] - halfSide,
      vertices[1] + halfSide,
    ];
    
    // Create a vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(squareVertices),
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

    // Draw the square
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  return {
    getSize,
    setSize,
    isObjectSelected,
    cleanTempData,
    getVertices,
    getColors,
    getShape,
    setVertices,
    setColors,
    addColors,
    addVertices,
    dilateVertices,
    draw,
    translateVertices,
    updateVertices,
    nearestVertex
  }
}