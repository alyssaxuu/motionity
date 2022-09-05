var API_KEY = 'PIXABAY_API';
var GOOGLE_FONTS_API_KEY = 'GOOGLE_FONTS_API_KEY';

// for legacy browsers
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
var oldsrc, oldobj;
var oldtimelinepos;
var speed = 1;
var page = 1;
var checkstatus = false;
let db = new Localbase('db');
var wip = false;
var paused = true;
var currenttime = 0;
var timelinetime = 5;
const offset_left = 20;
var duration = 30000;
var keyframes = [];
var p_keyframes = [];
var props = [
  'left',
  'top',
  'scaleX',
  'scaleY',
  'width',
  'height',
  'angle',
  'opacity',
  'fill',
  'strokeWidth',
  'stroke',
  'shadow.color',
  'shadow.opacity',
  'shadow.offsetX',
  'shadow.offsetY',
  'shadow.blur',
  'charSpacing',
  'lineHeight',
];
var objects = [];
var o_slider, o_letter_slider, o_line_slider;
var colormode = 'fill';
var spaceDown = false;
var selectedkeyframe;
var undo = [];
var undoarr = [];
var redo = [];
var groups = [];
var redoarr = [];
var state;
var statearr = [];
var recording = false;
var canvasrecord;
var clipboard;
var focus = false;
var editingpanel = false;
var files = [];
var re = /(?:\.([^.]+))?$/;
var filelist = [];
var timeout;
var spacehold = false;
var spacerelease = false;
var tempselection;
var line_h, line_v;
var tempgroup = [];
var editinggroup = false;
var tempgroupid;
var fontPicker;
var fonts = [];
var seeking = false;
var setting = false;
var handtool = false;
var canvasx = 0;
var canvasy = 0;
var overCanvas = false;
var draggingPanel = false;
var cropping = false;
var cropobj;
var cropscalex;
var cropscaley;
var croptop;
var cropleft;
var layer_count = 1;
var lockmovement = false;
var shiftx = 0;
var shifty = 0;
var editinglayer = false;
var editingproject = false;
var shiftkeys = [];
var shiftdown = false;
var cliptype = 'object';
var chromaslider, noiseslider, blurslider;
var isChrome =
  window.chrome && Object.values(window.chrome).length !== 0;
var eyeDropper;
if (isChrome) {
  eyeDropper = new EyeDropper();
}
var presets = [
  {
    name: 'Dribbble shot',
    id: 'dribbble',
    width: 1600,
    height: 1200,
  },
  { name: 'Facebook post', id: 'facebook', width: 1280, height: 720 },
  {
    name: 'Facebook ad',
    id: 'facebook-ad',
    width: 1080,
    height: 1080,
  },
  { name: 'Youtube video', id: 'youtube', width: 1920, height: 1080 },
  {
    name: 'Instagram video',
    id: 'instagram-id',
    width: 1080,
    height: 1920,
  },
  {
    name: 'Instagram stories',
    id: 'instagram-stories',
    width: 1080,
    height: 1920,
  },
  { name: 'Twitter video', id: 'twitter', width: 1280, height: 720 },
  { name: 'Snapchat ad', id: 'snapchat', width: 1080, height: 1920 },
  {
    name: 'LinkedIn video',
    id: 'linkedin',
    width: 1920,
    height: 1080,
  },
  {
    name: 'Product Hunt thumbnail',
    id: 'product-hunt',
    width: 600,
    height: 600,
  },
  {
    name: 'Pinterest ad',
    id: 'pinterest',
    width: 1080,
    height: 1920,
  },
];
var activepreset = 'custom';
var uploaded_images = [];
var uploaded_videos = [];
var uploading = false;
var background_audio = false;
var temp_audio = false;
var background_key;
var sliders = [];
var hovertime = 0;
var animatedtext = [];

// Get list of fonts
$.ajax({
  url:
    'https://www.googleapis.com/webfonts/v1/webfonts?key=' +
    GOOGLE_FONTS_API_KEY +
    '&sort=alpha',
  type: 'GET',
  dataType: 'json', // added data type
  success: function (response) {
    response.items.forEach(function (item) {
      fonts.push(item.family);
    });
  },
});

// Panel variants
const canvas_panel =
  '<div id="canvas-properties" class="panel-section"><p class="property-title">Canvas settings</p><table><tr><th class="name-col">Preset</th><th class="value-col"><select id="preset"></select></th></tr><tr><th class="name-col">Size</th><th class="value-col"><div id="canvas-w" class="property-input" data-label="W"><input type="number" min=1 value=1000></div><div id="canvas-h" class="property-input" data-label="H"><input type="number" value=1000 min=1></div></th></tr><tr><th class="name-col">Color</th><th class="value-col"><div id="canvas-color" class="object-color"><div id="color-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="canvas-color-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Duration</th><th class="value-col" id="duration-cell"><div id="canvas-duration" class="property-input" data-label="s"><input type="number" value=15.00></div></th></tr></table></div>';
