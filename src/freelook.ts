import { vec3 } from "gl-matrix";
import { Time } from "./time";
import { Component } from "./componentBase";
import { GameObject } from "./gameObject";

export class FreeLook extends Component {

    speed: number = 10.0;

    wDown: boolean = false
    aDown: boolean = false
    sDown: boolean = false
    dDown: boolean = false
    eDown: boolean = false
    qDown: boolean = false

    isMoving = false;
    x: number = 0;
    y: number = 0;

    constructor(gameObject: GameObject = null) {
        super(gameObject)
        document.addEventListener('keydown', (e: KeyboardEvent) => this.keyDown(e))
        document.addEventListener('keyup', (e: KeyboardEvent) => this.keyUp(e))

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

        const cameraFront: vec3 = [0, 0, 0]
        cameraFront[0] = Math.sin(this.gameObject.transform.rotation[1]) * Math.cos(this.gameObject.transform.rotation[0]);
        cameraFront[1] = Math.sin(this.gameObject.transform.rotation[0]);
        cameraFront[2] = Math.cos(this.gameObject.transform.rotation[1]) * Math.cos(this.gameObject.transform.rotation[0]);
        vec3.normalize(cameraFront, cameraFront)

        const cameraRight: vec3 = [0, 0, 0]
        vec3.cross(cameraRight, cameraFront, [0, 1, 0])

        if (this.wDown) {
            vec3.add(moveDir, moveDir, cameraFront)
        }
        if (this.aDown) {
            vec3.add(moveDir, moveDir, vec3.mul(vec3.create(), cameraRight, [-1, -1, -1]))
        }
        if (this.sDown) {
            vec3.add(moveDir, moveDir, vec3.mul(vec3.create(), cameraFront, [-1, -1, -1]))
        }
        if (this.dDown) {
            vec3.add(moveDir, moveDir, cameraRight)
        }
        if (this.eDown) {
            vec3.add(moveDir, moveDir, [0,1,0])
        }
        if (this.qDown) {
            vec3.add(moveDir, moveDir, [0,-1,0])
        }

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

    keyDown(e: KeyboardEvent): void {
        switch (e.key) {
            case "w":
                this.wDown = true
                break
            case "a":
                this.aDown = true
                break
            case "s":
                this.sDown = true
                break
            case "d":
                this.dDown = true
                break
            case "e":
                this.eDown = true
                break
            case "q":
                this.qDown = true
                break
        }
    }

    keyUp(e: KeyboardEvent): void {
        switch (e.key) {
            case "w":
                this.wDown = false
                break
            case "a":
                this.aDown = false
                break
            case "s":
                this.sDown = false
                break
            case "d":
                this.dDown = false
                break
            case "e":
                this.eDown = false
                break
            case "q":
                this.qDown = false
                break
        }
    }

    mouseMove(e: MouseEvent): void {
        if (!this.isMoving) {
            return
        }

        const rotateX: number = (-e.movementY) * Time.deltaTime * .3;
        const rotateY: number = (-e.movementX) * Time.deltaTime * .3;

        this.gameObject.transform.rotate([rotateX, rotateY, 0])
    }
}