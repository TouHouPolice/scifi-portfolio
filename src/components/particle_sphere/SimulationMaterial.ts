import * as THREE from 'three'
import { MaterialNode } from '@react-three/fiber'
import ParticleSphereSimVert from '@shaders/particle_sphere_sim.vert.glsl';
import ParticleSphereSimFrag from '@shaders/particle_sphere_sim.frag.glsl';
import { preprocessGLSLForThree } from '@utils/utils';

const simVert: string = preprocessGLSLForThree(ParticleSphereSimVert);
const simFrag: string = preprocessGLSLForThree(ParticleSphereSimFrag);

function getPoint(v: THREE.Vector4, size: number, data: Float32Array, offset: number) {
    const theta = Math.random() * 2 * Math.PI; // Random angle in [0, 2π]
    const phi = Math.acos(2 * Math.random() - 1); // Random angle in [0, π]
  
    // Convert spherical coordinates to Cartesian coordinates
    v.set(
      size * Math.sin(phi) * Math.cos(theta),
      size * Math.sin(phi) * Math.sin(theta),
      size * Math.cos(phi),
      v.w
    );
  
    return v.toArray(data, offset);
  }

function getSphere(count: number, size: number, p = new THREE.Vector4()) {
  const data = new Float32Array(count * 4);
  for (let i = 0; i < count * 4; i += 4) getPoint(p, size, data, i);
  return data
}

export default class SimulationMaterial extends THREE.ShaderMaterial {
  constructor() {
    const positionsTexture = new THREE.DataTexture(getSphere(512 * 512, 128), 512, 512, THREE.RGBAFormat, THREE.FloatType)
    positionsTexture.needsUpdate = true
    super({
      vertexShader: simVert,
      fragmentShader:simFrag,
      uniforms: {
        positions: { value: positionsTexture },
        uTime: { value: 0 },
        uCurlFreq: { value: 0.25 },
        uAntiGravityPos: { value: new THREE.Vector3(0, 0, 0) },
        uAntiGravityStrength: { value: 1 },
      }
    })
  }
}

declare module '@react-three/fiber' {
  interface ThreeElements {
    simulationMaterial: MaterialNode<SimulationMaterial, typeof SimulationMaterial>
  }
}



