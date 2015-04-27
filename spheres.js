//represent gl object
var gl;

//vertex color, and color index variables
var vColorLoc;
var colorIndex = 0;

//perspective matrix variables
var pMatrix;
var pMatrixLoc;
var fovx = 45.0;
var aspect;
var near = 0.1;
var far = 200;

//translation matrix, model-view matrix, and scale matrix
var tMatrix;
var mvMatrix;
var rotMatrix;
var scaleMatrix;
var Matrix;
var MatrixLoc;

//light variables
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0);
var lightDiffuse = vec4(1.0, 1.0, 0.0, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var ambientProductLoc, diffuseProductLoc, specularProductLoc;
var ambientProduct, diffuseProduct, specularProduct;
var lightPositionLoc;
var shininessLoc;
var sunMatrixLoc;

//x,y,z coord, and heading variable for camera movement
var coord = [ 0, Math.sin(Math.PI/6) * -75, -75 ];
var headingAngle = 0;

//sphere creation variables
var index = 0;
var pointsArray = [];
var normalsArray = [];

//starting vertices
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//array of planets and moon
var planets = [];

//creates a planet
function planet(x,n,s,t,dt, material, shading) {
    this.translateMatrix = translate(x, 0, 0);
    this.sMatrix = scale(s, s, s);
    this.theta = t;
    this.dtheta = dt;
    this.starting = index;
    this.material = material;
    this.shading = shading;
    //create a sphere
    tetrahedron(va, vb, vc, vd, n);
    this.numPoints = index - this.starting;
}

function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);
     var u = subtract(b, a);
     var v = subtract(c, a);
     var normal = vec4(normalize(cross(v,u)), true);
     normal[3] = 0.0;
    
     // normals are vectors
     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);

     index += 3;  
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {
                
        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

window.onload = function init()
{
    //initialize canvas and webGL
    var canvas = document.getElementById( "gl-canvas" );
    aspect = canvas.width/canvas.height;
        
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebG isn't available" ); }

    //creating planets and moon
    planets.push(new planet(0, 5, 3, 0, 0, {
        ambient: vec4(1.0, 1.0, 0.0, 1.0),
        diffuse: vec4(1.0, 1.0, 0.0, 1.0),
        specular: vec4(1.0, 1.0, 0.0, 1.0),
        shininess: 0.0,
        shading: 0,
    }));
    planets.push(new planet(7, 5, .8, 0, 2, {
        ambient: vec4(1.0, 0.0, 0.0, 1.0),
        diffuse: vec4(1.0, 0.0, 0.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 5.0,
        shading: 0,
    }));
    planets.push(new planet(15, 5, .5, 90, 1.5, {
        ambient: vec4(1.0, 0.0, 0.0, 1.0),
        diffuse: vec4(1.0, 0.0, 0.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 10.0,
        shading: 0,
    }));
    planets.push(new planet(20, 5, .7, 270, 1, {
        ambient: vec4(1.0, 0.0, 0.0, 1.0),
        diffuse: vec4(1.0, 0.0, 0.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 20.0,
        shading: 0,
    }));
    planets.push(new planet(25, 5, .9, 299, 1, {
        ambient: vec4(1.0, 0.0, 0.0, 1.0),
        diffuse: vec4(1.0, 0.0, 0.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 30.0,
        shading: 0,
    }));
    planets.push(new planet(10, 5, .2, 180, 2, {
        ambient: vec4(0.0, 1.0, 0.0, 1.0),
        diffuse: vec4(0.0, 1.0, 0.0, 1.0),
        specular: vec4(1.0, 1.0, 1.0, 1.0),
        shininess: 30.0,
        shading: 0,
    }));

    //configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // get variables from shader
    MatrixLoc = gl.getUniformLocation( program, "Matrix");
    ambientProductLoc = gl.getUniformLocation( program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation( program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation( program, "specularProduct");
    pMatrixLoc = gl.getUniformLocation( program, "pMatrix");
    shininessLoc = gl.getUniformLocation( program, "shininess");
    sunMatrixLoc = gl.getUniformLocation( program, "sunMatrix");

    //create and bind buffer for vertices
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    //send the vertex buffer to shader
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //create and bind buffer for normals
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal");
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vNormal );

    //event listener
    window.onkeydown = function(event) {
        var key = event.keyCode > 48 ? String.fromCharCode(event.keyCode) : event.keyCode;
        var radian = radians(headingAngle);
        switch(key) {
            case 'I':
                coord[0] -=(.25 * Math.sin(radian));
                coord[2] +=(.25 * Math.cos(radian));
                break;
            case 'J':
                coord[0] +=(.25 * Math.cos(radian));
                coord[2] +=(.25 * Math.sin(radian));
                break;
            case 'K':
                coord[0] -=(.25 * Math.cos(radian));
                coord[2] -=(.25 * Math.sin(radian));
                break;
            case 'M':
                coord[0] +=(.25 * Math.sin(radian));
                coord[2] -=(.25 * Math.cos(radian));
                break;
            case 'N':
                fovx -= 1;
                break;
            case 'W':
                fovx += 1;
                break;        
            case 'R':
                coord[0] = 0;
                coord[1] = Math.sin(Math.PI/6) * -75;
                coord[2] = -75;
                headingAngle = 0;
                fovx = 45;
                break;   
            case 37: //left arrow
                headingAngle -=1;
                break;
            case 38: //up arrow
                coord[1] -=.25;
                break;
            case 39: //right arrow
                headingAngle +=1;
                break;
            case 40: //down arrow
                coord[1] +=.25;
                break;
            default:
                break;
        }
    };

    render();
};

//returns fovy based on fovx
function fovy() {
    return ( 2 * Math.atan(Math.tan(radians(fovx)/2) / aspect) * 180 / Math.PI);
}

function render() {
    //clear canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    //calculate prospective Matrix
    pMatrix = perspective(fovy(), aspect, near, far);
    gl.uniformMatrix4fv(pMatrixLoc, false, flatten(pMatrix));

    tMatrix = mult(rotate( 30 + headingAngle, [1,0,0]), translate( coord[0], coord[1], coord[2]));

    //instance the spheres
    for (var i = 0; i < planets.length; i++) {
        planets[i].theta += planets[i].dtheta;
        
        //calculate light variables
        ambientProduct = mult(lightAmbient, planets[i].material.ambient);
        diffuseProduct = mult(lightDiffuse, planets[i].material.diffuse);
        specularProduct = mult(lightSpecular, planets[i].material.specular);
        gl.uniform4fv(ambientProductLoc, ambientProduct);
        gl.uniform4fv(diffuseProductLoc, diffuseProduct);
        gl.uniform4fv(specularProductLoc, specularProduct);
        gl.uniform1f(shininessLoc, planets[i].material.shininess);
        
        //create the moon on the last planet drawn
        if (i == planets.length - 1)
        {
            scaleMatrix = mult(Matrix, planets[i].sMatrix);
            rotMatrix = mult(rotate(planets[i].theta, [0,1,0]), planets[i].translateMatrix);
            Matrix = mult(scaleMatrix,rotMatrix);
        }
        //draw the other planets
        else
        {
            Matrix = mult(tMatrix, planets[i].sMatrix);
            Matrix = mult(Matrix, rotate(planets[i].theta, [0, 1, 0]));
            Matrix = mult(Matrix, planets[i].translateMatrix);
        }

        if (i == 0)
        {
            gl.uniformMatrix4fv(sunMatrixLoc, false, flatten(Matrix));
        }
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(Matrix));
        gl.drawArrays(gl.TRIANGLES, planets[i].starting , planets[i].numPoints);
    }

    //call render on browser refresh
    requestAnimFrame( render );
}