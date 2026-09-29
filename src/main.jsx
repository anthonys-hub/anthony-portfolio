import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { SpotLightHelper } from 'three'
import gsap from 'gsap'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import './index.css'
import App from './App.jsx'
import CarPlayUI from './CarPlayUI.jsx'
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

function AppRun() {


  const [progress, setProgress] = useState(0)
  const bytesRef = useRef({ street: { loaded: 0, total: 0 }, dog: { loaded: 0, total: 0 } })

  const [cameraPoint, setCameraPoint] = useState('orbit')
  const cameraStateRef = useRef('orbit')
  const animationFrameId = useRef(null)
  const screenMeshRef = useRef(null)
  const carPlayRef = useRef(null)
  const screenCenterRef = useRef(null)
  const panelOpenRef = useRef(false)
  const rimMeshRef = useRef(null)
  const dogRef = useRef(null)
  const [isMobile] = useState(() => window.matchMedia('(pointer: coarse)').matches)
  const [hasViewedScreen, setHasViewedScreen] = useState(false)


  const [soundOn, setSoundOn] = useState(false)
  const soundOnRef = useRef(false)
  const ambienceRef = useRef(null)

  const toggleSound = () => {
    if (!ambienceRef.current) {
      ambienceRef.current = new Audio('/ambience.mp3')
      ambienceRef.current.loop = true
      ambienceRef.current.volume = 0.15
    }
    if (soundOn) {
      ambienceRef.current.pause()
      soundOnRef.current = false
      setSoundOn(false)
    } else {
      ambienceRef.current.play().then(() => {
        soundOnRef.current = true
        setSoundOn(true)
      }).catch((e) => console.log(e))
    }
  }

  const [assetsLoaded, setAssetsLoaded] = useState(0)
  const totalAssets = 2


  const [panelOpen, setPanelOpen] = useState(false)

  const closePanel = () => {
    setPanelOpen(false)
    panelOpenRef.current = false
  }

  useEffect(() => {
    if (isMobile) return

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    window.renderer = renderer
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    const scene = new THREE.Scene()
    window.scene = scene
    scene.fog = new THREE.FogExp2(0x2a3a66, 0.01)

    const skyGeo = new THREE.SphereGeometry(400, 32, 15)
    const skyMat = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0b1430) },
        bottomColor: { value: new THREE.Color(0x2a3a66) },
        offset: { value: 20 },
        exponent: { value: 0.8 }
      },
      vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
      fragmentShader: `
    uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    varying vec3 vWorldPosition;
    void main() {
      float h = normalize(vWorldPosition + offset).y;
      gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
    }
  `,
      side: THREE.BackSide
    })
    const sky = new THREE.Mesh(skyGeo, skyMat)
    scene.add(sky)
    const hemi = new THREE.HemisphereLight(0x4466aa, 0x0a0a1a, 2.5)
    scene.add(hemi)

    const starCount = 1500
    const starPositions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 0.9 + 0.1)
      const r = 380
      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = r * Math.cos(phi)
      starPositions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }
    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, fog: false })
    scene.add(new THREE.Points(starGeo, starMat))

    scene.environment = pmremGenerator.fromScene(scene, 0, 0.1, 1000).texture
    scene.environmentIntensity = 1.5

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.05, 500)
    camera.position.set(11.614, 6.919, 3.940)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(28.546, 7.179, -15.961)
    controls.update()
    window.camera = camera
    window.controls = controls

    controls.enableZoom = false
    controls.enablePan = false
    controls.maxPolarAngle = Math.PI / 2 + 0.05

    const raycaster = new THREE.Raycaster()
    const mouseClick = new THREE.Vector2()

    const handleScreenClick = (event) => {
      if (event.target !== renderer.domElement) return
      if (cameraStateRef.current === 'transitioning') return

      mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseClick.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouseClick, camera)


      if (cameraStateRef.current === 'driverSeat' && screenMeshRef.current) {
        const screenHits = raycaster.intersectObject(screenMeshRef.current, true)


        if (screenHits.length > 0) {
          setPanelOpen(true)
          panelOpenRef.current = true
          setHasViewedScreen(true)
          return
        }
      }

      if (dogRef.current && soundOnRef.current) {
        const dogHits = raycaster.intersectObject(dogRef.current, true)
        if (dogHits.length > 0) {
          const bark = new Audio('/bark.mp3')
          bark.volume = 0.3
          bark.play()
        }
      }
    }

    window.addEventListener('click', handleScreenClick)

    const centerY = 1.3516
    const lookRange = Math.PI / 2
    let mouseX = 0
    let mouseY = 0
    let lastHoverCheck = 0
    const dogBox = new THREE.Box3()

    const centerDir = new THREE.Vector3(17.026 - 34.856, 2.941 - 6.701, -8.147 - -6.865).normalize()

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = (event.clientY / window.innerHeight) * 2 - 1

      const now = performance.now()
      if (now - lastHoverCheck < 100) return
      lastHoverCheck = now

      if (event.buttons !== 0) return
      if (cameraStateRef.current === 'transitioning' || panelOpenRef.current) return
      if (event.target !== renderer.domElement) return

      raycaster.setFromCamera(new THREE.Vector2(mouseX, -mouseY), camera)

      let overClickable = false

      if (cameraStateRef.current === 'driverSeat' && screenMeshRef.current) {
        overClickable = raycaster.intersectObject(screenMeshRef.current, true).length > 0
      }

      if (!overClickable && dogRef.current) {
        dogBox.setFromObject(dogRef.current)
        overClickable = raycaster.ray.intersectsBox(dogBox)
      }

      document.body.style.cursor = overClickable ? 'pointer' : 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)

    const handleWheel = (event) => {
      if (cameraStateRef.current === 'orbit' && event.deltaY < 0) {
        cameraStateRef.current = 'transitioning'
        controls.enabled = false
        setCameraPoint('transitioning')


        gsap.to(camera.position, {
          x: 34.856,
          y: 6.701,
          z: -6.865,
          duration: 2,
          onUpdate: () => camera.lookAt(controls.target),
          onComplete: () => { cameraStateRef.current = 'driverSeat', setCameraPoint('driverSeat') }
        })
        gsap.to(controls.target, {
          x: 17.026,
          y: 2.941,
          z: -8.147,
          duration: 2,
          onUpdate: () => camera.lookAt(controls.target)
        })

      } else if (cameraStateRef.current === 'driverSeat' && event.deltaY > 0 && !panelOpenRef.current) {
        cameraStateRef.current = 'transitioning'
        setCameraPoint('transitioning')

        gsap.to(camera.position, {
          x: 11.614,
          y: 6.919,
          z: 3.940,
          duration: 2,
          onUpdate: () => camera.lookAt(controls.target),
          onComplete: () => {
            cameraStateRef.current = 'orbit'
            controls.enabled = true
            setCameraPoint('orbit')
          }
        })
        gsap.to(controls.target, {
          x: 28.546,
          y: 7.179,
          z: -15.961,
          duration: 2,
          onUpdate: () => camera.lookAt(controls.target)
        })
      }
    }

    window.addEventListener('wheel', handleWheel)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)


    const rgbeLoader = new RGBELoader()
    const loader = new GLTFLoader()
    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
    loader.setDRACOLoader(dracoLoader)

    const updateProgress = () => {
      const { street, dog } = bytesRef.current
      const total = street.total + dog.total
      if (total > 0) setProgress(Math.round(((street.loaded + dog.loaded) / total) * 100))
    }




    loader.load('/StreetOpt.glb', (gltf) => {
      scene.add(gltf.scene)

      gltf.scene.traverse((child) => {
        if (child.isMesh && child.name.startsWith('Plane068')) {
          child.frustumCulled = false
        }

        if (child.type === 'SpotLight' && child.name !== 'Headlight_2_Shine001') {
          const worldPos = new THREE.Vector3()
          child.getWorldPosition(worldPos)

          const worldDir = new THREE.Vector3()
          child.getWorldDirection(worldDir)

          scene.add(child.target)
          child.target.position.copy(worldPos).addScaledVector(worldDir, -5)
          const targetY = worldPos.y - 4
          child.target.position.y = targetY
          child.angle = 0.3
          child.penumbra = 0.5
          child.distance = 50
          child.decay = 1

          child.intensity = child.intensity * 5
        }

        if (child.isLight) {
          child.intensity = child.intensity / 4000
        }

        if (child.name === 'ARm4_interior_etkc_screen_0') {
          screenMeshRef.current = child
          child.geometry.computeBoundingBox()
          const box = child.geometry.boundingBox
          screenCenterRef.current = box.getCenter(new THREE.Vector3())

          const rimGeometry = child.geometry.clone()
          rimGeometry.translate(-screenCenterRef.current.x, -screenCenterRef.current.y, -screenCenterRef.current.z)

          const rimMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1
          })
          const rimMesh = new THREE.Mesh(rimGeometry, rimMaterial)

          rimMesh.position.copy(screenCenterRef.current)
          rimMesh.translateX(0.02)
          rimMesh.scale.set(1.15, 1.15, 1.15)
          child.add(rimMesh)

          rimMeshRef.current = rimMesh
        }
      })

      const materialGroups = new Map()
      gltf.scene.updateMatrixWorld(true)

      gltf.scene.traverse((child) => {
        if (!child.isMesh) return
        if (child.name.startsWith('Plane068')) return
        if (child === screenMeshRef.current) return
        if (child.parent === screenMeshRef.current) return
        if (child.name.includes('ARm4')) return

        const key = child.material.uuid
        if (!materialGroups.has(key)) {
          materialGroups.set(key, { material: child.material, geometries: [] })
        }

        const geom = child.geometry.clone()
        geom.applyMatrix4(child.matrixWorld)
        materialGroups.get(key).geometries.push(geom)
      })

      const toRemove = []
      gltf.scene.traverse((child) => {
        if (!child.isMesh) return
        if (child.name.startsWith('Plane068')) return
        if (child === screenMeshRef.current) return
        if (child.parent === screenMeshRef.current) return
        if (child.name.includes('ARm4')) return
        toRemove.push(child)
      })
      toRemove.forEach((child) => child.parent.remove(child))

      materialGroups.forEach(({ material, geometries }) => {
        if (geometries.length < 2) {
          if (geometries.length === 1) {
            const mesh = new THREE.Mesh(geometries[0], material)
            scene.add(mesh)
          }
          return
        }
        const merged = mergeGeometries(geometries, false)
        if (!merged) {
          geometries.forEach((g) => scene.add(new THREE.Mesh(g, material)))
          return
        }
        const mergedMesh = new THREE.Mesh(merged, material)
        scene.add(mergedMesh)
      })

      setAssetsLoaded(prev => prev + 1)

    }, (xhr) => {
      if (xhr.lengthComputable) {
        bytesRef.current.street = { loaded: xhr.loaded, total: xhr.total }
        updateProgress()
      }
    })


    let mixer = null

    loader.load('/DracoOpt.glb', (gltf) => {
      scene.add(gltf.scene)
      dogRef.current = gltf.scene

      mixer = new THREE.AnimationMixer(gltf.scene)
      const clip = gltf.animations[0]
      const action = mixer.clipAction(clip)
      action.play()

      setAssetsLoaded(prev => prev + 1)

    }, (xhr) => {
      if (xhr.lengthComputable) {
        bytesRef.current.dog = { loaded: xhr.loaded, total: xhr.total }
        updateProgress()
      }
    })

    let lastTime = performance.now()
    let frameCount = 0
    let clock = new THREE.Clock()

    function animate() {

      const delta = clock.getDelta()

      if (mixer) {
        mixer.update(delta)
      }

      if (rimMeshRef.current && !panelOpenRef.current) {
        const time = clock.getElapsedTime();
        const pulse = (Math.sin(time * 3) + 1) / 2;
        rimMeshRef.current.material.opacity = 0.5 + pulse * 0.5;
      }

      if (cameraStateRef.current === 'driverSeat' && !panelOpenRef.current) {
        const yaw = -mouseX * lookRange
        const pitch = -mouseY * lookRange * 0.5
        const yawedDir = centerDir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
        const rightAxis = new THREE.Vector3().crossVectors(yawedDir, camera.up).normalize()
        const dir = yawedDir.applyAxisAngle(rightAxis, pitch)
        camera.lookAt(camera.position.clone().add(dir))
      }

      animationFrameId.current = requestAnimationFrame(animate)

      frameCount++
      const now = performance.now()
      if (now - lastTime >= 1000) {

        frameCount = 0
        lastTime = now
      }

      if (cameraStateRef.current === 'orbit') {
        controls.update(0)
      }
      renderer.render(scene, camera)
    }

    animate()

    document.body.appendChild(renderer.domElement)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('click', handleScreenClick)
      cancelAnimationFrame(animationFrameId.current)
      document.body.removeChild(renderer.domElement)
      window.removeEventListener('resize', handleResize)
    }

  }, [])

  return (
    <>
      {!isMobile && assetsLoaded < totalAssets && (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-5 z-50">
          <h1 className='text-white text-5xl italic font-["Instrument_Serif"]'>Anthony Colella</h1>
          <p className='text-zinc-400 font-["Courier_Prime"]'>Software Engineer</p>
          <div className='w-64 h-1 bg-zinc-800 rounded-full overflow-hidden mt-4'>
            <div className='h-full bg-white rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
          </div>
          <p className='text-zinc-500 text-sm font-["Courier_Prime"]'>{progress >= 100 ? 'Entering the city' : 'Starting engine...'} {progress}%</p>
        </div>
      )}
      {!isMobile && assetsLoaded >= totalAssets && !panelOpen && cameraPoint !== 'transitioning' && (
        <div className='fixed bottom-8 inset-x-0 flex justify-center pointer-events-none z-40'>
          <p className='animate-bounce text-white text-md font-["Courier_Prime"] bg-black/50 px-4 py-2 rounded-full'>
            {cameraPoint === 'orbit'
              ? 'Scroll up to learn about me! ↑'
              : hasViewedScreen
                ? 'Scroll down to exit the car ↓'
                : 'Click the screen for my projects, resume, contact, and more!'}
          </p>
        </div>
      )}
      {(isMobile || (cameraPoint === 'driverSeat' && panelOpen)) && <CarPlayUI ref={carPlayRef} setPanelOpen={closePanel} isMobile={isMobile} />}
      {!isMobile && assetsLoaded >= totalAssets && (
        <button
          onClick={toggleSound}
          aria-label={soundOn ? 'Mute ambience' : 'Unmute ambience'}
          className='fixed bottom-8 right-8 z-40 text-white/80 hover:text-white bg-black/50 p-3 rounded-full cursor-pointer'
        >
          {soundOn ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
      )}
    </>
  )

}

createRoot(document.getElementById('root')).render(

  <AppRun />

)