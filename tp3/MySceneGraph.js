import { CGFappearance, CGFtexture, CGFXMLreader, CGFshader } from '../lib/CGF.js';
import { MyRectangle } from './MyRectangle.js';
import { MyTriangle } from './MyTriangle.js';
import { MyCylinder } from "./MyCylinder.js";
import { MySphere } from "./MySphere.js"
import { MyTorus } from "./MyTorus.js"
import { MyPatch } from "./MyPatch.js"
import { CGFOBJModel } from "./CGFOBJModel.js"
import { MyBoard} from "./MyBoard.js"
import { MyKeyframeAnimation } from "./MyKeyframeAnimation.js"

var DEGREE_TO_RAD = Math.PI / 180;

// Order of the groups in the XML document.
var SCENE_INDEX = 0;
var VIEWS_INDEX = 1;
var AMBIENT_INDEX = 2;
var LIGHTS_INDEX = 3;
var TEXTURES_INDEX = 4;
var MATERIALS_INDEX = 5;
var TRANSFORMATIONS_INDEX = 6;
var PRIMITIVES_INDEX = 7;
var ANIMATIONS_INDEX = 8;
var BOARD_INDEX = 9;
var COMPONENTS_INDEX = 10;

/**
 * MySceneGraph class, representing the scene graph.
 */
export class MySceneGraph {
    /**
     * @constructor
     */
    constructor(filename, scene) {
        this.loadedOk = null;

        // Establish bidirectional references between scene and graph.
        this.scene = scene;
        scene.graph = this;

        this.nodes = [];

        this.idRoot = null;                    // The id of the root element.

        this.axisCoords = [];
        this.axisCoords['x'] = [1, 0, 0];
        this.axisCoords['y'] = [0, 1, 0];
        this.axisCoords['z'] = [0, 0, 1];

        // File reading 
        this.reader = new CGFXMLreader();

        /*
         * Read the contents of the xml file, and refer to this class for loading and error handlers.
         * After the file is read, the reader calls onXMLReady on this object.
         * If any error occurs, the reader calls onXMLError on this object, with an error message
         */
        this.reader.open('scenes/' + filename, this);
    }

    /*
     * Callback to be executed after successful reading
     */
    onXMLReady() {
        this.log("XML Loading finished.");
        var rootElement = this.reader.xmlDoc.documentElement;

        // Here should go the calls for different functions to parse the various blocks
        var error = this.parseXMLFile(rootElement);

        if (error != null) {
            this.onXMLError(error);
            return;
        }

        this.loadedOk = true;

        // As the graph loaded ok, signal the scene so that any additional initialization depending on the graph can take place
        this.scene.onGraphLoaded();
        this.firstRun = true;
    }

    /**
     * Parses the XML file, processing each block.
     * @param {XML root element} rootElement
     */
    parseXMLFile(rootElement) {
        this.matoffset = 0;
        this.lastoffset = 0;

        if (rootElement.nodeName != "sxs")
            return "root tag <sxs> missing";

        var nodes = rootElement.children;

        // Reads the names of the nodes to an auxiliary buffer.
        var nodeNames = [];

        for (var i = 0; i < nodes.length; i++) {
            nodeNames.push(nodes[i].nodeName);
        }

        var error;

        // Processes each node, verifying errors.

        // <scene>
        var index;
        if ((index = nodeNames.indexOf("scene")) == -1)
            return "tag <scene> missing";
        else {
            if (index != SCENE_INDEX)
                this.onXMLMinorError("tag <scene> out of order " + index);

            //Parse scene block
            if ((error = this.parseScene(nodes[index])) != null)
                return error;
        }

        // <views>
        if ((index = nodeNames.indexOf("views")) == -1)
            return "tag <views> missing";
        else {
            if (index != VIEWS_INDEX)
                this.onXMLMinorError("tag <views> out of order");

            //Parse views block
            if ((error = this.parseView(nodes[index])) != null)
                return error;
        }

        // <ambient>
        if ((index = nodeNames.indexOf("ambient")) == -1)
            return "tag <ambient> missing";
        else {
            if (index != AMBIENT_INDEX)
                this.onXMLMinorError("tag <ambient> out of order");

            //Parse ambient block
            if ((error = this.parseAmbient(nodes[index])) != null)
                return error;
        }

        // <lights>
        if ((index = nodeNames.indexOf("lights")) == -1)
            return "tag <lights> missing";
        else {
            if (index != LIGHTS_INDEX)
                this.onXMLMinorError("tag <lights> out of order");

            //Parse lights block
            if ((error = this.parseLights(nodes[index])) != null)
                return error;
        }
        // <textures>
        if ((index = nodeNames.indexOf("textures")) == -1)
            return "tag <textures> missing";
        else {
            if (index != TEXTURES_INDEX)
                this.onXMLMinorError("tag <textures> out of order");

            //Parse textures block
            if ((error = this.parseTextures(nodes[index])) != null)
                return error;
        }

        // <materials>
        if ((index = nodeNames.indexOf("materials")) == -1)
            return "tag <materials> missing";
        else {
            if (index != MATERIALS_INDEX)
                this.onXMLMinorError("tag <materials> out of order");

            //Parse materials block
            if ((error = this.parseMaterials(nodes[index])) != null)
                return error;
        }

        // <transformations>
        if ((index = nodeNames.indexOf("transformations")) == -1)
            return "tag <transformations> missing";
        else {
            if (index != TRANSFORMATIONS_INDEX)
                this.onXMLMinorError("tag <transformations> out of order");

            //Parse transformations block
            if ((error = this.parseTransformations(nodes[index])) != null)
                return error;
        }

        // <primitives>
        if ((index = nodeNames.indexOf("primitives")) == -1)
            return "tag <primitives> missing";
        else {
            if (index != PRIMITIVES_INDEX)
                this.onXMLMinorError("tag <primitives> out of order");

            //Parse primitives block
            if ((error = this.parsePrimitives(nodes[index])) != null)
                return error;
        }

        // <animations>
        if ((index = nodeNames.indexOf("animations")) == -1)
            return "tag <animations> missing";
        else {
            if (index != ANIMATIONS_INDEX)
                this.onXMLMinorError("tag <animations> out of order");

            //Parse animations block
            if ((error = this.parseAnimations(nodes[index])) != null)
                return error;
        }

        // <boards>
        if ((index = nodeNames.indexOf("boards")) != -1) {
            if (index != BOARD_INDEX)
                this.onXMLMinorError("tag <boards> out of order");

            //Parse board block
            if ((error = this.parseBoards(nodes[index])) != null)
                return error;
        }

        // <components>
        if ((index = nodeNames.indexOf("components")) == -1)
            return "tag <components> missing";
        else {
            if (index != COMPONENTS_INDEX)
                this.onXMLMinorError("tag <components> out of order");

            //Parse components block
            if ((error = this.parseComponents(nodes[index])) != null)
                return error;
        }
        this.log("all parsed");
        this.startTime = new Date();
    }

