var gl = null; // WebGL context

var iii;

var pause = false;

var gameover = false;

var rows = ['/player','/invader1','/invader2',
                '/invader3','/boss'];

var invaders = [];

var shaderProgram = null;

var triangleVertexPositionBuffer = null;
	
var triangleVertexColorBuffer = null;

// The GLOBAL transformation parameters

var globalAngleYY = 0.0;

var globalTz = 0.0;

// The local transformation parameters

// The translation vector

//var tx = 0.0;

//var ty = 0.0;

//var tz = 0.0;

// Position vectors

var tdown = 0.0;

var tboss = -1.3;

var level = 1;

var tplayer = 0.0;


// The rotation angles in degrees

var angleXX = 0.0;

var angleYY = 0.0;

var angleZZ = 0.0;

// The scaling factors

var sx = 0.5;

var sy = 0.5;

var sz = 0.5;

// GLOBAL Animation controls

var globalRotationYY_ON = 1;

var globalRotationYY_DIR = 1;

var globalRotationYY_SPEED = 1;

// Local Animation controls

var rotationXX_ON = 1;

var rotationXX_DIR = 1;

var rotationXX_SPEED = 1;
 
var rotationYY_ON = 1;

var rotationYY_DIR = 1;

var rotationYY_SPEED = 1;
 
var rotationZZ_ON = 1;

var rotationZZ_DIR = 1;

var rotationZZ_SPEED = 1;
 
// To allow choosing the way of drawing the model triangles

var primitiveType = null;
 
// To allow choosing the projection type

var projectionType = 0;

// NEW --- Model Material Features

// Ambient coef.

var kAmbi = [ 0.2, 0.2, 0.2 ];

// Difuse coef.

var kDiff = [ 0.7, 0.7, 0.7 ];

// Specular coef.

var kSpec = [ 0.7, 0.7, 0.7 ];

// Phong coef.

var nPhong = 10;

// Initial model has just ONE TRIANGLE

var vertices = [

		// FRONTAL TRIANGLE
		 
		-0.5, -0.5,  0.5,
		 
		 0.5, -0.5,  0.5,
		 
		 0.5,  0.5,  0.5,
];

var normals = [

		// FRONTAL TRIANGLE
		 
		 0.0,  0.0,  1.0,
		 
		 0.0,  0.0,  1.0,
		 
		 0.0,  0.0,  1.0,
];

// Initial color values just for testing!!

// They are to be computed by the Phong Illumination Model

var colors = [

		 // FRONTAL TRIANGLE
		 	
		 1.00,  0.00,  0.00,
		 
		 1.00,  0.00,  0.00,
		 
		 1.00,  0.00,  0.00,
];

//----------------------------------------------------------------------------
//
// The WebGL code
//

//----------------------------------------------------------------------------
//
//  Rendering
//

// Handling the Vertex and the Color Buffers

function initBuffers(){

	// Coordinates
		
	triangleVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	triangleVertexPositionBuffer.itemSize = 3;
	triangleVertexPositionBuffer.numItems = vertices.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 
			triangleVertexPositionBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
	
	// Colors
		
	triangleVertexColorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	triangleVertexColorBuffer.itemSize = 3;
	triangleVertexColorBuffer.numItems = colors.length / 3;			

	// Associating to the vertex shader
	
	gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 
			triangleVertexColorBuffer.itemSize, 
			gl.FLOAT, false, 0, 0);
}

//----------------------------------------------------------------------------

//	 Computing the illumination and rendering the model

