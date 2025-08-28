# Emerald

Emerald is a comprehensive 2D graphics engine that can help you create games easier than ever.

## Table of Contents

- [Emerald](#emerald)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Usage](#usage)
    - [Basic Setup](#basic-setup)
    - [Set the background color for the engine](#set-the-background-color-for-the-engine)
    - [Drawing the scene](#drawing-the-scene)
  - [Scene](#scene)
    - [Adding and removing items from the scene](#adding-and-removing-items-from-the-scene)
    - [Set Active Scene](#set-active-scene)
  - [Game Objects](#game-objects)
    - [Creating a new GameObject](#creating-a-new-gameobject)
    - [Components](#components)
      - [Texture](#texture)
      - [InstancedTexture](#instancedtexture)
      - [Square2D](#square2d)
      - [Triangle2D](#triangle2d)
      - [Circle2D](#circle2d)
      - [RigidBody](#rigidbody)
      - [BoxCollider](#boxcollider)
      - [CircleCollider](#circlecollider)
  - [Object methods](#object-methods)
    - [Position](#position)
    - [Rotation](#rotation)
    - [Scale](#scale)
    - [Change color](#change-color)
    - [Set texture frame](#set-texture-frame)
  - [Animations](#animations)
  - [Instance System](#instance-system)
    - [Creating Instances](#creating-instances)
    - [Instance Management](#instance-management)
    - [Instance Events](#instance-events)
  - [Physics Engine](#physics-engine)
    - [Setting up Physics](#setting-up-physics)
    - [Physics Bodies](#physics-bodies)
    - [Collision Detection](#collision-detection)
    - [Collision Events](#collision-events)
  - [Particle System](#particle-system)
    - [Particle Settings](#particle-settings)
    - [Creating Particle Systems](#creating-particle-systems)
    - [Particle System Methods](#particle-system-methods)
  - [Lighting System](#lighting-system)
    - [Ambient Light](#ambient-light)
    - [Point Light](#point-light)
    - [Directional Light](#directional-light)
  - [Text Rendering](#text-rendering)
    - [BitmapText](#bitmaptext)
  - [EventManager](#eventmanager)
    - [Keyboard Events](#keyboard-events)
    - [Mouse Events](#mouse-events)
    - [Object Events](#object-events)
    - [Event Cleanup](#event-cleanup)
  - [AudioManager](#audiomanager)
    - [Adding Audio](#adding-audio)
    - [Playing Audio](#playing-audio)
    - [Audio Control](#audio-control)
  - [Camera](#camera)
  - [FPSCounter](#fpscounter)
  - [Scene Management](#scene-management)
  - [Time Management](#time-management)
  - [Advanced Features](#advanced-features)
    - [Resize Handling](#resize-handling)

## Getting Started

To get started with Emerald, you need to have a canvas element in your HTML and import the necessary classes.

## Usage

### Basic Setup

```javascript
import { Emerald } from "./emerald/Emerald";
import { Scene } from "./emerald/Scene";
import { Color } from "./emerald/Color";
import SceneManager from "./emerald/managers/SceneManager";

const emerald = new Emerald(canvas); // You should pass your own canvas element here
const scene = new Scene();
SceneManager.setScene(scene);
```

### Set the background color for the engine

```javascript
emerald.setBackgroundColor(color); // color = new Color(r, g, b, a = 255);
```

### Drawing the scene

To draw items in the screen you need some sort of animation loop. I use `window.requestAnimationFrame` for this. Here is a basic example:

```javascript
let lastTime = 0;
const animate = (currentTime) => {
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;
  emerald.drawScene(scene, deltaTime); // You need this line to tell the engine what to draw
  window.requestAnimationFrame(animate);
};
animate(0);
```

## Scene

Emerald has multiple scenes support. In order to render any object it has to be added to the scene using the `add` method.

### Adding and removing items from the scene

```javascript
// Adding an object to the scene
scene.add(gameObject);

// Removing an object from the scene
scene.remove(gameObject);
```

### Set Active Scene

```javascript
// When changing a scene you should deactivate current scene to not mess up the event manager.

// Activate Scene
scene.setIsActive(true);

// Deactivate Scene
scene.setIsActive(false);
```

## Game Objects

### Creating a new GameObject

```javascript
import GameObject from "./emerald/components/GameObject";
import { Vector3, Vector2 } from "./emerald/Physics";

/*
    ARGUMENTS:
    1. name: string = Name of the new GameObject
    2. position: Vector3 = Position of the new GameObject
    3. rotation: number = Rotation of the new GameObject
    4. scale: Vector2 = Scale of the new GameObject
*/
const gameObject = new GameObject(name, position, rotation, scale);
```

This will create a new empty GameObject. At this stage you will not see anything on the screen until you add some components.

### Components

There are currently 8 components: Texture, InstancedTexture, Square2D, Circle2D, Triangle2D, RigidBody, BoxCollider, CircleCollider

#### Texture

```javascript
import { Texture } from "./emerald/Texture";

/*
    ARGUMENTS:
    1. texturePath = Specify the path for the texture that you want to use.
    2. frameWidth: number = The width of each frame.
    3. frameHeight: number = The height of each frame.
    4. framesPerRow: number = How many frames are in one row in your spritesheet.
    5. totalFrames: number = How many total frames does your spritesheet have.
    6. animationSpeed: number = Speed of change of every frame.
    7. autoPlay: boolean = Specify if you want the animation to play automatically. If you don't want any animation then pass false for it.
    8. pixelart: boolean = Specify whether the texture should be rendered in pixel art style. (THIS IS OPTIONAL. If you don't specify it then it will be defaulted to true)
    9. useLighting: boolean = Specify whether the texture should react to lighting or not. If you don't want any lighting then pass false for it. (THIS IS OPTIONAL. If you don't specify it then it will be defaulted to true)
*/
const texture = new Texture(
  texturePath,
  frameWidth,
  frameHeight,
  framesPerRow,
  totalFrames,
  animationSpeed,
  autoPlay,
  (pixelart = true),
  (useLighting = true)
);

// Add the texture to a game object
gameObject.addComponent(texture);
```

![Texture](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/texture.png?raw=true)

#### InstancedTexture

InstancedTexture is perfect for rendering many objects with the same texture efficiently, such as tiles, particles, or repeating elements.

```javascript
import { InstancedTexture } from "./emerald/InstancedTexture";

/*
    ARGUMENTS:
    1. texturePath = Specify the path for the texture that you want to use.
    2. instanceCount: number = How many instances of the texture you want to create.
    3. frameWidth: number = The width of each frame.
    4. frameHeight: number = The height of each frame.
    5. framesPerRow: number = How many frames are in one row in your spritesheet.
    6. totalFrames: number = How many total frames does your spritesheet have.
    7. animationSpeed: number = Speed of change of every frame.
    8. autoPlay: boolean = Specify if you want the animation to play automatically. If you don't want any animation then pass false for it.
    9. pixelart: boolean = Specify whether the texture should be rendered in pixel art style. (THIS IS OPTIONAL. If you don't specify it then it will be defaulted to true)
    10. useLighting: boolean = Specify whether the texture should react to lighting or not. If you don't want any lighting then pass false for it. (THIS IS OPTIONAL. If you don't specify it then it will be defaulted to true)
*/
const instancedTexture = new InstancedTexture(
  texturePath,
  instanceCount,
  frameWidth,
  frameHeight,
  framesPerRow,
  totalFrames,
  animationSpeed,
  autoPlay,
  (pixelart = true),
  (useLighting = true)
);

// Add the instanced texture to a game object
gameObject.addComponent(instancedTexture);
```

![InstancedTexture](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/instancedtexture.png?raw=true)

#### Square2D

```javascript
import { Square2D } from "./emerald/Shapes";

let square = new Square2D();
gameObject.addComponent(square);
```

![Square2D](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/square2d.png?raw=true)

#### Triangle2D

```javascript
import { Triangle2D } from "./emerald/Shapes";

let triangle = new Triangle2D();
gameObject.addComponent(triangle);
```

![Triangle2D](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/triangle2d.png?raw=true)

#### Circle2D

```javascript
import { Circle2D } from "./emerald/Shapes";

/*
    ARGUMENTS:
    1. segments = number of segments that the circle will have. Default is 32.
*/
let circle = new Circle2D(segments);
gameObject.addComponent(circle);
```

![Circle2D](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/circle2d.png?raw=true)

#### RigidBody

RigidBody is a component that allows you to add physics to your game objects. However, it won't work until you create a Physics instance at the top of your code.

```javascript
import RigidBody from "./emerald/components/RigidBody";
import { Physics, Vector2 } from "./emerald/Physics";

// Create physics engine first
const physics = new Physics(-70, 32, 2); // gravity, scale, velocityThreshold

/*
    ARGUMENTS:
    1. physics: Physics = Instance of the Physics class that you created at the top of your code.
    2. type: string = Type of the rigid body. It can be "dynamic", "kinematic", or "static".
    3. position: Vector2 = Position of the rigid body is Vector2 because it doesn't need any Z index.
    4. fixedRotation: boolean = Specify whether the rigid body should have a fixed rotation or not. Default is false.
    5. parentObject: GameObject = (OPTIONAL) If you want to attach the rigid body to a GameObject you can pass it here. If you don't want to attach it to any GameObject then pass null.
    6. offset: Vector2 = (OPTIONAL) Offset from the GameObject's position.
*/
const rigidBody = new RigidBody(
  physics,
  "dynamic",
  new Vector2(0, 0),
  false,
  gameObject,
  new Vector2(0, 0)
);

gameObject.addComponent(rigidBody);
```

#### BoxCollider

```javascript
import BoxCollider from "./emerald/components/BoxCollider";

/*
    ARGUMENTS:
    1. rigidBody: RigidBody = The rigid body component that this collider will be attached to.
    2. size: Vector2 = Size of the box collider.
    3. density: number = Density of the collider.
    4. friction: number = Friction of the collider.
    5. restitution: number = Restitution (bounciness) of the collider.
    6. isSensor: boolean = Whether this collider is a sensor (triggers events but doesn't collide physically).
    7. parentObject: GameObject = (OPTIONAL) Parent GameObject.
*/
const boxCollider = new BoxCollider(
  rigidBody,
  new Vector2(1, 1),
  1,
  0.3,
  0.1,
  false,
  gameObject
);

gameObject.addComponent(boxCollider);
```

![BoxCollider](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/boxcollider.png?raw=true)

The `BoxCollider` is specifically made bigger than the `Square2D` component in this image to demonstrate how it works. You can adjust the size of the collider to fit your needs.

#### CircleCollider

```javascript
import CircleCollider from "./emerald/components/CircleCollider";

/*
    ARGUMENTS:
    1. rigidBody: RigidBody = The rigid body component that this collider will be attached to.
    2. radius: number = Radius of the circle collider.
    3. density: number = Density of the collider.
    4. friction: number = Friction of the collider.
    5. restitution: number = Restitution (bounciness) of the collider.
    6. isSensor: boolean = Whether this collider is a sensor.
    7. parentObject: GameObject = (OPTIONAL) Parent GameObject.
*/
const circleCollider = new CircleCollider(
  rigidBody,
  1.5,
  1,
  0.3,
  0.8,
  false,
  gameObject
);

gameObject.addComponent(circleCollider);
```

![CircleCollider](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/circlecollider.png?raw=true)

The `CircleCollider` is specifically made bigger than the `Circle2D` component in this image to demonstrate how it works. You can adjust the radius of the collider to fit your needs.

## Object methods

### Position

```javascript
// Set position
gameObject.transform.position.x = 100;
gameObject.transform.position.y = 200;
gameObject.transform.position.z = 0;

// Or set all at once
gameObject.transform.position = new Vector3(100, 200, 0);
```

![Position](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/position.gif?raw=true)

### Rotation

```javascript
// Set rotation (in radians)
gameObject.transform.rotation = Math.PI / 4; // 45 degrees
```

![Rotation](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/rotation.gif?raw=true)

### Scale

```javascript
// Set scale
gameObject.transform.scale.x = 2;
gameObject.transform.scale.y = 2;

// Or set both at once
gameObject.transform.scale = new Vector2(2, 2);
```

![Scale](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/scale.gif?raw=true)

### Change color

```javascript
// For textures
const texture = gameObject.getComponent(Texture);
texture.setColor(new Color(255, 0, 0)); // Red
```

![Change Color](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/changecolor.gif?raw=true)

### Set texture frame

```javascript
// For animated textures
const texture = gameObject.getComponent(Texture);
texture.setFrame(2); // Set to frame 2
```

## Animations

```javascript
// Play animation
texture.playAnimation([0, 1, 2, 3], 200); // frames array, speed in ms

// Stop animation
texture.stopAnimation();

// Check if playing
if (texture.isPlaying) {
  // Animation is currently playing
}
```

![Animations](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/animations.gif?raw=true)

## Instance System

The Instance system allows you to efficiently manage multiple copies of the same object.

### Creating Instances

```javascript
import Instance from "./emerald/Instance";

// Create an instance
const instance = new Instance(
  "InstanceName",
  new Vector3(x, y, z),
  new Vector2(width, height),
  rotation,
  frame
);

// Add to InstancedTexture
const instancedTexture = gameObject.getComponent(InstancedTexture);
instancedTexture.addInstance(instance);
```

### Instance Management

```javascript
// Remove instance
instancedTexture.removeInstance(instanceId);

// Get instance by ID
const instance = instancedTexture.getInstanceWithId(instanceId);

// Get instance at position
const instance = instancedTexture.getInstanceAtPosition(position, tolerance);

// Clear all instances
instancedTexture.clearInstances();
```

### Instance Events

```javascript
// Add click event to specific instance
instancedTexture.addInstanceClickEvent(instanceId, (event) => {
  console.log("Instance clicked!");
});

// Add hover events to specific instance
instancedTexture.addInstanceHoverEvent(
  instanceId,
  (event) => console.log("Mouse entered"),
  (event) => console.log("Mouse left")
);
```

## Physics Engine

Emerald includes a comprehensive physics engine built on top of Planck.js.

### Setting up Physics

```javascript
import { Physics } from "./emerald/Physics";

/*
    ARGUMENTS:
    1. gravity: number = Gravity force (negative for downward)
    2. scale: number = Scale factor for physics units to pixels
    3. velocityThreshold: number = Minimum velocity threshold
*/
const physics = new Physics(-70, 32, 2);
```

### Physics Bodies

```javascript
// Get the physics body from a RigidBody component
const body = rigidBody.getBody();

// Set velocity
body.setLinearVelocity(new Vector2(10, 0));

// Get velocity
const velocity = body.getLinearVelocity();

// Get position
const position = body.getPosition();
```

### Collision Detection

```javascript
// Handle collision enter
physics.onCollisionEnter((bodyA, bodyB, contact) => {
  console.log("Collision started!");

  // Get collision normal
  const normal = contact.getWorldManifold().normal;
  //normal.y = -1 when player is on the ground
  //normal.y = 1  when player hits the ceiling
  //normal.x = -1 when player hits the left wall
  //normal.x = 1  when player hits the right wall

  // Check if bodies are sensors
  const fixtureA = contact.getFixtureA();
  const fixtureB = contact.getFixtureB();
  if (fixtureA.isSensor() || fixtureB.isSensor()) {
    // Handle sensor collision
  }
});

// Handle collision exit
physics.onCollisionExit((bodyA, bodyB, contact) => {
  console.log("Collision ended!");
});
```

### Collision Events

```javascript
// Process physics in your update loop
const animate = (currentTime) => {
  physics.process(deltaTime);
};
```

## Particle System

Emerald includes a powerful particle system for creating visual effects.

![Particles](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/particles.gif?raw=true)

### Particle Settings

```javascript
import ParticleSettings from "./emerald/particlesystem/ParticleSettings";

const particleSettings = new ParticleSettings({
  lifetime: 1.2,
  velocity: new Vector2(200, 300),
  gravity: new Vector2(0, -400),
  amount: 16,
  direction: new Vector2(0, 1), // upward
  spread: Math.PI * 2,
  emissionRate: Infinity, // one-shot emission
  frame: 0,
  offset: 5,
  rotation: 0,
  scale: new Vector2(5, 5),
  animation: { frames: [0, 1, 2], speed: 200 },
});
```

### Creating Particle Systems

```javascript
import Particles from "./emerald/particlesystem/Particles";

/*
    ARGUMENTS:
    1. name: string = Name of the particle system
    2. texturePath: string = Path to the texture
    3. frameWidth: number = Width of each frame
    4. frameHeight: number = Height of each frame
    5. framesPerRow: number = Frames per row in spritesheet
    6. totalFrames: number = Total frames in spritesheet
    7. duration: number = Duration of the effect
    8. settings: ParticleSettings = Particle settings object
*/
const particles = new Particles(
  "explosion",
  texturePath,
  16,
  16,
  9,
  27,
  1.2,
  particleSettings
);

// Add to scene
scene.add(particles.gameObject);
```

### Particle System Methods

```javascript
// Play particle effect at position
particles.play(new Vector3(x, y, z));

// Stop particle system
particles.stop();

// Reset particle system
particles.reset();

// Update particles (call in your animation loop)
particles.update(deltaTime);

// Check if active
if (particles.active) {
  // Particles are currently active
}
```

## Lighting System

Emerald supports ambient, point, and directional lighting.

### Ambient Light

```javascript
// Set ambient light
emerald.setAmbientLight(new Vector3(0.3, 0.3, 0.3)); // RGB values 0-1
```

### Point Light

```javascript
import PointLight from "./emerald/lights/PointLight";

/*
    ARGUMENTS:
    1. position: Vector2 = Position of the light
    2. color: Color = Color of the light
    3. intensity: number = Light intensity
    4. radius: number = Light radius
*/
const pointLight = new PointLight(
  new Vector2(100, 0),
  new Color(255, 204, 153),
  1.5,
  400
);

// Add to engine
emerald.addPointLight(pointLight);

// Update position
pointLight.position.x = newX;
pointLight.position.y = newY;
```

### Directional Light

```javascript
import DirectionalLight from "./emerald/lights/DirectionalLight";

/*
    ARGUMENTS:
    1. position: Vector2 = Position of the light
    2. direction: Vector2 = Direction vector
    3. color: Color = Color of the light
    4. intensity: number = Light intensity
    5. width: number = Width of the light beam
*/
const directionalLight = new DirectionalLight(
  new Vector2(0, 300),
  new Vector2(0, -1), // pointing down
  new Color(255, 255, 255),
  3.0,
  200
);

// Add to engine
emerald.addDirectionalLight(directionalLight);

// Rotate direction
const angle = 0.1;
const newX =
  directionalLight.direction.x * Math.cos(angle) -
  directionalLight.direction.y * Math.sin(angle);
const newY =
  directionalLight.direction.x * Math.sin(angle) +
  directionalLight.direction.y * Math.cos(angle);
directionalLight.direction.x = newX;
directionalLight.direction.y = newY;
```

## Text Rendering

### BitmapText

Emerald supports bitmap font rendering using the BitmapText component. This allows you to display text with custom fonts and styles.

![BitmapText](https://github.com/vahan-gev/emeralddocs/blob/main/github/screenshots/bitmaptext.png?raw=true)

```javascript
import BitmapText from "./emerald/BitmapText";

/*
    ARGUMENTS:
    1. text: string = Text to display
    2. texturePath: string = Path to bitmap font texture
    3. letters: string = String containing all available characters
    4. letterSpacing: number = Spacing between letters
    5. frameWidth: number = Width of each character frame
    6. frameHeight: number = Height of each character frame
    7. framesPerRow: number = Characters per row in font texture
    8. totalFrames: number = Total character frames
    9. pixelArt: boolean = Whether to use pixel art rendering
    10. fontSize: number = Font size
    11. color: Color = Text color
    12. position: Vector3 = Text position
    13. rotation: number = Text rotation
    14. useLighting: boolean = Whether text should react to lighting
*/
const bitmapText = new BitmapText(
  "Hello World!",
  fontTexturePath,
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?.",
  16,
  32,
  32,
  10,
  95,
  true,
  24,
  new Color(255, 255, 255),
  new Vector3(0, 200, 0),
  0,
  false
);

// Add to scene
scene.add(bitmapText.gameObject);

// Update text
bitmapText.setText("New Text!");
bitmapText.setColor(new Color(255, 0, 0));
bitmapText.setFontSize(32);
bitmapText.setLetterSpacing(20);
```

## EventManager

Emerald supports keyboard, mouse, click, and hover events. All events are handled using the built-in EventManager class.

![EventManager](https://github.com/vahan-gev/emeralddocs/blob/main/github/videos/eventmanager.gif?raw=true)

```javascript
import EventManager from "./emerald/managers/EventManager";

let eventManager = new EventManager(canvas, scene, emerald.camera);
```

### Keyboard Events

```javascript
// Key down events
eventManager.addKeyDown("w", () => {
  console.log("W key pressed");
});

// Key up events
eventManager.addKeyUp("w", () => {
  console.log("W key released");
});

// Check if key is currently pressed
if (eventManager.isKeyPressed("w")) {
  // W key is currently held down
}

// Remove key events
eventManager.removeKeyDown("w", callbackFunction);
eventManager.removeKeyUp("w", callbackFunction);
```

### Mouse Events

```javascript
// Get mouse position
const mousePos = eventManager.getMousePosition();
console.log(mousePos.x, mousePos.y);

// Check if camera was moved
if (eventManager.wasCameraMoved()) {
  // Camera was moved by dragging
  eventManager.resetCameraMoved();
}
```

### Object Events

```javascript
// Click events
eventManager.addClickEvent(gameObject, (event, object) => {
  console.log("Object clicked!");
});

// Hover events
eventManager.addHoverEvent(
  gameObject,
  (event) => {
    console.log("Mouse entered object");
  },
  (event) => {
    console.log("Mouse left object");
  }
);

// Remove events
eventManager.removeClickEvent(gameObject, callbackFunction);
eventManager.removeHoverEvent(gameObject, enterCallback, leaveCallback);
```

### Event Cleanup

```javascript
// Clean up all events when done
eventManager.clean();

// Change scene
eventManager.changeScene(newScene);
```

## AudioManager

Emerald includes a comprehensive audio management system.

### Adding Audio

```javascript
import AudioManager from "./emerald/managers/AudioManager";

const audioManager = new AudioManager();

// Add audio files
audioManager.add("path/to/sound.wav", "soundName");
audioManager.add("path/to/music.mp3", "backgroundMusic");
```

### Playing Audio

```javascript
// Play audio
audioManager.play("soundName");

// Play exclusively (stops all other audio first)
audioManager.playExclusive("soundName");
```

### Audio Control

```javascript
// Stop specific audio
audioManager.stop("soundName");

// Stop all audio
audioManager.stopAll();

// Remove audio
audioManager.remove("soundName");

// Get audio object
const sound = audioManager.getSound("soundName");
```

## Camera

The engine has simple controls for the camera. The camera is stored in the emerald variable.

```javascript
// Set camera position
emerald.camera.setPosition(x, y, z);

// Access camera transform directly
emerald.camera.transform.position.x = 100;
emerald.camera.transform.position.y = 200;
emerald.camera.transform.scale.x = 1.5;
emerald.camera.transform.scale.y = 1.5;
```

## FPSCounter

Emerald has a built-in FPS counter.

```javascript
import { FPSCounter } from "./emerald/FPSCounter";

let fpsCounter = new FPSCounter();

const animate = (currentTime) => {
  emerald.drawScene(scene, deltaTime);
  fpsCounter.update(); // Call this in your animation loop
  window.requestAnimationFrame(animate);
};
animate();
```

## Scene Management

```javascript
import SceneManager from "./emerald/managers/SceneManager";

// Set active scene
SceneManager.setScene(scene);

// Get current scene
const currentScene = SceneManager.getScene();
```

## Time Management

```javascript
import Time from "./emerald/Time";

// Get delta time
const deltaTime = Time.deltaTime;

// Time is automatically updated when you call emerald.drawScene()
// You can also manually set it
Time.setDeltaTime(deltaTime);
```

## Advanced Features

### Resize Handling

```javascript
// Handle window resize
const handleResize = () => {
  const { width, height } = getCanvasDimensions();
  emerald.resize(width, height);
};

window.addEventListener("resize", handleResize);
```
