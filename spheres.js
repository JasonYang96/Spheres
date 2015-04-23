//represent gl object

var gl;

window.onload = function init() {
	//initialize canvas and webGL
	var canvas = document.getElementById( "gl-canvas");
	aspect = canvas.width/canvas.height;

	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {alert ( "WebGL isn't available" ); }

	//configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height);
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.enable(gl.DEPTH_TEST);

	//Load shaders and initialize attribute buffers
	var program = initShaders(gl, "vertex-shader", "fragment-shader" );
	gl.useProgram(program);

	render();
}

function render() {
	//clear canvas
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

	//call render on browser refresh
	requestAnimFrame(render);
}
