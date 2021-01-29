import { Object3D, CatmullRomCurve3, Vector3, BufferGeometry, MeshBasicMaterial, Mesh, Euler, Quaternion, Material } from "three";
import { DegToRad, getCurveNormal, lerp } from "../utils/math";
import { MeshGenerator } from "./generator";

export function road(gen: MeshGenerator, spline: CatmullRomCurve3, segments: number, width: number, material: Material): Object3D {
  let dist = 0;

  let center: Vector3;
  let left: Vector3;
  let right: Vector3;

  let points: Array<Vector3> = new Array(segments * 2);

  let tangent: Vector3;

  let normal: Vector3 = new Vector3();
  let normalAxis = new Vector3(0, 1, 0);
  let normalAngle = Math.PI / 2;

  for (let i = 0; i < segments; i++) {
    dist = i / segments;

    center = spline.getPoint(dist);
    tangent = spline.getTangent(dist);

    normal = getCurveNormal(spline, dist, 0.5 / segments, normal);

    left = tangent
      .clone()
      .applyAxisAngle(normalAxis, normalAngle)
      .normalize()
      .multiplyScalar(width)
      .add(center);

    right = tangent
      .clone()
      .applyAxisAngle(normalAxis, -normalAngle)
      .normalize()
      .multiplyScalar(width)
      .add(center);

    points[i * 2 + 0] = left;
    points[i * 2 + 1] = right;
  }

  gen.addTris("strip", points);

  let geom = new BufferGeometry();
  gen.populateBufferGeometry(geom);

  const mesh = new Mesh(geom, material);
  return mesh;
}
