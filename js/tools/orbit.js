import "../lib/gl-matrix.js";

class Orbit {
    /**
     * Orbit.js - class handling the orbits between 2 planet objects
     * @param {Mesh} planetAnchor - anchor planet to define the orbit around
     * @param {Mesh} planetOrbit - orbiting planet
     * @param {number} distance - distance between the 2 planets
     * @param {number} orbitSpeed - the orbit speed (rad/s)
     * @param {number} rotationSpeed - the rotation speed (rad/s)
     */
    constructor(planetAnchor, planetOrbit, distance,orbitSpeed, rotationSpeed = 0) {
        this.planetAnchor = planetAnchor;
        this.planetOrbit = planetOrbit;
        this.distance = distance;
        this.orbitSpeed = orbitSpeed;
        this.rotationSpeed = rotationSpeed;

        //Defines a variable to handle the T (time) of the orbit
        this.orbitAngle = 0;
        this.rotationAngle = 0;

		this.planetOrbit.parent = this.planetAnchor;
    }

    //Tick method to animate based on the orbit
    tick(now) {
        if (this.lastFrameTime === undefined) {
            this.lastFrameTime = 0.0;
        }
        const deltatime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        //Increase of the time
        this.orbitAngle+=this.orbitSpeed * deltatime;

        if (this.orbitAngle >= 2 * Math.PI) this.orbitAngle -= 2 * Math.PI;
        if (this.orbitAngle <= -2 * Math.PI) this.orbitAngle += 2 * Math.PI;

        //Increase of the time
        this.rotationAngle=this.rotationSpeed * deltatime;

        //Calculate the new position for the planet in orbit
        let x = this.distance * Math.cos(this.orbitAngle);
        let y = this.distance * Math.sin(this.orbitAngle);

        glMatrix.quat.rotateY(this.planetOrbit.rotation,this.planetOrbit.rotation,this.rotationAngle);

        //Set the position for the orbiting planet
        this.planetOrbit.position[0] = x;
        this.planetOrbit.position[2] = y;
        this.planetOrbit.updateModelMatrix();
    }
}

export default Orbit
