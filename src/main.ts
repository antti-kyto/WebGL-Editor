//GAME SCRIPT

import { GameEngine } from './renderer'
import { GameObject } from './gameObject'

import { load } from '@loaders.gl/core';
import { GLTFLoader } from '@loaders.gl/gltf';

import { loadTexture } from './util'
import { Camera } from './camera';
import { FreeLook } from './freelook';
import { Time } from './time';
import { Simulation } from './simulation';
import { glMatrix, vec3 } from 'gl-matrix';
import { Material } from './material';

const cameraScale: number = -10
let then: number = 0

// Start
function main() {

    const canvas = document.querySelector('#glCanvas');

    const gameEngine: GameEngine = new GameEngine(canvas.clientWidth, canvas.clientHeight, cameraScale);
    gameEngine.clearCanvas();

    const camera: GameObject = new GameObject([0, 0, 10]);
    camera.transform.rotation = [0,glMatrix.toRadian(180),0]
    camera.addComponent(Camera);
    camera.addComponent(FreeLook);
    Camera.camera = camera;
    GameEngine.scene.push(camera);

    const texture2: any = loadTexture(GameEngine.gl, './textures/ball.png')
    const mat: Material = new Material(texture2)

    let sO: GameObject = new GameObject([0, -1, 0], gameEngine.meshList["plane"], mat)
    sO.transform.translate([0, 0, 0])
    sO.transform.rotation = [-90, 0, 0]
    sO.transform.scale = [15, 15, 15]
    GameEngine.scene.push(sO)

    let simulationO: GameObject = new GameObject([0, 0, 0])
    simulationO.components.push(new Simulation(gameEngine))

    GameEngine.scene.push(simulationO)
    

    gameEngine.initBuffers()

    requestAnimationFrame((time) => update(gameEngine, time));
}

function update(gameEngine: GameEngine, time: number) {

    time *= 0.001;  // convert to seconds
    Time.deltaTime = time - then
    then = time;
    Time.time += Time.deltaTime

    GameEngine.scene.forEach(gameObject => {
        // gameObject.transform.rotate([Time.deltaTime*1, 0, 0])
        gameObject.components.forEach(component => {
            component.update()
        })
    });

    gameEngine.drawScene();
    requestAnimationFrame((time) => update(gameEngine, time))
}

window.onload = main;