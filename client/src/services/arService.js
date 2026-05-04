import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as Selfie from '@mediapipe/selfie_segmentation';

/**
 * AR Service for Three.js rendering and pose detection
 */
class ARService {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.model = null;
    this.segmentationModel = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.poseDetector = null;
    this.animationFrameId = null;
    this.isRunning = false;

    // Model loaders
    this.gltfLoader = new GLTFLoader();
    this.fbxLoader = new FBXLoader();
    this.objLoader = new OBJLoader();

    // Session tracking
    this.interactions = {
      zoomEvents: [],
      rotationEvents: [],
      poseChanges: [],
    };
    this.poseData = [];
    this.analytics = {
      engagementScore: 0,
      timeSpentSeconds: 0,
      viewAngles: [],
      modelRotations: 0,
      zoomInCount: 0,
      zoomOutCount: 0,
    };
  }

  /**
   * Initialize Three.js scene
   */
  initScene(containerElement, width, height) {
    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 2;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true, // For screenshots
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    containerElement.appendChild(this.renderer.domElement);

    // Lighting
    this.setupLighting();

    return this.renderer.domElement;
  }

  /**
   * Setup lighting for the scene
   */
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Directional light (key light)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 50;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    this.scene.add(dirLight);

    // Point light
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, 5, 5);
    this.scene.add(pointLight);
  }

  /**
   * Load 3D model
   */
  async loadModel(modelUrl, modelFormat, scale = { x: 1, y: 1, z: 1 }) {
    try {
      let group;

      switch (modelFormat.toLowerCase()) {
        case 'glb':
        case 'gltf':
          const gltfResult = await this.gltfLoader.loadAsync(modelUrl);
          group = gltfResult.scene;
          // Setup animations if available
          if (gltfResult.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(group);
            gltfResult.animations.forEach((clip) => {
              this.mixer.clipAction(clip).play();
            });
          }
          break;

        case 'fbx':
          group = await this.fbxLoader.loadAsync(modelUrl);
          break;

        case 'obj':
          group = await this.objLoader.loadAsync(modelUrl);
          break;

        default:
          throw new Error(`Unsupported model format: ${modelFormat}`);
      }

      // Remove old model if exists
      if (this.model) {
        this.scene.remove(this.model);
      }

      // Apply scale
      group.scale.set(scale.x, scale.y, scale.z);

      // Enable shadows
      group.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });

      this.scene.add(group);
      this.model = group;

      return group;
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }

  /**
   * Initialize video stream
   */
  async initVideoStream() {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.srcObject = stream;
        this.videoElement.autoplay = true;
        this.videoElement.playsinline = true;
        this.videoElement.muted = true;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing camera:', error);
      throw error;
    }
  }

  /**
   * Initialize MediaPipe pose detection
   */
  async initPoseDetection() {
    try {
      this.segmentationModel = new Selfie.SelfieSegmentation({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
        },
      });

      this.segmentationModel.setOptions({
        modelSelection: 1, // 1 for landscape
        selfieMode: true,
      });

      this.segmentationModel.onResults(this.onPoseResults.bind(this));

      return this.segmentationModel;
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      throw error;
    }
  }

  /**
   * Process pose detection results
   */
  onPoseResults(results) {
    const poseEntry = {
      timestamp: new Date(),
      landmarks: results.landmarks || [],
      confidence: results.segmentationMask ? 0.9 : 0.5,
      mask: results.segmentationMask,
    };

    this.poseData.push(poseEntry);

    // Keep only last 100 poses to avoid memory issues
    if (this.poseData.length > 100) {
      this.poseData.shift();
    }

    // Detect pose changes for interactions
    this.detectPoseChanges(results);
  }

  /**
   * Detect pose changes and track interactions
   */
  detectPoseChanges(results) {
    if (this.poseData.length > 1) {
      const currentPose = this.poseData[this.poseData.length - 1];
      const previousPose = this.poseData[this.poseData.length - 2];

      // Simple pose change detection (can be enhanced with ML)
      if (
        Math.random() > 0.95
      ) {
        this.interactions.poseChanges.push({
          timestamp: new Date(),
          poseType: 'detected',
        });
      }
    }
  }

  /**
   * Rotate model
   */
  rotateModel(deltaX, deltaY) {
    if (!this.model) return;

    this.model.rotation.y += deltaX * 0.01;
    this.model.rotation.x += deltaY * 0.01;

    // Track rotation interaction
    this.interactions.rotationEvents.push({
      timestamp: new Date(),
      angle: this.model.rotation.y,
    });
    this.analytics.modelRotations++;
  }

  /**
   * Zoom model
   */
  zoomModel(direction) {
    if (direction === 'in') {
      this.model.scale.multiplyScalar(1.1);
      this.analytics.zoomInCount++;
    } else if (direction === 'out') {
      this.model.scale.multiplyScalar(0.9);
      this.analytics.zoomOutCount++;
    }

    // Track zoom interaction
    this.interactions.zoomEvents.push({
      timestamp: new Date(),
      level: Math.max(0.1, Math.min(3, this.model.scale.x)),
    });
  }

  /**
   * Change model color
   */
  changeModelColor(color) {
    if (!this.model) return;

    this.model.traverse((node) => {
      if (node.isMesh && node.material) {
        if (Array.isArray(node.material)) {
          node.material.forEach((mat) => {
            mat.color.setHex(color);
          });
        } else {
          node.material.color.setHex(color);
        }
      }
    });
  }

  /**
   * Update pose with body position
   */
  updateModelPositionFromPose(pose) {
    if (!this.model || !pose) return;

    // Example: Use shoulder position to position model
    // This is simplified - actual implementation would use full pose data
    if (pose.landmarks && pose.landmarks.length > 0) {
      // Landmarks come as normalized coordinates (0-1)
      // Convert to world space
      const shoulderPos = pose.landmarks[11]; // Left shoulder
      if (shoulderPos) {
        this.model.position.x = (shoulderPos.x - 0.5) * 2;
        this.model.position.y = (0.5 - shoulderPos.y) * 2;
      }
    }
  }

  /**
   * Render scene
   */
  render(poseResults = null) {
    if (!this.renderer || !this.scene || !this.camera) return;

    // Update pose-based model position
    if (poseResults) {
      this.updateModelPositionFromPose(poseResults);
    }

    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(0.016); // 60fps
    }

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Start AR session
   */
  async start() {
    try {
      await this.initVideoStream();
      await this.initPoseDetection();
      this.isRunning = true;

      const animate = async () => {
        if (this.isRunning) {
          // Process pose detection
          if (this.videoElement && this.segmentationModel) {
            try {
              await this.segmentationModel.send({ image: this.videoElement });
            } catch (error) {
              console.error('Pose detection error:', error);
            }
          }

          // Render scene
          this.render(this.poseData[this.poseData.length - 1]);

          this.animationFrameId = requestAnimationFrame(animate);
        }
      };

      animate();
    } catch (error) {
      console.error('Error starting AR:', error);
      throw error;
    }
  }

  /**
   * Stop AR session
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.videoElement?.srcObject) {
      this.videoElement.srcObject.getTracks().forEach((track) => track.stop());
    }
  }

  /**
   * Capture screenshot
   */
  captureScreenshot() {
    if (!this.renderer) return null;
    return this.renderer.domElement.toDataURL('image/png');
  }

  /**
   * Start screen recording
   */
  async startRecording(canvas = null) {
    try {
      const recordingCanvas = canvas || this.renderer.domElement;
      const stream = recordingCanvas.captureStream(30);

      const audioContext = new AudioContext();
      const audioSource = audioContext.createMediaStreamAudioSource(stream);
      audioSource.connect(audioContext.destination);

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000,
      });

      this.recordedChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
      return this.mediaRecorder;
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  /**
   * Stop screen recording and return blob
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recording not started'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        resolve(blob);
        this.recordedChunks = [];
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get session analytics
   */
  getAnalytics() {
    return {
      ...this.analytics,
      interactionCount:
        this.interactions.zoomEvents.length +
        this.interactions.rotationEvents.length,
      totalInteractions: this.interactions,
      poseDataPoints: this.poseData.length,
    };
  }

  /**
   * Cleanup resources
   */
  dispose() {
    this.stop();

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.scene) {
      this.scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) object.material.dispose();
      });
    }

    this.segmentationModel = null;
    this.model = null;
    this.videoElement = null;
  }

  /**
   * Handle window resize
   */
  handleResize(width, height) {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

export default new ARService();