    /**
     * Parses the <scene> block. 
     * @param {scene block element} sceneNode
     */
    parseScene(sceneNode) {

        // Get root of the scene.
        var root = this.reader.getString(sceneNode, 'root')
        if (root == null)
            return "no root defined for scene";

        this.idRoot = root;

        // Get axis length        
        var axis_length = this.reader.getFloat(sceneNode, 'axis_length');
        if (axis_length == null)
            this.onXMLMinorError("no axis_length defined for scene; assuming 'length = 1'");

        this.referenceLength = axis_length || 1;

        this.log("Parsed scene");

        return null;
    }

    /**
     * Parses the <views> block.
     * @param {view block element} viewsNode
     */
    parseView(viewsNode) {
        //this.onXMLMinorError("To do: Parse views and create cameras.");

        var children = viewsNode.children;

        this.cameras = {};
        var hasCamera = false;

        for(var i = 0; i < children.length; i++) {
            // Get id of the current cam.
            var camId = this.reader.getString(children[i], 'id');
            if (camId == null)
                return "no ID defined for view";

            // Checks for repeated IDs.
            if (this.cameras[camId] != null)
                return "ID must be unique for each view (conflict: ID = " + camId + ")";
            const cam = this.parseCamera(children[i], camId);
            if(cam != null)
                hasCamera = true;
            this.cameras[camId] = cam;
        }

        if(!hasCamera)
            return "Atleast one view must be defined";

        this.log("Parsed views");
        return null;
    }

    /**
     * Parse a single camera component and return array with values
     * @param {block element} cameraNode 
     * @param {String} camId 
     * @returns 
     */
    parseCamera(cameraNode, camId) {
        var global = [];
        var attributeNames = [];
        //Check type of cam
        if (cameraNode.nodeName != "perspective" && cameraNode.nodeName != "ortho") {
            this.onXMLMinorError("unknown tag <" + cameraNode.nodeName + ">");
            return null;
        }
        else {
            attributeNames.push(...["from", "to"]);
            global.push(cameraNode.nodeName);
        }

        // Specifications for the current view.
        var upIndex;
        var reqs = ["near", "far"];
        if(cameraNode.nodeName == "perspective")
            reqs.push("angle");
        else if(cameraNode.nodeName == "ortho") {
            reqs.push(...["left", "right", "top", "bottom"]);
        }

        for(var k = 0; k < reqs.length; k++) {
            var req = this.reader.getFloat(cameraNode, reqs[k])
            if(req == null)
                return "no " + reqs[k] + " defined for view " + camId;  
            global.push(req);
        }

        //children checks (from, to and opt up)
        var grandChildren = cameraNode.children;
        var nodeNames = [];
        for (var j = 0; j < grandChildren.length; j++) {
            nodeNames.push(grandChildren[j].nodeName);
        }

        for (var j = 0; j < attributeNames.length; j++) {
            var attributeIndex = nodeNames.indexOf(attributeNames[j]);

            if (attributeIndex != -1) {
                var aux = this.parseCoordinates3D(grandChildren[attributeIndex], "view position for ID " + camId);

                if (!Array.isArray(aux))
                    return aux;

                global.push(aux);
            }
            else
                return "view " + attributeNames[i] + " undefined for ID = " + camId;
        }

        if(cameraNode.nodeName == "ortho") {
            var upIndex = nodeNames.indexOf("up");

            if (upIndex != -1) {
                var aux = this.parseCoordinates3D(grandChildren[upIndex], "view position for ID " + camId);

                if (!Array.isArray(aux))
                    return aux;

                global.push(aux);
            } else {
                global.push([0,1,0]);
            }
        }
        return global;
    }

    /**
     * Parses the <ambient> node.
     * @param {ambient block element} ambientsNode
     */
    parseAmbient(ambientsNode) {

        var children = ambientsNode.children;

        this.ambient = [];
        this.background = [];

        var nodeNames = [];

        for (var i = 0; i < children.length; i++)
            nodeNames.push(children[i].nodeName);

        var ambientIndex = nodeNames.indexOf("ambient");
        var backgroundIndex = nodeNames.indexOf("background");

        var color = this.parseColor(children[ambientIndex], "ambient");
        if (!Array.isArray(color))
            return color;
        else
            this.ambient = color;

        color = this.parseColor(children[backgroundIndex], "background");
        if (!Array.isArray(color))
            return color;
        else
            this.background = color;

        this.log("Parsed ambient");

        return null;
    }

