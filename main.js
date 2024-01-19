import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import matcap from "./images/white2.jpeg";
import './style.css'

export default class Sketch {
  constructor(options) {
    this.clock = new THREE.Clock();
    this.container = options.domElement;
    this.height = this.container.offsetHeight;
    this.width = this.container.offsetWidth;
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.width / this.height,
      0.01,
      1000
    );
    this.camera.position.set(0, 1, 400);
    this.scene = new THREE.Scene();
    this.scene.destination = { x: 0, y: 0 };
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.autoClear = false;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;
    this.container.appendChild(this.renderer.domElement);
    this.addLights();
    this.fontLoader = new FontLoader();
    this.TextGeometry = new TextGeometry();
    this.timeClock = "";
    this.getCurrTime();
    this.resize();
    this.setUpResize();
    this.textLoader();
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.mousemove();

    setInterval(() => {
      let currentTime = this.getCurrTime();
      this.textMesh.geometry.dispose(); //Need this to tell renderer to delete the old geometry from GPU!
      this.textMesh.geometry = new TextGeometry(
        currentTime,
        this.typoProperties
      );
      this.textMesh.geometry.center();
    }, 1000);
    this.render();
  }

  addLights() {
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.lightHolder = new THREE.Group();
    const topLight = new THREE.SpotLight(0xffffff, 0.4);
    topLight.position.set(0, 155, 155); // <--- Light was between text and the plane, casting light only on the plane
    topLight.castShadow = true;
    topLight.shadow.camera.near = 1; // <--- Shadow camera with near / far values of 10 / 30 could not cover much in a scene where objects are of size 100x100
    topLight.shadow.camera.far = 1000;
    topLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
    this.lightHolder.add(topLight);
    const sideLight = new THREE.SpotLight(0xffffff, 0.4);
    sideLight.position.set(0, -4, 5);
    this.lightHolder.add(sideLight);
    this.scene.add(this.lightHolder);
    this.planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    this.shadowPlaneMaterial = new THREE.ShadowMaterial({
      opacity: 0.05,
    });
    const shadowPlaneMesh = new THREE.Mesh(
      this.planeGeometry,
      this.shadowPlaneMaterial
    );
    shadowPlaneMesh.rotation.x = Math.PI * -0.5;
    shadowPlaneMesh.position.y = -100.0;
    shadowPlaneMesh.receiveShadow = true;
    this.lightHolder.add(shadowPlaneMesh);
    this.scene.add(shadowPlaneMesh);
  }

  mousemove() {
    this.container.addEventListener("mousemove", (e) => {
      let b = (e.clientX - this.w / 2) / (this.w / 2);
      let a = (e.clientY - this.h / 2) / (this.h / 2);

      this.scene.destination.x = a * 0.2;
      this.scene.destination.y = b * 0.2;
    });
  }

  getCurrTime() {

    let date = new Date();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    let session = "AM";

    if (h == 0) {
      h = 12;
    }

    if (h > 12) {
      h = h - 12;
      session = "PM";
    }

    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    s = s < 10 ? "0" + s : s;

    let time = h + ":" + m + ":" + s + " " + session;

    this.timeClock = time;
    return time;
  }

  textLoader() {
    this.textMesh = new THREE.Mesh();
    const createTypo = (font) => {
      this.word = this.getCurrTime();
      this.typoProperties = {
        font: font,
        size: 120,
        height: 120 / 2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 5,
        bevelSize: 3,
        bevelOffset: 0,
        bevelSegments: 5,
      };
      this.text = new TextGeometry(this.word, this.typoProperties);
      this.textMesh.geometry = this.text;
      this.textMesh.material = new THREE.MeshMatcapMaterial({
        matcap: new THREE.TextureLoader().load(matcap),
      });
      this.textMesh.geometry.center();
      this.textMesh.castShadow = true;
      this.textMesh.scale.multiplyScalar(0.5);
      this.scene.add(this.textMesh);
    };
    this.fontLoader.load("./fontsAssets/helvetiker_regular.typeface.json", createTypo);

  }

  render() {

    // const t = this.clock.getElapsedTime()
    // this.textMesh.rotation.set(0.1 + Math.cos(t / 4.5) / 10, Math.sin(t / 4) / 4, 0.3 - (1 + Math.sin(t / 4)) / 8)
    // this.textMesh.position.y = (1 + Math.sin(t / 2)) / 10

    this.scene.rotation.x +=
      (this.scene.destination.x - this.scene.rotation.x) * 0.05;
    this.scene.rotation.y +=
      (this.scene.destination.y - this.scene.rotation.y) * 0.05;

    // this.controls.update();
    this.camera.lookAt(this.scene.position);

    requestAnimationFrame(this.render.bind(this));

    this.renderer.render(this.scene, this.camera);

  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  setUpResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }
}

new Sketch({
  domElement: document.getElementById("container"),
});