const object_panel =
  '<div id="layout-properties" class="panel-section"><p class="property-title">Layout</p><table><tr><th class="name-col">Position</th><th class="value-col"><div id="object-x" class="property-input" data-label="X"><input type="number" value=1000></div><div id="object-y" class="property-input" data-label="Y"><input value=1000 type="number"></div></th></tr><tr><th class="name-col">Size</th><th class="value-col"><div id="object-w" class="property-input" data-label="W"><input type="number" min=1 value=1000></div><div id="object-h" class="property-input" data-label="H"><input type="number" value=1000 min=1></div></th></tr><tr><th class="name-col">Rotation</th><th class="value-col" id="duration-cell"><div id="object-r" class="property-input" data-label="&#176;"><input type="number" min=0 max=360 value=0></div></th></tr></table></div>';
const back_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Layer</p><table><tr><th class="name-col">Opacity</th><th class="value-col"><div id="select-opacity"></div><div id="object-o" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Mask</th><th class="value-col"><select id="masks"><option value="none">None</option></select></th></tr></table></div>';
const image_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Layer</p><table><tr><th class="name-col">Opacity</th><th class="value-col"><div id="select-opacity"></div><div id="object-o" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Mask</th><th class="value-col"><select id="masks"><option value="none">None</option></select></th></tr></table></div>';
const selection_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Layer</p><table><tr><th class="name-col">Opacity</th><th class="value-col"><div id="select-opacity"></div><div id="object-o" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Group</th><th class="value-col"><div id="group-objects">Group selection</div></th></tr></table></div>';
const group_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Layer</p><table><tr><th class="name-col">Opacity</th><th class="value-col"><div id="select-opacity"></div><div id="object-o" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Mask</th><th class="value-col"><select id="masks"><option value="none">None</option></select></th></tr><tr><th class="name-col">Group</th><th class="value-col"><div id="ungroup-objects">Ungroup selection</div></th></tr></table></div>';
const other_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Layer</p><table><tr><th class="name-col">Opacity</th><th class="value-col"><div id="select-opacity"></div><div id="object-o" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Mask</th><th class="value-col"><select id="masks"><option value="none">None</option></select></th></tr></table></div>';
const shape_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Rectangle</p><table><tr><th class="name-col">Color</th><th class="value-col"><div id="object-color-fill" class="object-color"><div id="color-fill-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="object-color-fill-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Radius</th><th class="value-col" id="duration-cell"><div id="object-corners" class="property-input" data-label="px"><input type="number" value=0 min=0></div></th></tr></table></div>';
const path_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Shape</p><table><tr><th class="name-col">Color</th><th class="value-col"><div id="object-color-fill" class="object-color"><div id="color-fill-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="object-color-fill-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr></table></div>';
const text_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Text</p><table><tr><th class="name-col">Font</th><th class="value-col"><select id="font-picker"></select></th></tr><tr><th class="name-col">Align</th><th class="value-col"><div class="align-text" id="align-text-left"><img src="assets/align-text-left.svg"></div><div class="align-text" id="align-text-center"><img src="assets/align-text-center.svg"></div><div class="align-text" id="align-text-right"><img src="assets/align-text-right.svg"></div><div class="align-text" id="align-text-justify"><img src="assets/align-text-justify.svg"></div></th></tr><tr><th class="name-col">Format</th><th class="value-col"><div class="format-text" id="format-bold"><img src="assets/bold.svg"></div><div class="format-text" id="format-italic"><img src="assets/italic.svg"></div><div class="format-text" id="format-underline"><img src="assets/underline.svg"></div><div class="format-text" id="format-strike"><img src="assets/strike.svg"></div></th></tr><tr><th class="name-col">Color</th><th class="value-col"><div id="object-color-fill" class="object-color"><div id="color-fill-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="object-color-fill-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Letter</th><th class="value-col"><div id="select-letter"></div><div id="text-h" class="property-input" data-label="%"><input type="number" value=1></div></th></tr><tr><th class="name-col">Line</th><th class="value-col"><div id="select-line"></div><div id="text-v" class="property-input" data-label="%"><input type="number" value=1></div></th></tr></table></div>';
const stroke_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Stroke</p><table><tr><th class="name-col">Type</th><th class="value-col left-col"><div class="line-join" id="miter"><img src="assets/miter.svg"></div><div class="line-join" id="bevel"><img src="assets/bevel.svg"></div><div class="line-join" id="round"><img src="assets/round.svg"></div><div class="line-join" id="small-dash"><img src="assets/dash2.svg"></div></th></tr><tr><th class="name-col">Color</th><th class="value-col"><div id="object-color-stroke" class="object-color"><div id="color-stroke-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="object-color-stroke-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Width</th><th class="value-col" id="duration-cell"><div id="object-stroke" class="property-input" data-label="px"><input type="number" min=0 value=0></div></th></tr></table></div>';
const shadow_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Shadow</p><table><tr><th class="name-col">Offset</th><th class="value-col"><div id="object-shadow-x" class="property-input" data-label="X"><input type="number" value=0></div><div id="object-shadow-y" class="property-input" data-label="Y"><input value=0 type="number"></div></th></tr><tr><th class="name-col">Color</th><th class="value-col"><div id="object-color-shadow" class="object-color"><div id="color-shadow-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="object-color-shadow-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr><tr><th class="name-col">Blur</th><th class="value-col" id="duration-cell"><div id="object-blur" class="property-input" data-label="px"><input type="number" value=0 min=0></div></th></tr></table></div>';
const image_more_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Image</p><div id="image-buttons"><div id="filters-button"><img src="assets/filters.svg"> Edit filters</div><div id="crop-image"><img src="assets/crop-icon.svg">Crop image</div></div></div></hr>';
const video_more_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Video</p><div id="image-buttons"><div id="filters-button" class="filters-video"><img src="assets/filters.svg"> Edit filters</div></div></div></hr>';
const animated_text_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Text</p><table><tr><th class="name-col">Content</th><th class="value-col" id="duration-cell"><div id="animated-text" class="property-input" data-label=""><input id="animatedinput" type="text" value="text"><div id="animatedset">Set</div></div></th></tr><tr><th class="name-col">Font</th><th class="value-col"><select id="font-picker"></select></th></tr><tr><th class="name-col">Color</th><th class="value-col"><div id="text-color" class="object-color"><div id="color-text-side" class="color-picker"></div><input value="#FFFFFF" disabled="disabled"></div><div id="color-text-opacity" class="property-input" data-label="%"><input type="number" value=100></div></th></tr></table></div>';
const start_animation_panel =
  '<hr><div id="back-properties" class="panel-section"><p class="property-title">Start animation</p><table><tr><th class="name-col">Preset</th><th class="value-col"><select id="preset-picker"></select></th></tr><tr><th class="name-col">Easing</th><th class="value-col"><select id="easing-picker"><option value="linear">Linear</option><option value="easeInQuad">Ease in</option><option value="easeOutQuad">Ease out</option><option value="easeinOutQuad">Ease in-out</option><option value="easeOutInQuad">Ease out-in</option><option value="easeInBounce">Ease in bounce</option><option value="easeOutBounce">Ease out bounce</option><option value="easeinOutBounce">Ease in-out bounce</option><option value="easeOutInBouce">Ease out-in bounce</option><option value="easeOutInBouce">Ease out-in bounce</option><option value="easeInSine">Ease in sine</option><option value="easeOutSine">Ease out sine</option><option value="easeinOutSine">Ease in-out sine</option><option value="easeOutInSine">Ease out-in sine</option><option value="easeOutInSine">Ease out-in sine</option><option value="easeInCubic">Ease in cubic</option><option value="easeOutCubic">Ease out cubic</option><option value="easeinOutCubic">Ease in-out cubic</option><option value="easeOutInCubic">Ease out-in cubic</option><option value="easeOutInCubic">Ease out-in cubic</option></select></th></tr><tr><th class="name-col">Order</th><th class="value-col"><div id="order-toggle"><div id="order-backward" class="order-toggle-item">Backward</div><div id="order-forward" class="order-toggle-item order-toggle-item-active">Forward</div></div></th></tr><tr><th class="name-col">Order</th><th class="value-col"><div id="order-toggle"><div id="type-letters" class="order-toggle-item-2">Letters</div><div id="type-words" class="order-toggle-item-2 order-toggle-item-active-2">Words</div></div></th></tr><tr><th class="name-col">Duration</th><th class="value-col" id="duration-cell"><div id="animated-text-duration" class="property-input" data-label="s"><input id="durationinput" type="number" value="0"></div></th></tr></table></div>';
