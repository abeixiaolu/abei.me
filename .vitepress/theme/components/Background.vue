<script setup lang="ts">
const containerRef = ref<HTMLDivElement>()
let animationId: number
let cleanupFns: (() => void)[] = []

const { isDark } = useData()

onMounted(async () => {
  const THREE = await import('three')
  const container = containerRef.value!

  const getBgColor = () => isDark.value ? 0x050505 : 0xfcfcff
  const getInkColor = () => isDark.value ? 0xd0d0d0 : 0x111111

  const bgColor = getBgColor()
  const inkColor = getInkColor()

  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(bgColor, 0.002)

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 150

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(bgColor, 1)
  container.appendChild(renderer.domElement)

  const group = new THREE.Group()
  scene.add(group)

  const numLegs = 120
  const segmentsPerLeg = 50
  const spineLength = 100

  const inkMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(inkColor) },
    },
    vertexShader: `
      uniform float time;
      attribute float vertexIndex;
      attribute float legIndex;
      varying float vAlpha;
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      void main() {
        vec3 pos = position;
        float influence = vertexIndex / 50.0;
        float rx = random(vec2(legIndex * 0.1, 0.0));
        float ry = random(vec2(legIndex * 0.1, 1.0));
        float rz = random(vec2(legIndex * 0.1, 2.0));
        pos.x += sin(time * (0.3 + rx * 0.4) + legIndex * 0.5) * 5.0 * influence;
        pos.y += cos(time * (0.2 + ry * 0.3) + legIndex * 0.7) * 5.0 * influence * 0.5;
        pos.z += sin(time * (0.25 + rz * 0.35) + legIndex * 0.3) * 5.0 * influence * 0.7;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = 1.0 - (influence * 0.8);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      varying float vAlpha;
      void main() {
        gl_FragColor = vec4(color, vAlpha * 0.6);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: isDark.value ? THREE.AdditiveBlending : THREE.NormalBlending,
  })

  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(numLegs * segmentsPerLeg * 3)
  const vertexIndices = new Float32Array(numLegs * segmentsPerLeg)
  const legIndices = new Float32Array(numLegs * segmentsPerLeg)

  let pIdx = 0
  let vIdx = 0
  for (let i = 0; i < numLegs; i++) {
    const rootY = (Math.random() - 0.5) * spineLength
    const side = Math.random() > 0.5 ? 1 : -1
    const baseAngle = Math.random() * Math.PI * 0.5 - Math.PI * 0.25
    let currentX = 0
    let currentY = rootY
    let currentZ = 0
    const legLengthScale = 1.0 + Math.random() * 1.5
    for (let j = 0; j < segmentsPerLeg; j++) {
      positions[pIdx++] = currentX
      positions[pIdx++] = currentY
      positions[pIdx++] = currentZ
      vertexIndices[vIdx] = j
      legIndices[vIdx] = i
      vIdx++
      const progression = j / segmentsPerLeg
      currentX += (Math.cos(baseAngle) * side * 2.5) * (1 - progression * 0.5) * legLengthScale
      currentY -= (1.5 + Math.random() * 0.5) * legLengthScale
      currentZ += Math.sin(baseAngle) * 2.0
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('vertexIndex', new THREE.BufferAttribute(vertexIndices, 1))
  geometry.setAttribute('legIndex', new THREE.BufferAttribute(legIndices, 1))
  group.add(new THREE.Line(geometry, inkMaterial))

  // Grain
  const grainGeometry = new THREE.PlaneGeometry(2, 2)
  const grainMaterial = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, amount: { value: 0.05 } },
    vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float time;
      uniform float amount;
      float rand(vec2 co) { return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453); }
      void main() {
        vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0);
        float noise = rand(uv * time) * amount;
        gl_FragColor = vec4(vec3(noise), 1.0);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  })
  const postScene = new THREE.Scene()
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  postScene.add(new THREE.Mesh(grainGeometry, grainMaterial))

  let mouseX = 0
  let mouseY = 0
  const onMouseMove = (e: MouseEvent) => {
    mouseX = e.clientX - window.innerWidth / 2
    mouseY = e.clientY - window.innerHeight / 2
  }
  document.addEventListener('mousemove', onMouseMove)

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onResize)

  const clock = new THREE.Clock()
  function animate() {
    animationId = requestAnimationFrame(animate)
    const time = clock.getElapsedTime()
    group.rotation.y += 0.05 * (mouseX * 0.0005 - group.rotation.y)
    group.rotation.x += 0.05 * (mouseY * 0.0005 - group.rotation.x)
    group.rotation.z = Math.sin(time * 0.1) * 0.1
    inkMaterial.uniforms.time.value = time
    grainMaterial.uniforms.time.value = time
    renderer.autoClear = true
    renderer.render(scene, camera)
    renderer.autoClear = false
    renderer.render(postScene, postCamera)
  }
  animate()

  const stopWatch = watch(isDark, () => {
    renderer.setClearColor(getBgColor(), 1)
    scene.fog = new THREE.FogExp2(getBgColor(), 0.002)
    inkMaterial.uniforms.color.value = new THREE.Color(getInkColor())
    inkMaterial.blending = isDark.value ? THREE.AdditiveBlending : THREE.NormalBlending
    inkMaterial.needsUpdate = true
  })

  cleanupFns = [
    () => cancelAnimationFrame(animationId),
    () => document.removeEventListener('mousemove', onMouseMove),
    () => window.removeEventListener('resize', onResize),
    () => renderer.dispose(),
    () => geometry.dispose(),
    () => inkMaterial.dispose(),
    () => grainGeometry.dispose(),
    () => grainMaterial.dispose(),
    () => stopWatch(),
  ]
})

onUnmounted(() => cleanupFns.forEach(fn => fn()))
</script>

<template>
  <div ref="containerRef" class="bg-canvas" aria-hidden="true" />
  <div class="bg-decoration" aria-hidden="true">䷀</div>
</template>

<style scoped>
.bg-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

.bg-decoration {
  position: fixed;
  bottom: 24px;
  right: 24px;
  font-family: var(--font-mono, monospace);
  font-size: 1.5rem;
  line-height: 1;
  color: var(--color-text);
  opacity: 0.06;
  pointer-events: none;
  z-index: 0;
  letter-spacing: 0.2rem;
  user-select: none;
}
</style>
