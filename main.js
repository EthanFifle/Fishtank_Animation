
var canvas;
var gl;

var program ;

var near = 1;
var far = 100;

// Size of the viewport in viewing coordinates
var left = -6.0;
var right = 6.0;
var ytop = 6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
var controller ;

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse) ;

    Cube.init(program);
    FishBody.init(18,program) ;
    Sphere.init(36,program) ;

    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

	
	document.getElementById("sliderXi").oninput = function() {
		RX = this.value ;
		window.requestAnimFrame(render);
	}
		
    
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
        console.log(animFlag) ;
		
		controller = new CameraController(canvas);
		controller.onchange = function(xRot,yRot) {
			RX = xRot ;
			RY = yRot ;
			window.requestAnimFrame(render); };
    };

    render();
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawFishBody() {
    setMV() ;
    FishBody.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modeling  matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modeling Matrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

// puts the given matrix at the top of the stack MS
function gPut(m) {
	MS.push(m) ;
}

// Used for bubble animation
let animationActive = false; // Create a boolean separate from animFlag to manipulate

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,20);
    MS = [] ; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4() ;
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	//projectionMatrix = perspective(45, 1, near, far);
    
    // Rotations from the sliders
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    
    // set all the matrices
    setAllMatrices() ;
    
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() / 1000 ;

        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }

        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;

    }

    /************************* Useful Functions *************************/

    // Sets the rotation angle a & b such that the object rotates a <= obj <=
    // Also set the speed (in terms of frequency) between oscillations
    function setRotation( time, a, b, frq ) {

        const angleRange = b - a;
        const oscillation = Math.sin(time * frq);

        return a + (oscillation + 1) * 0.5 * angleRange;
    }

    // Set the translation speed and distance for the human and fish
    function setTranslation( time, speed, distance ) {

        return Math.cos(time * speed ) * distance;
    }

    // Draws an ellipse relative to the previous one when called in a hierarchical chain (recursive)
    // is passed values a, b & sine to animate motion from each individual call
    function drawEllipse( time, a, b, frq, sine ) {

        gScale(1/0.1, 1/0.25, 1/0.1);
        gTranslate(0,0.45,0);

        gTranslate(0,-0.3,0);
        gRotate(sine * setRotation(time, a, b, frq),0,0,1); // side to side
        //gRotate(sine * setRotation(time, a, b, frq),0,1,0);
        // Commented out because I don't know how to deal with collisions yet!
        gRotate(sine * setRotation(time, a, b, frq),1,0,0); // front to back
        gTranslate(0,0.3,0);

        gScale(0.1, 0.25, 0.1);
        setColor(vec4(0.0,0.5,0.0,1.0));
        drawSphere() ;

    }

    // Recursive function for drawing & manipulating ellipses
    function ellipseHierarchy(level, sine, drift, theta) {

        if (level > 0) {
            gPush();
            {
                // Alternate rotation direction every 3 Ellipses for wave effect
                if(level % 3 === 0){
                    sine = sine*-1;
                }
                // Honestly just mess around with these values to see what looked best
                let a = drift + sine * theta * Math.sin(TIME * 0.1 * level); // "realistic" drift function for current
                let b = a + sine * theta * Math.cos(TIME * 0.1 * level); // 0.1 * level for smoothness & acceleration handling near top & bottom of hierarchy

                drawEllipse(TIME, a, b, 0.5, sine); // Pass along angles & sine to draw, set frequency of rotations
                ellipseHierarchy(level - 1, sine,  b, theta); // Recursive call
            }
            gPop();
        }
    }

    /************************* End of Useful Functions *************************/

    /************************* Scene Set Up *************************/

    // Position everything relative to the center of the screen
    gTranslate(-4,0,0) ;
    // Larger rock
    gPush() ;
    {
        gTranslate(2.8,-3.8,0);
        gScale(0.7,0.7,0.7);
        setColor(vec4(0.4,0.4,0.4,1.0));
        drawSphere();
    }
    gPop() ;
    // Smaller rock
    gPush() ;
    {
        gTranslate(1.5,-4.0,0);
        gScale(0.5,0.5,0.5);
        setColor(vec4(0.4,0.4,0.4,1.0));
        drawSphere();
    }
    gPop() ;
    // Ground
    gPush() ;
    {
        gTranslate(4,-9.5,0);
        gScale(10,5,10);
        setColor(vec4(0.0,0.0,0.0,1.0));
        drawCube();
    }
    gPop() ;

    /************************* End of Scene Setup *************************/

    /************************* Ellipse Code *************************/
    /*
     * Each Ellipse animation differs slightly for aesthetic but the movement is EXACTLY the same as the call to/implementation of
     * ellipseHierarchy(), drawEllipse(), & setRotation() do not change. Please do doc marks for "three seaweed strands are identical
     * and move exactly the same way", they do just with different values on purpose (As I see it to be an improvement)
     */

    gPush(); // Ellipse Center Basis
    {
        gTranslate(2.8, -2.9, 0); // Translate to a position on the rock

        // Set up first basis rotation point
        gTranslate(0, -0.5, 0);
        gRotate(setRotation(TIME, -5, 5, 0.5), 0, 0, 1);
        gTranslate(0, 0.5, 0);

        gScale(0.1, 0.25, 0.1);
        setColor(vec4(0.0, 0.5, 0.0, 1.0));
        drawSphere();

        ellipseHierarchy(10, 1, -1, 5); // 11 in total
        // level: number of ellipses drawn after the "base"
        // sine: to start in +ve or -ve direction
        // drift: to set a "realistic" current drift
        // theta: to set a larger range of angles

    }
    gPop();

    // Ellipse Right Basis
    gPush() ; // Base (1)
    {
        gTranslate(3.3,-3.1,0);

        gTranslate(0,-0.45,0);
        gRotate(setRotation(TIME, -5, 5, 0.5),0,0,1);
        gTranslate(0,0.45,0);

        gScale(0.1, 0.25, 0.1);
        setColor(vec4(0.0,0.5,0.0,1.0));
        drawSphere() ;

        ellipseHierarchy(9, -1, -4, 4); // 10 in total
    }
    gPop() ;

    // Ellipse Left Basis
    gPush() ; // Base (1)
    {
        gTranslate(2.3,-3.1,0);

        gTranslate(0,-0.5,0);
        gRotate(setRotation(TIME, -5, 5, 0.5),0,0,1);
        gTranslate(0,0.5,0);

        gScale(0.1, 0.25, 0.1);
        setColor(vec4(0.0,0.5,0.0,1.0));
        drawSphere() ;

        ellipseHierarchy(9, 1, -6.5, 5); // 10 in total
    }
    gPop() ;

    /************************* End of Ellipse Code *************************/

    gPush(); // Bubbles
    {

        if (Math.sin(TIME) > 0) {

            let currTime = (new Date()).getTime() / 1000 ;
            let time = TIME - currTime;

            for (let i = 0; i < 4; i++) {

                setMV();
                gTranslate(i % 2 === 0 ? -1 : 1, -time, 0);
                setColor(vec4(1.0, 1.0, 1.0, 1.0));
                drawSphere();

            }

        }

    }
    gPop();

    /************************* Human Body Code *************************/

    // Human Body basis position
    gPush() ;
    {
        // Order of operations for the human base: Translate, Rotate then Scale

        gTranslate(8,0,-2);
        gRotate(-20,0,1,0);

        gTranslate( setTranslation(TIME, 0.5, 0.7), // distance in the x
            setTranslation(TIME, 0.5, 0.5), 0); // distance in the y

        gScale(0.7, 1, 0.4);

        setColor(vec4(0.4,0.0,0.4,1.0));
        drawCube();

        // Head
        gPush() ;
        {
            // Order of operations for the human appendages: Undo Body Scale, Translate, then Rotate

            gScale(1/0.7, 1, 1/0.4);
            gTranslate(0,1.35,0);

            gScale(0.35, 0.35, 0.35);

            setColor(vec4(0.4,0.0,0.4,1.0));
            drawSphere();

        }
        gPop() ;

        // Left Leg
        gPush() ;
        {
            gScale(1/0.7, 1, 1/0.4);
            gTranslate(-0.3,-1.55,-0.2);
            gRotate(30,1,0,0);

            gTranslate(-0.3,0.4, 0);
            gRotate(-setRotation(TIME, -20,40,0.7),1,0,0);
            gTranslate(0.3,-0.4, -0);

            gScale(0.15, 0.6, 0.15);

            setColor(vec4(0.4,0.0,0.4,1.0));
            drawCube();

            gPush() ; // Lower Left Leg
            {
                // Undo scaling
                gScale(1/0.15, 1/0.6, 1/0.15);

                // Translate, Rotate, Re-scal
                gTranslate(0,-0.95,-0.40);
                gRotate(50,1,0,0);

                gTranslate(-0.3,0.4, 0);
                gRotate(-setRotation(TIME, -10,20,0.7),1,0,0);
                gTranslate(0.3,-0.4, -0);

                gScale(0.15, 0.5, 0.15);

                setColor(vec4(0.4,0.0,0.4,1.0));
                drawCube();

                gPush() ; // Left Foot
                {
                    // Undo scaling
                    gScale(1/0.15, 1/0.5, 1/0.15);

                    // Translate, Rotate, Re-scal
                    gTranslate(0,-0.6,0.2);
                    gRotate(90,1,0,0);
                    gScale(0.15, 0.45, 0.08);

                    setColor(vec4(0.4,0.0,0.4,1.0));
                    drawCube();

                }
                gPop() ;

            }
            gPop() ;

        }
        gPop() ; // End of Left Leg

        // Right Leg
        gPush() ;
        {
            gScale(1/0.7, 1, 1/0.4);// undo body scale
            gTranslate(0.3,-1.4,-0.4);
            gRotate(60,1,0,0);

            gTranslate(-0.3,0.4, 0);
            gRotate(setRotation(TIME, -60,0,0.7),1,0,0);
            gTranslate(0.3,-0.4, -0);

            gScale(0.15, 0.6, 0.15);

            setColor(vec4(0.4,0.0,0.4,1.0));
            drawCube();

            gPush() ; // Lower Right Leg
            {
                // Undo scaling
                gScale(1/0.15, 1/0.6, 1/0.15);

                // Translate, Rotate, Re-scal
                gTranslate(0,-0.95,-0.40);
                gRotate(50,1,0,0);

                gTranslate(-0.3,0.4, 0);
                gRotate(setRotation(TIME, -10,20,0.7),1,0,0);
                gTranslate(0.3,-0.4, -0);

                gScale(0.15, 0.5, 0.15);

                setColor(vec4(0.4,0.0,0.4,1.0));
                drawCube();

                gPush() ; // Right Foot
                {
                    // Undo scaling
                    gScale(1/0.15, 1/0.5, 1/0.15);

                    // Translate, Rotate, Re-scal
                    gTranslate(0,-0.6,0.2);
                    gRotate(90,1,0,0);
                    gScale(0.15, 0.45, 0.08);

                    setColor(vec4(0.4,0.0,0.4,1.0));
                    drawCube();

                }
                gPop() ;

            }
            gPop() ;

        }
        gPop() ; // End of Right Leg

    }
    gPop() ;

    /************************* End of Human Body Code *************************/

    /************************* Fish Body Code *************************/

    /* Position the entire fish at the bottom of the screen
     * The reason why this is here is because we originally drew the fish in the "wrong"
     * orientation to the screen so rather than redoing translations... etc. we rotated the
     * entire fish
     */

    gRotate(-90,1,0,0);
    // This means that now x = y, y = z, z = x when applying transformations to the fish

    // Fish Body basis position
    gPush() ;
    {
        gTranslate(3.5,-3.5,-2.5);
        gRotate(90,0,1,0);

        // Rock point center position 2.8,-3.8,0
        // x translation offset -4, 0, 0
        // larger rock center position = 2.8 - 3.5 (0.7)
        // Remember x = y, y = z, z = x
        gTranslate(0,3.5,-0.7);
        gRotate(TIME*120/3.14159,1,0,0);
        gTranslate( -setTranslation(TIME, 1.2, 0.7), 0, 0); // distance in the y
        gTranslate(0,-3.5,0.7);

        gScale(0.7, 0.5, 2.5);
        setColor(vec4(0.5,0.0,0.2,1.0));
        drawFishBody();

        // Fish Head basis position
        gPush() ;
        {
            gTranslate(0,0,-0.65);
            gRotate(180,0,1,0);
            gScale(1.0, 1.0, 0.3);
            setColor(vec4(0.5,0.5,0.5,1.0));
            drawFishBody();

            // Right Eye basis position
            gPush() ;
            {
                // White base
                gTranslate(0.3, -0.6, -0.2);
                gScale(0.2, 0.2, 0.2);
                gRotate(90,0,1,0);
                setColor(vec4(1.0,1.0,1.0,1.0));
                drawSphere();

                // black pupal
                gPush() ;
                {
                    gTranslate(-0.8, 0.0, 0.0); // Translate relative to the eye (White base)
                    gScale(0.5, 0.5, 0.5); // Scale relative to the eye (White base)
                    setColor(vec4(0.0, 0.0, 0.0, 1.0));
                    drawSphere();
                }
                gPop() ;
            }
            gPop() ; // End of Right Eye

            // Left Eye basis position
            gPush() ;
            {
                gTranslate(0.3, 0.6, -0.2);
                gScale(0.2, 0.2, 0.2);
                gRotate(90,0,1,0);
                setColor(vec4(1.0,1.0,1.0,1.0));
                drawSphere() ;

                // black pupal
                gPush();
                {
                    gTranslate(-0.8, 0.0, 0.0); // Translate relative to the eye (White base)
                    gScale(0.5, 0.5, 0.5); // Scale relative to the eye (White base)
                    setColor(vec4(0.0, 0.0, 0.0, 1.0));
                    drawSphere();
                }
                gPop() ;
            }
            gPop() ; // End of Left Eye
        }
        gPop() ; // End of Head

        // Top Fin basis position
        gPush() ;
        {
            // Remember x = y, y = z, z = x
            // All primary tail animations for the primary fins (top & bottom) are applied to this basis
            gScale(1/0.7,1/0.5,1/2.5)
            // translate to a fixed point around a new origin
            gTranslate(-0.6,0.0, 2.25); // this translation is relative to the body

            // apply rotations and scaling
            gTranslate(0,0,-1.2);
            gRotate(setRotation(TIME, -40,40,6),1,0,0);
            gTranslate(0,0,1.2);
            gRotate(-40,0,1,0);

            gScale(0.3, 0.2, 1.5);

            setColor(vec4(0.5,0.0,0.2,1.0));
            drawFishBody() ;

            // Bottom Fin basis position
            gPush() ;
            {
                gScale(1/0.3, 1/0.2, 1/1.5);
                gTranslate(0.4,0.0,-0.8);

                gRotate(82,0,1,0);
                gScale(0.3, 0.2, 0.9);

                setColor(vec4(0.5,0.0,0.2,1.0));
                drawFishBody() ;
            }
            gPop() ;

            // Tail Merger (extra Not Needed but here for aesthetic)
            gPush() ; // Remember x = y, y = z, z = x
            {
                gScale(1/0.4, 1/0.2, 1/1.75);
                gTranslate(-0.2,0,-1.2);

                gRotate(215,0,1,0);
                gScale(0.44, 0.18, 0.7);

                setColor(vec4(0.5,0.0,0.2,1.0));
                drawFishBody() ;
            }
            gPop() ;

        }
        gPop() ;


        // Body Union (extra Not Needed but for more realistic secondary tail animation)
        gPush() ; // Remember x = y, y = z, z = x
        {
            gScale(1/0.7,1/0.5,1/2.5)
            gTranslate(0,0,1);
            gRotate(175, 0,1,0);

            gTranslate(0,0,1);
            gRotate(-setRotation(TIME, -5,5,6),1,0,0);
            gTranslate(0,0,-1);
            //gRotate(-40,0,1,0);

            gScale(0.2, 0.15, 0.8);

            setColor(vec4(0.5,0.0,0.2,1.0));
            drawFishBody() ;
        }
        gPop() ;




    }
    gPop() ; // End of Body

    /************************* End of Fish Body Code *************************/

    
    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
	var controller = this;
	this.onchange = null;
	this.xRot = 0;
	this.yRot = 0;
	this.scaleFactor = 3.0;
	this.dragging = false;
	this.curX = 0;
	this.curY = 0;
	
	// Assign a mouse down handler to the HTML element.
	element.onmousedown = function(ev) {
		controller.dragging = true;
		controller.curX = ev.clientX;
		controller.curY = ev.clientY;
	};
	
	// Assign a mouse up handler to the HTML element.
	element.onmouseup = function(ev) {
		controller.dragging = false;
	};
	
	// Assign a mouse move handler to the HTML element.
	element.onmousemove = function(ev) {
		if (controller.dragging) {
			// Determine how far we have moved since the last mouse move
			// event.
			var curX = ev.clientX;
			var curY = ev.clientY;
			var deltaX = (controller.curX - curX) / controller.scaleFactor;
			var deltaY = (controller.curY - curY) / controller.scaleFactor;
			controller.curX = curX;
			controller.curY = curY;
			// Update the X and Y rotation angles based on the mouse motion.
			controller.yRot = (controller.yRot + deltaX) % 360;
			controller.xRot = (controller.xRot + deltaY);
			// Clamp the X rotation to prevent the camera from going upside
			// down.
			if (controller.xRot < -90) {
				controller.xRot = -90;
			} else if (controller.xRot > 90) {
				controller.xRot = 90;
			}
			// Send the onchange event to any listener.
			if (controller.onchange != null) {
				controller.onchange(controller.xRot, controller.yRot);
			}
		}
	};
}
