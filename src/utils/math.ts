
import { CatmullRomCurve3, Curve, Vector3 } from "three";

export function centerOfVertices (vertices: Array<Vector3>, out: Vector3): Vector3 {
  out.set(0,0,0);
  for (let v of vertices) {
    out.add(v);
  }
  out.divideScalar(vertices.length);
  return out;
}

export function pointsEqual (a: Vector3, b: Vector3, allowedDist: number = 0): boolean {
  return a.distanceTo(b) <= allowedDist;
}

export function lerp(from: number, to: number, by: number): number {
  return from * (1 - by) + to * by
}

export function clamp (value, min, max): number {
  return Math.min(Math.max(value, min), max);
}

export const DegToRad = Math.PI/180;
export const RadToDeg = 180/Math.PI;

/**Calculates a normal vector from a point on a curve
 * 
 * @param curve the curve to sample from
 * @param dist the distance along the curve, should follow same rules as curve.getPoint( dist )
 * @param sampleInterval how far behind/ahead the curve is to be sampled
 * 
 * Dividing the curve into segments, this should be equal to 1/segments or less
 * @param out output to this vector object (also returned)
 */
export function getCurveNormal (curve: CatmullRomCurve3, dist: number, sampleInterval: number, out: Vector3): Vector3 {
  //Using divmod % will keep the sample distances between 0 and 1 no matter what

  //(p2 - p1)x(p3 - p1)
  //x meaning cross product
  let a = curve.getPoint(dist - (sampleInterval % 1) );
  let b = curve.getPoint(dist);
  let c = curve.getPoint(dist + (sampleInterval % 1 ) );

  let first = b.clone().add(a);
  let second = c.clone().sub(a);

  out.copy(first).cross(second).normalize();
  return out;
}
