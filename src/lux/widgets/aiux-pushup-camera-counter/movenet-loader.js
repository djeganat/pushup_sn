/**
 * Loads TensorFlow.js + MoveNet (pose-detection) on demand from jsDelivr and creates
 * a single-pose Lightning detector. Browser only — call from a user action.
 *
 * Network origins the instance CSP must allow:
 *   script-src  cdn.jsdelivr.net
 *   connect-src tfhub.dev, www.kaggle.com, storage.googleapis.com (model weights)
 */

const CDN = 'https://cdn.jsdelivr.net/npm';
export const TF_SCRIPTS = Object.freeze([
  `${CDN}/@tensorflow/tfjs-core@4.22.0/dist/tf-core.min.js`,
  `${CDN}/@tensorflow/tfjs-converter@4.22.0/dist/tf-converter.min.js`,
  `${CDN}/@tensorflow/tfjs-backend-webgl@4.22.0/dist/tf-backend-webgl.min.js`,
  `${CDN}/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js`
]);

const loaded = new Map();

function loadScript(src) {
  if (loaded.has(src)) return loaded.get(src);
  const p = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.crossOrigin = 'anonymous';
    s.onload = () => resolve();
    s.onerror = () => {
      loaded.delete(src);
      s.remove();
      reject(Object.assign(new Error(`Failed to load ${src}`), {name: 'ModelLoadError'}));
    };
    document.head.appendChild(s);
  });
  loaded.set(src, p);
  return p;
}

let detectorPromise = null;

/** Resolves to a shared MoveNet detector ({estimatePoses, dispose}). */
export function getMoveNetDetector() {
  if (detectorPromise) return detectorPromise;
  detectorPromise = (async () => {
    // pose-detection's UMD references a WebGPU backend global in instanceof checks;
    // a stub class makes those checks false so the WebGL path is used.
    if (!globalThis.tfwebgpu) globalThis.tfwebgpu = {WebGPUBackend: class WebGPUBackendStub {}};
    for (const src of TF_SCRIPTS) await loadScript(src); // order matters
    const {tf, poseDetection} = globalThis;
    if (!tf || !poseDetection) throw Object.assign(new Error('TensorFlow globals missing'), {name: 'ModelLoadError'});
    await tf.setBackend('webgl');
    await tf.ready();
    return poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      enableSmoothing: true
    });
  })();
  detectorPromise.catch(() => {
    detectorPromise = null; // allow retry
  });
  return detectorPromise;
}