const audio_panel =
  '<div id="layout-properties" class="panel-section"><p class="property-title">Audio</p><table><tr><th class="name-col">Volume</th><th class="value-col" id="duration-cell"><div id="object-volume" class="property-input" data-label="%"><input type="number" value=0></div></th></tr></table></div>';

// Browser variants
const shape_browser =
  '<div id="search-fixed"><p class="property-title">Objects</p><img id="collapse" src="assets/collapse.svg"><div id="browser-search"><input placeholder="Search..."><img src="assets/search.svg" id="search-icon"><img src="assets/delete.svg" id="delete-search"><div id="search-button">Go</div></div></div><div id="shapes-cont"><p class="row-title">Shapes</p><div class="gallery-row" id="shapes-row"></div><p class="row-title">Emojis</p><div class="gallery-row" id="emojis-row"></div></div>';
const image_browser =
  '<div id="search-fixed"><p class="property-title">Images</p><img id="collapse" src="assets/collapse.svg"><div id="browser-search"><input placeholder="Search..."><a href="https://pixabay.com" target="_blank" id="pixabay"><img src="assets/pixabay.svg"></a><img src="assets/search.svg" id="search-icon"><img src="assets/delete.svg" id="delete-search"><div id="search-button">Go</div></div></div><div id="shapes-cont"><div id="landing"><div id="landing-text">Browse millions of high quality images from Pixabay. Use the search bar above or choose from popular categories below.</div><div id="categories"></div></div><div id="images-grid"></div></div>';
const text_browser =
  '<div id="search-fixed"><p class="property-title">Text</p><img id="collapse" src="assets/collapse.svg"><div id="browser-search"><input placeholder="Search..."><img src="assets/search.svg" id="search-icon"><img src="assets/delete.svg" id="delete-search"><div id="search-button">Go</div></div></div><div id="shapes-cont"><p class="row-title">Basic text</p><div id="heading-text" data-font="Inter" class="add-text noselect">Add a heading</div><div id="subheading-text" data-font="Inter" class="add-text noselect">Add a subheading</div><div id="body-text" data-font="Inter" class="add-text noselect">Add body text</div></div>';
