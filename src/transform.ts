import { Component } from "./componentBase"
import {vec3} from 'gl-matrix';

export class Transform extends Component {

    startPosition: vec3
    position: vec3  // World position
    rotation: vec3  // World rotation
    scale: vec3     // World scale

    constructor(position: vec3 = [0, 0, 0], rotation: vec3 = [0, 0, 0], scale: vec3 = [1, 1, 1]) {
        super()
        this.startPosition = position
        this.position = position
        this.rotation = rotation
        this.scale = scale
    }

    translate(position: vec3):void{
        vec3.add(this.position, this.position, position)
    }
    rotate(rotation: vec3):void{
        vec3.add(this.rotation, this.rotation, rotation)
    }
}