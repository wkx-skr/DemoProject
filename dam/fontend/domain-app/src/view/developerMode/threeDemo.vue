<!--
<template>
  <div :style="style.container">
    <div id="demo">

    </div>
  </div>
</template>
<script>
  import * as THREE from 'three'
  import { Scene, PerspectiveCamera, WebGLRenderer } from 'three'
  import { BoxGeometry, MeshBasicMaterial, Mesh } from 'three'
  import { LineBasicMaterial, Vector3, BufferGeometry, Line, Light, AmbientLight } from 'three'
  import { GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
  export default {
    data () {
      const style = {
        container: {
          position: 'absolute',
          top:'60px',left:0,right:0,bottom:0,
          // background:'pink'
        }
      }
      return {
        style: style
      }
    },
    mounted () {
      // this.test()
      this.test2()
    },
    methods: {
      test2 () {
        const scene = new Scene()
        const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) // Perspective Camera 透视摄像机 (视野角度FOV，长宽比aspect ratio，近截面和远截面）
        camera.position.set(0,0,5)
        camera.lookAt(0,0,0)
        console.log(1)
        let a = 4
        if (a === 3) {
          console.log(3)
        } else {
          console.log(4)
        }
        const renderer = new WebGLRenderer()

        // renderer.physicallyCorrectLights = true
        // renderer.setSize(window.innerWidth, window.innerHeight) //第三个参数，updateStyle设为false可以节省性能
        // document.getElementById('demo').appendChild(renderer.domElement)
        // let loader = new GLTFLoader()
        // loader.load(this.$url + '/helloworld.glb', function(gltf) {
        //   scene.add(gltf.scene)
        //   gltf.animations
        //   gltf.scene
        //   gltf.scenes
        //   gltf.cameras
        //   gltf.asset
        // }, (xhr) => {
        //   console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
        // }, error => {
        //   console.error(error)
        // })
        let geometry = new BoxGeometry()
        let material = new MeshBasicMaterial({ color: 0x00ff00 })
        let cube = new Mesh(geometry, material)
        scene.add(cube)
        // console.log(scene)
        // let light = new Light(0xffffff, 10)
        // let am = new AmbientLight(0x404040,10)
        // scene.add(am)
        renderer.render(scene, camera)
      },
      test () {
        const scene = new Scene()
        const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000) // Perspective Camera 透视摄像机 (视野角度FOV，长宽比aspect ratio，近截面和远截面）
        const renderer = new WebGLRenderer()
        renderer.setSize(window.innerWidth, window.innerHeight) //第三个参数，updateStyle设为false可以节省性能
        document.getElementById('demo').appendChild(renderer.domElement)

        //立方体
        let geometry = new BoxGeometry()

        //材质
        let material = new MeshBasicMaterial({ color: 0x00ff00 })

        //网格,网格包括一个几何体和作用在此几何体上的材质
        let cube = new Mesh(geometry, material)
        scene.add(cube)
        camera.position.z = 5
        camera.position.set(0,0,10)
        camera.lookAt(0,0,0)

        let material1 = new LineBasicMaterial({color: 0x0000ff})
        let points = []
        points.push(new Vector3(-1,0,0))
        points.push(new Vector3(0,1,0))
        points.push(new Vector3(1,0,0))
        let geometry1 = new BufferGeometry().setFromPoints(points)
        let line = new Line(geometry1, material1)
        scene.add(line)
        let am = new AmbientLight(0xFFFFFF,1000)
        console.log(am)
        scene.add(am)
        function animate() {
          //比setInterval要好，用户切换到其他标签时会暂停，不会浪费资源和电池
          requestAnimationFrame( animate)
          cube.rotation.x += 0.01
          // cube.rotation.y += 0.01
          renderer.render(scene, camera)
        }
        animate()
      }
    }
  }
</script>
<style>
  canvas {
    color:#FFF;
  }
</style>
-->
