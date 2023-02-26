export const Line = (gl, program) => {
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
  const getShape = () => "line";

  const getSize = () => Math.sqrt(Math.pow(cornerDistance[0], 2) + Math.pow(cornerDistance[1], 2));
  const setSize = (size) => {
    const scale = size / getSize();
    dilateVertices(scale / 1000);
  }

  const addVertices = (vertex) => {
    if (vertices.length === 0) {
      vertices[0] = vertex[0];
      vertices[1] = vertex[1];
    } else {
      vertices[2] = vertex[0];
      vertices[3] = vertex[1];

      cornerDistance = [vertices[2] - vertices[0], vertices[3] - vertices[1]];
    }
  };

  const addColors = (color) => {
    colors = [];

    for (let i = 0; i < vertices.length / 2; i++) {
      colors.push(color[i].r);
      colors.push(color[i].g);
      colors.push(color[i].b);
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
        return vertex - cornerDistance[0] * (scale - 1) / 2;
      } else if (index == 1) {
        return vertex - cornerDistance[1] * (scale - 1) / 2;
      } else if (index == 2) {
        return vertex + cornerDistance[0] * (scale - 1) / 2;
      } else if (index == 3) {
        return vertex + cornerDistance[1] * (scale - 1) / 2;
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

    const x1 = orderedVertices[0];
    const y1 = orderedVertices[1];
    const x2 = orderedVertices[2];
    const y2 = orderedVertices[3];

    const x = v[0];
    const y = v[1];

    if (x1 - 0.1 <= x && x <= x2 + 0.1 && y1 - 0.1 <= y && y <= y2 + 0.1) {
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
    // Create a vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
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

    // Draw the line
    gl.drawArrays(gl.LINES, 0, vertices.length / 2);
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
  }
}