import { vec3 } from "gl-matrix";
import { Time } from "./time";
import { Component } from "./componentBase";
import { GameObject } from "./gameObject";
import { Simulation } from "./simulation";

export class Ball extends Component {

    speed: number = 10.0;

    isMoving = false;
    x: number = 0;
    y: number = 0;

    constructor(gameObject: GameObject = null) {
        super(gameObject)
        document.addEventListener('mousedown', (e: MouseEvent) => {
            this.x = e.offsetX
            this.y = e.offsetY
            this.isMoving = true
        })
        document.addEventListener('mousemove', (e: MouseEvent) => this.mouseMove(e))
        document.addEventListener('mouseup', (e: MouseEvent) => {
            this.x = e.offsetX
            this.y = e.offsetY
            this.isMoving = false
        })
    }

    update(): void {

        let moveDir: vec3;
        moveDir = [0, 0, 0]


        vec3.normalize(moveDir, moveDir)

        this.move(moveDir)
    }

    move(moveDir: vec3): void {
        vec3.add(
            this.gameObject.transform.position,
            this.gameObject.transform.position,
            vec3.mul(
                vec3.create(),
                moveDir,
                [Time.deltaTime * this.speed, Time.deltaTime * this.speed, Time.deltaTime * this.speed]
            )
        )
    }


    mouseMove(e: MouseEvent): void {
        if (!this.isMoving) {
            return
        }

        this.gameObject.transform.translate([e.movementX* Time.deltaTime * 10, -e.movementY* Time.deltaTime * 10, 0])

        // const rotateX: number = (-e.movementY) * Time.deltaTime * .3;
        // const rotateY: number = (e.movementX) * Time.deltaTime * .3;

        // this.gameObject.transform.rotate([rotateX, rotateY, 0])
    }
}