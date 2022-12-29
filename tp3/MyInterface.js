import { CGFinterface, CGFapplication, dat } from '../lib/CGF.js';

/**
* MyInterface class, creating a GUI interface.
*/

export class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        return true;
    }

    /**
     * Setups gui after parsing is done (ie setup cameras and lights we got from parsing)
     */
    postParsingSetup() {
        this.gui = new dat.GUI();
        //var settings = new MyGameSettings();

        // add a group of controls (and open/expand by defult)
        this.gui.add(this.scene, 'selectedCamera', this.scene.cameraList).name('Cameras').onChange(this.scene.updateCamera.bind(this.scene));
        var folder = this.gui.addFolder('Lights');
        var shadefolder = this.gui.addFolder('Shaders');
        for(var key in this.scene.lightVal) {
            folder.add(this.scene.lightVal, key).name(key);
        }
        for(var key in this.scene.shaderVal) {
            shadefolder.add(this.scene.shaderVal, key).name(key);
        }
        this.gui.add(this.scene, 'selectedTheme', this.scene.themeList).name('Themes').onChange(this.scene.updateTheme.bind(this.scene));

        this.initKeys();
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
        if(event.code == "KeyM")
            this.scene.graph.matoffset++;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }
}