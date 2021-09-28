import { Component } from "./componentBase"

export class Mesh extends Component {
    positions: Array<number>
    offset: number
    vertexCount: number
    
    constructor(offset: number, positions: Array<number>, indices: Array<number>) {
        super()
        this.offset = offset
        this.positions = positions
        this.vertexCount = indices.length
    }
}