function computeIllumination( mvMatrix ) {

	// Phong Illumination Model
	
	// Clearing the colors array
	
	for( var i = 0; i < colors.length; i++ )
	{
		colors[i] = 0.0;
	}
	
    // SMOOTH-SHADING 

    // Compute the illumination for every vertex

    // Iterate through the vertices
    
    for( var vertIndex = 0; vertIndex < vertices.length; vertIndex += 3 )
    {	
		// For every vertex
		
		// GET COORDINATES AND NORMAL VECTOR
		
		var auxP = vertices.slice( vertIndex, vertIndex + 3 );
		
		var auxN = normals.slice( vertIndex, vertIndex + 3 );

        // CONVERT TO HOMOGENEOUS COORDINATES

		auxP.push( 1.0 );
		
		auxN.push( 0.0 );
		
        // APPLY CURRENT TRANSFORMATION

        var pointP = multiplyPointByMatrix( mvMatrix, auxP );

        var vectorN = multiplyVectorByMatrix( mvMatrix, auxN );
        
        normalize( vectorN );

		// VIEWER POSITION
		
		var vectorV = vec3();
		
		if( projectionType == 0 ) {
		
			// Orthogonal 
			
			vectorV[2] = 1.0;
		}	
		else {
			
		    // Perspective
		    
		    // Viewer at ( 0, 0 , 0 )
		
			vectorV = symmetric( pointP );
		}
		
        normalize( vectorV );

	    // Compute the 3 components: AMBIENT, DIFFUSE and SPECULAR
	    
	    // FOR EACH LIGHT SOURCE
	    
	    for(var l = 0; l < lightSources.length; l++ )
	    {
			if( lightSources[l].isOff() ) {
				
				continue;
			}
			
	        // INITIALIZE EACH COMPONENT, with the constant terms
	
		    var ambientTerm = vec3();
		
		    var diffuseTerm = vec3();
		
		    var specularTerm = vec3();
		
		    // For the current light source
		
		    ambient_Illumination = lightSources[l].getAmbIntensity();
		
		    int_Light_Source = lightSources[l].getIntensity();
		
		    pos_Light_Source = lightSources[l].getPosition();
		    
		    // Animating the light source, if defined
		    
		    var lightSourceMatrix = mat4();
		    
		    // COMPLETE THE CODE FOR THE OTHER ROTATION AXES
		    
		    if( lightSources[l].isRotYYOn() ) 
		    {
				lightSourceMatrix = mult( 
						lightSourceMatrix, 
						rotationYYMatrix( lightSources[l].getRotAngleYY() ) );
			}
			
	        for( var i = 0; i < 3; i++ )
	        {
			    // AMBIENT ILLUMINATION --- Constant for every vertex
	   
			    ambientTerm[i] = ambient_Illumination[i] * kAmbi[i];
	
	            diffuseTerm[i] = int_Light_Source[i] * kDiff[i];
	
	            specularTerm[i] = int_Light_Source[i] * kSpec[i];
	        }
	    
	        // DIFFUSE ILLUMINATION
	        
	        var vectorL = vec4();
	
	        if( pos_Light_Source[3] == 0.0 )
	        {
	            // DIRECTIONAL Light Source
	            
	            vectorL = multiplyVectorByMatrix( 
							lightSourceMatrix,
							pos_Light_Source );
	        }
	        else
	        {
	            // POINT Light Source
	
	            // TO DO : apply the global transformation to the light source?
	
	            vectorL = multiplyPointByMatrix( 
							lightSourceMatrix,
							pos_Light_Source );
				
				for( var i = 0; i < 3; i++ )
	            {
	                vectorL[ i ] -= pointP[ i ];
	            }
	        }
	
			// Back to Euclidean coordinates
			
			vectorL = vectorL.slice(0,3);
			
	        normalize( vectorL );
	
	        var cosNL = dotProduct( vectorN, vectorL );
	
	        if( cosNL < 0.0 )
	        {
				// No direct illumination !!
				
				cosNL = 0.0;
	        }
	
	        // SEPCULAR ILLUMINATION 
	
	        var vectorH = add( vectorL, vectorV );
	
	        normalize( vectorH );
	
	        var cosNH = dotProduct( vectorN, vectorH );
	
			// No direct illumination or viewer not in the right direction
			
	        if( (cosNH < 0.0) || (cosNL <= 0.0) )
	        {
	            cosNH = 0.0;
	        }
	
	        // Compute the color values and store in the colors array
	        
	        var tempR = ambientTerm[0] + diffuseTerm[0] * cosNL + specularTerm[0] * Math.pow(cosNH, nPhong);
	        
	        var tempG = ambientTerm[1] + diffuseTerm[1] * cosNL + specularTerm[1] * Math.pow(cosNH, nPhong);
	        
	        var tempB = ambientTerm[2] + diffuseTerm[2] * cosNL + specularTerm[2] * Math.pow(cosNH, nPhong);
	        
			colors[vertIndex] += tempR;
	        
	        // Avoid exceeding 1.0
	        
			if( colors[vertIndex] > 0.5 ) {
				
				colors[vertIndex] = 0.5;
			}
	        
	        // Avoid exceeding 1.0
	        
			colors[vertIndex + 1] += tempG;
			
			if( colors[vertIndex + 1] > 0.1 ) {
				
				colors[vertIndex + 1] = 0.1;
			}
			
			colors[vertIndex + 2] += tempB;
	        
	        // Avoid exceeding 1.0
	        
			if( colors[vertIndex + 2] > 1.0 ) {
				
				colors[vertIndex + 2] = 1.0;
			}
	    }	
	}
}

