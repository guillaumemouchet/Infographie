import "../lib/gl-matrix.js";
import "../lib/tweakpane-plugin-rotation.min.js";
import "../lib//tweakpane-plugin-infodump-0.2.0.js";

class Camera {

    constructor(position = [0.0, 0.0, 0.0], target = [0.0, 0.0, 0.0]) {
        this.modelMatrix = glMatrix.mat4.create();
        this.viewMatrix = glMatrix.mat4.create();
        this.projectionMatrix = glMatrix.mat4.create();

        this.up = glMatrix.vec3.fromValues(0, 1, 0);
        this.position = glMatrix.vec3.fromValues(
            position[0],
            position[1],
            position[2]
        );
        this.rotation = glMatrix.quat.create();

        this.target = glMatrix.vec3.fromValues(target[0], target[1], target[2]);

        // Two special and rare cases have to be tested
        // TODO : Il y a un problème d'orientation ici
        // let la_vec_x = target[0] - position[0];
        // let la_vec_y = target[1] - position[1];
        // let la_vec_z = target[2] - position[2];
        //
        // if (la_vec_x === 0.0 && la_vec_y === 0.0) {
        //   // special case#1 if look at vector is null:
        //   if (la_vec_z === 0.0) {
        //     this.position = glMatrix.vec3.fromValues(0.0, 0.0, -1.0);
        //     this.target = glMatrix.vec3.fromValues(0.0, 0.0, 0.0);
        //   } // special case#2, collinear vector
        //   else {
        //     this.up = glMatrix.vec3.fromValues(-1.0, 0.0, 0.0);
        //   }
        // }

        this.updateViewMatrix();
    }

    get positionAsDict()
    {
        return {x: this.position[0],y: this.position[1],z: this.position[2]}
    }

    get quatRotationAsDict() {
        return {x: this.rotation[0], y: this.rotation[1], z: this.rotation[2], w: this.rotation[3]}
    }

    get eulerRotation() {
        let eRot = ArcballCamera.quatToEuler(this.rotation);
        return {x: eRot[0], y: eRot[1], z: eRot[2]}
    }

    get rotationMatrix() {
        return glMatrix.mat4.fromQuat(glMatrix.mat4.create(), this.rotation);
    }

    get inverseRotationMatrix() {
        return glMatrix.mat4.invert(glMatrix.mat4.create(), this.rotationMatrix);
    }

    static quatToEuler(q) {
        // https://en.wikipedia.org/wiki/Conversion_between_quaternions_and_Euler_angles

        // roll (x-axis rotation)
        let sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
        let cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
        let xRot = Math.atan2(sinr_cosp, cosr_cosp);

        let yRot;
        let sinp = 2 * (q[3] * q[1] - q[2] * q[0]);
        if (Math.abs(sinp) >= 1) {
            const copySign = (x, y) => Math.sign(x) === Math.sign(y) ? x : -x;
            yRot = copySign(M_PI / 2, sinp); // use 90 degrees if out of range
        } else {
            yRot = Math.asin(sinp);
        }

        let siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
        let cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
        let zRot = Math.atan2(siny_cosp, cosy_cosp);

        return glMatrix.vec3.fromValues(xRot, yRot, zRot);
    }

    /**
     * Append Camera information folder to your Tweakpane window.
     * @param gui - Tweakpane root window (ex: pane, gui)
     * @param container - Tweakpane element to append the Camera info to
     * @param camera - Camera object used to display the informations
     */
    static appendCameraInfoToTweakpaneGUI(gui, container, camera) {
        gui.registerPlugin(TweakpaneRotationInputPlugin);
        gui.registerPlugin(TweakpaneInfodumpPlugin);

        const cameraFolder = container.addFolder({
            title: 'Camera transform (read-only)',
        });

        cameraFolder.addBlade({
            view: "infodump",
            content: "# Camera controls\n" +
                "* **Rotation**: Left mouse button\n" +
                "* **Translation / Pan**: Right mouse button\n" +
                "* **Zoom**: Mouse wheel\n" +
                "* **Move**: [W,A,S,D,R,F] keys",
            border: true,
            markdown: true,
        });

        cameraFolder.addInput(camera, 'positionAsDict', {
            label: "Position",
        });

        cameraFolder.addInput(camera, 'quatRotationAsDict', {
            label: "Rotation",
            view: 'rotation',
            rotationMode: 'quaternion', // optional, 'quaternion' by default
            picker: 'inline', // or 'popup'. optional, 'popup' by default
            expanded: true, // optional, false by default
        });
    }

