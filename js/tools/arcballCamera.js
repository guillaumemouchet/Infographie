import "../lib/gl-matrix.js";
import {PerspectiveCamera} from "./camera.js";

let dx = 0.0;
let dy = 0.0;
let dz = 0.0;

function onClickDownEvent(event) {
    switch (event.code) {
        case "KeyW":
            dz = -1;
            break;
        case "KeyS":
            dz = 1;
            break;
        case "KeyD":
            dx = 1;
            break;
        case "KeyA":
            dx = -1;
            break;
        case "KeyR":
            dy = 1;
            break;
        case "KeyF":
            dy = -1;
            break;
    }
}

function onClickUpEvent(event) {
    dx = 0.0;
    dy = 0.0;
    dz = 0.0;
}

document.addEventListener("keydown", onClickDownEvent);
document.addEventListener("keyup", onClickUpEvent);

class ArcballCamera extends PerspectiveCamera {
    /**
     * Arcball/Orbit camera
     * based on :
     * https://github.com/Twinklebear/webgl-util/blob/master/arcball.js
     * https://github.com/mosra/magnum-examples/blob/master/src/arcball/ArcBall.cpp
     * @param distance
     * @param target
     * @param radianAngle
     * @param screenDim
     * @param nearBound
     * @param farBound
     */
    constructor(
        distance,
        target,
        radianAngle,
        screenDim,
        nearBound,
        farBound
    ) {
        super([0, 0, distance], target, radianAngle, screenDim[0] / screenDim[1], nearBound, farBound);

        this.zoomSensibility = 30.2;
        this.zoom = 1.0;
        this.speed = 1.0;

        this.lefMousePressed = false;

        this.screenDim = screenDim;
        this.invScreen = [1.0 / screenDim[0], 1.0 / screenDim[1]];
    }

    /**
     * Set the canvas to bind with
     *
     * @param {HTMLElement} canvas
     */
    bindCanvas(canvas) {
        this.canvas = canvas;
        canvas.onmousemove = this._handleMouseMove.bind(this);
        canvas.onmousedown = this._handleMouseDown.bind(this);
        canvas.onmouseup = this._handleMouseUp.bind(this);
        // canvas.onmousewheel = this._handleMouseWheel.bind(this);
        canvas.addEventListener('wheel', ev => {
            this._handleMouseWheel(ev)
        }, false);

        canvas.onmouseover = this._handleMouseOver.bind(this);
        canvas.onmouseout = this._handleMouseOut.bind(this);
    }

    /**
     * Update current motion tracking angle and position
     */
    update(now) {
        if (this.lastFrameTime === undefined) {
            this.lastFrameTime = 0.0;
        }
        const deltatime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        let deltaTranslationVector = glMatrix.vec3.fromValues(
            dx * deltatime * this.speed,
            dy * deltatime * this.speed,
            dz * deltatime * this.speed
        );
        glMatrix.vec3.transformQuat(deltaTranslationVector, deltaTranslationVector, this.rotation);
        this.move(deltaTranslationVector);

        glMatrix.mat4.identity(this.modelMatrix);

        let lookAtMat = glMatrix.mat4.create();
        glMatrix.mat4.targetTo(lookAtMat, this.position, this.target, this.up);
        glMatrix.mat4.getRotation(this.rotation, lookAtMat);

        glMatrix.mat4.fromRotationTranslation(this.modelMatrix, this.rotation, this.position);

        // TODO Normally we want to inverse the view matrix but it doesnt work like it should
        glMatrix.mat4.invert(this.viewMatrix, this.modelMatrix);
    }

    // rotate(prevMouse, curMouse){
    //     let deltaAngleX = (360 / this.screenDim[0]); // a movement from left to right = 2*PI = 360 deg
    //     let deltaAngleY = (180 / this.screenDim[1]);  // a movement from top to bottom = PI = 180 deg
    //     let xAngle = -(curMouse[1]-prevMouse[1]) * deltaAngleX;
    //     let yAngle = -(curMouse[0]-prevMouse[0]) * deltaAngleY;
    //     let zAngle = 0;
    //
    //     // Transform the local / mouse rotation into a rotation in camera space
    //     [xAngle,yAngle,zAngle] = glMatrix.vec4.transformQuat(glMatrix.vec4.create(),[xAngle,yAngle,0,0], this.rotation)
    //
    //     let quat = glMatrix.quat.fromEuler(glMatrix.quat.create(),xAngle,yAngle,zAngle);
    //     this.rotation = glMatrix.quat.mul(this.rotation, quat, this.rotation);
    //     let vec4Pos = glMatrix.vec4.fromValues(this.position[0],this.position[1],this.position[2],1.0);
    //     glMatrix.vec4.transformQuat(vec4Pos,vec4Pos,quat);
    //     this.position = glMatrix.vec3.fromValues(vec4Pos[0],vec4Pos[1],vec4Pos[2]);
    //
    //     glMatrix.vec3.transformQuat(this.up, glMatrix.vec3.fromValues(0, 1, 0), this.rotation);
    //
    // }

