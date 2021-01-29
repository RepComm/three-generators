
import { EXPONENT_CSS_STYLES, Panel } from "@repcomm/exponent-ts";
import { Renderer } from "./components/renderer";
import { BoxGeometry, BufferGeometry, CatmullRomCurve3, DoubleSide, GridHelper, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, Vector3 } from "three";
import { tree } from "./generators/tree";
import { MeshGenerator } from "./generators/generator";
import { road } from "./generators/road";

//Because top level await is a mess
async function main() {
  //Append exponent styles
  EXPONENT_CSS_STYLES.mount(document.head);

  //Create a div to contain the ui
  const container = new Panel()
  .setId("container")
  .mount(document.body);

  //3d rendering
  const camera = new PerspectiveCamera(75, 1, 1, 100);
  camera.position.z = 10;
  camera.position.y = 4;

  const scene = new Scene();
  scene.add(camera);

  //Renderer mixes exponent system with three js renderer
  const renderer = new Renderer()
  .mount(container)
  .setScene(scene)
  .setCamera(camera);

  setTimeout(()=>{
    renderer.setSize(renderer.rect.width, renderer.rect.height);
  }, 200);

  let grid = new GridHelper(50, 50, 0x4499ff, 0x333333);
  scene.add(grid);

  let generator = new MeshGenerator();

  let centers = new Array<Vector3>();
  
  let radius = 3;

  centers.push(
    new Vector3( -1,  1, -1).multiplyScalar(radius),
    new Vector3( -1,  0,  1).multiplyScalar(radius),
    new Vector3(  1,  0,  1).multiplyScalar(radius),
    new Vector3(  1,  0, -1).multiplyScalar(radius)
  );

  let spline = new CatmullRomCurve3(centers, true, "catmullrom");

  let root = road(
    generator,
    spline,
    64,
    1,
    new MeshBasicMaterial({
      color: 0x334455,
      side: DoubleSide,
      wireframe: true
    }
  ));
  scene.add(root);
  console.log(root);

  setInterval(()=>{
    root.rotateY(0.02);
  }, 1000/15);
}

main();