    /**
     * Set the perspective projection for the camera.
     *
     * @param {number} radianAngle the aperture of the field of view
     * @param {number} viewPortRatio ratio of the window
     * @param {number} nearBound position of the top rectangle of the frustum
     * @param {number} farBound position of the bottom rectangle of the frustum
     */
    setPerspective(radianAngle, viewPortRatio, nearBound, farBound) {
        glMatrix.mat4.perspective(
            this.projectionMatrix,
            radianAngle,
            viewPortRatio,
            nearBound,
            farBound
        );
    }

    /**
     * Set the orthogonal projection for the camera.
     *
     * @param {number} left position for the left side of the frustum
     * @param {number} right position for the right side of the frustum
     * @param {number} bottom position for the bottom side of the frustum
     * @param {number} top position for the top side of the frustum
     * @param {number} near position for the near side of the frustum
     * @param {number} far position for the far side of the frustum
     */
    setOrthogonal(left, right, bottom, top, near, far) {
        glMatrix.mat4.ortho(
            this.projectionMatrix,
            left,
            right,
            bottom,
            top,
            near,
            far
        );
    }

    /**
     * Set the position of the camera.
     *
     * @param {number} x position of the camera in the scene
     * @param {number} y position of the camera in the scene
     * @param {number} z position of the camera in the scene
     */
    setPositionOfCamera(x, y, z) {
        if (typeof x === "object") {
            this.position[0] = x[0] || 0;
            this.position[1] = x[1] || 0;
            this.position[2] = x[2] || 0;
        } else {
            this.position[0] = x || 0;
            this.position[1] = y || 0;
            this.position[2] = z || 0;
        }

        this.updateViewMatrix();
    }

    /**
     * Set the target's positions the camera will point.
     *
     * @param {number} x position of the target in the scene
     * @param {number} y position of the target in the scene
     * @param {number} z position of the target in the scene
     */
    setTargetOfCamera(x, y, z) {
        if (typeof x === "object") {
            this.target[0] = x[0] || 0;
            this.target[1] = x[1] || 0;
            this.target[2] = x[2] || 0;
        } else {
            this.target[0] = x || 0;
            this.target[1] = y || 0;
            this.target[2] = z || 0;
        }

        this.updateViewMatrix();
    }

    /**
     * Update the mvMatrix with the position, cameraTarget and up vectors so the camera will take in count all the
     * modifications. The camera will be at the position of the position's vector in the scene and focus at the
     * cameraTarget's vector.
     */
    updateViewMatrix() {
        glMatrix.mat4.identity(this.viewMatrix);

        glMatrix.mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
        glMatrix.mat4.getRotation(this.rotation, this.viewMatrix);

        // Using the lookAt() function produce a viewMatrix. So no need to inverse the camera matrix.
        // glMatrix.mat4.invert(this.viewMatrix, this.viewMatrix);
    }
}

class PerspectiveCamera extends Camera {
    constructor(
        position,
        target,
        radianAngle,
        viewPortRatio,
        nearBound,
        farBound
    ) {
        super(position, target);
        this.setPerspective(radianAngle, viewPortRatio, nearBound, farBound);
    }
}

class OrthogonalCamera extends Camera {
    constructor(position, target, left, right, bottom, top, near, far) {
        super(position, target);
        this.setOrthogonal(left, right, bottom, top, near, far);
    }
}

export {Camera, OrthogonalCamera, PerspectiveCamera};
