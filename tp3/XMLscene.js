import { CGFcameraOrtho, CGFscene } from '../lib/CGF.js';
import { CGFaxis,CGFcamera } from '../lib/CGF.js';


var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
export class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();


        this.selectedCamera = 0;
        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);

        this.axis = new CGFaxis(this);
        this.setUpdatePeriod(10);

        this.remqueue = [];
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        this.cameras = [];
        this.cameraList = {};
        let i = 0;
        for(var key in this.graph.cameras) {
            var camera = this.graph.cameras[key];
            var camObj;
            if(camera[0] == "perspective")
                camObj = new CGFcamera(camera[4] * DEGREE_TO_RAD, camera[2], camera[3], camera[5], camera[6]);
            else if(camera[0] == "ortho")
                camObj = new CGFcameraOrtho(camera[4], camera[5], camera[7], camera[6], camera[2], camera[3], camera[8], camera[9], camera[10]);
            this.cameras.push(camObj);
            this.cameraList[camera[1]] = i;
            i++;
        }
        this.updateCamera();
        //this.camera = new CGFcamera(0.4, 0.1, 500, vec3.fromValues(15, 15, 15), vec3.fromValues(0, 0, 0));
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        this.lightVal = {};
        this.lightId = {};
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];
                var attn_offset = 0; //attenuation values position changes depending on wether its spot or omni light, compensate

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0] - light[2][0], light[8][1] - light[2][1], light[8][2] - light[2][2]); //target - pos
                    attn_offset += 3;
                }

                var attenuation = light[6+attn_offset];
                if(attenuation != null) {
                    if(attenuation[0] != 0)
                        this.lights[i].setConstantAttenuation(attenuation[0])
                    if(attenuation[1] != 0)
                        this.lights[i].setLinearAttenuation(attenuation[1])
                    if(attenuation[2] != 0)
                        this.lights[i].setQuadraticAttenuation(attenuation[2])
                }

                this.lightId[key] = i;
                if(this.remqueue.includes(key)) {
                    i++;
                    continue;
                }

                this.lights[i].setVisible(true);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                this.lightVal[key] = light[0];

                i++;
            }
        }
        this.lightNumb = i;
        this.remqueue = [];
    }

    addRemQueue(id) {
        this.remqueue.push(id);
    }

    /**
     * Initializes the shader object to use to enable/disable in UI
     */
    initShaders() {
        this.shaderVal = {};

        for (var component in this.graph.shaderComponents) {
                this.shaderVal[this.graph.shaderComponents[component]] = true;
        }
    }

    /**
     * Update a camera after swithcing on gui
     */
    updateCamera() {
        this.camera = this.cameras[this.selectedCamera];
        this.interface.setActiveCamera(this.camera);
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.axis = new CGFaxis(this, this.graph.referenceLength);

        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);

        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initCameras();

        this.initLights();

        this.initShaders();

        this.interface.postParsingSetup();

        this.sceneInited = true;

        this.startTime = null;
    }

    update(t) {
        if(!this.sceneInited)
            return;

        if (this.startTime == null) {
            this.startTime = t;
            return;
        }

        let seconds = (t - this.startTime) / 1000;
        
        this.graph.updateAnimations(seconds);
        this.graph.updateShaders(seconds);
    }

    logPicking()
	{
		if (this.pickMode == false && this.playingDemo != true) {
			// results can only be retrieved when picking mode is false
			if (this.pickResults != null && this.pickResults.length > 0) {
				for (var i=0; i< this.pickResults.length; i++) {
					var obj = this.pickResults[i][0];
					if (obj)
					{
                        for(const board in this.graph.boards) {
                            const b = this.graph.boards[board];
                            if(b.idInRange(this.pickResults[i][1])) {
                                b.handleID(this.pickResults[i][1]);
                                continue;
                            }
                        }
					}
				}
				this.pickResults.splice(0,this.pickResults.length);
			}		
		}
	}

    /**
     * Displays the scene.
     */
    display() {
        // ---- BEGIN Background, camera and axis setup
        if(!this.sceneInited)
            return;

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.axis.display();

        for (var key in this.lightVal) {
            const i = this.lightId[key];
            if(this.lightVal[key]) {
                this.lights[i].enable();
            } else {
                this.lights[i].disable();
            }
            this.lights[i].setVisible(false);
            this.lights[i].update();
        }
        
        this.setDefaultAppearance();

        // Displays the scene (MySceneGraph function).
        this.logPicking();
        this.graph.displayScene();

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}