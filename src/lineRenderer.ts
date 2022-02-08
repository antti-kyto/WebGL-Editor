import { Component } from "./componentBase"
import { vec3 } from 'gl-matrix';
import { GameObject } from "./gameObject";

export class LineRenderer extends Component {

    startPosition: vec3
    endPosition: vec3
    width: number = 0.01

    constructor(gameEngine, start: vec3, end: vec3) {
        super()

        this.startPosition = start
        this.endPosition = end

        const lineDirection: vec3 = [0, 0, 0]
        vec3.sub(lineDirection, end, start)
        vec3.normalize(lineDirection, lineDirection)
        console.log(lineDirection)

        const upDir: vec3 = Math.abs(lineDirection[0]) >= Math.abs(lineDirection[1]) ? [0, 1, 0] : [1, 0, 0]
        console.log(upDir)

        const right: vec3 = [0, 0, 0]
        vec3.cross(right, lineDirection, upDir)
        vec3.normalize(right, right)

        const normalVector: vec3 = [0, 0, 0]
        vec3.cross(normalVector, right, lineDirection)
        vec3.normalize(normalVector, normalVector)

        const positions = [
            start[0] + this.width / 2 * normalVector[0], start[1] + this.width / 2 * normalVector[1], 0,
            start[0] + -this.width / 2 * normalVector[0], start[1] + -this.width / 2 * normalVector[1], 0,
            end[0] + this.width / 2 * normalVector[0], end[1] + this.width / 2 * normalVector[1], 0,
            end[0] + -this.width / 2 * normalVector[0], end[1] + -this.width / 2 * normalVector[1], 0,
        ]

        const normals = [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
        ]

        const indices = [
            0, 1, 2,
            1, 3, 2
        ]

        const lineName: string = gameEngine.meshList.length.toString()
        gameEngine.costructBufferDatas(
            lineName,
            positions,
            normals,
            [],
            [],
            indices)

        const line: GameObject = new GameObject([-0, 0, 0], gameEngine.meshList[lineName])
        gameEngine.scene.push(line)
    }
}