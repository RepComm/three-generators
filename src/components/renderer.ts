
import { Panel } from "@repcomm/exponent-ts";
import { Camera, Scene, WebGLRenderer } from "three";

export class Renderer extends Panel {
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: Camera;
  private doRender: boolean;

  constructor () {
    super();

    this.renderer = new WebGLRenderer({

    });

    this.doRender = true;

    this.renderer.setAnimationLoop((time)=>{
      if (this.doRender && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    });

    this.renderer.domElement.style["flex"] = "1";
    this.renderer.domElement.style["min-width"] = "0";
    this.renderer.domElement.style["min-height"] = "0";
    

    this.mountChild(this.renderer.domElement);
  }
  setDoRender (doRender: boolean): this {
    this.doRender = doRender;
    return this;
  }
  setCamera (camera: Camera): this {
    this.camera = camera;
    return this;
  }
  setScene (scene: Scene): this {
    this.scene = scene;
    return this;
  }
  setSize (width: number, height: number): this {
    this.renderer.setSize(width, height);
    return this;
  }
}
