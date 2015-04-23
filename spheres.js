//represent gl object
var gl;

//theta variable
var thetaLoc;
var theta = 0.0;

//vertex color, and color index variables
var vColorLoc;
var colorIndex = 0;

//perspective matrix variables
var pMatrix;
var fovx = 45.0;
var aspect;
var near = 0.1;
var far = 200;

//translation matrix, model-view matrix, and scale matrix
var tMatrix;
var mvMatrix;
var Matrix;
var MatrixLoc;

//x,y,z coord, and heading variable for camera movement
var coord = [ 0, 0, -75 ];
var headingAngle = 0;

//sphere creation variables
var numTimesToSubdivide = 3;
var index = 0;
var pointsArray = [];
var normalsArray = [];

//starting vertices
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

//color array
var vertexColors = [
    [ 0.6, 0.6, 0.6, 1.0 ],  // black
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.5, 0.5, 0.5, 1.0 ],  // grey
];

//array of matrices to instance 8 spheres
var spheres = [
    translate( 10,  10,  10),
    translate( 10,  10, -10),
    translate( 10, -10,  10),
    translate( 10, -10, -10),
    translate(-10,  10,  10),
    translate(-10,  10, -10),
    translate(-10, -10,  10),
    translate(-10, -10, -10),
];

function triangle(a, b, c) {
     pointsArray.push(a);
     pointsArray.push(b);      
     pointsArray.push(c);
    
     // normals are vectors
     
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

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

    //create a sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

    //configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // get variables from shader
    vColorLoc = gl.getUniformLocation( program, "vColor" );
    thetaLoc = gl.getUniformLocation( program, "theta");
    MatrixLoc = gl.getUniformLocation( program, "Matrix");

    //create and bind buffer for vertices
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    //send the vertex buffer to shader
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    //event listener
    window.onkeydown = function(event) {
        var key = event.keyCode > 48 ? String.fromCharCode(event.keyCode) : event.keyCode;
        var radian = radians(headingAngle);
        switch(key) {
            case 'C':
                colorIndex = (colorIndex + 1) % vertexColors.length;
                break;
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
                coord[1] = 0;
                coord[2] = -25;
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
function fovy()
{
    return ( 2 * Math.atan(Math.tan(radians(fovx)/2) / aspect) * 180 / Math.PI);
}

function render() {
    //clear canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    //rotate by theta and send to shader
    theta += 6.0;
    gl.uniform1f(thetaLoc, theta);

    //apply model-view matrix
    pMatrix = perspective(fovy(), aspect, near, far);
    tMatrix = mult(rotate(headingAngle, [ 0, 1, 0 ]), translate( coord[0], coord[1], coord[2]));
    mvMatrix = mult(pMatrix, tMatrix);

    //instance the spheres
    for (var i = 0; i < spheres.length; ++i) {
        console.log("creating sphere");
        Matrix = mult(mvMatrix, spheres[i]);
        gl.uniformMatrix4fv(MatrixLoc, false, flatten(Matrix));

        //set up color of triangles then draw
        gl.uniform4fv(vColorLoc, vertexColors[(colorIndex + i) % vertexColors.length]);

        for (var j = 0; j < index; j+= 3) {
            gl.drawArrays(gl.TRIANGLES, j , 3);
        }
    }

    //call render on browser refresh
    requestAnimFrame( render );
}