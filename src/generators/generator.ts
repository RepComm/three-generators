import { BufferAttribute, BufferGeometry, Geometry, Vector3 } from "three";
import { pointsEqual } from "../utils/math";

/**
 * ### separate
 * each 3 points is a triangle
 * 
 * ### fan
 * first point is center, others are points around a perimeter (think circle)
 *
 * ```
 * 1---0---5
 * | / | \ |
 * 2---3---4
 * ```
 * ### strip
 * first three are the first triangle, each next point makes a new triangle with the previous 2 points
 * ```
 * 0---2---4
 * | / | / |
 * 1---3---5
 * ```
 */
export type InterpretVerticesTriangleMode = "separate"|"fan"|"strip";

export type InterpretVerticesQuadrangleMode = "separate"|"strip"|"tube";

export type InterpretVerticesPolygonMode = "coplanar"

export interface LoopTrianglesCallback {
  (accessIndex: number, a: Vector3, b: Vector3, c: Vector3): void;
}

export class MeshGenerator {
  /**An array containing triangles where each triangle has its own 3 vertices
   * 
   * Note: Vertex3 may be reused, but the reference in the array is obviously separate
   * 
   * This means we don't need vertice information to render the triangles
  */
  private vertices: Array<Vector3>;

  constructor () {
    this.vertices = new Array();
  }
  /**Add a bunch of triangles
   * @param mode how to interpret the vertices
   * @param vertices 
   */
  addTris (mode: InterpretVerticesTriangleMode, vertices: Array<Vector3>): this {
    let a: Vector3;
    let b: Vector3;
    let c: Vector3;

    switch (mode) {
      case "separate":
        for (let i=0; i<vertices.length; i+=3) {
          this.addTri(
            vertices[i + 0],
            vertices[i + 1],
            vertices[i + 2]
          );
        }
        break;
      case "strip":
        //a, b, c, d, e, f
        //abc, bcd, cde, def

        /**
         * a---c---e
         * | / | / |
         * b---d---f
         */
        let flip = false;
        for (let i=2; i<vertices.length; i++) {
          if (flip) {
            a = vertices[i-2];
            b = vertices[i-1];
            c = vertices[i];
          } else {
            c = vertices[i-2];
            b = vertices[i-1];
            a = vertices[i];
          }
          flip = !flip;
          this.addTri(a, b, c);
        }
        break;
      case "fan":
        /**
         * 1---0---5
         * | / | \ |
         * 2---3---4
         */
        a = vertices[0];
        for (let i=2; i<vertices.length; i++) {
          b = vertices[i-1];
          c = vertices[i];
        }
        break;
      default:
        throw `Unhandled mode: ${mode}`;
        break;
    }
    return this;
  }
  /**Add a single triangle
   * 
   * Clockwise winding
   * 
   * @param a twelve o'clock
   * @param b four o'clock
   * @param c eight o'clock
   */
  addTri (a: Vector3, b: Vector3, c: Vector3): this {
    this.vertices.push(a, b, c);
    return this;
  }
  /**Add a single quadrangle
   * 
   * Clockwise winding
   * 
   * ```
   * 1---2
   * | / |
   * 0---3
   * ```
   */
  addQuad (a: Vector3, b: Vector3, c: Vector3, d: Vector3): this {
    this.addTri(a, b, c);
    this.addTri(c, d, a);
    return this;
  }
  addQuads (mode: InterpretVerticesQuadrangleMode, vertices: Array<Vector3>): this {

    return this;
  }
  addPoly (mode: InterpretVerticesPolygonMode, vertices: Array<Vector3>): this {

    return this;
  }
  loopTriangles (cb: LoopTrianglesCallback): this {
    let a: Vector3;
    let b: Vector3;
    let c: Vector3;

    for (let i=0; i<this.vertices.length; i+=3) {
      a = this.vertices[i + 0];
      b = this.vertices[i + 1];
      c = this.vertices[i + 2];
      cb(this.vertexToTriangleIndex(i), a, b, c);
    }
    return this;
  }
  /**Converts any vertex index to a triangle access index it belongs to
   * 
   * @param vertIndex 
   */
  vertexToTriangleIndex (vertIndex: number): number {
    return Math.floor(vertIndex / 3)
  }
  /**Converts any triangle access index to the first vertex index belonging to it
   * 
   * @param triIndex 
   */
  triangleToVertexIndex (triIndex: number): number {
    return triIndex * 3;
  }
  /**Return a list of triangle accessIndexes that utilize the vertex
   * 
   * @param vert point to check
   * @param allowedDist distance tolerance
   */
  getTrianglesUsingVertex (vert: Vector3, allowedDist: number = 0, referenceOnly: boolean = false): Array<number> {
    let result = new Array<number>();
    
    this.loopTriangles((accessIndex, a, b, c)=>{
      if (a === vert || b === vert || c === vert) {
        result.push(accessIndex);
      } else {
        if (
          !referenceOnly &&
          pointsEqual(a, vert, allowedDist) &&
          pointsEqual(b, vert, allowedDist) &&
          pointsEqual(c, vert, allowedDist)
        ) {
          result.push(accessIndex);
        }
      }
    });
    return result;
  }
  clear (): this {
    this.vertices.length = 0;
    return this;
  }
  getTriangleCount (): number {
    return this.vertexToTriangleIndex(this.vertices.length-1);
  }
  getVertexCount (): number {
    return this.vertices.length;
  }
  toFloat32Array (out?: Float32Array): Float32Array {
    let result: Float32Array;

    if (!out || out.length !== this.vertices.length*3) {
      result = new Float32Array(this.vertices.length*3);
    }

    let i=0;
    this.loopTriangles((triangleIndex, a, b, c)=>{
      result[i] = a.x; i++;
      result[i] = a.y; i++;
      result[i] = a.z; i++;

      result[i] = b.x; i++;
      result[i] = b.y; i++;
      result[i] = b.z; i++;

      result[i] = c.x; i++;
      result[i] = c.y; i++;
      result[i] = c.z; i++;
    });

    return result;
  }
  /**Returns a copy of the internal vertices that make up separate triangles
   * 
   * This can be fed into an unindexed threejs geometry
   * 
   * @param out 
   */
  toVector3Array (out?: Array<Vector3>, clone: boolean = true): Array<Vector3> {
    if (!out) {
      out = new Array(this.getVertexCount());
    } else if (out.length !== this.getVertexCount()) {
      out.length = this.getVertexCount();
    }
    let i=0;
    for (let v of this.vertices) {
      if (clone) {
        out[i] = v.clone();
      } else {
        out[i] = v;
      }
      i++;
    }
    return out;
  }
  getVertex (vertIndex: number): Vector3 {
    return this.vertices[vertIndex];
  }
  populateGeometry (geometry: Geometry, clone: boolean = true, setNeedsUpdate: boolean = true): this {
    geometry.vertices = this.toVector3Array(geometry.vertices, clone);
    if (setNeedsUpdate) geometry.verticesNeedUpdate = true;
    return this;
  }
  populateBufferGeometry (geometry: BufferGeometry): BufferGeometry {
    let data = this.toFloat32Array();
    geometry.setAttribute(
      "position",
      new BufferAttribute(data, 3)
    );
    return geometry;
  }
}
