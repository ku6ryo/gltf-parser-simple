import { loadAndParseGLB } from "./parser";
import modelUrl from "./untitled.glb"

;(async () => {
  await loadAndParseGLB(modelUrl)
})()

