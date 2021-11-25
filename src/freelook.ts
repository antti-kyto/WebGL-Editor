import { Camera } from "./camera";
import { Component } from "./componentBase";

export class FreeLook extends Component{
    Update(deltaTime: number):void {
        // Camera.camera.transform.translate([0.01*deltaTime,0,0])
    }
}