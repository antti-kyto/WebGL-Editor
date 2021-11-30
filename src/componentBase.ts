import { GameObject } from "./gameObject";

export class Component {

    gameObject: GameObject;

    constructor(gameObject: GameObject = null){
        this.gameObject = gameObject;
    }
    
    start(): void {

    }
    
    update(): void {

    }
}