    rotate(prevMouse, curMouse) {
        // Normalize
        let mPrev = glMatrix.vec2.set(glMatrix.vec2.create(),
            -clamp(prevMouse[0] * 2.0 * this.invScreen[0] - 1.0, -1.0, 1.0),
            -clamp(1.0 - prevMouse[1] * 2.0 * this.invScreen[1], -1.0, 1.0));

        // Normalize
        let mCur = glMatrix.vec2.set(glMatrix.vec2.create(),
            -clamp(curMouse[0] * 2.0 * this.invScreen[0] - 1.0, -1.0, 1.0),
            -clamp(1.0 - curMouse[1] * 2.0 * this.invScreen[1], -1.0, 1.0));

        let mPrevBall = screenToArcball(mPrev);
        let mCurBall = screenToArcball(mCur);

        // Transform the local / mouse rotation into a rotation in camera space
        let worldmPrev = glMatrix.vec4.transformQuat([],[mPrevBall[0],mPrevBall[1],mPrevBall[2],0], this.rotation); // We tranform the axis of the quarternion
        let worldmCur = glMatrix.vec4.transformQuat([],[mCurBall[0],mCurBall[1],mCurBall[2],0], this.rotation); // We tranform the axis of the quarternion
        mPrevBall = [worldmPrev[0],worldmPrev[1],worldmPrev[2], mPrevBall[3]];
        mCurBall = [worldmCur[0],worldmCur[1],worldmCur[2], worldmCur[3]];


        // rotation = curBall * prevBall * rotation
        this.rotation = glMatrix.quat.mul(this.rotation, mPrevBall, this.rotation);
        this.rotation = glMatrix.quat.mul(this.rotation, mCurBall, this.rotation);

        let vec4Pos = glMatrix.vec4.fromValues(this.position[0], this.position[1], this.position[2], 0.0);
        glMatrix.vec4.transformQuat(vec4Pos, vec4Pos, mPrevBall);
        glMatrix.vec4.transformQuat(vec4Pos, vec4Pos, mCurBall);
        this.position = glMatrix.vec3.fromValues(vec4Pos[0], vec4Pos[1], vec4Pos[2]);

        glMatrix.vec3.transformQuat(this.up, glMatrix.vec3.fromValues(0, 1, 0), this.rotation);

        function clamp(a, min, max) {
            return a < min ? min : a > max ? max : a;
        }

        function screenToArcball(p) {
            let dist = glMatrix.vec2.dot(p, p);
            if (dist <= 1.0) {
                return glMatrix.quat.set(glMatrix.quat.create(), p[0], p[1], Math.sqrt(1.0 - dist), 0);
            } else {
                let unitP = glMatrix.vec2.normalize(glMatrix.vec2.create(), p);
                return glMatrix.quat.set(glMatrix.quat.create(), unitP[0], unitP[1], 0, 0);
            }
        }
    }

    pan(mouseDelta) {
        let panSpeed = 3.0;
        let delta = glMatrix.vec3.set(glMatrix.vec3.create(), -mouseDelta[0] * this.invScreen[0] * panSpeed,
            -mouseDelta[1] * this.invScreen[1] * panSpeed, 0);

        glMatrix.vec3.transformQuat(delta, delta, this.rotation);
        glMatrix.vec3.add(this.target, this.target, delta);
        glMatrix.vec3.add(this.position, this.position, delta);
    }

    move(delta) {
        glMatrix.vec3.add(this.target, this.target, delta);
        glMatrix.vec3.add(this.position, this.position, delta);
    }


    /**
     * Return relative location of mouse
     *
     * @param {event} event
     */
    _getMousePosition(event) {
        let rect = this.canvas.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        };
    }

    /**
     * Event called when handleMouseOver
     *
     * @param {event} event
     */
    _handleMouseOver(event) {
        document.body.style.overflow = "hidden";
    }

    /**
     * Event called when handleMouseOut
     *
     * @param {event} event
     */
    _handleMouseOut(event) {
        document.body.style.overflow = "auto";
    }

    /**
     * Event called when handleMouseWheel
     *
     * @param {event} event
     */
    _handleMouseWheel(event) {
        const wheel = event.wheelDelta; // n or -n.

        let distanceToEarthCenter = glMatrix.vec3.distance(this.target, this.position)-1.0;
        let proportional_zoomSensib = this.zoomSensibility/distanceToEarthCenter;

        let delta = glMatrix.vec3.set(glMatrix.vec3.create(), 0, 0, Math.sign(wheel)* -1 / proportional_zoomSensib);

        glMatrix.vec3.transformQuat(delta, delta, this.rotation);
        glMatrix.vec3.add(this.position, this.position, delta);
    }

    /**
     * Event called when handleMouseMove
     *
     * @param {event} event
     */
    _handleMouseMove(event) {
        if (this.lefMousePressed) {
            let mousePosition = this._getMousePosition(event);
            this.rotate(this.previousMousPos, [mousePosition.x, mousePosition.y]);
            this.previousMousPos = [mousePosition.x, mousePosition.y];
        }
        if (this.rightMousePressed) {
            let mousePosition = this._getMousePosition(event);
            let diffX = mousePosition.x - this.previousMousPos[0];
            let diffY = mousePosition.y - this.previousMousPos[1];
            this.pan([diffX, -diffY]);
            this.previousMousPos = [mousePosition.x, mousePosition.y];
        }
    }

    /**
     * Event called when handleMouseDown
     *
     * @param {event} event
     */
    _handleMouseDown(event) {
        if (event.button === 0) this.lefMousePressed = true;
        if (event.button === 2) this.rightMousePressed = true;
        if (event.button === 0 || event.button === 2) {
            let mousePosition = this._getMousePosition(event);
            this.mouseX = mousePosition.x;
            this.mouseY = mousePosition.y;
            this.previousMousPos = [mousePosition.x, mousePosition.y]
        }
    }

    /**
     * Event called when handleMouseUp
     *
     * @param {event} event
     */
    _handleMouseUp(event) {
        if (event.button === 0) this.lefMousePressed = false;
        if (event.button === 2) this.rightMousePressed = false;
    }
}

export {ArcballCamera};