    /**
     * Parses the <light> node.
     * @param {lights block element} lightsNode
     */
    parseLights(lightsNode) {
        var children = lightsNode.children;

        this.lights = {};
        var numLights = 0;

        var grandChildren = [];
        var nodeNames = [];

        // Any number of lights.
        for (var i = 0; i < children.length; i++) {

            // Storing light information
            var global = [];
            var attributeNames = [];
            var attributeTypes = [];

            //Check type of light
            if (children[i].nodeName != "omni" && children[i].nodeName != "spot") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }
            else {
                attributeNames.push(...["location", "ambient", "diffuse", "specular"]);
                attributeTypes.push(...["position", "color", "color", "color"]);
            }

            // Get id of the current light.
            var lightId = this.reader.getString(children[i], 'id');
            if (lightId == null)
                return "no ID defined for light";

            // Checks for repeated IDs.
            if (this.lights[lightId] != null)
                return "ID must be unique for each light (conflict: ID = " + lightId + ")";

            // Light enable/disable
            var enableLight = this.reader.getBoolean(children[i], 'enabled');
            if (!(enableLight != null && !isNaN(enableLight) && (enableLight == true || enableLight == false))) {
                this.onXMLMinorError("unable to parse value component of the 'enable light' field for ID = " + lightId + "; assuming 'value = 1'");
                enableLight = true;
            }

            //Add enabled boolean and type name to light info
            global.push(enableLight);
            global.push(children[i].nodeName);

            grandChildren = children[i].children;
            // Specifications for the current light.

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            for (var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    if (attributeTypes[j] == "position")
                        var aux = this.parseCoordinates4D(grandChildren[attributeIndex], "light position for ID" + lightId);
                    else
                        var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " illumination for ID" + lightId);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                }
                else
                    return "light " + attributeNames[j] + " undefined for ID = " + lightId;
            }

            // Gets the additional attributes of the spot light
            if (children[i].nodeName == "spot") {
                var angle = this.reader.getFloat(children[i], 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of the light for ID = " + lightId;

                var exponent = this.reader.getFloat(children[i], 'exponent');
                if (!(exponent != null && !isNaN(exponent)))
                    return "unable to parse exponent of the light for ID = " + lightId;

                var targetIndex = nodeNames.indexOf("target");

                // Retrieves the light target.
                var targetLight = [];
                if (targetIndex != -1) {
                    var aux = this.parseCoordinates3D(grandChildren[targetIndex], "target light for ID " + lightId);
                    if (!Array.isArray(aux))
                        return aux;

                    targetLight = aux;
                }
                else
                    return "light target undefined for ID = " + lightId;

                global.push(...[angle, exponent, targetLight])
            }

            //Handles attenuation
            var attnIndex = nodeNames.indexOf("attenuation");

            if (attnIndex != -1) {
                var aux = this.parseAttenuation(grandChildren[attnIndex], "attenuation for ID " + lightId);
                if (!Array.isArray(aux))
                    return aux;

                global.push(aux);
            }

            this.lights[lightId] = global;
            numLights++;
        }

        if (numLights == 0)
            return "at least one light must be defined";
        else if (numLights > 8)
            this.onXMLMinorError("too many lights defined; WebGL imposes a limit of 8 lights");

        this.log("Parsed lights");
        this.numLights = numLights;
        return null;
    }

    /**
     * Parses the <textures> block. 
     * @param {textures block element} texturesNode
     */
    parseTextures(texturesNode) {

        //For each texture in textures block, check ID and file URL
        //this.onXMLMinorError("To do: Parse textures.");

        this.textures  = {};

        var children = texturesNode.children;

        for (var i = 0; i < children.length; i++) {
            if (children[i].nodeName != "texture") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var textureID = this.reader.getString(children[i], 'id');
            if (textureID == null)
                return "no ID defined for texture";
            if(textureID == "inherit")
                return "inherit ID reserved for textures"
            if(textureID == "none")
                return "none ID reserved for textures"


            // Checks for repeated IDs.
            if (this.textures[textureID] != null)
                return "ID must be unique for each texture (conflict: ID = " + textureID + ")";

            var textureLink = this.reader.getString(children[i], "file");
            if(textureLink == null)
                return "no path defined for texture " + textureID;
            /**var file = new File([""], textureLink);
            if(!file.exists) {
                this.onXMLMinorError("file doesn't exist " + textureLink);
            } else {
                var ext = filename.split('.').pop();
                if(ext != "jpg" && ext != "png")
                    this.onXMLMinorError("wrong filetype " + ext)
                else
                    this.textures[textureID] = file;
            }**/
            this.textures[textureID] = new CGFtexture(this.scene, textureLink);
        }

        this.log("Parsed textures");
        return null;
    }

    /**
     * Parses the <materials> node.
     * @param {materials block element} materialsNode
     */
    parseMaterials(materialsNode) {
        var children = materialsNode.children;

        this.materials = {};

        var grandChildren = [];
        var attributeNames = ["emission", "ambient", "diffuse", "specular"];
        var nodeNames = [];

        // Any number of materials.
        for (var i = 0; i < children.length; i++) {

            var global = [];

            if (children[i].nodeName != "material") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current material.
            var materialID = this.reader.getString(children[i], 'id');
            if (materialID == null)
                return "no ID defined for material";
            if(materialID == "inherit")
                return "inherit ID reserved for materials";

            // Checks for repeated IDs.
            if (this.materials[materialID] != null)
                return "ID must be unique for each material (conflict: ID = " + materialID + ")";

            var shiny = this.reader.getFloat(children[i], 'shininess');
            if (shiny == null)
                return "no shininess defined for mat";
            else
                global.push(shiny);

            
            grandChildren = children[i].children;
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }
            for(var j = 0; j < attributeNames.length; j++) {
                var attributeIndex = nodeNames.indexOf(attributeNames[j]);

                if (attributeIndex != -1) {
                    var aux = this.parseColor(grandChildren[attributeIndex], attributeNames[j] + " for ID " + materialID);

                    if (!Array.isArray(aux))
                        return aux;

                    global.push(aux);
                } else {
                    return attributeNames[j] + " undefined for mat " + materialID;
                }
            }
            this.materials[materialID] = global;
        }

        this.log("Parsed materials");
        return null;
    }

    /**
     * Parse a transformation block
     * @param {node being parsed} node
     * @param {id of node} transformationID
     * @returns combined transformation matrix
     */
    parseTransformation(node, transformationID) {
        var transfMatrix = mat4.create();
        var grandChildren = node.children;

        for (var j = 0; j < grandChildren.length; j++) {
            switch (grandChildren[j].nodeName) {
                case 'translate':
                    var coordinates = this.parseCoordinates3D(grandChildren[j], "translate transformation for ID " + transformationID);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.translate(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'scale':                        
                    var coordinates = this.parseCoordinates3D(grandChildren[j], "scale transformation for ID " + transformationID);
                    if (!Array.isArray(coordinates))
                        return coordinates;

                    transfMatrix = mat4.scale(transfMatrix, transfMatrix, coordinates);
                    break;
                case 'rotate':
                    var axis = this.reader.getString(grandChildren[j], 'axis');
                    var axisVec = [];
                    if (axis == null)
                        return "no axis defined for rotation";
                    
                    switch(axis) {
                        case 'x':
                            axisVec = [1,0,0];
                            break;
                        case 'y':
                            axisVec = [0,1,0];
                            break;
                        case 'z':
                            axisVec = [0,0,1];
                            break;
                        default:
                            return "wrong axis defined for rotaation";
                    }

                    var angle = this.reader.getFloat(grandChildren[j], 'angle');
                    if (angle == null)
                        return "no angle defined for rotation";

                    transfMatrix = mat4.rotate(transfMatrix, transfMatrix, angle*DEGREE_TO_RAD, axisVec);
                    break;
                default:
                    return "invalid node " + grandChildren[j].nodeName + " in transformation block"
            }
        }
        return transfMatrix;
    }

    /**
     * Parses the <transformations> block.
     * @param {transformations block element} transformationsNode
     */
    parseTransformations(transformationsNode) {
        var children = transformationsNode.children;

        this.transformations = {};

        // Any number of transformations.
        for (var i = 0; i < children.length; i++) {

            if (children[i].nodeName != "transformation") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current transformation.
            var transformationID = this.reader.getString(children[i], 'id');
            if (transformationID == null)
                return "no ID defined for transformation";

            // Checks for repeated IDs.
            if (this.transformations[transformationID] != null)
                return "ID must be unique for each transformation (conflict: ID = " + transformationID + ")";

            // Specifications for the current transformation.
            var transfMatrix = this.parseTransformation(children[i], transformationID);
            if(typeof transfMatrix == "string")
                return transfMatrix;
            this.transformations[transformationID] = transfMatrix;
        }

        this.log("Parsed transformations");
        return null;
    }

    /**
     * Parses the <primitives> block.
     * @param {primitives block element} primitivesNode
     */
    parsePrimitives(primitivesNode) {
        var children = primitivesNode.children;

        this.primitives = {};

        var grandChildren = [];

        // Any number of primitives.
        for (var i = 0; i < children.length; i++) {

            var prim;

            if (children[i].nodeName != "primitive") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current primitive.
            var primitiveId = this.reader.getString(children[i], 'id');
            if (primitiveId == null)
                return "no ID defined for texture";

            // Checks for repeated IDs.
            if (this.primitives[primitiveId] != null)
                return "ID must be unique for each primitive (conflict: ID = " + primitiveId + ")";

            grandChildren = children[i].children;

            // Validate the primitive type
            if ((grandChildren[0].nodeName != "patch" && grandChildren.length != 1) ||
                (grandChildren[0].nodeName != 'rectangle' && grandChildren[0].nodeName != 'triangle' &&
                    grandChildren[0].nodeName != 'cylinder' && grandChildren[0].nodeName != 'sphere' &&
                    grandChildren[0].nodeName != 'torus' && grandChildren[0].nodeName != "patch" && grandChildren[0].nodeName != "objfile")) {
                return "There must be exactly 1 primitive type (rectangle, triangle, cylinder, sphere or torus)"
            }

            // Specifications for the current primitive.
            var primitiveType = grandChildren[0].nodeName;

            // Retrieves the primitive coordinates.
            if (primitiveType == 'rectangle') {
                // x1
                var x1 = this.reader.getFloat(grandChildren[0], 'x1');
                if (!(x1 != null && !isNaN(x1)))
                    return "unable to parse x1 of the primitive coordinates for ID = " + primitiveId;

                // y1
                var y1 = this.reader.getFloat(grandChildren[0], 'y1');
                if (!(y1 != null && !isNaN(y1)))
                    return "unable to parse y1 of the primitive coordinates for ID = " + primitiveId;

                // x2
                var x2 = this.reader.getFloat(grandChildren[0], 'x2');
                if (!(x2 != null && !isNaN(x2) && x2 > x1))
                    return "unable to parse x2 of the primitive coordinates for ID = " + primitiveId;

                // y2
                var y2 = this.reader.getFloat(grandChildren[0], 'y2');
                if (!(y2 != null && !isNaN(y2) && y2 > y1))
                    return "unable to parse y2 of the primitive coordinates for ID = " + primitiveId;

                prim = new MyRectangle(this.scene, primitiveId, x1, x2, y1, y2);

            } else if(primitiveType == "triangle") {
                var coords = ["x1", "y1", "z1", "x2", "y2", "z2", "x3", "y3", "z3"]
                var l = [];

                for(var j = 0; j < coords.length; j++) {
                    var val = this.reader.getFloat(grandChildren[0], coords[j]);
                    if (!(val != null && !isNaN(val)))
                        return "unable to parse " +coords[i] +" of the primitive coordinates for ID = " + primitiveId;
                    l.push(val);
                }

                prim = new MyTriangle(this.scene, primitiveId, l[0], l[1], l[2], l[3], l[4], l[5], l[6], l[7], l[8]);

            } else if(primitiveType == "cylinder"){
                // base
                var base = this.reader.getFloat(grandChildren[0], 'base');
                if (!(base != null && !isNaN(base)))
                    return "unable to parse base of the primitive coordinates for ID = " + primitiveId;

                // top
                var top = this.reader.getFloat(grandChildren[0], 'top');
                if (!(top != null && !isNaN(top)))
                    return "unable to parse top of the primitive coordinates for ID = " + primitiveId;

                // height
                var height = this.reader.getFloat(grandChildren[0], 'height');
                if (!(height != null && !isNaN(height) && height > 0))
                    return "unable to parse height of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                prim = new MyCylinder(this.scene, primitiveId, base, top, height, slices, stacks);
            } else if(primitiveType == "sphere") {
                // radius
                var radius = this.reader.getFloat(grandChildren[0], 'radius');
                if (!(radius != null && !isNaN(radius) && radius > 0))
                    return "unable to parse radius of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // stacks
                var stacks = this.reader.getInteger(grandChildren[0], 'stacks');
                if (!(stacks != null && !isNaN(stacks) && stacks > 0))
                    return "unable to parse stacks of the primitive coordinates for ID = " + primitiveId;

                prim = new MySphere(this.scene, primitiveId, radius, slices, stacks);
            } else if(primitiveType == "torus") {
                // inner
                var inner = this.reader.getFloat(grandChildren[0], 'inner');
                if (!(inner != null && !isNaN(inner) && inner > 0))
                    return "unable to parse inner of the primitive coordinates for ID = " + primitiveId;

                // outer
                var outer = this.reader.getFloat(grandChildren[0], 'outer');
                if (!(outer != null && !isNaN(outer) && outer > 0))
                    return "unable to parse outer of the primitive coordinates for ID = " + primitiveId;

                // slices
                var slices = this.reader.getInteger(grandChildren[0], 'slices');
                if (!(slices != null && !isNaN(slices) && slices >= 3))
                    return "unable to parse slices of the primitive coordinates for ID = " + primitiveId;

                // loops
                var loops = this.reader.getInteger(grandChildren[0], 'loops');
                if (!(loops != null && !isNaN(loops) && loops > 0))
                    return "unable to parse loops of the primitive coordinates for ID = " + primitiveId;

                prim = new MyTorus(this.scene, primitiveId, inner, outer, slices, loops);
            } else if(primitiveType == "patch") {
                var degree_u = this.reader.getInteger(grandChildren[0], 'degree_u');
                if (!(degree_u != null && !isNaN(degree_u) && degree_u > 0))
                    return "unable to parse degree_u of the primitive coordinates for ID = " + primitiveId;

                var parts_u = this.reader.getInteger(grandChildren[0], 'parts_u');
                if (!(parts_u != null && !isNaN(parts_u) && parts_u > 0))
                    return "unable to parse parts_u of the primitive coordinates for ID = " + primitiveId;

                var degree_v = this.reader.getInteger(grandChildren[0], 'degree_v');
                if (!(degree_v != null && !isNaN(degree_v) && degree_v > 0))
                    return "unable to parse degree_v of the primitive coordinates for ID = " + primitiveId;

                var parts_v = this.reader.getInteger(grandChildren[0], 'parts_v');
                if (!(parts_v != null && !isNaN(parts_v) && parts_v > 0))
                    return "unable to parse parts_v of the primitive coordinates for ID = " + primitiveId;

                var controlpoints = [];

                var grandgrandChildren = grandChildren[0].children;

                if(grandgrandChildren.length != (degree_u+1)*(degree_v+1))
                    return "incorrect number of controlpoints";

                for(let u = 0; u < (degree_u+1); u++) {
                    var subarray = [];
                    for(let v = 0; v < (degree_v+1); v++) {
                        var cpnode = grandgrandChildren[u*(degree_v+1)+v];

                        if(cpnode.nodeName != "controlpoint")
                            this.onXMLMinorError("Wrong name for controlpoint");
                        
                        var point = this.parseCoordinates3D(cpnode);
                        if (!Array.isArray(point))
                            return point;

                        point.push(1); //weight
                        subarray.push(point);
                    }
                    controlpoints.push(subarray);
                }

                prim = new MyPatch(this.scene, degree_u, parts_u, degree_v, parts_v, controlpoints);
            } else if(primitiveType == "objfile") {
                var file = this.reader.getString(grandChildren[0], 'file');
                if (file == null)
                    return "unable to parse file of the primitive coordinates for ID = " + primitiveId;

                prim = new CGFOBJModel(this.scene, file);
            }

            this.primitives[primitiveId] = prim;
        }

        this.log("Parsed primitives");
        return null;
    }

    /**
     * Parses the <animations> block. 
     * @param {animations block element} animNode
     */
    parseAnimations(animNode) {

        this.animations = {};

        let children = animNode.children;
        for(let i = 0; i < children.length; i++) {
            let anim = children[i];
            if(anim.nodeName != "keyframeanim")
                this.onXMLMinorError("Incorrect name for keyframeanim: " + anim.nodeName);
            var animID = this.reader.getString(anim, 'id');
            if (animID == null)
                return "no ID defined for keyframeanim";
            let keyframes = anim.children;
            if(keyframes.length < 1)
                return "keyframeanim must have atleast one keyframe"
            
            var keyframeList = [];
            let lastInstant = -1;
            for(let j = 0; j < keyframes.length; j++) {
                let keyframe = keyframes[j];
                if(keyframe.nodeName != "keyframe")
                    this.onXMLMinorError("Incorrect name for keyframe: " + keyframe.nodeName);
                let instant = this.reader.getFloat(keyframe, 'instant');
                if (!(instant != null && !isNaN(instant)))
                    return "no instant defined for keyframe on " + animID;
                if(instant < lastInstant)
                    return "wrong instant order for keyframe on " + animID;
                lastInstant = instant;
                var keyframeobj = this.parseKeyframe(keyframe, animID);
                if(typeof keyframeobj == "string")
                    return keyframeobj;
                var keyObj = [instant, keyframeobj];
                keyframeList.push(keyObj);
            }
            this.animations[animID] = new MyKeyframeAnimation(this.scene, keyframeList);
        }

        this.log("Parsed animations");
        return null;
    }

    /**
   * Parses the keyframe transformations
   * @param {keyframe block element} keyframe
   * @param {string} animID associated animation ID
   */
    parseKeyframe(keyframe, animID) {
        var keyframeobj = {};
        //set defaults
        keyframeobj['trans'] = [0,0,0];
        keyframeobj['xrot'] = 0;
        keyframeobj['yrot'] = 0;
        keyframeobj['zrot'] = 0;
        keyframeobj['scale'] = [1,1,1];
        let expectedNodes = ['translation', 'rotation', 'rotation', 'rotation', 'scale'];
        let expectedRotations = [null, 'z', 'y', 'x', null];
        let unnacounted = [0, 1, 2, 3, 4]
        for(let i = 0; i < keyframe.children.length; i++) {
            let node = keyframe.children[i];
            let pos = expectedNodes.indexOf(node.nodeName);
            if(pos == -1)
                this.onXMLMinorError("Wrong node " + node.nodeName + " on keyframe for animation " + animID);
            else if(pos != i)
                this.onXMLMinorError("Wrong node order " + node.nodeName + " on keyframe for animation " + animID);
            expectedNodes[pos] = null; //for repeated rotation
            if(node.nodeName == "translation") {
                var aux = this.parseCoordinates3D(node, "translation for keyframe on animation " + animID);
                if (!Array.isArray(aux))
                    return aux;
                keyframeobj['trans'] = aux;
                unnacounted.splice(unnacounted.indexOf(0), 1);
            } else if(node.nodeName == "rotation") {
                var axis = this.reader.getString(node, 'axis');
                var index = expectedRotations.indexOf(axis)
                if (index == -1)
                    return "Unknown axis for rotation for keyframe on animation " + animID;
                else if(axis != expectedRotations[index])
                    this.onXMLMinorError("Wrong node order " + axis + "-rotation on keyframe for animation " + animID);
                var angle = this.reader.getFloat(node, 'angle');
                if (!(angle != null && !isNaN(angle)))
                    return "unable to parse angle of " + axis + "-rotation on keyframe for animation " + animID;
                keyframeobj[axis+'rot'] = angle;
                unnacounted.splice(unnacounted.indexOf(index), 1);
            } else if(node.nodeName == "scale") {
                var aux = this.parseCoordinates3D(node, "translation for keyframe on animation " + animID, 's');
                if (!Array.isArray(aux))
                    return aux;
                keyframeobj['scale'] = aux;
                unnacounted.splice(unnacounted.indexOf(5), 1);
            }
        }
        for(let i = 0; i < unnacounted.length; i++) {
            let val = unnacounted[i];
            let couldntFind = expectedNodes[val];
            if(expectedRotations[val] != null)
                couldntFind = expectedRotations[val] + "-" + couldntFind;
            this.onXMLMinorError("Used default value for " + couldntFind + " because wasnt defined for keyframe on " + animID);
        }
        return keyframeobj;
    }

    /**
     * Parses the <boards> block.
     * @param {boards block element} boards
     */
    parseBoards(boards) {
        let children = boards.children;
        this.boards = {};
        this.huds = [];
        this.boardPickID = 0;
        for(let i = 0; i < children.length; i++) {
            let res = this.parseBoard(children[i]);
            if(res != null)
                return res;
        }
    }


    /**
     * Parses the <board> block.
     * @param {board block element} boardNode
     */
    parseBoard(boardNode) {
        var id = this.reader.getString(boardNode, 'id');
        if (id == null)
            return "no id defined for board";
        var size = this.reader.getInteger(boardNode, 'size');
        if (size == null)
            return "no size defined for board";
        if (size % 2 != 0 || size < 6)
            return "invalid size for board (even numbers greater or equal to 6)";
        var piece_radius = this.reader.getFloat(boardNode, 'piece_radius');
        if (piece_radius == null)
            return "no piece radius defined for board";
        var piece_height = this.reader.getFloat(boardNode, 'piece_height');
        if (piece_height == null)
            return "no piece height defined for board";
        var spotlight = this.reader.getString(boardNode, 'spotlight');
        if (spotlight == null)
            return "no spotlight defined for board";
        if(this.lights[spotlight][1] != "spot")
            return "referenced light is not spotlight"
        
        let buttpositions = {}
        let buttons = ["undo_transform","restart_transform","demo_transform","camera_transform"]
        for(let i = 0; i < 4; i++) {
            var transform = this.reader.getString(boardNode, buttons[i]);
            transform = this.transformations[transform];
            if(transform == null)
                return "Invalid definition of " + buttons[i] + " for " + id;
            buttpositions[buttons[i]] = transform;
        }

        let cappositions = []
        let caps = ["capture_1","capture_2"]
        for(let i = 0; i < 2; i++) {
            try {
                var transform = this.reader.getString(boardNode, caps[i]);
                transform = this.transformations[transform];
                cappositions.push(transform);
            } catch {
                continue;
            }
        }
        
        var time = this.reader.getInteger(boardNode, 'time');
        if (time == null)
            time = 30;
        var mats = [];
        var matsNeed = ["pos1_mat", "pos2_mat"];
        for(let i = 0; i < matsNeed.length; i++) {
            var matid = this.reader.getString(boardNode, matsNeed[i]);
            if(matid == null)
                return "no ID defined for material " + matsNeed[i] + " on board";
            var mat = this.materials[matid];
            if(mat == null)
                return "unknown material " + matid;
            mats.push(mat);
        }
        var frame = this.reader.getString(boardNode, 'ui_frame');
        frame = this.textures[frame];

        let children = boardNode.children;
        let cams = [];
        for(let i = 0; i < children.length; i++) {
            const cam = this.parseCamera(children[i], id);
            if(cam[0] == "perspective")
                cams.push(cam);
        }
        if(cams.length < 2)
            return "Not enough cam positions defined for board " + id;
        this.boards[id] = new MyBoard(this.scene, this, id, this.boardPickID, size, piece_radius, piece_height, mats, spotlight, time, buttpositions, frame, cams, cappositions);
        this.boardPickID = this.boards[id].getNewID();
        this.huds.push(this.boards[id].getHUD())
    }


    /**
   * Parses the <components> block.
   * @param {components block element} componentsNode
   */
     parseComponents(componentsNode) {
        var children = componentsNode.children;

        this.components = {};
        this.shaders = {};
        this.shaderComponents = [];

        var grandChildren = [];
        var grandgrandChildren = [];
        var nodeNames = [];

        // Any number of components.
        for (var i = 0; i < children.length; i++) {

            var component = {};

            if (children[i].nodeName != "component") {
                this.onXMLMinorError("unknown tag <" + children[i].nodeName + ">");
                continue;
            }

            // Get id of the current component.
            var componentID = this.reader.getString(children[i], 'id');
            if (componentID == null)
                return "no ID defined for componentID";

            // Checks for repeated IDs.
            if (this.components[componentID] != null)
                return "ID must be unique for each component (conflict: ID = " + componentID + ")";

            grandChildren = children[i].children;

            nodeNames = [];
            for (var j = 0; j < grandChildren.length; j++) {
                nodeNames.push(grandChildren[j].nodeName);
            }

            var transformationIndex = nodeNames.indexOf("transformation");
            var materialsIndex = nodeNames.indexOf("materials");
            var textureIndex = nodeNames.indexOf("texture");
            var childrenIndex = nodeNames.indexOf("children");
            if(transformationIndex == -1 || materialsIndex == -1 || textureIndex == -1 || childrenIndex == -1)
                return "Component missing definitions (transformation/materials/texture/children) " + componentID;

            // Transformations
            var transfMatrix;
            var trans = grandChildren[transformationIndex];
            if(trans.children.length == 1 && trans.children[0].nodeName == "transformationref") {
                var reference = this.reader.getString(trans.children[0], 'id');
                transfMatrix = this.transformations[reference];
                if(transfMatrix == null)
                    return "unknown transformationref " + reference;
            } else {
                transfMatrix = this.parseTransformation(grandChildren[transformationIndex], "component " + componentID);
            }
            if(typeof transfMatrix == "string")
                return transfMatrix;
            component["transformation"] = transfMatrix;
            // Materials
            grandgrandChildren = grandChildren[materialsIndex].children;
            var mats = [];
            for(var j = 0; j < grandgrandChildren.length; j++) {
                var node = grandgrandChildren[j];
                if(node.nodeName != "material")
                    this.onXMLMinorError("Wrong name for material node: " +  node.nodeName);
                var matid = this.reader.getString(node, "id");
                if(matid == null)
                    return "no ID defined for material reference";
                if(matid != "inherit") {
                    var mat = this.materials[matid];
                    if(mat == null)
                        return "unknown material " + matid;
                }
                mats.push(matid);
            }
            if(mats.length == 0)
                return "no materials defined for component " + componentID;
            component["materials"] = mats;
            // Texture
            var textnode = grandChildren[textureIndex];
            var tid = this.reader.getString(textnode, "id");
            if(tid == null)
                return "no id for texture on " + componentID;
            if(tid != "inherit" && tid != "none") {
                var tex = this.textures[tid];
                if(tex == null)
                    return "unknown texture " + tid; 
                var length_s = this.reader.getFloat(textnode, "length_s");
                var length_t = this.reader.getFloat(textnode, "length_t");
                if(length_s == null || length_t == null) {
                    this.onXMLMinorError("No length defined for texture on component " + componentID + " defaulting to 1")
                    if(length_s == null)
                        length_s = 1
                    if(length_t == null)
                        length_t = 1
                }
                component["texture"] = [tid, length_s, length_t];
            } else {
                var has_s = this.reader.hasAttribute(textnode, "length_s");
                var has_t = this.reader.hasAttribute(textnode, "length_t");
                if(has_s || has_t)
                    this.onXMLMinorError("lengths defined for inherit or none")
                component["texture"] = [tid];
            }
            // Children
            grandgrandChildren = grandChildren[childrenIndex].children;
            var primmies = [];
            var childComps = [];
            for(var j = 0; j < grandgrandChildren.length; j++) {
                var node = grandgrandChildren[j];
                if(node.nodeName != "componentref" && node.nodeName != "primitiveref" && node.nodeName != "board")
                    return "unknown node type for component children " + componentID;
                var cid = this.reader.getString(node, "id");
                if(cid == null)
                    return "id not defined for component child " + componentID;
                if(node.nodeName == "componentref") {
                    childComps.push(cid);
                } else if(node.nodeName == "primitiveref") {
                    var primitive = this.primitives[cid];
                    if(primitive == null)
                        return "Unknown primitive " + cid;
                    primmies.push(primitive);
                } else if(node.nodeName == "board") {
                    component['board'] = cid;
                }
            }
            if(primmies.length == 0 && childComps.length == 0 && component['board'] == null)
                return "no children defined for component " + componentID;
            component['primitives'] = primmies;
            component['children'] = childComps;
            //highlighted
            var highlightedIndex = nodeNames.indexOf("highlighted");
            if(highlightedIndex != -1) {
                if(primmies.length == 0) {
                    this.onXMLMinorError("highlight set for " + componentID + " but no child primitives");
                } else {
                    let highlight = grandChildren[highlightedIndex];
                    let color = this.parseColor(highlight, "highlighted on " + componentID, true);
                    var scale_h = this.reader.getFloat(highlight, 'scale_h');
                    if (!(scale_h != null && !isNaN(scale_h)))
                        return "unable to parse scale of highlighted in " + componentID + " component";
                    
                    let shader = new CGFshader(this.scene.gl, "shaders/pulsar.vert", "shaders/pulsar.frag");
                    shader.setUniformsValues({ normScale: scale_h });
                    shader.setUniformsValues({ r: color[0] });
                    shader.setUniformsValues({ g: color[1] });
                    shader.setUniformsValues({ b: color[2] });
                    shader.setUniformsValues({ mat_r: 0 });
                    shader.setUniformsValues({ mat_g: 0 });
                    shader.setUniformsValues({ mat_b: 0 });
                    shader.setUniformsValues({ hasTexture: false });
                    
                    this.shaders[componentID] = shader;
                    component['shaderInit'] = false;
                    this.shaderComponents.push(componentID);
                }
            }
            //animation
            var animationIndex = nodeNames.indexOf("animation");
            if(animationIndex != -1) {
                var animId = this.reader.getString(grandChildren[animationIndex], 'id');
                if (animId == null)
                    return "unable to parse id of animation in " + componentID + " component";
                let animation = this.animations[animId];
                if(animation == null)
                    return "unknown animation " + animId + " on component " + componentID;
                component["animation"] = animId;
            }

            this.components[componentID] = component;
        }

        return this.componentGraphCheck(this.idRoot, [this.idRoot]);
    }

    /**
     * Explores component graph to ensure children correctly exist
     * @param {node id} id
     * @param {array of visited nodes} visited
     */
    componentGraphCheck(id, visited) {
        var component = this.components[id];
        var children = component['children'];
        for(var i = 0; i < children.length; i++) {
            if(this.components[children[i]] == null)
                return "unknown child component " + children[i];
            if(visited.includes(children[i]))
                return "node loop in component " + children[i];
            var rec = this.componentGraphCheck(children[i], visited.concat([children[i]]));
            if(rec != null)
                return rec;
        }
        return null;
    }


    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates3D(node, messageError, prefix = '') {
        var position = [];

        // x
        var x = this.reader.getFloat(node, prefix+'x');
        if (!(x != null && !isNaN(x)))
            return "unable to parse x-coordinate of the " + messageError;

        // y
        var y = this.reader.getFloat(node, prefix+'y');
        if (!(y != null && !isNaN(y)))
            return "unable to parse y-coordinate of the " + messageError;

        // z
        var z = this.reader.getFloat(node, prefix+'z');
        if (!(z != null && !isNaN(z)))
            return "unable to parse z-coordinate of the " + messageError;

        position.push(...[x, y, z]);

        return position;
    }

    /**
     * Parse the attenuation from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
     parseAttenuation(node, messageError) {
        var attenuation = [];
        var notzero = false;

        // constant
        var constant = this.reader.getFloat(node, 'constant');
        if (!(constant != null && !isNaN(constant)))
            return "unable to parse constant of the " + messageError;
        if(constant != 0) {
            notzero = true;
            if(constant != 1)
                return "invalid non-zero value for constant only 1.0 allowed of " + messageError
        }

        // linear
        var linear = this.reader.getFloat(node, 'linear');
        if (!(linear != null && !isNaN(linear)))
            return "unable to parse linear of the " + messageError;
        if(linear != 0) {
            if(notzero)
                return "more than one non zero value set for attenuation of the " + messageError;
            else
                notzero = true;
            if(linear != 1)
                return "invalid non-zero value for linear only 1.0 allowed of " + messageError
        }

        // quadratic
        var quadratic = this.reader.getFloat(node, 'quadratic');
        if (!(quadratic != null && !isNaN(quadratic)))
            return "unable to parse quadratic of the " + messageError;
        if(quadratic != 0) {
            if(notzero)
                return "more than one non zero value set for attenuation of the " + messageError;
            else
                notzero = true;
            if(quadratic != 1)
                return "invalid non-zero value for quadratic only 1.0 allowed of " + messageError
    
        }
        attenuation.push(...[constant, linear, quadratic]);

        return attenuation;
    }

    /**
     * Parse the coordinates from a node with ID = id
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     */
    parseCoordinates4D(node, messageError) {
        var position = [];

        //Get x, y, z
        position = this.parseCoordinates3D(node, messageError);

        if (!Array.isArray(position))
            return position;


        // w
        var w = this.reader.getFloat(node, 'w');
        if (!(w != null && !isNaN(w)))
            return "unable to parse w-coordinate of the " + messageError;

        position.push(w);

        return position;
    }

    /**
     * Parse the color components from a node
     * @param {block element} node
     * @param {message to be displayed in case of error} messageError
     * @param {boolean} skipA wether to skip component a
     */
    parseColor(node, messageError, skipA = false) {
        var color = [];

        // R
        var r = this.reader.getFloat(node, 'r');
        if (!(r != null && !isNaN(r) && r >= 0 && r <= 1))
            return "unable to parse R component of the " + messageError;

        // G
        var g = this.reader.getFloat(node, 'g');
        if (!(g != null && !isNaN(g) && g >= 0 && g <= 1))
            return "unable to parse G component of the " + messageError;

        // B
        var b = this.reader.getFloat(node, 'b');
        if (!(b != null && !isNaN(b) && b >= 0 && b <= 1))
            return "unable to parse B component of the " + messageError;

        // A
        if(!skipA) {
        var a = this.reader.getFloat(node, 'a');
        if (!(a != null && !isNaN(a) && a >= 0 && a <= 1))
            return "unable to parse A component of the " + messageError;
        }

        color.push(...[r, g, b, a]);

        return color;
    }

    /** 
     * Callback to be executed on any read error, showing an error on the console.
     * @param {string} message
     */
    onXMLError(message) {
        console.error("XML Loading Error: " + message);
        this.loadedOk = false;
    }

    /**
     * Callback to be executed on any minor error, showing a warning on the console.
     * @param {string} message
     */
    onXMLMinorError(message) {
        console.warn("Warning: " + message);
    }

    /**
     * Callback to be executed on any message.
     * @param {string} message
     */
    log(message) {
        console.log("   " + message);
    }

    /**
     * Displays the scene, processing each node, starting in the root node.
     */
    displayScene() {
        this.displayNode(this.idRoot, null, null);
        for(let i = 0; i < this.huds.length; i++) {
            this.scene.pushMatrix();
            this.huds[i].display(i);
            this.scene.popMatrix();
        }
        this.lastoffset = this.matoffset;
        this.firstRun = false;
    }

    /**
     * Updates animations by float
     * @param {float} t time
     */
    updateAnimations(t) {
        for(let key in this.animations) {
            let anim = this.animations[key];
            anim.update(t);
        }
        for(let key in this.boards) {
            let b = this.boards[key];
            b.updateAnimations(t);
        }
    }

    /**
     * Updates shaders by time
     * @param {float} t time 
     */
    updateShaders(t) {
        for(let key in this.shaders) {
            if(!this.scene.shaderVal[key])
                continue;
            let shader = this.shaders[key];
            shader.setUniformsValues({ timeFactor: t });
        }
    }

    /**
     * Normalizes a vector
     * @param {Array} a Vector array
     * @returns Normalized vector
     */
    normalizeVec(a) {
        let length = Math.sqrt((a[0] * a[0]) + (a[1] * a[1]) + (a[2] * a[2]));
        return [a[0] / length, a[1] / length, a[2] / length,]
    }

    /**
     * Explores component graph to display
     * @param {node id} id
     * @param {material id of parent node} lastmat
     * @param {texture object of parent node} lasttex
     */
    displayNode(id, lastmat, lasttex) {
    var component = this.components[id];
    var children = component['children'];
    var primitives = component['primitives'];
    var transfMatrix = component['transformation'];
    var animation = this.animations[component['animation']];
    var shader = this.shaders[id];
    var board = component['board'];
    var shaderInit = component['shaderInit'];


    this.scene.pushMatrix();
    //transform
    this.scene.multMatrix(transfMatrix); //component transform
    if(animation != null) {
        let draw = animation.doDraw();
        if(!draw) {
            this.scene.popMatrix();
            return null;
        }
        animation.apply();
    }
    
    //appearance
    let appearance = new CGFappearance(this.scene);
    //textures
    var tex = component['texture'];
    if(tex[0] == "inherit")
        tex = lasttex;
    if(tex[0] != "none") {
        appearance.setTexture(this.textures[tex[0]]);
        component["s"] = tex[1];
        component["t"] = tex[2];
    }
    appearance.setTextureWrap('REPEAT', 'REPEAT');
    //material
    var matl = component['materials'].length;
    var matid = component['materials'][this.matoffset % matl];
    if(matid == "inherit")
        matid = lastmat;
    var mat = this.materials[matid];
    //order stored is shini/emmision/diffuse/specular
    appearance.setShininess(mat[0]);
    appearance.setEmission(mat[1][0], mat[1][1], mat[1][2], mat[1][3]);
    appearance.setAmbient(mat[2][0], mat[2][1], mat[2][2], mat[2][3]);
    appearance.setDiffuse(mat[3][0], mat[3][1], mat[3][2], mat[3][3]);
    appearance.setSpecular(mat[4][0], mat[4][1], mat[4][2], mat[4][3]);
    appearance.apply();

    if(shader != null && this.scene.shaderVal[id]) {
        if(!shaderInit || this.lastoffset != this.matoffset) { //update mat on change or start
            let col = this.normalizeVec(mat[2]);
            shader.setUniformsValues({ mat_r: col[0] });
            shader.setUniformsValues({ mat_g: col[1] });
            shader.setUniformsValues({ mat_b: col[2] });
        }
        if(!shaderInit) {
            if(tex!="none") {
                shader.setUniformsValues({ hasTexture: true });
            }
            component['shaderInit'] = true;
        }
        this.scene.setActiveShaderSimple(shader);
    }

    for(var i = 0; i < primitives.length; i++) {
        //primitives[i].enableNormalViz();
        if(!primitives[i].isQuadratic())
            primitives[i].setLength(component["s"], component["t"]);
        this.scene.registerForPick(-1, primitives[i]);
        primitives[i].display();
    }

    if(shader != null && this.scene.shaderVal[id])
        this.scene.setActiveShaderSimple(this.scene.defaultShader);

    if(board != null) {
        this.boards[board].display();
    }

    //keep exploring
    for(var i = 0; i < children.length; i++) {
        this.displayNode(children[i], matid, tex);
    }

    this.scene.popMatrix();
    return null;
}
}