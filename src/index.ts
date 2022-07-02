import { loadAndParseGLB } from "./parser";
import modelUrl from "./model.glb"
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Mesh,
  BufferGeometry,
  Float32BufferAttribute,
  Uint16BufferAttribute,
  Vector3,
  AmbientLight,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Color,
  DirectionalLight,
  Quaternion,
  DoubleSide
} from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

;(async () => {
  const models = await loadAndParseGLB(modelUrl)


  const renderer = new WebGLRenderer()
  const scene = new Scene()
  const camera = new PerspectiveCamera(undefined, window.innerWidth / window.innerHeight)
  camera.position.set(0, 0, -10)
  camera.lookAt(0, 0, 0)
  const controls = new OrbitControls(camera, renderer.domElement)

  models.forEach(m => {
    if (m == null) {
      return
    }
    const g = new BufferGeometry()
    g.setAttribute("position", new Float32BufferAttribute(new Float32Array(m.position), 3))
    g.setIndex(new Uint16BufferAttribute(new Uint16Array(m.indices), 1))
    g.computeVertexNormals()
    const mesh = new Mesh(g, new MeshStandardMaterial({
      color: new Color(200, 0, 0),
      roughness: 0.5,
      metalness: 0.8,
      side: DoubleSide
    }))
    mesh.position.set(m.translation[0], m.translation[1], m.translation[2])
    mesh.rotation.setFromQuaternion(new Quaternion(m.rotation[0], m.rotation[1], m.rotation[2], m.rotation[3]))
    mesh.scale.set(m.scale[0], m.scale[1], m.scale[2])
    scene.add(mesh)
  })
  document.body.appendChild(renderer.domElement)

  for(let i = 0; i < 6; i++) {
    const l = new DirectionalLight(new Color(0, 200 * i / 6, 0), 0.1)
    l.position.set(10 * Math.sin(i * Math.PI / 6 * 2), 10, 10 * Math.cos(i * Math.PI / 6 * 2))
    l.lookAt(0, 0, 0)
    scene.add(l)
  }

  scene.add(new AmbientLight(undefined, 0.01))

  renderer.setSize(window.innerWidth, window.innerHeight)

  function loop() {
    renderer.render(scene, camera)
    controls.update()
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
})()

