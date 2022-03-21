import { Component } from "./componentBase"
import { GameEngine } from './renderer'
import { vec2, vec3 } from 'gl-matrix';
import { GameObject } from "./gameObject";

export class LineRenderer extends Component {

    gameObject: GameObject

    point1: GameObject
    point2: GameObject
    startPosition: vec3
    endPosition: vec3
    width: number = 1

    constructor(gameEngine, start: GameObject, end: GameObject) {
        super()

        this.point1 = start
        this.point2 = end

        this.startPosition = start.transform.position
        this.endPosition = end.transform.position

        const lineDirection: vec3 = [0, 0, 0]
        vec3.sub(lineDirection, this.endPosition, this.startPosition)
        vec3.normalize(lineDirection, lineDirection)

        const lineCenter: vec3 = [0, 0, 0]
        vec3.add(lineCenter,
            this.startPosition,
            this.endPosition
        )
        vec3.div(lineCenter,
            lineCenter,
            [2, 2, 2]
        )

        this.gameObject = new GameObject(lineCenter, gameEngine.meshList["plane"])
        this.gameObject.components.push(this)

        const dist = vec3.dist(
            this.startPosition,
            this.endPosition
        )
        this.gameObject.transform.scale = [1, 1, dist / 2]

        const angle = vec2.angle([0, 1], [lineDirection[0], lineDirection[1]])
        if (lineDirection[0] > 0)
            this.gameObject.transform.rotation = [90, 0, (180 / Math.PI) * -angle]
        else
            this.gameObject.transform.rotation = [90, 0, (180 / Math.PI) * angle]
        GameEngine.scene.push(this.gameObject)
        // GameEngine.scene.push(line)
    }

    update(): void {
        if (!this.point1 || !this.point2)
            return
        this.startPosition = this.point1.transform.position
        this.endPosition = this.point2.transform.position

        const lineDirection: vec3 = [0, 0, 0]
        vec3.sub(lineDirection, this.endPosition, this.startPosition)
        vec3.normalize(lineDirection, lineDirection)

        const lineCenter: vec3 = [0, 0, 0]
        vec3.add(lineCenter,
            this.startPosition,
            this.endPosition
        )
        vec3.div(lineCenter,
            lineCenter,
            [2, 2, 2]
        )

        const dist = vec3.dist(
            this.startPosition,
            this.endPosition
        )
        this.gameObject.transform.position = lineCenter
        this.gameObject.transform.scale = [1, 1, dist / 2]

        const angle = vec2.angle([0, 1], [lineDirection[0], lineDirection[1]])
        if (lineDirection[0] > 0)
            this.gameObject.transform.rotation = [90, 0, (180 / Math.PI) * -angle]
        else
            this.gameObject.transform.rotation = [90, 0, (180 / Math.PI) * angle]
    }
}