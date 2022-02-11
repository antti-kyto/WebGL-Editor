import { vec3 } from "gl-matrix";
import { GameEngine } from "./renderer";
import { Component } from "./componentBase";
import { GameObject } from "./gameObject";

export class PointLight extends Component {

    position: vec3 = [-4, 3, 0]
    constant: number = 1.0
    linear: number = 0.15
    quadratic: number = 0.035

    ambient: vec3 = [0, 0, 0]
    diffuse: vec3 = [1, 1, 1]
    specular: vec3 = [1, 1, 1]

    constructor(gameObject: GameObject = null) {
        super(gameObject)
        GameEngine.pointLights.push(this)
    }

    update(): void {
        this.position = this.gameObject.transform.position
    }
}