const video_browser =
  '<div id="search-fixed"><p class="property-title">Videos</p><img id="collapse" src="assets/collapse.svg"><div id="browser-search"><input placeholder="Search..."><a href="https://pixabay.com" target="_blank" id="pixabay"><img src="assets/pixabay.svg"></a><img src="assets/search.svg" id="search-icon"><img src="assets/delete.svg" id="delete-search"><div id="search-button">Go</div></div></div><div id="shapes-cont"><div id="landing"><div id="landing-text">Browse millions of high quality images from Pixabay. Use the search bar above or choose from popular categories below.</div><div id="categories"></div></div><div id="images-grid"></div></div>';
const upload_browser =
  '<div id="search-fixed"><p class="property-title">Uploads</p><div id="upload-button"><img src="assets/upload.svg"> Upload media</div><img id="collapse" src="assets/collapse.svg"><div id="upload-tabs"><div id="images-tab" class="upload-tab upload-tab-active">Images</div><div id="videos-tab" class="upload-tab">Videos</div></div></div><div id="images-grid"></div>';
const audio_browser =
  '<div id="search-fixed" class="audio-browser"><p class="property-title">Audio</p><div id="audio-upload-button"><img src="assets/upload.svg"> Upload audio</div><img id="collapse" src="assets/collapse.svg"></div><div id="audio-list-parent"><div id="landing-text" class="audio-landing-text">Audio provided by Pixabay. Browse millions of assets from Pixabay by <a href="https://pixabay.com/music/" target="_blank">clicking here.</a></div><div id="audio-list"></div></div>';

// Text animation list
var text_animation_list = [
  { name: 'fade in', label: 'Fade in', src: 'assets/fade-in.svg' },
  {
    name: 'typewriter',
    label: 'Typewriter',
    src: 'assets/typewriter.svg',
  },
  {
    name: 'slide top',
    label: 'Slide top',
    src: 'assets/slide-top.svg',
  },
  {
    name: 'slide bottom',
    label: 'Slide bottom',
    src: 'assets/slide-bottom.svg',
  },
  {
    name: 'slide left',
    label: 'Slide left',
    src: 'assets/slide-left.svg',
  },
  {
    name: 'slide right',
    label: 'Slide right',
    src: 'assets/slide-right.svg',
  },
  { name: 'scale', label: 'Scale', src: 'assets/scale.svg' },
  { name: 'shrink', label: 'Shrink', src: 'assets/shrink.svg' },
];

// Shapes list
var shape_grid_items = [
  'assets/shapes/rectangle.svg',
  'assets/shapes/circle.svg',
  'assets/shapes/triangle.svg',
  'assets/shapes/polygon.svg',
  'assets/shapes/star.svg',
  'assets/thingy.svg',
  'assets/shapes/heart.svg',
  'assets/shapes/arrow.svg',
];
var emoji_items = [
  'assets/twemojis/laughing-emoji.png',
  'assets/twemojis/crying-emoji.png',
  'assets/twemojis/surprised-emoji.png',
  'assets/twemojis/smiling-emoji.png',
  'assets/twemojis/tongue-emoji.png',
  'assets/twemojis/heart-eyes-emoji.png',
  'assets/twemojis/heart-kiss-emoji.png',
  'assets/twemojis/sunglasses-cool-emoji.png',
  'assets/twemojis/ghost-emoji.png',
  'assets/twemojis/skull-emoji.png',
  'assets/twemojis/mindblown-emoji.png',
  'assets/twemojis/bomb-emoji.png',
  'assets/twemojis/hundred-100-points-emoji.png',
  'assets/twemojis/thought-balloon-emoji.png',
  'assets/twemojis/wave-emoji.png',
  'assets/twemojis/point-emoji.png',
  'assets/twemojis/thumbs-up-emoji.png',
  'assets/twemojis/clap-emoji.png',
  'assets/twemojis/raising-hands-emoji.png',
  'assets/twemojis/praying-hands-emoji.png',
  'assets/twemojis/nail-polish-emoji.png',
  'assets/twemojis/eyes-emoji.png',
  'assets/twemojis/cat-face-emoji.png',
  'assets/twemojis/dog-face-emoji.png',
  'assets/twemojis/rose-emoji.png',
  'assets/twemojis/tulip-emoji.png',
  'assets/twemojis/pizza-emoji.png',
  'assets/twemojis/construction-emoji.png',
  'assets/twemojis/plane-emoji.png',
  'assets/twemojis/rocket-emoji.png',
  'assets/twemojis/clock-emoji.png',
  'assets/twemojis/star-emoji.png',
  'assets/twemojis/sun-emoji.png',
  'assets/twemojis/moon-emoji.png',
  'assets/twemojis/fire-emoji.png',
  'assets/twemojis/sparkles-emoji.png',
  'assets/twemojis/party-popper-emoji.png',
  'assets/twemojis/gift-emoji.png',
  'assets/twemojis/trophy-emoji.png',
  'assets/twemojis/target-emoji.png',
  'assets/twemojis/gem-emoji.png',
  'assets/twemojis/money-emoji.png',
  'assets/twemojis/pencil-emoji.png',
  'assets/twemojis/graph-emoji.png',
  'assets/twemojis/wip-emoji.png',
  'assets/twemojis/winking-face-emoji.png',
  'assets/twemojis/pleading-face-emoji.png',
  'assets/twemojis/thinking-face-emoji.png',
];