function drawModel( angleXX, angleYY, angleZZ, 
					sx, sy, sz,
					tx, ty, tz,
					mvMatrix,
					primitiveType ) { //gl.TRIANGLES

	// The the global model transformation is an input
	
	// Concatenate with the particular model transformations
	
    // Pay attention to transformation order !!
    
	mvMatrix = mult( mvMatrix, translationMatrix( tx, ty, tz ) );
						 
	mvMatrix = mult( mvMatrix, rotationZZMatrix( angleZZ ) );
	
	mvMatrix = mult( mvMatrix, rotationYYMatrix( angleYY ) );
	
	mvMatrix = mult( mvMatrix, rotationXXMatrix( - 90 ) );
	
	mvMatrix = mult( mvMatrix, scalingMatrix( 0.1, 0.1, 0.1 ) );
						 
	// Passing the Model View Matrix to apply the current transformation
	
	var mvUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	
	gl.uniformMatrix4fv(mvUniform, false, new Float32Array(flatten(mvMatrix)));
	
	// NEW - Aux. Function for computing the illumination
	
	computeIllumination( mvMatrix );
	
	// Associating the data to the vertex shader
	
	// This can be done in a better way !!

	initBuffers();
	
	// Drawing 
	
    gl.drawArrays(primitiveType, 0, triangleVertexPositionBuffer.numItems); 
			
}

//----------------------------------------------------------------------------

//  Drawing the 3D scene

function drawScene() {
	
	var pMatrix;
	
	var mvMatrix = mat4();
	
	// Clearing the frame-buffer and the depth-buffer
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	// Computing the Projection Matrix
	// Always Perspective Projection
	
	pMatrix = perspective( 45, 1, 0.05, 15 );
		
	// Global transformation !!
		
	globalTz = -2.5;
	
	// Passing the Projection Matrix to apply the current projection
	
	var pUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	
	gl.uniformMatrix4fv(pUniform, false, new Float32Array(flatten(pMatrix)));
	
	// GLOBAL TRANSFORMATION FOR THE WHOLE SCENE
	
	mvMatrix = translationMatrix( 0, 0, globalTz );


	// Instantianting the current model

    //INVADERS GRID
    for (iii = 0; iii < rows.length; iii++){
        var invindex = [1,1,2,2,3];
        var invader = invaders[invindex[iii]];
        parsingobj(invader);
        for (var j = 0; j < 15; j++) {
            drawModel(angleXX, angleYY, angleZZ,
                sx, sy, sz,
                j*0.12-0.85, iii*0.11+0.2-tdown, 0,
                mvMatrix,
                primitiveType);
        }
    }

    //BOSS
    parsingobj(invaders[4]);
    drawModel(angleXX, angleYY, angleZZ,
        sx, sy, sz,
        tboss, 0.8-tdown, 0,
        mvMatrix,
        primitiveType);

    //PLAYER
    parsingobj(invaders[0]);
    drawModel(angleXX, angleYY, angleZZ,
        sx, sy, sz,
        tplayer, -0.85, 0,
        mvMatrix,
        primitiveType);


}

//----------------------------------------------------------------------------
//
//  NEW --- Animation
//

// Animation --- Updating transformation parameters

var lastTime = 0;

function animate() {
	
	var timeNow = new Date().getTime();
	
	if( lastTime != 0 ) {
		
		var elapsed = timeNow - lastTime;
		
		// Global rotation
		
		if( globalRotationYY_ON ) {

			globalAngleYY += globalRotationYY_DIR * globalRotationYY_SPEED * (90 * elapsed) / 1000.0;
	    }

		// Local rotations
		
		if( rotationXX_ON && false) {

			angleXX += rotationXX_DIR * rotationXX_SPEED * (90 * elapsed) / 1000.0;
	    }

		if( rotationYY_ON ) {

			angleYY += rotationYY_DIR * rotationYY_SPEED * (90 * elapsed) / 1000.0;
			if (Math.abs(angleYY) >= 30){

				if(angleYY >= 30)
					angleYY = 29;
				else
					angleYY = -29;
				rotationYY_DIR = -rotationYY_DIR;
			}
	    }

		if( rotationZZ_ON && false ) {

			angleZZ += rotationZZ_DIR * rotationZZ_SPEED * (90 * elapsed) / 1000.0;
	    }

	    // position

        tdown += level*0.01;
		tboss += 0.2;
		if (tboss > 1.3){
		    tboss = - 1.3;
        }

		// Rotating the light sources
	
		if( lightSources[0].isRotYYOn() ) {

			var angle = lightSources[0].getRotAngleYY() + (90 * elapsed) / 1000.0;
		
			lightSources[0].setRotAngleYY( angle );
		}
	}

    if (iii*0.11+0.2-tdown < -0.75) gameover = true;

	lastTime = timeNow;
}


