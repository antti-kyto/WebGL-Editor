import { Component } from './componentBase';
import { Mesh } from './mesh'
import { Transform } from './transform'

import { vec3 } from 'gl-matrix';
import { Material } from './material';

export class GameObject {

    parent: GameObject | null = null
    child: Array<GameObject> = []

    components: Array<Component> = []

    transform: Transform = new Transform()
    mesh: Mesh | null = null
    material: Material

    constructor(
        position: vec3,
        mesh: Mesh = null,
        material: Material = new Material()
    ) {
        this.transform = new Transform(position)
        this.mesh = mesh
        this.material = material
    }

    addComponent(component: any): void {
        this.components.push(new component(this))
        return component
    }

    getComponent(component: any): any {
        return this.components.find(function (element) {
            return element.constructor == component
        });
    }
}