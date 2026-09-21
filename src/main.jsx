import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { SpotLightHelper } from 'three'
import gsap from 'gsap'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import './index.css'
import App from './App.jsx'
import CarPlayUI from './CarPlayUI.jsx'

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
  const [isMobile] = useState(() => window.matchMedia('(pointer: coarse)').matches)

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.2

    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    pmremGenerator.compileEquirectangularShader()

    const scene = new THREE.Scene()
    window.scene = scene

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
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
      if (cameraStateRef.current !== 'driverSeat') return

      mouseClick.x = (event.clientX / window.innerWidth) * 2 - 1
      mouseClick.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.setFromCamera(mouseClick, camera)

      if (screenMeshRef.current) {
        const intersects = raycaster.intersectObject(screenMeshRef.current, true)
        if (intersects.length > 0) {
          setPanelOpen(true)
          panelOpenRef.current = true
        }
      }
    }

    window.addEventListener('click', handleScreenClick)

    const centerY = 1.3516
    const lookRange = Math.PI / 2
    let mouseX = 0
    let mouseY = 0

    const centerDir = new THREE.Vector3(17.026 - 34.856, 2.941 - 6.701, -8.147 - -6.865).normalize()

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = (event.clientY / window.innerHeight) * 2 - 1

      if (cameraStateRef.current === 'driverSeat' && !panelOpenRef.current && screenMeshRef.current) {
        const hoverMouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        )
        raycaster.setFromCamera(hoverMouse, camera)
        const intersects = raycaster.intersectObject(screenMeshRef.current, true)
        document.body.style.cursor = intersects.length > 0 ? 'pointer' : 'default'
      }
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

    const loader = new GLTFLoader()
    const rgbeLoader = new RGBELoader()

    const updateProgress = () => {
      const { street, dog } = bytesRef.current
      const total = street.total + dog.total
      if (total > 0) setProgress(Math.round(((street.loaded + dog.loaded) / total) * 100))
    }

    rgbeLoader.load('/cobblestone_street_night_1k.hdr', (texture) => {
      scene.environment = pmremGenerator.fromEquirectangular(texture).texture
    })

    loader.load('/StreetWebP.glb', (gltf) => {
      scene.add(gltf.scene)

      gltf.scene.traverse((child) => {
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

          child.intensity = child.intensity * 20
        }

        if (child.isLight) {
          child.intensity = child.intensity / 4000
        }

        if (child.name === 'ARm4_interior_etkc_screen_0') {
          screenMeshRef.current = child
        }

        if (child.name === 'ARm4_interior_etkc_screen_0') {
          screenMeshRef.current = child
          child.geometry.computeBoundingBox()
          screenCenterRef.current = child.geometry.boundingBox.getCenter(new THREE.Vector3())
        }
        if (child.name === 'ARm4_interior_etkc_screen_0') {
          screenMeshRef.current = child
          child.geometry.computeBoundingBox()
          const box = child.geometry.boundingBox
          screenCenterRef.current = box.getCenter(new THREE.Vector3())

          const size = box.getSize(new THREE.Vector3())
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
      setAssetsLoaded(prev => prev + 1)

    }, (xhr) => {
      if (xhr.lengthComputable) {
        bytesRef.current.street = { loaded: xhr.loaded, total: xhr.total }
        updateProgress()
      }
    })

    let mixer = null

    loader.load('/DracoOptimized.glb', (gltf) => {
      scene.add(gltf.scene)

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
          <p className='animate-bounce text-white/80 text-sm font-["Courier_Prime"] bg-black/50 px-4 py-2 rounded-full'>
            {cameraPoint === 'orbit' ? 'Scroll up to enter the car ↑' : 'Scroll down to exit ↓'}
          </p>
        </div>
      )}
      {(isMobile || (cameraPoint === 'driverSeat' && panelOpen)) && <CarPlayUI ref={carPlayRef} setPanelOpen={closePanel} isMobile={isMobile} />}
    </>
  )

}

createRoot(document.getElementById('root')).render(

  <AppRun />

)