//----------------------------------------------------------------------------

// Timer

function tick() {

        requestAnimFrame(tick);

        drawScene();

    if (!pause && !gameover){
        animate();
    }

}




//----------------------------------------------------------------------------
//
//  User Interaction
//

function outputInfos(){
    
}

//-----------------------------

function parsingobj(data) {

    var lines = data.split('\n');

    // The new vertices

    var newVertices = [];

    // The new normal vectors

    var newNormals = [];

    // Check every line and store

    for(var line = 0; line < lines.length; line++){

        // The tokens/values in each line

        // Separation between tokens is 1 or mode whitespaces

        var tokens = lines[line].split(/\s\s*/);

        // Array of tokens; each token is a string

        if( tokens[0] == "v" )
        {
            // For every vertex we have 3 floating point values

            for( j = 1; j < 4; j++ ) {

                newVertices.push( parseFloat( tokens[ j ] ) );
            }
        }

        if( tokens[0] == "vn" )
        {
            // For every normal we have 3 floating point values

            for( j = 1; j < 4; j++ ) {

                newNormals.push( parseFloat( tokens[ j ] ) );
            }
        }
    }

    // Assigning to the current model

    vertices = newVertices.slice();

    normals = newNormals.slice();

    // Checking to see if the normals are defined on the file

    if( normals.length == 0 )
    {
        computeVertexNormals( vertices, normals );
    }

    // To render the model just read
    // TODO: drawmodel maybe useful...
    //drawModel(angleXX,angleYY,angleZZ,sx,sy,sz,tx,ty,tz,mat4(),gl.TRIANGLES);

}

function invaderarrayfill( ) {

    for (var i = 0; i<rows.length;i++){
        var file = rows[i];
        $.get(file, function( data ) {
            invaders.push(data);
        });
    }

}

//----------------------------------------------------------------------------

function setEventListeners(){

    document.addEventListener("keydown", function(event) {

        var key = event.keyCode; // ASCII
        if (!pause && !gameover){

            switch (key) {
                //left
                case 37 : //left arrow
                case 65 : // A
                    if(tplayer < -0.85){
                        break;
                    }
                    tplayer -= 0.01;
                    break;

                //right
                case 39 : //right arrow
                case 68 : // D
                    if(tplayer > 0.85){
                        break;
                    }
                    tplayer += 0.01;
                    break;
            }

        }

    });

    document.addEventListener("keypress", function(event) {

        var key = event.keyCode; // ASCII

        switch (key) {

            //shoot or restart
            case 32 : // space bar
                if (!pause && !gameover) { // shoot
                    console.log("SHOOT");
                }
                if(gameover){ // restart game

                    tdown = 0.0;
                    tboss = -1.3;
                    tplayer = 0.0;
                    level = 1;

                    gameover = false;

                }
                break;

            //pause
            case 80 : // P
                if(!gameover) {
                    pause = !pause;
                    break;
                }

        }


    });


}

//----------------------------------------------------------------------------
//
// WebGL Initialization
//

function initWebGL( canvas ) {
	try {
		
		// Create the WebGL context
		
		// Some browsers still need "experimental-webgl"
		
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// DEFAULT: The viewport occupies the whole canvas 
		
		// DEFAULT: The viewport background color is WHITE
		
		// NEW - Drawing the triangles defining the model
		
		primitiveType = gl.TRIANGLES;
		
		// DEFAULT: Face culling is DISABLED
		
		// Enable FACE CULLING
		
		gl.enable( gl.CULL_FACE );
		
		// DEFAULT: The BACK FACE is culled!!
		
		// The next instruction is not needed...
		
		gl.cullFace( gl.BACK );

		// Enable DEPTH-TEST
		
		gl.enable( gl.DEPTH_TEST );        
	} catch (e) {
	}
	if (!gl) {
		alert("Could not initialise WebGL, sorry! :-(");
	}        
}

//----------------------------------------------------------------------------

function runWebGL() {

    invaderarrayfill();

	var canvas = document.getElementById("my-canvas");
	
	initWebGL( canvas );

	shaderProgram = initShaders( gl );
	
	setEventListeners();
	
	initBuffers();
	
	tick();		// NEW --- A timer controls the rendering / animation

	outputInfos();
}

