# Motionity

![Preview](preview.gif)<br><br>
The web-based motion graphics editor for everyone 📽

Motionity is a free and open source animation editor in the web. It's a mix of After Effects and Canva, with powerful features like keyframing, masking, filters, and more, and integrations to browse for assets to easily drag and drop into your video.

👉 [Try it now](https://motionity.app) for free, or [read the guide in Notion](https://motionity.notion.site/Get-started-with-Motionity-bc2a2017670d4ec6a44d5ff760ca4656)

<a href="https://www.producthunt.com/posts/motionity?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-motionity" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=357641&theme=light" alt="Motionity - The&#0032;web&#0045;based&#0032;motion&#0032;graphics&#0032;editor&#0032;for&#0032;everyone | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

> You can support this project (and many others) through [GitHub Sponsors](https://github.com/sponsors/alyssaxuu)! ❤️

Made by [Alyssa X](https://twitter.com/alyssaxuu)

## Features

⚡️ Keyframing with custom easing<br>
🎚 Image and video filters (adjustments, blur, chroma key...)<br>
✂️ Trim and cut videos<br>
👀 Layer masking<br>
🔊 Audio support<br>
🔍 Search for images, videos, shapes and more<br>
✨ Text animation (typewriter, scale, fade...)<br>
💥 Lottie support<br>
🧩 Pixabay integration<br>
...and much more - all for free & no sign in needed!

## Setting up the project on your machine
- Run `git clone https://github.com/alyssaxuu/motionity` in a terminal.
- Open `src/index.html` in your browser.

## App Architecture
Since Motionity only saves projects locally without no account needed, this app does not have a backend.

Each major piece of the app's architecture is placed in a corresponding .JS file.

### `init.js` :
This file contains most startup tasks for the app, including initalization of the canvas, the artboard, various filters, the color picker, the canvas recorder, Google Font imports, and the selection box.

Various global variables are stored here, such as:
- Preset data
- Lists of text animations
- Lists of images
- Lists of image categories
- Lists of video categories
- Lists of audio
- Lists of font categories

### `ui.js`:
This file contains functions for controlling, manipulating, and updating the UI, including:
- Functions for updating panel values, inputs, text values, stroke values, chroma values, and panel values. 
- Manipulating objects in the canvas, including functions to drag and replace them.
- Functions to open/close modals and panels, and switch to the currently active panels and tools.
- Functions to load/delete media from the panels.
- Functions to check, clear, and apply, reset, remove, close, and open filters.

### `align.js` :
This file controls the alignment of objects on the canvas, including alignment guides and checks for snapping.

### `database.js`:
This file uses localbase to autosave the user's project locally. Functionality to import/export files, assets, and projects is implemented here.

### `lottie.js`:
Defines preset for new Lottie animations.

### `text.js`:
Implements functions for setting, animating, and rendering text within the canvas. Also implements the `AnimatedText` class, which implements functionality for rendering, seeking, playing, and resetting animated text.

### `recorder.js`:
Implements functionality to record the canvas and export the recording.

### `functions.js`:
Most of the app's core functionality is implemented here, including:

- Functionality to group, ungroup, and regroup svg objects.
- Functions to play/pause the video.
- Undo/redo functionality
- Functions to create (both automatically and manually), render, remove, copy, update, snap, and drag keyframes.
- Functions for animating, freezing, and rendering props.
- Functions for loading and adding videos to the canvas.
- Implementation of the hand tool.
- Functions for creating, toggling, and rendering layers.
- Layer ordering.

### `events.js`:
Implements event handling for the app, including:
- Events for objects being moved, scaled, resized, or modified in the canvas.
- Events for selections being made, updated, or cleared in the canvas.
- Event handling for keyboard presses.
- Event handling for copying/pasting.
- Event handling for panning.
- Handling for changing the canvas's zoom level.
- Handling for object dragging.

#

Feel free to reach out to me through email at hi@alyssax.com or [on Twitter](https://twitter.com/alyssaxuu) if you have any questions or feedback! Hope you find this useful 💜
 
