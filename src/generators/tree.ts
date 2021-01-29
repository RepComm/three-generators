
import { BufferGeometry, DoubleSide, LinearInterpolant, Mesh, MeshBasicMaterial, Object3D, PointsMaterial, Vector3 } from "three";
import { lerp } from "../utils/math";
import { MeshGenerator } from "./generator"

export function ring (y: number, radius: number, circleSegments: number, out?: Array<Vector3>): Array<Vector3> {
  if (!out) {
    out = new Array(circleSegments);
  } else if (out.length !== circleSegments) {
    out.length = circleSegments;
  }

  let factor = 0;

  for (let i=0; i<circleSegments+1; i++) {
    factor = i/circleSegments;

    out[i] = new Vector3(
      Math.cos(factor * Math.PI*2) * radius,
      y,
      Math.sin(factor * Math.PI*2) * radius
    );
  }
  return out;
}

export function tree (gen: MeshGenerator, baseRadius: number, height: number, circleSegments: number, heightSegments: number): Object3D {
  let root = new Object3D();

  gen.clear();

  let ringData0 = new Array<Vector3>(circleSegments);
  let ringData1 = new Array<Vector3>(circleSegments);

  let currentRadius = baseRadius;
  let topRadius = 0.1;

  let lasty = 0;
  let y = 0;
  for (let i=0; i<heightSegments-1; i+=1) {
    lasty = y;
    y = (i+1/heightSegments) * height;

    ring(lasty, currentRadius, circleSegments, ringData0);
    currentRadius = lerp (baseRadius, topRadius, i/heightSegments);

    ring(y, currentRadius, circleSegments, ringData1);

    for (let j=0; j<circleSegments; j+=1) {
      gen.addQuad(
        ringData0[j + 0],
        ringData1[j + 0],
        ringData1[j + 1],
        ringData0[j + 1]
      );
    }
  }

  let geom = new BufferGeometry();
  gen.populateBufferGeometry(geom);

  let material = new MeshBasicMaterial({
    color: 0xa65a17,
    // side: DoubleSide,
    wireframe: true
  });

  const mesh = new Mesh( geom, material );
  root.add(mesh);
  return root;
}