// Image list
var image_grid_items = [
  'https://images.unsplash.com/photo-1609153259378-a8b23c766aec?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1866&q=80',
  'https://images.unsplash.com/photo-1614435082296-ef0cbdb16b70?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=934&q=80',
  'https://images.unsplash.com/photo-1614432254115-7e756705e910?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxMHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1614423234685-544477464e15?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHw4fHx8ZW58MHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1614357235247-99fabbee67f9?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60',
  'https://images.unsplash.com/photo-1614373371549-c7d2e4885f17?ixid=MXwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOXx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=900&q=60',
];
var image_categories = [
  { name: 'background', image: 'assets/background.png' },
  { name: 'wallpaper', image: 'assets/wallpaper.png' },
  { name: 'nature', image: 'assets/nature.png' },
  { name: 'summer', image: 'assets/summer.png' },
  { name: 'beach', image: 'assets/beach.png' },
  { name: 'space', image: 'assets/space.png' },
  { name: 'office', image: 'assets/office.png' },
  { name: 'food', image: 'assets/food.png' },
];

// Video list
var video_categories = [
  { name: 'rain', image: 'assets/rain.png' },
  { name: 'cars', image: 'assets/cars.png' },
  { name: 'meditation', image: 'assets/meditation.png' },
  { name: 'forest', image: 'assets/forest.png' },
  { name: 'animals', image: 'assets/animals.png' },
  { name: 'street', image: 'assets/street.png' },
  { name: 'travel', image: 'assets/travel.png' },
  { name: 'work', image: 'assets/work.png' },
];

// Audio list
var audio_items = [
  {
    name: 'Lofi Study',
    desc: 'FASSounds',
    duration: '2:27',
    thumb: 'assets/audio/lofi-thumb.png',
    src: 'assets/audio/lofi.mp3',
    link: 'https://pixabay.com/users/fassounds-3433550/',
  },
  {
    name: 'Stomping Rock (Four Shots)',
    desc: 'AlexGrohl',
    duration: '1:59',
    thumb: 'assets/audio/stomping-rock-thumb.png',
    src: 'assets/audio/stomping-rock.mp3',
    link: 'https://pixabay.com/users/alexgrohl-25289918/',
  },
  {
    name: 'Everything Feels New',
    desc: 'EvgenyBardyuzha',
    duration: '1:06',
    thumb: 'assets/audio/everything-feels-new-thumb.png',
    src: 'assets/audio/everything-feels-new.mp3',
    link: 'https://pixabay.com/users/evgenybardyuzha-25235210/',
  },
  {
    name: 'Both of Us',
    desc: 'madiRFAN',
    duration: '2:48',
    thumb: 'assets/audio/both-of-us-thumb.png',
    src: 'assets/audio/both-of-us.mp3',
    link: 'https://pixabay.com/users/madirfan-50411/',
  },
  {
    name: 'The Podcast Intro',
    desc: 'Music Unlimited',
    duration: '1:51',
    thumb: 'assets/audio/the-podcast-intro-thumb.png',
    src: 'assets/audio/the-podcast-intro.mp3',
    link: 'https://pixabay.com/users/music_unlimited-27600023/',
  },
  {
    name: 'Epic Cinematic Trailer',
    desc: 'PavelYudin',
    duration: '2:27',
    thumb: 'assets/audio/epic-cinematic-trailer-thumb.png',
    src: 'assets/audio/epic-cinematic-trailer.mp3',
    link: 'https://pixabay.com/users/pavelyudin-27739282/',
  },
  {
    name: 'Inspirational Background',
    desc: 'AudioCoffee',
    duration: '2:19',
    thumb: 'assets/audio/inspirational-background-thumb.png',
    src: 'assets/audio/inspirational-background.mp3',
    link: 'https://pixabay.com/users/audiocoffee-27005420/',
  },
  {
    name: 'Tropical Summer Music',
    desc: 'Music Unlimited',
    duration: '2:35',
    thumb: 'assets/audio/tropical-summer-music-thumb.png',
    src: 'assets/audio/tropical-summer-music.mp3',
    link: 'https://pixabay.com/users/music_unlimited-27600023/',
  },
];

// Text list
var text_items = {
  sansserif: [
    { name: 'Roboto', fontname: 'Roboto' },
    { name: 'Montserrat', fontname: 'Montserrat' },
    { name: 'Poppins', fontname: 'Poppins' },
  ],
  serif: [
    { name: 'Playfair Display', fontname: 'Playfair Display' },
    { name: 'Merriweather', fontname: 'Merriweather' },
    { name: 'IBM Plex Serif', fontname: 'IBM Plex Serif' },
  ],
  monospace: [
    { name: 'Roboto Mono', fontname: 'Roboto Mono' },
    { name: 'Inconsolata', fontname: 'Inconsolata' },
    { name: 'Source Code Pro', fontname: 'Source Code Pro' },
  ],
  handwriting: [
    { name: 'Dancing Script', fontname: 'Dancing Script' },
    { name: 'Pacifico', fontname: 'Pacifico' },
    { name: 'Indie Flower', fontname: 'Indie Flower' },
  ],
  display: [
    { name: 'Lobster', fontname: 'Lobster' },
    { name: 'Bebas Neue', fontname: 'Bebas Neue' },
    { name: 'Titan One', fontname: 'Titan One' },
  ],
};

