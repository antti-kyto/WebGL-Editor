import { Component } from "./componentBase"
import { glMatrix, mat3, vec2, vec3 } from 'gl-matrix';
import { LineRenderer } from './lineRenderer';
import { GameEngine } from './renderer'
import { GameObject } from './gameObject'
import { Time } from './time'


class Point {

    gameObject: GameObject
    position: vec2
    prevPosition: vec2
    locked: boolean = false;

    constructor(gameEngine, position: vec2) {
        this.position = position
        this.prevPosition = position

        this.gameObject = new GameObject([position[0], position[1], 0], gameEngine.meshList["plane"])
        this.gameObject.transform.scale = [0.5, 0.5, 0.5]
        this.gameObject.transform.rotation = [-90, 0, 0]
        GameEngine.scene.push(this.gameObject)
        Simulation.points.push(this)
    }
}

class Stick {
    pointA: Point
    pointB: Point

    length: number

    lineRenderer: LineRenderer

    constructor(gameEngine, pointA: Point, pointB: Point) {
        this.pointA = pointA
        this.pointB = pointB
        this.length = vec2.dist(
            [pointA.gameObject.transform.position[0], pointA.gameObject.transform.position[1]],
            [pointB.gameObject.transform.position[0], pointB.gameObject.transform.position[1]]
        )

        new LineRenderer(gameEngine, pointA.gameObject, pointB.gameObject)

        Simulation.sticks.push(this)
    }
}

export class Simulation extends Component {

    static points: Array<Point> = []
    static sticks: Array<Stick> = []
    static move: boolean

    constructor(gameEngine) {
        super()
        const point1 = new Point(gameEngine, [-8, 0])
        const point2 = new Point(gameEngine, [8, 0])
        const point3 = new Point(gameEngine, [-15, 0])
        const point4 = new Point(gameEngine, [15, 0])
        point1.locked = true
        point2.locked = true
        point3.locked = true
        point4.locked = true

        //TOP R L
        const point5 = new Point(gameEngine, [-7, -1])
        const point6 = new Point(gameEngine, [7, -1])
        //MID
        const point7 = new Point(gameEngine, [0, -8])
        const point8 = new Point(gameEngine, [0, -15])
        const point9 = new Point(gameEngine, [0, -22])

        const point10 = new Point(gameEngine, [-5.5, -10.5])
        const point11 = new Point(gameEngine, [5.5, -10.5])

        const point12 = new Point(gameEngine, [-4.5, -18.5])
        const point13 = new Point(gameEngine, [4.5, -18.5])

        const point14 = new Point(gameEngine, [-13, -7])
        const point15 = new Point(gameEngine, [-11.5, -11])
        const point16 = new Point(gameEngine, [-10, -16])
        const point17 = new Point(gameEngine, [-7, -26])

        const point18 = new Point(gameEngine, [13, -7])
        const point19 = new Point(gameEngine, [11.5, -11])
        const point20 = new Point(gameEngine, [10, -16])
        const point21 = new Point(gameEngine, [7, -26])

        const point22 = new Point(gameEngine, [-10, -8])
        const point23 = new Point(gameEngine, [10, -8])


        new Stick(gameEngine, point1, point5)
        new Stick(gameEngine, point5, point7)
        new Stick(gameEngine, point7, point10)
        new Stick(gameEngine, point10, point22)
        new Stick(gameEngine, point10, point16)
        new Stick(gameEngine, point10, point8)
        new Stick(gameEngine, point12, point16)
        new Stick(gameEngine, point12, point17)
        new Stick(gameEngine, point12, point8)
        new Stick(gameEngine, point12, point9)
        new Stick(gameEngine, point3, point14)
        new Stick(gameEngine, point14, point15)
        new Stick(gameEngine, point15, point16)
        new Stick(gameEngine, point16, point17)
        new Stick(gameEngine, point22, point14)
        new Stick(gameEngine, point22, point15)
        new Stick(gameEngine, point22, point5)

        new Stick(gameEngine, point2, point6)
        new Stick(gameEngine, point6, point7)
        new Stick(gameEngine, point6, point23)
        new Stick(gameEngine, point23, point11)
        new Stick(gameEngine, point23, point18)
        new Stick(gameEngine, point23, point19)
        new Stick(gameEngine, point11, point7)
        new Stick(gameEngine, point11, point8)
        new Stick(gameEngine, point11, point20)
        new Stick(gameEngine, point13, point8)
        new Stick(gameEngine, point13, point9)
        new Stick(gameEngine, point13, point20)
        new Stick(gameEngine, point13, point21)
        new Stick(gameEngine, point4, point18)
        new Stick(gameEngine, point18, point19)
        new Stick(gameEngine, point19, point20)
        new Stick(gameEngine, point20, point21)

        new Stick(gameEngine, point3, point4)

        // this.sticks.push(stick3)
    }

