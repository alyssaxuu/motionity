async function newLottieAnimation(x, y, json) {
  const newlottie = new fabric.Lottie(json, {
    left: x,
    top: y,
    width: 500,
    height: 500,
    originX: 'center',
    originY: 'center',
    backgroundColor: 'rgba(255,255,255,0)',
    cursorWidth: 1,
    stroke: '#000',
    strokeUniform: true,
    paintFirst: 'stroke',
    strokeWidth: 0,
    cursorDuration: 1,
    cursorDelay: 250,
    duration: duration * 1000,
    assetType: 'sprite',
    id: 'Sprite' + layer_count,
    objectCaching: false,
    strokeDashArray: false,
    inGroup: false,
    shadow: {
      color: '#000',
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      opacity: 0,
    },
  });
  canvas.add(newlottie);
  canvas.requestRenderAll();
  newlottie.duration = newlottie.getDuration() * 1000;
  newlottie.goToSeconds(0);
  canvas.renderAll();
  newLayer(newlottie);
  canvas.setActiveObject(newlottie);
  canvas.bringToFront(newlottie);
}
