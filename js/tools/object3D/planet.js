import PerfectSphere from "./perfectSphere.js";
import WebglTools from "../webglTools.js";

class Planet extends PerfectSphere {
    constructor(radius, color, position = [0, 0, 0], angularSpeed = 0.0, atmosphereRadius = 0.0, atmosphereThickness = 0.0) {
        super(radius, color, position);

        this.atmosphereThickness = atmosphereThickness;
        this.atmosphereRadius = atmosphereRadius;
        this.angularSpeed = angularSpeed;
        //Defines a variable to handle the T (time) of the orbit
        this.angle = 0;
    }

    //Tick method to animate based on the orbit
    tick(now) {
        if (this.lastFrameTime === undefined) {
            this.lastFrameTime = 0.0;
        }
        const deltatime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        //Increase of the time
        this.angle += this.angularSpeed * deltatime;

        // if (this.angle >= 2 * Math.PI) this.angle -= 2 * Math.PI;
        // if (this.angle <= -2 * Math.PI) this.angle += 2 * Math.PI;
    }
}

export default Planet;