    update(): void {

        if(!GameEngine.readyToRender)
            return

        Simulation.points.forEach(point => {
            if (point.locked) {
                return
            }
            const prevPosition = [point.gameObject.transform.position[0], point.gameObject.transform.position[1]]
            vec3.add(
                point.gameObject.transform.position,
                point.gameObject.transform.position,
                [
                    (point.gameObject.transform.position[0] - point.prevPosition[0]) * Time.deltaTime,
                    (point.gameObject.transform.position[1] - point.prevPosition[1]) * Time.deltaTime,
                    0
                ]
            )
            vec3.add(
                point.gameObject.transform.position,
                point.gameObject.transform.position,
                [
                    0,
                    -90 * Time.deltaTime,
                    0
                ]
            )
            point.prevPosition = [prevPosition[0], prevPosition[1]]
        })

        for (let i: number = 0; i < 2; i++) {
            Simulation.sticks.forEach(stick => {
                let stickCenter: vec2 = [0, 0]
                let stickDir: vec2 = [0, 0]

                vec2.add(stickCenter,
                    [stick.pointA.gameObject.transform.position[0], stick.pointA.gameObject.transform.position[1]],
                    [stick.pointB.gameObject.transform.position[0], stick.pointB.gameObject.transform.position[1]]
                )
                vec2.div(stickCenter,
                    stickCenter,
                    [2, 2]
                )

                vec2.sub(stickDir,
                    [stick.pointA.gameObject.transform.position[0], stick.pointA.gameObject.transform.position[1]],
                    [stick.pointB.gameObject.transform.position[0], stick.pointB.gameObject.transform.position[1]]
                )
                vec2.normalize(stickDir,
                    stickDir,
                )

                if (!stick.pointA.locked) {
                    let posA: vec2 = [0, 0]
                    vec2.mul(posA, stickDir, [stick.length, stick.length])
                    vec2.div(posA, posA, [2, 2])
                    vec2.add(posA, stickCenter, posA)
                    stick.pointA.gameObject.transform.position = [posA[0], posA[1], 0]
                }

                if (!stick.pointB.locked) {
                    let posB: vec2 = [0, 0]
                    vec2.mul(posB, stickDir, [stick.length, stick.length])
                    vec2.div(posB, posB, [2, 2])
                    vec2.sub(posB, stickCenter, posB)
                    stick.pointB.gameObject.transform.position = [posB[0], posB[1], 0]
                }
            })
        }

        if(!Simulation.move)
            return

        for (let i: number = 0; i < 4; i++) {
            const pos: vec3 = [0,0,0]
            vec3.add(
                pos,
                Simulation.points[i].gameObject.transform.startPosition,
                [Math.sin(Time.time*0.5) * Time.deltaTime * 9000, Math.sin(Time.time*1) * Time.deltaTime * 9000, 0]
            )
            Simulation.points[i].gameObject.transform.position = pos
        }
    }
}