WebFont.load({
  google: {
    families: ['Syne'],
  },
  active: () => {},
});

var webglBackend;
try {
  webglBackend = new fabric.WebglFilterBackend();
} catch (e) {
  console.log(e);
}
var canvas2dBackend = new fabric.Canvas2dFilterBackend();

fabric.filterBackend = fabric.initFilterBackend();
fabric.filterBackend = webglBackend;

// Lottie support
fabric.Lottie = fabric.util.createClass(fabric.Image, {
  type: 'lottie',
  lockRotation: true,
  lockSkewingX: true,
  lockSkewingY: true,
  srcFromAttribute: false,

  initialize: function (path, options) {
    if (!options.width) options.width = 480;
    if (!options.height) options.height = 480;

    this.path = path;
    this.tmpCanvasEl = fabric.util.createCanvasElement();
    this.tmpCanvasEl.width = options.width;
    this.tmpCanvasEl.height = options.height;

    this.lottieItem = bodymovin.loadAnimation({
      renderer: 'canvas',
      loop: false,
      autoplay: false,
      path: path,
      rendererSettings: {
        context: this.tmpCanvasEl.getContext('2d'),
        preserveAspectRatio: 'xMidYMid meet',
      },
    });

    this.lottieItem.addEventListener('enterFrame', (e) => {
      this.canvas.requestRenderAll();
    });

    this.lottieItem.addEventListener('DOMLoaded', () => {
      this.lottieItem.goToAndStop(currenttime, false);
      this.lottieItem.duration =
        this.lottieItem.getDuration(false) * 1000;
      this.canvas.requestRenderAll();
      canvas.renderAll();
      canvas.fire('lottie:loaded', { any: 'payload' });
    });

    this.callSuper('initialize', this.tmpCanvasEl, options);
  },

  goToSeconds: function (seconds) {
    this.lottieItem.goToAndStop(seconds, false);
    this.canvas.requestRenderAll();
  },
  goToFrame: function (frame) {
    this.lottieItem.goToAndStop(frame, true);
  },
  getDuration: function () {
    return this.lottieItem.getDuration(false);
  },
  play: function () {
    this.lottieItem.play();
  },
  pause: function () {
    this.lottieItem.pause();
  },
  getSrc: function () {
    return this.path;
  },
});

fabric.Lottie.fromObject = function (_object, callback) {
  const object = fabric.util.object.clone(_object);
  fabric.Image.prototype._initFilters.call(
    object,
    object.filters,
    function (filters) {
      object.filters = filters || [];
      fabric.Image.prototype._initFilters.call(
        object,
        [object.resizeFilter],
        function (resizeFilters) {
          object.resizeFilter = resizeFilters[0];
          fabric.util.enlivenObjects(
            [object.clipPath],
            function (enlivedProps) {
              object.clipPath = enlivedProps[0];
              const fabricLottie = new fabric.Lottie(
                object.src,
                object
              );
              callback(fabricLottie, false);
            }
          );
        }
      );
    }
  );
};

// Initialize canvas
var canvas = new fabric.Canvas('canvas', {
  preserveObjectStacking: true,
  backgroundColor: '#FFF',
  stateful: true,
});
canvas.selection = false;
canvas.controlsAboveOverlay = true;

// Customize controls
fabric.Object.prototype.set({
  transparentCorners: false,
  borderColor: '#51B9F9',
  cornerColor: '#FFF',
  borderScaleFactor: 2.5,
  cornerStyle: 'circle',
  cornerStrokeColor: '#0E98FC',
  borderOpacityWhenMoving: 1,
});

canvas.selectionColor = 'rgba(46, 115, 252, 0.11)';
canvas.selectionBorderColor = 'rgba(98, 155, 255, 0.81)';
canvas.selectionLineWidth = 1.5;

var img = document.createElement('img');
img.src = 'assets/middlecontrol.svg';

var img2 = document.createElement('img');
img2.src = 'assets/middlecontrolhoz.svg';

var img3 = document.createElement('img');
img3.src = 'assets/edgecontrol.svg';

var img4 = document.createElement('img');
img4.src = 'assets/rotateicon.svg';

