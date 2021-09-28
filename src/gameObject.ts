import { Component } from './componentBase';
import { Mesh } from './mesh'
import { Transform } from './transform'

import {vec3} from 'gl-matrix';

export class GameObject {

    parent: GameObject | null = null
    child: Array<GameObject> = []
    texture: any
    
    components: Array<Component> = []

    transform: Transform = new Transform()
    mesh: Mesh | null = null

    constructor(position: vec3, mesh: Mesh) {
        this.transform = new Transform(position)
        this.mesh = mesh
    }

    addComponent(component: any): void {
        this.components.push(component)
        return component
    }

    getComponent(component: any): any {
        return this.components.find(function (element) {
            return element.constructor == component
        });
    }
}