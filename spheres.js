//represent gl object
var gl;

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
var rotMatrix;
var scaleMatrix;
var Matrix;
var MatrixLoc;

//x,y,z coord, and heading variable for camera movement
var coord = [ 0, Math.sin(Math.PI/6) * -50, -50 ];
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

//array of matrices to instance 8 spheres
var spheres = [
    translate( 10, 0, 0),
    translate( 12, 0, 0),
    translate( 15, 0, 0),
    translate( 17, 0, 0),
];

var theta = [
    0,
    0,
    0,
    0,
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
function fovy()
{
    return ( 2 * Math.atan(Math.tan(radians(fovx)/2) / aspect) * 180 / Math.PI);
}

function render() {
    //clear canvas
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    //apply model-view matrix
    pMatrix = mult(mult(perspective(fovy(), aspect, near, far), rotate( 30, [1,0,0])), rotate(headingAngle, [ 0, 1, 0 ]));
    tMatrix = mult(pMatrix, translate( coord[0], coord[1], coord[2]));
    scaleMatrix = mult(tMatrix, scale(3,3,3));

    //create stationary sun
    gl.uniformMatrix4fv(MatrixLoc, false, flatten(scaleMatrix));
    gl.uniform4fv(vColorLoc, [1.0, 1.0, 0.0, 1.0]);
    for (var j = 0; j < index; j+= 3) {
        gl.drawArrays(gl.TRIANGLES, j , 3);
    }

    //instance the spheres
    for (var i = 0; i < spheres.length; i++) {

        if (i == spheres.length - 1)
        {
            //create the moon on the last planet drawn
            theta[i] += 2
            scaleMatrix = mult(Matrix, scale(.2,.2,.2));
            rotMatrix = mult(rotate(theta[i], [0,1,0]), spheres[i]);
            Matrix = mult(scaleMatrix,rotMatrix);

            gl.uniform4fv(vColorLoc, [0.0, 1.0, 0.0, 1.0]);
        }
        else
        {
            theta[i] += .5 * (i+ 1);
            mvMatrix = mult(tMatrix, rotate(theta[i], [0, 1, 0]));
            scaleMatrix = mult(mvMatrix, scale( i*.5 + .5, i*.5 + .5, i*.5 + .5));
            Matrix = mult(scaleMatrix, spheres[i]);

            gl.uniform4fv(vColorLoc, [ 1.0, 0.0, 0.0, 1.0 ]);
        }

        gl.uniformMatrix4fv(MatrixLoc, false, flatten(Matrix));


        for (var j = 0; j < index; j+= 3) {
            gl.drawArrays(gl.TRIANGLES, j , 3);
        }
    }

    //call render on browser refresh
    requestAnimFrame( render );
}