function renderIcon(ctx, left, top, styleOverride, fabricObject) {
  const wsize = 20;
  const hsize = 25;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(img, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}
function renderIconHoz(ctx, left, top, styleOverride, fabricObject) {
  const wsize = 25;
  const hsize = 20;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(img2, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}
function renderIconEdge(ctx, left, top, styleOverride, fabricObject) {
  const wsize = 25;
  const hsize = 25;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(img3, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}

function renderIconRotate(
  ctx,
  left,
  top,
  styleOverride,
  fabricObject
) {
  const wsize = 40;
  const hsize = 40;
  ctx.save();
  ctx.translate(left, top);
  ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
  ctx.drawImage(img4, -wsize / 2, -hsize / 2, wsize, hsize);
  ctx.restore();
}
function resetControls() {
  fabric.Object.prototype.controls.ml = new fabric.Control({
    x: -0.5,
    y: 0,
    offsetX: -1,
    cursorStyleHandler:
      fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIcon,
  });

  fabric.Object.prototype.controls.mr = new fabric.Control({
    x: 0.5,
    y: 0,
    offsetX: 1,
    cursorStyleHandler:
      fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingXOrSkewingY,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIcon,
  });

  fabric.Object.prototype.controls.mb = new fabric.Control({
    x: 0,
    y: 0.5,
    offsetY: 1,
    cursorStyleHandler:
      fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIconHoz,
  });

  fabric.Object.prototype.controls.mt = new fabric.Control({
    x: 0,
    y: -0.5,
    offsetY: -1,
    cursorStyleHandler:
      fabric.controlsUtils.scaleSkewCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingYOrSkewingX,
    getActionName: fabric.controlsUtils.scaleOrSkewActionName,
    render: renderIconHoz,
  });

  fabric.Object.prototype.controls.tl = new fabric.Control({
    x: -0.5,
    y: -0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  });

  fabric.Object.prototype.controls.tr = new fabric.Control({
    x: 0.5,
    y: -0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  });

  fabric.Object.prototype.controls.bl = new fabric.Control({
    x: -0.5,
    y: 0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  });

  fabric.Object.prototype.controls.br = new fabric.Control({
    x: 0.5,
    y: 0.5,
    cursorStyleHandler: fabric.controlsUtils.scaleCursorStyleHandler,
    actionHandler: fabric.controlsUtils.scalingEqually,
    render: renderIconEdge,
  });

  fabric.Object.prototype.controls.mtr = new fabric.Control({
    x: 0,
    y: 0.5,
    cursorStyleHandler: fabric.controlsUtils.rotationStyleHandler,
    actionHandler: fabric.controlsUtils.rotationWithSnapping,
    offsetY: 30,
    withConnecton: false,
    actionName: 'rotate',
    render: renderIconRotate,
  });
}
resetControls();
var textBoxControls = (fabric.Textbox.prototype.controls = {});

textBoxControls.mtr = fabric.Object.prototype.controls.mtr;
textBoxControls.tr = fabric.Object.prototype.controls.tr;
textBoxControls.br = fabric.Object.prototype.controls.br;
textBoxControls.tl = fabric.Object.prototype.controls.tl;
textBoxControls.bl = fabric.Object.prototype.controls.bl;
textBoxControls.mt = fabric.Object.prototype.controls.mt;
textBoxControls.mb = fabric.Object.prototype.controls.mb;

textBoxControls.ml = new fabric.Control({
  x: -0.5,
  y: 0,
  offsetX: -1,
  cursorStyleHandler:
    fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.changeWidth,
  actionName: 'resizing',
  render: renderIcon,
});

textBoxControls.mr = new fabric.Control({
  x: 0.5,
  y: 0,
  offsetX: 1,
  cursorStyleHandler:
    fabric.controlsUtils.scaleSkewCursorStyleHandler,
  actionHandler: fabric.controlsUtils.changeWidth,
  actionName: 'resizing',
  render: renderIcon,
});

// Get any object by ID
fabric.Canvas.prototype.getItemById = function (name) {
  var object = null,
    objects = this.getObjects();
  for (var i = 0, len = this.size(); i < len; i++) {
    if (objects[i].get('type') == 'group') {
      if (objects[i].get('id') && objects[i].get('id') === name) {
        object = objects[i];
        break;
      }
      var wip = i;
      for (var o = 0; o < objects[i]._objects.length; o++) {
        if (
          objects[wip]._objects[o].id &&
          objects[wip]._objects[o].id === name
        ) {
          object = objects[wip]._objects[o];
          break;
        }
      }
    } else if (objects[i].id && objects[i].id === name) {
      object = objects[i];
      break;
    }
  }
  return object;
};

// Create the artboard
var a_width = 600;
var a_height = 500;
var artboard = new fabric.Rect({
  left: canvas.get('width') / 2 - a_width / 2,
  top: canvas.get('height') / 2 - a_height / 2,
  width: a_width,
  height: a_height,
  absolutePositioned: true,
  rx: 0,
  ry: 0,
  fill: '#FFF',
  hasControls: true,
  transparentCorners: false,
  borderColor: '#0E98FC',
  cornerColor: '#0E98FC',
  cursorWidth: 1,
  cursorDuration: 1,
  cursorDelay: 250,
  id: 'overlay',
});
canvas.renderAll();

// Clip canvas to the artboard
canvas.clipPath = artboard;
canvas.renderAll();

// Initialize color picker (fill)
var o_fill = Pickr.create({
  el: '#color-picker-fill',
  theme: 'nano',
  inline: true,
  useAsButton: true,
  swatches: null,
  default: '#FFFFFF',
  showAlways: true,
  components: {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
      hex: true,
      rgba: true,
      hsla: false,
      hsva: false,
      cmyk: false,
      input: true,
      clear: false,
      save: false,
    },
  },
});

// Color picker events
o_fill
  .on('init', (instance) => {
    o_fill.hide();
  })
  .on('change', (instance) => {
    if (canvas.getActiveObject()) {
      const object = canvas.getActiveObject();
      if (colormode == 'fill') {
        $('#object-color-fill input').val(
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        $('#object-color-fill-opacity input').val(
          Math.round(o_fill.getColor().toRGBA()[3] * 100 * 100) / 100
        );
        $('#color-fill-side').css(
          'background-color',
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        object.set('fill', o_fill.getColor().toRGBA().toString());
        if (!seeking && !setting) {
          newKeyframe(
            'fill',
            object,
            currenttime,
            object.get('fill'),
            true
          );
        }
      } else if (colormode == 'stroke') {
        $('#object-color-stroke input').val(
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        $('#object-color-stroke-opacity input').val(
          Math.round(o_fill.getColor().toRGBA()[3] * 100 * 100) / 100
        );
        $('#color-stroke-side').css(
          'background-color',
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        object.set('stroke', o_fill.getColor().toRGBA().toString());
        if (!seeking && !setting) {
          newKeyframe(
            'stroke',
            object,
            currenttime,
            object.get('stroke'),
            true
          );
          newKeyframe(
            'strokeWidth',
            object,
            currenttime,
            object.get('strokeWidth'),
            true
          );
        }
      } else if (colormode == 'shadow') {
        $('#object-color-shadow input').val(
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        $('#object-color-shadow-opacity input').val(
          Math.round(o_fill.getColor().toRGBA()[3] * 100 * 100) / 100
        );
        $('#color-shadow-side').css(
          'background-color',
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        object.set(
          'shadow',
          new fabric.Shadow({
            color: o_fill.getColor().toRGBA().toString(),
            offsetX: object.shadow.offsetX,
            offsetY: object.shadow.offsetY,
            blur: object.shadow.blur,
            opacity: object.shadow.opacity,
          })
        );
        if (!seeking && !setting) {
          newKeyframe(
            'shadow.color',
            object,
            currenttime,
            object.shadow.color,
            true
          );
        }
      } else if (colormode == 'chroma') {
        var obj = canvas.getActiveObject();
        $('#chroma-color input').val(
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        $('#color-chroma-side').css(
          'background-color',
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        if (obj.filters.find((x) => x.type == 'RemoveColor')) {
          obj.filters.find((x) => x.type == 'RemoveColor').color =
            o_fill.getColor().toRGBA().toString();
        }
        updateChromaValues();
      } else if (colormode == 'text') {
        var obj = canvas.getActiveObject();
        $('#text-color input').val(
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        $('#color-text-side').css(
          'background-color',
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        animatedtext
          .find((x) => x.id == obj.id)
          .setProps(
            { fill: o_fill.getColor().toRGBA().toString() },
            canvas
          );
      }
      canvas.renderAll();
    } else {
      if (colormode == 'back') {
        $('#canvas-color input').val(
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        $('#canvas-color-opacity input').val(
          Math.round(o_fill.getColor().toRGBA()[3] * 100 * 100) / 100
        );
        $('#color-side').css(
          'background-color',
          o_fill.getColor().toHEXA().toString().substring(0, 7)
        );
        canvas.setBackgroundColor(
          o_fill.getColor().toRGBA().toString()
        );
        canvas.renderAll();
      }
    }
  })
  .on('show', (instance) => {
    $('.pcr-current-color').html(
      "<img id='eyedropper' src='assets/eyedropper.svg'>"
    );
  });

var f = fabric.Image.filters;

// Canvas recorder initialization
var canvasrecord = new fabric.Canvas('canvasrecord', {
  preserveObjectStacking: true,
  backgroundColor: '#FFF',
  width: artboard.width,
  height: artboard.height,
});

var timelineslider = document.getElementById('timeline-zoom');
var t_slider = new RangeSlider(timelineslider, {
  design: '2d',
  theme: 'default',
  handle: 'round',
  popup: null,
  showMinMaxLabels: false,
  unit: '%',
  min: 5,
  max: 47,
  value: 47,
  onmove: function (x) {
    setTimelineZoom(-1 * (x - 51));
  },
  onfinish: function (x) {
    setTimelineZoom(-1 * (x - 51));
  },
  onstart: function (x) {},
});

const selectbox = new SelectionArea({
  class: 'selection-area',
  selectables: ['.keyframe'],
  container: '#timeline',
  // Query selectors for elements from where a selection can be started from.
  startareas: ['html'],

  // Query selectors for elements which will be used as boundaries for the selection.
  boundaries: ['#timeline'],

  startThreshold: 10,

  allowTouch: true,

  intersect: 'touch',

  overlap: 'invert',

  // Configuration in case a selectable gets just clicked.
  singleTap: {
    allow: false,
    intersect: 'native',
  },

  // Scroll configuration.
  scrolling: {
    speedDivider: 10,
    manualSpeed: 750,
  },
});

selectbox
  .on('beforestart', (evt) => {
    if (
      $(evt.event.target).hasClass('keyframe') ||
      $(evt.event.target).attr('id') == 'seekbar' ||
      $(evt.event.target).parent().hasClass('main-row') ||
      $(evt.event.target).hasClass('main-row') ||
      $(evt.event.target).hasClass('trim-row') ||
      evt.event.which === 3
    ) {
      return false;
    }
  })
  .on('start', (evt) => {})
  .on('move', (evt) => {})
  .on('stop', (evt) => {
    $('.keyframe-selected').removeClass('keyframe-selected');
    shiftkeys = [];
    if (evt.store.selected.length == 0) {
      $('.keyframe-selected').removeClass('keyframe-selected');
    } else {
      canvas.discardActiveObject();
      canvas.renderAll();
      evt.store.selected.forEach(function (key) {
        shiftkeys.push({
          keyframe: key,
          offset: $(key).offset().left,
        });
        $(key).addClass('keyframe-selected');
      });
    }
  });
