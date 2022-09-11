// Resize the canvas
function resizeCanvas() {
  canvas.discardActiveObject();
  canvas.setHeight($('#canvas-area').height());
  canvas.setWidth($('#canvas-area').width());
  artboard.set({
    left: canvas.get('width') / 2 - artboard.get('width') / 2,
    top: canvas.get('height') / 2 - artboard.get('height') / 2,
  });
  canvas.renderAll();
  animate(false, currenttime);
  initLines();
}
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

// Highlight layers when selecting objects in the canvas, scroll into view if needed
function updateSelection(e) {
  if (e.target.type == 'activeSelection') {
    $('.layer-selected').removeClass('layer-selected');
    canvas.getActiveObjects().forEach(function (object) {
      if (
        $('.layer').length > 0 &&
        $(".layer[data-object='" + object.get('id') + "']").length > 0
      ) {
        $(".layer[data-object='" + object.get('id') + "']").addClass(
          'layer-selected'
        );
        if (e.e != undefined) {
          document
            .getElementsByClassName('layer-selected')[0]
            .scrollIntoView();
        }
      }
    });
  } else {
    if (
      $('.layer').length > 0 &&
      $(".layer[data-object='" + e.target.get('id') + "']").length > 0
    ) {
      $('.layer-selected').removeClass('layer-selected');
      $(".layer[data-object='" + e.target.get('id') + "']").addClass(
        'layer-selected'
      );
      if (e.e != undefined) {
        document
          .getElementsByClassName('layer-selected')[0]
          .scrollIntoView();
      }
    }
  }
}

// Object has been modified, automatically add a keyframe
function autoKeyframe(object, e, multi) {
  if (e.action == 'drag') {
    newKeyframe(
      'left',
      object,
      currenttime,
      object.get('left'),
      true
    );
    newKeyframe('top', object, currenttime, object.get('top'), true);
  } else if (e.action == 'scale') {
    newKeyframe(
      'scaleX',
      object,
      currenttime,
      object.get('scaleX'),
      true
    );
    newKeyframe(
      'scaleY',
      object,
      currenttime,
      object.get('scaleY'),
      true
    );
    newKeyframe(
      'left',
      object,
      currenttime,
      object.get('left'),
      true
    );
    newKeyframe('top', object, currenttime, object.get('top'), true);
    newKeyframe(
      'width',
      object,
      currenttime,
      object.get('width'),
      true
    );
    newKeyframe(
      'height',
      object,
      currenttime,
      object.get('height'),
      true
    );
  } else if (e.action == 'rotate') {
    newKeyframe(
      'angle',
      object,
      currenttime,
      object.get('angle'),
      true
    );
    if (multi) {
      newKeyframe(
        'scaleX',
        object,
        currenttime,
        object.get('scaleX'),
        true
      );
      newKeyframe(
        'scaleY',
        object,
        currenttime,
        object.get('scaleY'),
        true
      );
      newKeyframe(
        'width',
        object,
        currenttime,
        object.get('width'),
        true
      );
      newKeyframe(
        'left',
        object,
        currenttime,
        object.get('left'),
        true
      );
      newKeyframe(
        'top',
        object,
        currenttime,
        object.get('top'),
        true
      );
    }
  } else if (
    e.action == 'resizing' ||
    e.action == 'scaleX' ||
    e.action == 'scaleY'
  ) {
    newKeyframe(
      'scaleX',
      object,
      currenttime,
      object.get('scaleX'),
      true
    );
    newKeyframe(
      'scaleY',
      object,
      currenttime,
      object.get('scaleY'),
      true
    );
    newKeyframe(
      'left',
      object,
      currenttime,
      object.get('left'),
      true
    );
    newKeyframe(
      'width',
      object,
      currenttime,
      object.get('width'),
      true
    );
    newKeyframe('top', object, currenttime, object.get('top'), true);
    newKeyframe(
      'height',
      object,
      currenttime,
      object.get('height'),
      true
    );
  }
}

// Reselect
function reselect(selection) {
  tempselection = false;
  if (selection.type == 'activeSelection') {
    var objs = [];
    for (let so of selection._objects) {
      for (let obj of canvas.getObjects()) {
        if (obj.get('id') === so.get('id')) {
          objs.push(obj);
          break;
        }
      }
    }
    canvas.setActiveObject(
      new fabric.ActiveSelection(objs, {
        canvas: canvas,
      })
    );
    canvas.renderAll();
  } else {
    if (selection.get('type') == 'group') {
      canvas.setActiveObject(canvas.getItemById(selection.get('id')));
    } else {
      canvas.setActiveObject(selection);
    }
    canvas.renderAll();
  }
}

// Group objects
function group() {
  var objects = canvas.getActiveObjects();
  var object_ids = [];
  var newgroup = new fabric.Group();
  objects.forEach(function (object) {
    newgroup.addWithUpdate(object);
    object.set({ inGroup: true });
    $(".layer[data-object='" + object.get('id') + "']").remove();
    object_ids.push(object.get('id'));
    $('#' + object.get('id')).remove();
    canvas.remove(object);
  });
  //var newgroup = canvas.getActiveObject().toGroup();
  newgroup.set({
    id: 'Group' + layer_count,
    objectCaching: false,
    isGroup: true,
    color: '#F1890E',
    type: 'group',
    stroke: '#000',
    strokeUniform: true,
    strokeWidth: 0,
    paintFirst: 'stroke',
    absolutePositioned: true,
    inGroup: false,
    strokeDashArray: false,
    objectCaching: true,
    shadow: {
      color: 'black',
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      opacity: 0,
    },
  });
  groups.push({ id: newgroup.get('id'), objects: object_ids });
  canvas.renderAll();
  newLayer(newgroup);
  canvas.setActiveObject(newgroup);
  keyframes.sort(function (a, b) {
    if (a.id.indexOf('Group') >= 0 && b.id.indexOf('Group') == -1) {
      return 1;
    } else if (
      b.id.indexOf('Group') >= 0 &&
      a.id.indexOf('Group') == -1
    ) {
      return -1;
    } else {
      return 0;
    }
  });
  save();
}
$(document).on('click', '#group-objects', group);

// Ungroup SVG
function unGroup(group) {
  canvas.discardActiveObject();
  canvas.renderAll();
  tempgroup = group._objects;
  group._restoreObjectsState();
  $(".layer[data-object='" + group.get('id') + "']").remove();
  $('#' + group.get('id')).remove();
  canvas.remove(group);
  keyframes = $.grep(keyframes, function (e) {
    return e.id != group.get('id');
  });
  p_keyframes = $.grep(p_keyframes, function (e) {
    return e.id != group.get('id');
  });
  objects = $.grep(objects, function (e) {
    return e.id != group.get('id');
  });
  canvas.renderAll();
  for (var i = 0; i < tempgroup.length; i++) {
    if (tempgroup[i].inGroup) {
      canvas.add(tempgroup[i]);
      renderLayer(tempgroup[i]);
      props.forEach(function (prop) {
        if (
          prop != 'top' &&
          prop != 'scaleY' &&
          prop != 'width' &&
          prop != 'height' &&
          prop != 'shadow.offsetX' &&
          prop != 'shadow.offsetY' &&
          prop != 'shadow.opacity' &&
          prop != 'shadow.blur' &&
          prop != 'lineHeight'
        ) {
          renderProp(prop, tempgroup[i]);
        }
      });
      const keyarr = $.grep(keyframes, function (e) {
        return e.id == tempgroup[i].id;
      });
      keyarr.forEach(function (keyframe) {
        if (
          keyframe.name != 'top' &&
          keyframe.name != 'scaleY' &&
          keyframe.name != 'width' &&
          keyframe.name != 'height' &&
          keyframe.name != 'shadow.offsetX' &&
          keyframe.name != 'shadow.offsetY' &&
          keyframe.name != 'shadow.opacity' &&
          keyframe.name != 'shadow.blur' &&
          keyframe.name != 'lineHeight'
        ) {
          renderKeyframe(
            canvas.getItemById(keyframe.id),
            keyframe.name,
            keyframe.t
          );
        }
      });
    }
  }
  canvas.renderAll();
  save();
}
$(document).on('click', '#ungroup-objects', function () {
  if (canvas.getActiveObject()) {
    unGroup(canvas.getActiveObject());
  }
});

// Regroup SVG
function reGroup(id) {
  var group = [];
  var objects = [];
  groups
    .find((x) => x.id == id)
    .objects.forEach(function (object) {
      objects.push(canvas.getItemById(object));
    });
  var activeselection = new fabric.ActiveSelection(objects);
  var newgroup = activeselection.toGroup();
  newgroup.set({
    id: id,
    objectCaching: false,
  });
  canvas.add(newgroup);
  canvas.renderAll();
}

// Keep record canvas up to date
function updateRecordCanvas() {
  canvasrecord.setWidth(artboard.width);
  canvasrecord.setHeight(artboard.height);
  canvasrecord.width = artboard.width;
  canvasrecord.height = artboard.height;
  canvas.clipPath = null;
  objects.forEach(async function (object) {
    var obj = canvas.getItemById(object.id);
    if (obj.filters) {
      if (obj.filters.length > 0) {
        object.filters = [];
        obj.filters.forEach(function (filter) {
          if (
            filter.type == 'BlackWhite' ||
            filter.type == 'Invert' ||
            filter.type == 'Sepia' ||
            filter.type == 'Kodachrome' ||
            filter.type == 'Polaroid' ||
            filter.type == 'Technicolor' ||
            filter.type == 'Brownie' ||
            filter.type == 'Vintage'
          ) {
            object.filters.push({ type: filter.type });
          } else if (filter.type == 'Brightness') {
            object.filters.push({
              type: filter.type,
              value: filter.brightness,
            });
          } else if (filter.type == 'Contrast') {
            object.filters.push({
              type: filter.type,
              value: filter.contrast,
            });
          } else if (filter.type == 'Vibrance') {
            object.filters.push({
              type: filter.type,
              value: filter.vibrance,
            });
          } else if (filter.type == 'Saturation') {
            object.filters.push({
              type: filter.type,
              value: filter.saturation,
            });
          } else if (filter.type == 'HueRotation') {
            object.filters.push({
              type: filter.type,
              value: filter.rotation,
            });
          } else if (filter.type == 'Blur') {
            object.filters.push({
              type: filter.type,
              value: filter.blur,
            });
          } else if (filter.type == 'Noise') {
            object.filters.push({
              type: filter.type,
              value: filter.noise,
            });
          } else if (filter.type == 'RemoveColor') {
            object.filters.push({
              type: filter.type,
              distance: filter.distance,
              color: filter.color,
            });
          }
        });
        obj.filters = [];
        obj.applyFilters();
        var backend = fabric.filterBackend;
        if (backend && backend.evictCachesForKey) {
          backend.evictCachesForKey(obj.cacheKey);
          backend.evictCachesForKey(obj.cacheKey + '_filtered');
        }
        if (
          obj.filters.length > 0 &&
          obj.get('id').indexOf('Video') >= 0
        ) {
          await obj.setElement(obj.saveElem);
        }
      } else {
        object.filters = [];
      }
    } else {
      object.filters = [];
    }
  });
  const canvassave = canvas.toJSON([
    'volume',
    'audioSrc',
    'defaultLeft',
    'defaultTop',
    'defaultScaleX',
    'defaultScaleY',
    'notnew',
    'starttime',
    'top',
    'left',
    'width',
    'height',
    'scaleX',
    'scaleY',
    'flipX',
    'flipY',
    'originX',
    'originY',
    'transformMatrix',
    'stroke',
    'strokeWidth',
    'strokeDashArray',
    'strokeLineCap',
    'strokeDashOffset',
    'strokeLineJoin',
    'strokeMiterLimit',
    'angle',
    'opacity',
    'fill',
    'globalCompositeOperation',
    'shadow',
    'clipTo',
    'visible',
    'backgroundColor',
    'skewX',
    'skewY',
    'fillRule',
    'paintFirst',
    'clipPath',
    'strokeUniform',
    'rx',
    'ry',
    'selectable',
    'hasControls',
    'subTargetCheck',
    'id',
    'hoverCursor',
    'defaultCursor',
    'isEditing',
    'source',
    'assetType',
    'duration',
    'inGroup',
  ]);
  canvas.clipPath = artboard;
  canvasrecord.loadFromJSON(canvassave, function () {
    if (canvasrecord.getItemById('center_h')) {
      canvasrecord.remove(canvasrecord.getItemById('center_h'));
      canvasrecord.remove(canvasrecord.getItemById('center_v'));
    }
    if (canvasrecord.getItemById('line_h')) {
      canvasrecord.remove(canvasrecord.getItemById('line_h'));
      canvasrecord.remove(canvasrecord.getItemById('line_v'));
    }
    canvasrecord.renderAll();
    canvasrecord.setWidth(artboard.width);
    canvasrecord.setHeight(artboard.height);
    canvasrecord.width = artboard.width;
    canvasrecord.height = artboard.height;
    canvasrecord.renderAll();
    objects.forEach(function (object) {
      replaceSource(
        canvasrecord.getItemById(object.id),
        canvasrecord
      );
      replaceSource(canvas.getItemById(object.id), canvas);
    });
  });
}

// Download recording
function downloadRecording(chunks) {
  $('#download-real').html('Downloading...');
  if ($('input[name=radio]:checked').val() == 'webm') {
    var url = URL.createObjectURL(
      new Blob(chunks, {
        type: 'video/webm',
      })
    );
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    recording = false;
    currenttime = 0;
    animate(false, 0);
    $('#seekbar').offset({
      left:
        offset_left +
        $('#inner-timeline').offset().left +
        currenttime / timelinetime,
    });
    canvas.renderAll();
    resizeCanvas();
    $('#download-real').html('Download');
    $('#download-real').removeClass('downloading');
    updateRecordCanvas();
  } else if ($('input[name=radio]:checked').val() == 'mp4') {
    type = 'video/mp4';
  } else {
    convertStreams(new Blob(chunks, { type: 'video/webm' }), 'gif');
  }
}

$('#download-real').on('click', record);

// Save everything in the canvas (for undo/redo/autosave)
function save() {
  redo = [];
  redoarr = [];
  if (state) {
    undo.push(state);
    undoarr.push(statearr);
  }
  canvas.clipPath = null;
  state = canvas.toJSON([
    'volume',
    'audioSrc',
    'top',
    'left',
    'width',
    'height',
    'scaleX',
    'scaleY',
    'flipX',
    'flipY',
    'originX',
    'originY',
    'transformMatrix',
    'stroke',
    'strokeWidth',
    'strokeDashArray',
    'strokeLineCap',
    'strokeDashOffset',
    'strokeLineJoin',
    'strokeMiterLimit',
    'angle',
    'opacity',
    'fill',
    'globalCompositeOperation',
    'shadow',
    'clipTo',
    'visible',
    'backgroundColor',
    'skewX',
    'skewY',
    'fillRule',
    'paintFirst',
    'clipPath',
    'strokeUniform',
    'rx',
    'ry',
    'selectable',
    'hasControls',
    'subTargetCheck',
    'id',
    'hoverCursor',
    'defaultCursor',
    'isEditing',
    'source',
    'assetType',
    'duration',
    'inGroup',
    'filters',
  ]);
  canvas.clipPath = artboard;
  statearr = {
    keyframes: JSON.parse(JSON.stringify(keyframes)),
    p_keyframes: JSON.parse(JSON.stringify(p_keyframes)),
    objects: JSON.parse(JSON.stringify(objects)),
    colormode: colormode,
    duration: duration,
    currenttime: currenttime,
  };
  if (undo.length >= 1) {
    $('#undo').addClass('history-active');
  } else {
    $('#undo').removeClass('history-active');
  }
  if (redo.length >= 1) {
    $('#redo').addClass('history-active');
  } else {
    $('#redo').removeClass('history-active');
  }

  updateRecordCanvas();
  autoSave();
}

// Duplicate object
function copyObject() {
  if (clipboard) {
    if (cliptype == 'object') {
      if (clipboard.type == 'activeSelection') {
        clipboard._objects.forEach(function (clone) {
          clone.clone(function (cloned) {
            cloned.set({
              id: 'Shape' + layer_count,
            });
            canvas.add(cloned);
            canvas.renderAll();
            newLayer(cloned);
            canvas.setActiveObject(cloned);
          });
        });
      } else {
        clipboard.clone(function (cloned) {
          cloned.set({
            id: 'Shape' + layer_count,
          });
          canvas.add(cloned);
          canvas.renderAll();
          newLayer(cloned);
          canvas.setActiveObject(cloned);
        });
      }
      save();
    } else {
      copyKeyframes();
    }
  }
}

// Replace the source of an object when reloading the canvas (since Fabric needs a DOM reference for the objects)
function replaceSource(object, canvas) {
  if (object == null) {
    return false;
  }
  if (object.get('type') != 'group') {
    if (object.type) {
      if (object.type == 'image') {
        if (object.get('id').indexOf('Video') >= 0) {
          var vidObj = document.createElement('video');
          var vidSrc = document.createElement('source');
          vidSrc.src = object.get('source');
          vidObj.crossOrigin = 'anonymous';
          vidObj.appendChild(vidSrc);
          vidObj.addEventListener('loadeddata', function () {
            vidObj.width = this.videoWidth;
            vidObj.height = this.videoHeight;
            vidObj.currentTime = 0;
            vidObj.muted = false;
            async function waitLoad() {
              if (vidObj.readyState >= 3) {
                object.setElement(vidObj);
                object.saveElem = vidObj;
                await canvas.renderAll();
                await animate(false, currenttime);
                if (
                  objects.find((x) => x.id == object.get('id'))
                    .filters
                ) {
                  if (
                    objects.find((x) => x.id == object.get('id'))
                      .filters.length > 0
                  ) {
                    objects
                      .find((x) => x.id == object.get('id'))
                      .filters.forEach(function (filter) {
                        if (filter.type == 'Sepia') {
                          object.filters.push(new f.Sepia());
                        } else if (filter.type == 'Invert') {
                          object.filters.push(new f.Invert());
                        } else if (filter.type == 'BlackWhite') {
                          object.filters.push(new f.BlackWhite());
                        } else if (filter.type == 'Kodachrome') {
                          object.filters.push(new f.Kodachrome());
                        } else if (filter.type == 'Polaroid') {
                          object.filters.push(new f.Polaroid());
                        } else if (filter.type == 'Technicolor') {
                          object.filters.push(new f.Technicolor());
                        } else if (filter.type == 'Vintage') {
                          object.filters.push(new f.Vintage());
                        } else if (filter.type == 'Brownie') {
                          object.filters.push(new f.Brownie());
                        } else if (filter.type == 'Brightness') {
                          object.filters.push(
                            new f.Brightness({
                              brightness: filter.value,
                            })
                          );
                        } else if (filter.type == 'Contrast') {
                          object.filters.push(
                            new f.Contrast({ contrast: filter.value })
                          );
                        } else if (filter.type == 'Saturation') {
                          object.filters.push(
                            new f.Saturation({
                              saturation: filter.value,
                            })
                          );
                        } else if (filter.type == 'Vibrance') {
                          object.filters.push(
                            new f.Vibrance({ vibrance: filter.value })
                          );
                        } else if (filter.type == 'HueRotation') {
                          object.filters.push(
                            new f.HueRotation({
                              rotation: filter.value,
                            })
                          );
                        } else if (filter.type == 'Noise') {
                          object.filters.push(
                            new f.Noise({ noise: filter.value })
                          );
                        } else if (filter.type == 'Blur') {
                          object.filters.push(
                            new f.Blur({ blur: filter.value })
                          );
                        } else if (filter.type == 'RemoveColor') {
                          object.filters.push(
                            new f.RemoveColor({
                              distance: filter.distance,
                              color: filter.color,
                            })
                          );
                        }
                      });
                    object.applyFilters();
                    canvas.renderAll();
                  }
                }
              } else {
                window.setTimeout(function () {
                  waitLoad();
                }, 100);
              }
            }
            window.setTimeout(function () {
              waitLoad();
            }, 100);
          });
          vidObj.currentTime = 0;
        } else {
          //var img = new Image();
          //img.onload = function(){
          //   object.setElement(img);
          //    canvas.renderAll();
          if (objects.find((x) => x.id == object.get('id')).filters) {
            if (
              objects.find((x) => x.id == object.get('id')).filters
                .length > 0
            ) {
              objects
                .find((x) => x.id == object.get('id'))
                .filters.forEach(function (filter) {
                  if (filter.type == 'Sepia') {
                    object.filters.push(new f.Sepia());
                  } else if (filter.type == 'Invert') {
                    object.filters.push(new f.Invert());
                  } else if (filter.type == 'BlackWhite') {
                    object.filters.push(new f.BlackWhite());
                  } else if (filter.type == 'Kodachrome') {
                    object.filters.push(new f.Kodachrome());
                  } else if (filter.type == 'Polaroid') {
                    object.filters.push(new f.Polaroid());
                  } else if (filter.type == 'Technicolor') {
                    object.filters.push(new f.Technicolor());
                  } else if (filter.type == 'Vintage') {
                    object.filters.push(new f.Vintage());
                  } else if (filter.type == 'Brownie') {
                    object.filters.push(new f.Brownie());
                  } else if (filter.type == 'Brightness') {
                    object.filters.push(
                      new f.Brightness({ brightness: filter.value })
                    );
                  } else if (filter.type == 'Contrast') {
                    object.filters.push(
                      new f.Contrast({ contrast: filter.value })
                    );
                  } else if (filter.type == 'Saturation') {
                    object.filters.push(
                      new f.Saturation({ saturation: filter.value })
                    );
                  } else if (filter.type == 'Vibrance') {
                    object.filters.push(
                      new f.Vibrance({ vibrance: filter.value })
                    );
                  } else if (filter.type == 'HueRotation') {
                    object.filters.push(
                      new f.HueRotation({ rotation: filter.value })
                    );
                  } else if (filter.type == 'Noise') {
                    object.filters.push(
                      new f.Noise({ noise: filter.value })
                    );
                  } else if (filter.type == 'Blur') {
                    object.filters.push(
                      new f.Blur({ blur: filter.value })
                    );
                  } else if (filter.type == 'RemoveColor') {
                    object.filters.push(
                      new f.RemoveColor({
                        distance: filter.distance,
                        color: filter.color,
                      })
                    );
                  }
                });
              object.applyFilters();
              canvas.renderAll();
            } else {
              object.filters = [];
              object.applyFilters();
              canvas.renderAll();
            }
          }

          //}
          //img.src = window.URL.createObjectURL(new Blob(files.find(x => x.name == object.get("id")).file, {type:"image/png"}));
        }
      }
    }
  }
}

// Perform undo/redo
function undoRedo(newState, saveState, newArrState, saveArrState) {
  saveState.push(state);
  saveArrState.push(statearr);
  statearr = newArrState.pop();
  state = newState.pop();
  keyframes = statearr.keyframes;
  p_keyframes = statearr.p_keyframes;
  objects = statearr.objects;
  colormode = statearr.colormode;
  duration = statearr.duration;
  currenttime = statearr.currenttime;
  canvas.clipPath = null;
  canvas.loadFromJSON(state, function () {
    canvas.clipPath = artboard;
    canvas.getItemById('line_h').set({ opacity: 0 });
    canvas.getItemById('line_v').set({ opacity: 0 });
    canvas.renderAll();
    $('.object-props').remove();
    $('.layer').remove();
    objects.forEach(function (object) {
      replaceSource(canvas.getItemById(object.id), canvas);
      renderLayer(canvas.getItemById(object.id));
      props.forEach(function (prop) {
        if (
          prop != 'top' &&
          prop != 'scaleY' &&
          prop != 'width' &&
          prop != 'height' &&
          prop != 'shadow.offsetX' &&
          prop != 'shadow.offsetY' &&
          prop != 'shadow.opacity' &&
          prop != 'shadow.blur' &&
          prop != 'lineHeight'
        ) {
          renderProp(prop, canvas.getItemById(object.id));
        }
      });
    });
    keyframes.forEach(function (keyframe) {
      if (
        keyframe.name != 'top' &&
        keyframe.name != 'scaleY' &&
        keyframe.name != 'width' &&
        keyframe.name != 'height' &&
        keyframe.name != 'shadow.offsetX' &&
        keyframe.name != 'shadow.offsetY' &&
        keyframe.name != 'shadow.opacity' &&
        keyframe.name != 'shadow.blur' &&
        keyframe.name != 'lineHeight'
      ) {
        renderKeyframe(
          canvas.getItemById(keyframe.id),
          keyframe.name,
          keyframe.t
        );
      }
    });
    animate(false, currenttime);
  });
  if (undo.length >= 1) {
    $('#undo').addClass('history-active');
  } else {
    $('#undo').removeClass('history-active');
  }
  if (redo.length >= 1) {
    $('#redo').addClass('history-active');
  } else {
    $('#redo').removeClass('history-active');
  }
}

// Undo/redo buttons
$(document).on('click', '#undo', function () {
  if (undo.length >= 1) {
    undoRedo(undo, redo, undoarr, redoarr);
  }
});
$(document).on('click', '#redo', function () {
  if (undo.length >= 1) {
    undoRedo(redo, undo, redoarr, undoarr);
  }
});

// Generate keyframes
function keyframeChanges(object, type, id, selection) {
  if (object.get('type') == 'rect') {
    object.set({
      rx: parseFloat($('#object-corners input').val()),
      ry: parseFloat($('#object-corners input').val()),
    });
  } else if (object.get('type') == 'textbox') {
    object.set({
      charSpacing: parseFloat($('#text-h input').val()) * 10,
      lineHeight: parseFloat($('#text-v input').val() / 100),
    });
    canvas.renderAll();
  }
  canvas.renderAll();
  if (type && type == 'opacity') {
    newKeyframe(
      'opacity',
      object,
      currenttime,
      object.get('opacity'),
      true
    );
  } else if (type && type == 'opacity3') {
    newKeyframe(
      'charSpacing',
      object,
      currenttime,
      object.get('charSpacing'),
      true
    );
    newKeyframe(
      'lineHeight',
      object,
      currenttime,
      object.get('lineHeight'),
      true
    );
  } else {
    if (id == 'object-x' || id == 'object-y') {
      newKeyframe(
        'left',
        object,
        currenttime,
        object.get('left'),
        true
      );
      newKeyframe(
        'top',
        object,
        currenttime,
        object.get('top'),
        true
      );
    } else if (id == 'object-w' || id == 'object-h') {
      newKeyframe(
        'scaleX',
        object,
        currenttime,
        object.get('scaleX'),
        true
      );
      newKeyframe(
        'scaleY',
        object,
        currenttime,
        object.get('scaleY'),
        true
      );
      newKeyframe(
        'width',
        object,
        currenttime,
        object.get('width'),
        true
      );
      newKeyframe(
        'height',
        object,
        currenttime,
        object.get('width'),
        true
      );
      if (selection) {
        newKeyframe(
          'left',
          object,
          currenttime,
          object.get('left'),
          true
        );
        newKeyframe(
          'top',
          object,
          currenttime,
          object.get('top'),
          true
        );
      }
    } else if (id == 'object-r') {
      newKeyframe(
        'angle',
        object,
        currenttime,
        object.get('angle'),
        true
      );
      if (selection) {
        newKeyframe(
          'left',
          object,
          currenttime,
          object.get('left'),
          true
        );
        newKeyframe(
          'top',
          object,
          currenttime,
          object.get('top'),
          true
        );
        newKeyframe(
          'scaleX',
          object,
          currenttime,
          object.get('scaleX'),
          true
        );
        newKeyframe(
          'scaleY',
          object,
          currenttime,
          object.get('scaleY'),
          true
        );
        newKeyframe(
          'width',
          object,
          currenttime,
          object.get('width'),
          true
        );
        newKeyframe(
          'height',
          object,
          currenttime,
          object.get('width'),
          true
        );
      }
    } else if (id == 'object-stroke') {
      newKeyframe(
        'strokeWidth',
        object,
        currenttime,
        object.get('strokeWidth'),
        true
      );
      newKeyframe(
        'stroke',
        object,
        currenttime,
        object.get('stroke'),
        true
      );
    } else if (
      id == 'object-shadow-x' ||
      id == 'object-shadow-y' ||
      id == 'object-blur' ||
      id == 'object-color-stroke-opacity'
    ) {
      newKeyframe(
        'shadow.color',
        object,
        currenttime,
        object.shadow.color,
        true
      );
      newKeyframe(
        'shadow.opacity',
        object,
        currenttime,
        object.shadow.opacity,
        true
      );
      newKeyframe(
        'shadow.offsetX',
        object,
        currenttime,
        object.shadow.offsetX,
        true
      );
      newKeyframe(
        'shadow.offsetY',
        object,
        currenttime,
        object.shadow.offsetY,
        true
      );
      newKeyframe(
        'shadow.blur',
        object,
        currenttime,
        object.shadow.blur,
        true
      );
    }
  }
  save();
}

// Play video
function play() {
  paused = false;
  animate(true, currenttime);
  $('#play-button').attr('src', 'assets/pause-button.svg');
}

// Pause video
function pause() {
  paused = true;
  $('#play-button').attr('src', 'assets/play-button.svg');
}

// Set object value (while animating)
function setObjectValue(prop, object, value, inst) {
  if (object.get('type') != 'group') {
    if (object.group) {
      var group = object.group;
      tempgroup = group._objects;
      group._restoreObjectsState();
      canvas.setActiveObject(group);
      inst.remove(canvas.getActiveObject());
      canvas.discardActiveObject();
      inst.renderAll();
      for (var i = 0; i < tempgroup.length; i++) {
        inst.add(tempgroup[i]);
      }
    }
  }
  if (prop == 'left' && !recording) {
    object.set(prop, value + artboard.get('left'));
  } else if (prop == 'top' && !recording) {
    object.set(prop, value + artboard.get('top'));
  } else if (prop == 'shadow.blur') {
    object.shadow.blur = value;
  } else if (prop == 'shadow.color') {
    object.shadow.color = value;
  } else if (prop == 'shadow.offsetX') {
    object.shadow.offsetX = value;
  } else if (prop == 'shadow.offsetY') {
    object.shadow.offsetY = value;
  } else if (prop == 'shadow.blur') {
    object.shadow.blur = value;
  } else if (object.get('type') != 'group') {
    object.set(prop, value);
  } else if (prop != 'width') {
    object.set(prop, value);
  }
  inst.renderAll();
}

// Find last keyframe in time from same object & property
function lastKeyframe(keyframe, index) {
  var temparr = keyframes.slice();
  temparr.sort(function (a, b) {
    return a.t - b.t;
  });
  temparr.length = temparr.findIndex((x) => x === keyframe);
  temparr.reverse();
  if (temparr.length == 0) {
    return false;
  } else {
    for (var i = 0; i < temparr.length; i++) {
      if (
        temparr[i].id == keyframe.id &&
        temparr[i].name == keyframe.name
      ) {
        return temparr[i];
        break;
      } else if (i == temparr.length - 1) {
        return false;
      }
    }
  }
}

// Check whether any keyframe exists for a certain property
function checkAnyKeyframe(id, prop, inst) {
  const object = inst.getItemById(id);
  if (object.get('assetType') == 'audio') {
    return false;
  }
  if (
    object.get('type') != 'textbox' &&
    (prop == 'charSpacing' || prop == 'lineHeight')
  ) {
    return false;
  }
  if (
    object.get('type') == 'group' &&
    (prop == 'shadow.opacity' ||
      prop == 'shadow.color' ||
      prop == 'shadow.offsetX' ||
      prop == 'shadow.offsetY' ||
      prop == 'shadow.blur')
  ) {
    return false;
  }
  const keyarr2 = $.grep(keyframes, function (e) {
    return e.id == id && e.name == prop;
  });
  if (keyarr2.length == 0) {
    const value = objects
      .find((x) => x.id == id)
      .defaults.find((x) => x.name == prop).value;
    setObjectValue(prop, object, value, inst);
  }
}

// Check if parameter is a DOM element
function isDomElem(el) {
  return el instanceof HTMLElement || el[0] instanceof HTMLElement
    ? true
    : false;
}

// Play videos when seeking/playing
async function playVideos(time) {
  objects.forEach(async function (object) {
    var object = canvas.getItemById(object.id);
    if (object == null) {
      return false;
    }
    var inst = canvas;
    var start = false;
    if (recording) {
      object = canvasrecord.getItemById(object.id);
      inst = canvasrecord;
    }
    if (
      object.get('id').indexOf('Video') >= 0 &&
      p_keyframes.find((x) => x.id == object.id).trimstart +
        p_keyframes.find((x) => x.id == object.id).start <=
        time &&
      p_keyframes.find((x) => x.id == object.id).end >= time
    ) {
      var tempfilters = object.filters;
      if (object.filters.length > 0) {
        object.filters = [];
        object.applyFilters();
        var image = object;
        var backend = fabric.filterBackend;
        if (backend && backend.evictCachesForKey) {
          backend.evictCachesForKey(image.cacheKey);
          backend.evictCachesForKey(image.cacheKey + '_filtered');
        }
        await object.setElement(object.saveElem);
      }
      object.set('visible', true);
      inst.renderAll();
      if ($(object.getElement())[0].paused == true) {
        $(object.getElement())[0].currentTime = parseFloat(
          (
            (time -
              p_keyframes.find((x) => x.id == object.id).start +
              p_keyframes.find((x) => x.id == object.id).trimstart) /
            1000
          ).toFixed(2)
        );
      }
      if (!recording) {
        var animation = {
          value: 0,
        };
        var instance = anime({
          targets: animation,
          value: [currenttime, duration],
          delay: 0,
          duration: duration,
          easing: 'linear',
          autoplay: true,
          update: async function () {
            if (!paused && start) {
              if (object.filters.length > 0) {
                object.filters = [];
                object.applyFilters();
                var image = object;
                var backend = fabric.filterBackend;
                if (backend && backend.evictCachesForKey) {
                  backend.evictCachesForKey(image.cacheKey);
                  backend.evictCachesForKey(
                    image.cacheKey + '_filtered'
                  );
                }
                await object.setElement(object.saveElem);
              }
              if ($(object.getElement())[0].tagName == 'VIDEO') {
                $(object.getElement())[0].play();
              }
              await inst.renderAll();
              if (tempfilters.length > 0) {
                object.filters = tempfilters;
                object.applyFilters();
                inst.renderAll();
              }
            } else if (paused) {
              if (
                isDomElem($(object.getElement())[0]) &&
                $(object.getElement())[0].tagName == 'VIDEO'
              ) {
                $(object.getElement())[0].pause();
              }
              animation.value = duration + 1;
              anime.remove(animation);
            }
          },
          changeBegin: function () {
            start = true;
          },
        });
        if (paused) {
          $(object.getElement())[0].currentTime = parseFloat(
            (
              (time -
                p_keyframes.find((x) => x.id == object.id).start +
                p_keyframes.find((x) => x.id == object.id)
                  .trimstart) /
              1000
            ).toFixed(2)
          );
          await inst.renderAll();
          if (tempfilters.length > 0) {
            object.filters = tempfilters;
            object.applyFilters();
            inst.renderAll();
          }
        }
      } else {
        if ($(object.getElement())[0].paused == true) {
          $(object.getElement())[0].play();
          inst.renderAll();
        }
      }
    } else if (object.get('id').indexOf('Video') >= 0) {
      $(object.getElement())[0].pause();
      object.set('visible', false);
      inst.renderAll();
    }
  });
}

// Play background audio
function playAudio(time) {
  objects.forEach(async function (object) {
    var start = false;
    var obj = canvas.getItemById(object.id);
    if (obj.get('assetType') == 'audio') {
      var flag = false;
      var animation = {
        value: 0,
      };
      var instance = anime({
        targets: animation,
        value: [currenttime, duration],
        delay: 0,
        duration: duration,
        easing: 'linear',
        autoplay: true,
        update: async function () {
          if (start && play && !paused) {
            if (
              !flag &&
              p_keyframes.find((x) => x.id == object.id).start <=
                currenttime &&
              p_keyframes.find((x) => x.id == object.id).end >=
                currenttime
            ) {
              if (obj.get('src')) {
                obj.get('src').currentTime =
                  (p_keyframes.find((x) => x.id == object.id)
                    .trimstart -
                    p_keyframes.find((x) => x.id == object.id).start +
                    currenttime) /
                  1000;
                obj.get('src').volume = obj.get('volume');
                obj.get('src').play();
                flag = true;
              } else {
                var audio = new Audio(obj.get('audioSrc'));
                obj.set('src', audio);
                audio.volume = obj.get('volume');
                audio.crossOrigin = 'anonymous';
                audio.currentTime =
                  (p_keyframes.find((x) => x.id == object.id)
                    .trimstart -
                    p_keyframes.find((x) => x.id == object.id).start +
                    currenttime) /
                  1000;
                audio.play();
                flag = true;
              }
            } else if (
              p_keyframes.find((x) => x.id == object.id).start >=
                currenttime ||
              p_keyframes.find((x) => x.id == object.id).end <=
                currenttime
            ) {
              if (obj.get('src')) {
                obj.get('src').pause();
              }
            }
          } else if (paused) {
            if (obj.get('src')) {
              obj.get('src').pause();
              anime.remove(animation);
            }
          }
        },
        changeBegin: function () {
          start = true;
        },
      });
    }
  });
}

// Temp animate with render callback
async function recordAnimate(time) {
  anime.speed = 1;
  //return new Promise(function(resolve){
  var inst = canvasrecord;
  if (animatedtext.length > 0) {
    animatedtext.forEach(function (text) {
      text.seek(time, inst);
      inst.renderAll();
    });
  }
  keyframes.forEach(function (keyframe, index) {
    // Regroup if needed (groups break to animate their children, then regroup after children have animated)
    if (groups.find((x) => x.id == keyframe.id)) {
      if (!canvas.getItemById(keyframe.id)) {
        reGroup(keyframe.id);
      }
      const object = canvas.getItemById(keyframe.id);
      if (
        currenttime <
        p_keyframes.find((x) => x.id == keyframe.id).trimstart +
          p_keyframes.find((x) => x.id == keyframe.id).start
      ) {
        object.set('visible', false);
        inst.renderAll();
      } else if (
        currenttime >
          p_keyframes.find((x) => x.id == keyframe.id).end ||
        currenttime > duration
      ) {
        object.set('visible', false);
        inst.renderAll();
      } else {
        object.set('visible', true);
        inst.renderAll();
      }
      if (
        currenttime >=
        p_keyframes.find((x) => x.id == keyframe.id).trimstart +
          p_keyframes.find((x) => x.id == keyframe.id).start
      ) {
        props.forEach(function (prop) {
          checkAnyKeyframe(keyframe.id, prop, inst);
        });
      }
    }

    // Copy of setObjectValue function, seems to perform better inside the function
    function setValue(prop, object, value, inst) {
      if (object.get('type') != 'group') {
        if (object.group) {
          var group = object.group;
          tempgroup = group._objects;
          group._restoreObjectsState();
          canvas.setActiveObject(group);
          inst.remove(canvas.getActiveObject());
          canvas.discardActiveObject();
          inst.renderAll();
          for (var i = 0; i < tempgroup.length; i++) {
            inst.add(tempgroup[i]);
          }
        }
      }
      if (prop == 'left' && !recording) {
        object.set(prop, value + artboard.get('left'));
      } else if (prop == 'top' && !recording) {
        object.set(prop, value + artboard.get('top'));
      } else if (prop == 'shadow.blur') {
        object.shadow.blur = value;
      } else if (prop == 'shadow.color') {
        object.shadow.color = value;
      } else if (prop == 'shadow.offsetX') {
        object.shadow.offsetX = value;
      } else if (prop == 'shadow.offsetY') {
        object.shadow.offsetY = value;
      } else if (prop == 'shadow.blur') {
        object.shadow.blur = value;
      } else if (object.get('type') != 'group') {
        object.set(prop, value);
      } else if (prop != 'width') {
        object.set(prop, value);
      }
      inst.renderAll();
    }

    // Find next keyframe in time from same object & property
    function nextKeyframe(keyframe, index) {
      var temparr = keyframes.slice();
      temparr.sort(function (a, b) {
        return a.t - b.t;
      });
      temparr.splice(0, temparr.findIndex((x) => x === keyframe) + 1);
      if (temparr.length == 0) {
        return false;
      } else {
        for (var i = 0; i < temparr.length; i++) {
          if (
            temparr[i].id == keyframe.id &&
            temparr[i].name == keyframe.name
          ) {
            return temparr[i];
            break;
          } else if (i == temparr.length - 1) {
            return false;
          }
        }
      }
    }

    var object = canvasrecord.getItemById(keyframe.id);
    if (
      keyframe.t >= time &&
      currenttime >=
        p_keyframes.find((x) => x.id == keyframe.id).trimstart +
          p_keyframes.find((x) => x.id == keyframe.id).start
    ) {
      var delay = 0;
      var start = false;
      var lasttime, lastprop;
      // Find last keyframe in time from same object & property
      var lastkey = lastKeyframe(keyframe, index);
      if (!lastkey) {
        lasttime = 0;
        lastprop = objects
          .find((x) => x.id == keyframe.id)
          .defaults.find((x) => x.name == keyframe.name).value;
      } else {
        lasttime = lastkey.t;
        lastprop = lastkey.value;
      }
      if (lastkey && lastkey.t >= time && !play) {
        return;
      }

      // Initiate the animation
      var animation = {
        value: lastprop,
      };
      var instance = anime({
        targets: animation,
        delay: delay,
        value: keyframe.value,
        duration: keyframe.t - lasttime,
        easing: keyframe.easing,
        autoplay: false,
        update: function () {
          if (start && paused) {
            anime.remove(animation);
          }
        },
        changeBegin: function () {
          start = true;
        },
      });

      if (time - lasttime <= 0) {
        instance.seek(0);
      } else {
        instance.seek(time - lasttime);
      }

      if (
        parseFloat(lasttime) <= parseFloat(time) &&
        parseFloat(keyframe.t) >= parseFloat(time)
      ) {
        setValue(keyframe.name, object, animation.value, inst);
      }
    } else if (keyframe.t < time && !nextKeyframe(keyframe, index)) {
      var prop = keyframe.name;
      if (prop == 'shadow.blur') {
        if (object.shadow.blur != keyframe.value) {
          setValue(keyframe.name, object, keyframe.value, inst);
        }
      } else if (prop == 'shadow.color') {
        if (object.shadow.color != keyframe.value) {
          setValue(keyframe.name, object, keyframe.value, inst);
        }
      } else if (prop == 'shadow.offsetX') {
        if (object.shadow.offsetX != keyframe.value) {
          setValue(keyframe.name, object, keyframe.value, inst);
        }
      } else if (prop == 'shadow.offsetY') {
        if (object.shadow.offsetY != keyframe.value) {
          setValue(keyframe.name, object, keyframe.value, inst);
        }
      } else {
        if (object.get(prop) != keyframe.value) {
          setValue(keyframe.name, object, keyframe.value, inst);
        }
      }
    }
  });

  objects.forEach(function (object) {
    if (object.id.indexOf('Group') == -1) {
      const object2 = canvas.getItemById(object.id);
      if (
        currenttime <
        p_keyframes.find((x) => x.id == object.id).trimstart +
          p_keyframes.find((x) => x.id == object.id).start
      ) {
        object2.set('visible', false);
      } else if (
        currenttime >
          p_keyframes.find((x) => x.id == object.id).end ||
        currenttime > duration
      ) {
        object2.set('visible', false);
      } else {
        object2.set('visible', true);
      }
      if (
        currenttime >=
        p_keyframes.find((x) => x.id == object.id).trimstart +
          p_keyframes.find((x) => x.id == object.id).start
      ) {
        props.forEach(function (prop) {
          checkAnyKeyframe(object.id, prop, inst);
        });
      }
    }
  });
  inst.renderAll();

  playVideos(time);
  //});
}

// Animate timeline (or seek to specific point in time)
async function animate(play, time) {
  anime.speed = speed;
  if (!draggingPanel) {
    var starttime = new Date();
    var offset = time;
    var inst = canvas;
    keyframes.forEach(function (keyframe, index) {
      // Find next keyframe in time from same object & property
      function nextKeyframe(keyframe, index) {
        var temparr = keyframes.slice();
        temparr.sort(function (a, b) {
          return a.t - b.t;
        });
        temparr.splice(
          0,
          temparr.findIndex((x) => x === keyframe) + 1
        );
        if (temparr.length == 0) {
          return false;
        } else {
          for (var i = 0; i < temparr.length; i++) {
            if (
              temparr[i].id == keyframe.id &&
              temparr[i].name == keyframe.name
            ) {
              return temparr[i];
              break;
            } else if (i == temparr.length - 1) {
              return false;
            }
          }
        }
      }
      // Regroup if needed (groups break to animate their children, then regroup after children have animated)
      if (groups.find((x) => x.id == keyframe.id)) {
        if (!canvas.getItemById(keyframe.id)) {
          reGroup(keyframe.id);
        }
        const object = canvas.getItemById(keyframe.id);
        if (
          currenttime <
          p_keyframes.find((x) => x.id == keyframe.id).trimstart +
            p_keyframes.find((x) => x.id == keyframe.id).start
        ) {
          object.set('visible', false);
          inst.renderAll();
        } else if (
          currenttime >
            p_keyframes.find((x) => x.id == keyframe.id).end ||
          currenttime > duration
        ) {
          object.set('visible', false);
          inst.renderAll();
        } else {
          object.set('visible', true);
          inst.renderAll();
        }
        if (
          currenttime >=
          p_keyframes.find((x) => x.id == keyframe.id).trimstart +
            p_keyframes.find((x) => x.id == keyframe.id).start
        ) {
          props.forEach(function (prop) {
            checkAnyKeyframe(keyframe.id, prop, inst);
          });
        }
      }

      // Copy of setObjectValue function, seems to perform better inside the function
      function setValue(prop, object, value, inst) {
        if (object.get('assetType') == 'audio' && play) {
          if (object.get('src')) {
            object.get('src').volume = value;
            object.set('volume', value);
          }
          return false;
        }
        if (object.get('type') != 'group') {
          if (object.group) {
            /*
                        var group = object.group;
                        tempgroup = group._objects;
                        group._restoreObjectsState();
                        canvas.setActiveObject(group);
                        inst.remove(canvas.getActiveObject());
                        canvas.discardActiveObject();
                        inst.renderAll();
                        for (var i = 0; i < tempgroup.length; i++) {
                            inst.add(tempgroup[i]);
                        }
												*/
          }
        }
        if (prop == 'left' && !recording) {
          object.set(prop, value + artboard.get('left'));
        } else if (prop == 'top' && !recording) {
          object.set(prop, value + artboard.get('top'));
        } else if (prop == 'shadow.blur') {
          object.shadow.blur = value;
        } else if (prop == 'shadow.color') {
          object.shadow.color = value;
        } else if (prop == 'shadow.offsetX') {
          object.shadow.offsetX = value;
        } else if (prop == 'shadow.offsetY') {
          object.shadow.offsetY = value;
        } else if (prop == 'shadow.blur') {
          object.shadow.blur = value;
        } else if (object.get('type') != 'group') {
          object.set(prop, value);
        } else if (prop != 'width') {
          object.set(prop, value);
        }
        inst.renderAll();
      }

      var object = canvas.getItemById(keyframe.id);
      if (
        keyframe.t >= time &&
        currenttime >=
          p_keyframes.find((x) => x.id == keyframe.id).trimstart +
            p_keyframes.find((x) => x.id == keyframe.id).start
      ) {
        var delay = 0;
        var start = false;
        var lasttime, lastprop;
        // Find last keyframe in time from same object & property
        var lastkey = lastKeyframe(keyframe, index);
        if (!lastkey) {
          lasttime = 0;
          lastprop = objects
            .find((x) => x.id == keyframe.id)
            .defaults.find((x) => x.name == keyframe.name).value;
        } else {
          lasttime = lastkey.t;
          lastprop = lastkey.value;
        }
        if (lastkey && lastkey.t >= time && !play) {
          return;
        }
        // Set delay for the animation if playing
        if (play) {
          if (lasttime > currenttime) {
            delay = lasttime - time;
          }
        }
        // Initiate the animation
        var animation = {
          value: lastprop,
        };
        var instance = anime({
          targets: animation,
          delay: delay,
          value: keyframe.value,
          duration: keyframe.t - lasttime,
          easing: keyframe.easing,
          autoplay: false,
          update: function () {
            if (start && !paused) {
              if (
                currenttime <
                  p_keyframes.find((x) => x.id == keyframe.id)
                    .trimstart +
                    p_keyframes.find((x) => x.id == keyframe.id)
                      .start ||
                currenttime >
                  p_keyframes.find((x) => x.id == keyframe.id).end ||
                currenttime > duration
              ) {
                object.set('visible', false);
                inst.renderAll();
              } else {
                setValue(
                  keyframe.name,
                  object,
                  animation.value,
                  inst
                );
                object.set('visible', true);
                inst.renderAll();
              }
            } else if (start && paused) {
              anime.remove(animation);
            }
          },
          changeBegin: function () {
            start = true;
          },
        });

        if (time - lasttime <= 0) {
          instance.seek(0);
        } else {
          instance.seek(time - lasttime);
        }

        if (play) {
          instance.play();
        } else if (
          parseFloat(lasttime) <= parseFloat(time) &&
          parseFloat(keyframe.t) >= parseFloat(time)
        ) {
          setValue(keyframe.name, object, animation.value, inst);
        }
      } else if (
        keyframe.t < time &&
        !nextKeyframe(keyframe, index)
      ) {
        var prop = keyframe.name;
        if (prop == 'left' && !recording) {
          if (
            object.get('left') - artboard.get('left') !=
            keyframe.value
          ) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        } else if (prop == 'top' && !recording) {
          if (
            object.get('top') - artboard.get('top') !=
            keyframe.value
          ) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        } else if (prop == 'shadow.blur') {
          if (object.shadow.blur != keyframe.value) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        } else if (prop == 'shadow.color') {
          if (object.shadow.color != keyframe.value) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        } else if (prop == 'shadow.offsetX') {
          if (object.shadow.offsetX != keyframe.value) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        } else if (prop == 'shadow.offsetY') {
          if (object.shadow.offsetY != keyframe.value) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        } else {
          if (object.get(prop) != keyframe.value) {
            setValue(keyframe.name, object, keyframe.value, inst);
          }
        }
      }
    });
    /*
        if (play) {
            p_keyframes.forEach(function(keyframe){
                inst.getItemById(keyframe.id).set("visible", false);
                window.setTimeout(function(){
                    if (!paused) {
                        inst.getItemById(keyframe.id).set("visible", true);
                        inst.renderAll();
                    }
                }, keyframe.start-time)
                window.setTimeout(function(){
                    if (!paused) {
                        inst.getItemById(keyframe.id).set("visible", false);
                        inst.renderAll();
                    }
                }, keyframe.end-time)
            })
        }
        */
    objects.forEach(function (object) {
      if (object.id.indexOf('Group') == -1) {
        const object2 = canvas.getItemById(object.id);
        if (
          currenttime <
          p_keyframes.find((x) => x.id == object.id).trimstart +
            p_keyframes.find((x) => x.id == object.id).start
        ) {
          object2.set('visible', false);
        } else if (
          currenttime >
            p_keyframes.find((x) => x.id == object.id).end ||
          currenttime > duration
        ) {
          object2.set('visible', false);
        } else {
          object2.set('visible', true);
        }
        if (
          currenttime >=
          p_keyframes.find((x) => x.id == object.id).trimstart +
            p_keyframes.find((x) => x.id == object.id).start
        ) {
          props.forEach(function (prop) {
            checkAnyKeyframe(object.id, prop, inst);
          });
        }
      }
      var obj = canvas.getItemById(object.id);
      if (obj.type == 'lottie') {
        obj.goToSeconds(currenttime);
        inst.renderAll();
      }
    });
    inst.renderAll();

    if (animatedtext.length > 0) {
      animatedtext.forEach(function (text) {
        text.seek(currenttime, canvas);
        inst.renderAll();
      });
    }

    playVideos(time);
    if (play) {
      playAudio(time);
    }
    if (play && !paused) {
      var animation = {
        value: 0,
      };
      var main_instance = anime({
        targets: animation,
        value: [currenttime, duration],
        duration: duration - currenttime,
        easing: 'linear',
        autoplay: true,
        update: function () {
          if (!paused) {
            currenttime = animation.value;
            if (animatedtext.length > 0) {
              animatedtext.forEach(function (text) {
                text.seek(currenttime, canvas);
                inst.renderAll();
              });
            }
            objects.forEach(function (object) {
              if (object.id.indexOf('Group') == -1) {
                const object2 = inst.getItemById(object.id);
                if (
                  currenttime <
                  p_keyframes.find((x) => x.id == object.id)
                    .trimstart +
                    p_keyframes.find((x) => x.id == object.id).start
                ) {
                  object2.set('visible', false);
                } else if (
                  currenttime >
                    p_keyframes.find((x) => x.id == object.id).end ||
                  currenttime > duration
                ) {
                  object2.set('visible', false);
                } else {
                  object2.set('visible', true);
                }
                if (
                  currenttime >=
                  p_keyframes.find((x) => x.id == object.id)
                    .trimstart +
                    p_keyframes.find((x) => x.id == object.id).start
                ) {
                  props.forEach(function (prop) {
                    checkAnyKeyframe(object.id, prop, inst);
                  });
                }
              }
              var obj = canvas.getItemById(object.id);
              if (obj.type == 'lottie') {
                obj.goToSeconds(currenttime);
                inst.renderAll();
              }
            });
            inst.renderAll();
            if (!recording) {
              renderTime();
              $('#seekbar').css({
                left: currenttime / timelinetime + offset_left,
              });
            }
          } else {
            pause();
            animation.value = duration + 1;
            anime.remove(animation);
          }
        },
        complete: function () {
          pause();
        },
      });
    } else if (paused) {
      currenttime = time;
    }
  }
}

// Render a keyframe
function renderKeyframe(object, prop, time) {
  const color = objects.find((x) => x.id == object.id).color;
  if (prop == 'shadow.color') {
    if (
      $('#' + object.get('id'))
        .find('.shadowcolor')
        .is(':visible')
    ) {
      time =
        time -
        parseFloat(
          p_keyframes.find((x) => x.id == object.get('id')).start
        );
    }
    $('#' + object.get('id'))
      .find('.shadowcolor')
      .prepend(
        "<div class='keyframe' data-time='" +
          time +
          "' data-object='" +
          object.get('id') +
          "' data-property='" +
          prop +
          "'></div>"
      );
    $('#' + object.get('id'))
      .find('.shadowcolor')
      .find("[data-time='" + time + "']")
      .css({ left: time / timelinetime, background: color });
  } else {
    if (
      $('#' + object.get('id'))
        .find('.' + prop)
        .is(':visible')
    ) {
      time =
        time -
        parseFloat(
          p_keyframes.find((x) => x.id == object.get('id')).start
        );
    }
    $('#' + object.get('id'))
      .find('.' + prop)
      .prepend(
        "<div class='keyframe' data-time='" +
          time +
          "' data-object='" +
          object.get('id') +
          "' data-property='" +
          prop +
          "'></div>"
      );
    $('#' + object.get('id'))
      .find('.' + prop)
      .find("[data-time='" + time + "']")
      .css({ left: time / timelinetime, background: color });
  }
}

// Create a keyframe
function newKeyframe(property, object, time, value, render) {
  // Check if property can be animated
  if (
    $.inArray(
      property,
      objects.find((x) => x.id == object.get('id')).animate
    ) != -1
  ) {
    const keyarr = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(time) &&
        e.id == object.get('id') &&
        e.name == property
      );
    });
    const keyarr2 = $.grep(keyframes, function (e) {
      return e.id == object.get('id') && e.name == property;
    });
    if (keyarr2.length == 0) {
      if (property == 'left') {
        objects
          .find((x) => x.id == object.get('id'))
          .defaults.find((x) => x.name == property).value =
          object.get(property) - artboard.get('left');
      } else if (property == 'top') {
        objects
          .find((x) => x.id == object.get('id'))
          .defaults.find((x) => x.name == property).value =
          object.get(property) - artboard.get('top');
      } else {
        objects
          .find((x) => x.id == object.get('id'))
          .defaults.find((x) => x.name == property).value = value;
      }
    }
    if (keyarr.length == 0) {
      if (property == 'left') {
        keyframes.push({
          t: time,
          name: property,
          value: value - artboard.get('left'),
          id: object.get('id'),
          easing: 'linear',
        });
      } else if (property == 'top') {
        keyframes.push({
          t: time,
          name: property,
          value: value - artboard.get('top'),
          id: object.get('id'),
          easing: 'linear',
        });
      } else {
        keyframes.push({
          t: time,
          name: property,
          value: value,
          id: object.get('id'),
          easing: 'linear',
        });
      }
      if (
        render &&
        property != 'top' &&
        property != 'scaleY' &&
        property != 'width' &&
        property != 'height' &&
        property != 'stroke' &&
        property != 'shadow.opacity' &&
        property != 'shadow.offsetX' &&
        property != 'shadow.offsetY' &&
        property != 'shadow.blur' &&
        property != 'lineHeight'
      ) {
        renderKeyframe(object, property, time);
      }
      keyframes.sort(function (a, b) {
        if (
          a.id.indexOf('Group') >= 0 &&
          b.id.indexOf('Group') == -1
        ) {
          return 1;
        } else if (
          b.id.indexOf('Group') >= 0 &&
          a.id.indexOf('Group') == -1
        ) {
          return -1;
        } else {
          return 0;
        }
      });
    } else if (render) {
      if (
        property != 'top' &&
        property != 'scaleY' &&
        property != 'width' &&
        property != 'height' &&
        property != 'stroke' &&
        property != 'shadow.opacity' &&
        property != 'shadow.offsetX' &&
        property != 'shadow.offsetY' &&
        property != 'shadow.blur' &&
        property != 'lineHeight'
      ) {
        updateKeyframe(
          $('#' + object.get('id')).find(
            ".keyframe[data-time='" +
              time +
              "'][data-property='" +
              property +
              "']"
          ),
          true
        );
      }
    }
  } else {
    if (property == 'left') {
      objects
        .find((x) => x.id == object.get('id'))
        .defaults.find((x) => x.name == property).value =
        object.get(property) - artboard.get('left');
    } else if (property == 'top') {
      objects
        .find((x) => x.id == object.get('id'))
        .defaults.find((x) => x.name == property).value =
        object.get(property) - artboard.get('top');
    } else {
      objects
        .find((x) => x.id == object.get('id'))
        .defaults.find((x) => x.name == property).value = value;
    }
  }
}

// Create a keyframe (manually)
function manualKeyframe() {
  var prop = $(this).parent().attr('data-property');
  const object = canvas.getItemById(
    $(this).parent().parent().parent().attr('data-object')
  );
  if (prop == 'position') {
    prop = 'left';
    newKeyframe('top', object, currenttime, object.get('top'), true);
  } else if (prop == 'scale') {
    prop = 'scaleX';
    newKeyframe(
      'scaleY',
      object,
      currenttime,
      object.get('scaleY'),
      true
    );
    newKeyframe(
      'width',
      object,
      currenttime,
      object.get('width'),
      true
    );
    newKeyframe(
      'height',
      object,
      currenttime,
      object.get('height'),
      true
    );
  } else if (prop == 'stroke') {
    prop = 'strokeWidth';
    newKeyframe(
      'stroke',
      object,
      currenttime,
      object.get('stroke'),
      true
    );
  } else if (prop == 'shadow') {
    prop = 'shadow.color';
    newKeyframe(
      'shadow.opacity',
      object,
      currenttime,
      object.get('shadow.opacity'),
      true
    );
    newKeyframe(
      'shadow.offsetX',
      object,
      currenttime,
      object.get('shadow.offsetX'),
      true
    );
    newKeyframe(
      'shadow.offsetY',
      object,
      currenttime,
      object.get('shadow.offsetY'),
      true
    );
    newKeyframe(
      'shadow.blur',
      object,
      currenttime,
      object.get('shadow.blur'),
      true
    );
  } else if (prop == 'text') {
    prop = 'charSpacing';
    newKeyframe(
      'lineHeight',
      object,
      currenttime,
      object.get('lineHeight'),
      true
    );
  }
  newKeyframe(prop, object, currenttime, object.get(prop), true);
  save();
}
$(document).on('click', '.property-keyframe', manualKeyframe);

// Freeze all properties (this is counterintuitve because I initially programmed it to work the other way around)
function toggleAnimate(e) {
  e.stopPropagation();
  const object = canvas.getItemById(
    $(this).parent().parent().parent().attr('data-object')
  );
  // Turn off clock -> Stop animation
  if ($(this).hasClass('frozen')) {
    $(this).removeClass('frozen');
    $(this).attr('src', 'assets/freeze.svg');
    objects.find((x) => x.id == object.get('id')).animate = [];
    // Turn on clock -> Start animation
  } else {
    $(this).addClass('frozen');
    $(this).attr('src', 'assets/frozen.svg');
    objects.find((x) => x.id == object.get('id')).animate = [];
    if (object.get('assetType') == 'audio') {
      objects
        .find((x) => x.id == object.get('id'))
        .animate.push('volume');
      keyframes = $.grep(keyframes, function (e) {
        return e.id != object.get('id');
      });
      $(".keyframe[data-object='" + object.get('id') + "']").remove();
      $(this)
        .parent()
        .parent()
        .parent()
        .find('.freeze-prop')
        .removeClass('frozen');
      newKeyframe('volume', object, 0, 0.5, true);
    } else {
      props.forEach(function (prop) {
        objects
          .find((x) => x.id == object.get('id'))
          .animate.push(prop);
      });
      keyframes = $.grep(keyframes, function (e) {
        return e.id != object.get('id');
      });
      $(".keyframe[data-object='" + object.get('id') + "']").remove();
      $(this)
        .parent()
        .parent()
        .parent()
        .find('.freeze-prop')
        .removeClass('frozen');

      props.forEach(function (prop) {
        if (prop == 'lineHeight' || prop == 'charSpacing') {
          if (object.get('type') == 'textbox') {
            newKeyframe(prop, object, 0, object.get(prop), true);
          }
        } else if (
          prop == 'shadow.opacity' ||
          prop == 'shadow.blur' ||
          prop == 'shadow.offsetX' ||
          prop == 'shadow.offsetY' ||
          prop == 'shadow.color'
        ) {
          if (object.get('type') != 'group') {
            if (prop == 'shadow.color') {
              newKeyframe(prop, object, 0, object.shadow.color, true);
            } else if (prop == 'shadow.opacity') {
              newKeyframe(
                prop,
                object,
                0,
                object.shadow.opacity,
                true
              );
            } else if (prop == 'shadow.offsetX') {
              newKeyframe(
                prop,
                object,
                0,
                object.shadow.offsetX,
                true
              );
            } else if (prop == 'shadow.offsetY') {
              newKeyframe(
                prop,
                object,
                0,
                object.shadow.offsetY,
                true
              );
            } else if (prop == 'shadow.blur') {
              newKeyframe(prop, object, 0, object.shadow.blur, true);
            }
          }
        } else {
          newKeyframe(prop, object, 0, object.get(prop), true);
        }
      });
    }
  }
  save();
}
$(document).on('click', '.freeze', toggleAnimate);

function animateProp(prop, object) {
  objects.find((x) => x.id == object.get('id')).animate.push(prop);

  // Prop counterparts
  if (prop == 'left') {
    objects.find((x) => x.id == object.get('id')).animate.push('top');
    newKeyframe(
      'left',
      object,
      currenttime,
      object.get('left'),
      true
    );
    newKeyframe('top', object, currenttime, object.get('top'), true);
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'left').value =
      object.get('left') - artboard.get('left');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'top').value =
      object.get('top') - artboard.get('top');
  } else if (prop == 'scaleX') {
    newKeyframe(
      'scaleY',
      object,
      currenttime,
      object.get('scaleY'),
      true
    );
    newKeyframe(
      'width',
      object,
      currenttime,
      object.get('width'),
      true
    );
    newKeyframe(
      'height',
      object,
      currenttime,
      object.get('height'),
      true
    );
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('scaleY');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('width');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('height');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'height').value =
      object.get('height');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'width').value =
      object.get('width');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'scaleY').value =
      object.get('scaleY');
  } else if (prop == 'strokeWidth') {
    newKeyframe(
      'stroke',
      object,
      currenttime,
      object.get('stroke'),
      true
    );
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'stroke').value =
      object.get('stroke');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('stroke');
  } else if (prop == 'shadow.color') {
    newKeyframe(
      'shadow.color',
      object,
      currenttime,
      object.shadow.color,
      true
    );
    newKeyframe(
      'shadow.opacity',
      object,
      currenttime,
      object.shadow.opacity,
      true
    );
    newKeyframe(
      'shadow.offsetX',
      object,
      currenttime,
      object.shadow.offsetX,
      true
    );
    newKeyframe(
      'shadow.offsetY',
      object,
      currenttime,
      object.shadow.offsetY,
      true
    );
    newKeyframe(
      'shadow.blur',
      object,
      currenttime,
      object.shadow.blur,
      true
    );
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.color').value =
      object.get('shadow.color');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.opacity').value =
      object.get('shadow.opacity');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.offsetX').value =
      object.get('shadow.offsetX');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.offsetY').value =
      object.get('shadow.offsetY');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.blur').value =
      object.get('shadow.blur');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('shadow.opacity');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('shadow.offsetX');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('shadow.offsetY');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('shadow.blur');
  } else if (prop == 'charSpacing') {
    newKeyframe(
      'lineHeight',
      object,
      currenttime,
      object.get('lineHeight'),
      true
    );
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'lineHeight').value =
      object.get('lineHeight');
    objects
      .find((x) => x.id == object.get('id'))
      .animate.push('lineHeight');
  }

  // Exception
  if (prop != 'left' && prop != 'shadow.color') {
    newKeyframe(prop, object, currenttime, object.get(prop), true);
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == prop).value = object.get(prop);
  }
}

function freezeProp(prop, object) {
  objects.find((x) => x.id == object.get('id')).animate = $.grep(
    objects.find((x) => x.id == object.get('id')).animate,
    function (e) {
      return e != prop;
    }
  );
  // Also add prop counterparts (should probably have done in a better way)
  if (prop == 'left') {
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'top';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'top';
    });
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'left').value =
      object.get('left') - artboard.get('left');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'top').value =
      object.get('top') - artboard.get('top');
  } else if (prop == 'scaleX') {
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'height').value =
      object.get('height');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'width').value =
      object.get('width');
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'scaleY').value =
      object.get('scaleY');
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'scaleY';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'scaleY';
    });
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'width';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'width';
    });
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'height';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'height';
    });
  } else if (prop == 'strokeWidth') {
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'stroke').value =
      object.get('stroke');
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'stroke';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'stroke';
    });
  } else if (prop == 'shadow.color') {
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.opacity').value =
      object.shadow.opacity;
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.offsetX').value =
      object.shadow.offsetX;
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.offsetY').value =
      object.shadow.offsetY;
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'shadow.blur').value =
      object.shadow.blur;
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'shadow.opacity';
    });
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'shadow.opacity';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'shadow.offsetX';
    });
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'shadow.offsetX';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'shadow.offsetY';
    });
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'shadow.offsetY';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'shadow.blur';
    });
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'shadow.blur';
      }
    );
  } else if (prop == 'charSpacing') {
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == 'lineHeight').value =
      object.get('lineHeight');
    objects.find((x) => x.id == object.get('id')).animate = $.grep(
      objects.find((x) => x.id == object.get('id')).animate,
      function (e) {
        return e != 'lineHeight';
      }
    );
    keyframes = $.grep(keyframes, function (e) {
      return e.id != object.get('id') || e.name != 'lineHeight';
    });
  }

  keyframes = $.grep(keyframes, function (e) {
    return e.id != object.get('id') || e.name != prop;
  });

  // Exception
  if (prop != 'left' && prop != 'shadow.color') {
    objects
      .find((x) => x.id == object.get('id'))
      .defaults.find((x) => x.name == prop).value = object.get(prop);
  }

  $(
    ".keyframe[data-object='" +
      object.get('id') +
      "'][data-property='" +
      prop +
      "']"
  ).remove();
}

// Toggle animation mode for property
function toggleAnimateProp(e) {
  e.stopPropagation();
  var prop = $(this).parent().attr('data-property');
  const object = canvas.getItemById(
    $(this).parent().parent().parent().attr('data-object')
  );
  if (prop == 'position') {
    prop = 'left';
  } else if (prop == 'scale') {
    prop = 'scaleX';
  } else if (prop == 'stroke') {
    prop = 'strokeWidth';
  } else if (prop == 'shadow') {
    prop = 'shadow.color';
  } else if (prop == 'text') {
    prop = 'charSpacing';
  }

  // Check layer global "freezing" state
  if (
    $(this)
      .parent()
      .parent()
      .parent()
      .find('.freeze')
      .hasClass('frozen')
  ) {
    objects.find((x) => x.id == object.get('id')).animate = [];
    $(this)
      .parent()
      .parent()
      .parent()
      .find('.freeze')
      .removeClass('frozen');

    // Stop animating all props except selected
    var propmatch = [
      prop,
      'scaleY',
      'width',
      'height',
      'top',
      'stroke',
      'shadow.opacity',
      'shadow.offsetX',
      'shadow.offsetY',
      'shadow.blur',
      'lineHeight',
    ];
    props.forEach(function (p) {
      if ($.inArray(p, propmatch) == -1) {
        if (
          (object.get('type') == 'textbox' && p == 'charSpacing') ||
          p == 'lineHeight'
        ) {
          freezeProp(p, object);
        } else if (p != 'charSpacing' && p != 'lineHeight') {
          freezeProp(p, object);
        }
      }
    });
  }

  // Turn off clock -> Stop animating
  if ($(this).hasClass('frozen')) {
    $(this).removeClass('frozen');
    $(this).attr('src', 'assets/freeze.svg');
    freezeProp(prop, object);
    // Turn on clock -> Animate
  } else {
    $(this).addClass('frozen');
    $(this).attr('src', 'assets/frozen.svg');
    animateProp(prop, object);
  }
  save();
}
$(document).on('click', '.freeze-prop', toggleAnimateProp);

// Lock layer
function lockLayer(e) {
  e.stopPropagation();
  const object = canvas.getItemById(
    $(this).parent().parent().parent().attr('data-object')
  );
  if ($(this).hasClass('locked')) {
    $(this).removeClass('locked');
    $(this).attr('src', 'assets/lock.svg');
    object.selectable = true;
    $(this).parent().parent().parent().attr('draggable', true);
  } else {
    $(this).addClass('locked');
    $(this).attr('src', 'assets/locked.svg');
    object.selectable = false;
    if (canvas.getActiveObject() == object) {
      canvas.discardActiveObject();
      canvas.renderAll();
    }
    $(this).parent().parent().parent().attr('draggable', false);
  }
  save();
}
$(document).on('click', '.lock', lockLayer);

// Center an object in the canvas
function centerObject(object) {
  object.set('top', artboard.get('top') + artboard.get('height') / 2);
  object.set(
    'left',
    artboard.get('left') + artboard.get('width') / 2
  );
  canvas.renderAll();
  save();
}

// Render a layer
function renderLayer(object, animate = false) {
  $('#nolayers').addClass('yaylayers');
  const color = objects.find((x) => x.id == object.get('id')).color;
  var src = '';
  var classlock = '';
  var srclock = 'lock';
  var freeze = 'freeze';
  if (object.get('type') == 'textbox') {
    src = 'assets/text.svg';
  } else if (
    object.get('type') == 'rect' ||
    object.get('type') == 'group' ||
    object.get('type') == 'circle' ||
    object.get('type') == 'path'
  ) {
    src = 'assets/star.svg';
    if (object.get('assetType') == 'animatedText') {
      src = 'assets/text.svg';
    }
    if (object.get('assetType') == 'audio') {
      src = 'assets/audio.svg';
    }
  } else if (object.get('type') == 'image') {
    if (
      object.get('assetType') &&
      object.get('assetType') == 'video'
    ) {
      src = 'assets/video.svg';
    } else {
      src = 'assets/image.svg';
    }
  } else if (object.get('type') == 'lottie') {
    src = 'assets/zappy.svg';
  } else if (object.get('assetType') == 'audio') {
    src = 'assets/audio.svg';
  }
  if (object.selectable == false) {
    classlock = 'locked';
    srclock = 'locked';
  }
  if (animate != false) {
    freeze = 'frozen';
  }
  const leftoffset =
    p_keyframes.find((x) => x.id == object.get('id')).trimstart /
    timelinetime;
  const width =
    (p_keyframes.find((x) => x.id == object.get('id')).end -
      p_keyframes.find((x) => x.id == object.get('id')).trimstart) /
    timelinetime;
  $('#inner-timeline').prepend(
    "<div class='object-props' id='" +
      object.get('id') +
      "' style='width:" +
      (p_keyframes.find((x) => x.id == object.get('id')).end -
        p_keyframes.find((x) => x.id == object.get('id')).start) /
        timelinetime +
      "px'><div class='row main-row'><div class='row-el' style='background-color:" +
      color +
      "'><div class='trim-row' style='left:" +
      leftoffset +
      'px;width:' +
      width +
      "px'></div></div></div></div>"
  );
  if (object.get('assetType') == 'audio') {
    object.setControlsVisibility({
      mt: false,
      mb: false,
      ml: false,
      mr: false,
    });
    $('#layer-inner-list').prepend(
      "<div class='layer' data-object='" +
        object.get('id') +
        "'><div class='layer-name'><img class='droparrow' src='assets/drop-arrow.svg' ><img class='layer-icon' src=" +
        src +
        "><input class='layer-custom-name' value='" +
        objects.find((x) => x.id == object.get('id')).label +
        "' readonly></span><div class='layer-options'><img class='" +
        freeze +
        "' src='assets/" +
        freeze +
        ".svg' title='Toggle animation'></div></div><div class='properties'></div></div>"
    );
  } else {
    $('#layer-inner-list').prepend(
      "<div class='layer' data-object='" +
        object.get('id') +
        "'><div class='layer-name'><img class='droparrow' src='assets/drop-arrow.svg' ><img class='layer-icon' src=" +
        src +
        "><input class='layer-custom-name' value='" +
        objects.find((x) => x.id == object.get('id')).label +
        "' readonly></span><div class='layer-options'><img class='lock " +
        classlock +
        "' src='assets/" +
        srclock +
        ".svg' title='Lock layer'><img class='" +
        freeze +
        "' src='assets/" +
        freeze +
        ".svg' title='Toggle animation'></div></div><div class='properties'></div></div>"
    );
  }
  $(".layer[data-object='" + object.get('id') + "']")
    .find('.properties')
    .toggle();
  setTimelineZoom(timelinetime);
  sortable('#layer-inner-list', {
    placeholderClass: 'hovering',
    copy: true,
    customDragImage: (draggedElement, elementOffset, event) => {
      return {
        element: document.getElementById('nothing'),
        posX: event.pageX - elementOffset.left,
        posY: event.pageY - elementOffset.top,
      };
    },
  });
  if (object.selectable == false) {
    $(".layer[data-object='" + object.get('id') + "']").attr(
      'draggable',
      false
    );
  }
}

// Render a property
function renderProp(prop, object) {
  var classfreeze = '';
  srcfreeze = 'freeze';
  if (
    $.inArray(
      prop,
      objects.find((x) => x.id == object.get('id')).animate
    ) != -1
  ) {
    classfreeze = 'frozen';
    srcfreeze = 'frozen';
  }
  if (prop == 'shadow.color') {
    prop = 'shadowcolor';
  }
  $('#' + object.get('id')).append(
    "<div class='row " +
      prop +
      " keyframe-row' data-object='" +
      object.get('id') +
      "'><div class='row-el'></div></div>"
  );
  if (prop == 'left') {
    $(".layer[data-object='" + object.get('id') + "']")
      .find('.properties')
      .append(
        "<div class='property-name' data-property='position'><span class='property-keyframe' title='Create a new keyframe'></span>Position<img class='freeze-prop " +
          classfreeze +
          "' src='assets/" +
          srcfreeze +
          ".svg' title='Toggle animation'></div>"
      );
  } else if (prop == 'scaleX') {
    $(".layer[data-object='" + object.get('id') + "']")
      .find('.properties')
      .append(
        "<div class='property-name' data-property='scale'><span class='property-keyframe' title='Create a new keyframe'></span>Scale<img class='freeze-prop " +
          classfreeze +
          "' src='assets/" +
          srcfreeze +
          ".svg' title='Toggle animation'></div>"
      );
  } else if (prop == 'strokeWidth') {
    $(".layer[data-object='" + object.get('id') + "']")
      .find('.properties')
      .append(
        "<div class='property-name' data-property='stroke'><span class='property-keyframe' title='Create a new keyframe'></span>Stroke<img class='freeze-prop " +
          classfreeze +
          "' src='assets/" +
          srcfreeze +
          ".svg' title='Toggle animation'></div>"
      );
  } else if (prop == 'shadowcolor') {
    $(".layer[data-object='" + object.get('id') + "']")
      .find('.properties')
      .append(
        "<div class='property-name' data-property='shadow'><span class='property-keyframe' title='Create a new keyframe'></span>Shadow<img class='freeze-prop " +
          classfreeze +
          "' src='assets/" +
          srcfreeze +
          ".svg' title='Toggle animation'></div>"
      );
  } else if (prop == 'charSpacing') {
    $(".layer[data-object='" + object.get('id') + "']")
      .find('.properties')
      .append(
        "<div class='property-name' data-property='text'><span class='property-keyframe' title='Create a new keyframe'></span>Text<img class='freeze-prop " +
          classfreeze +
          "' src='assets/" +
          srcfreeze +
          ".svg' title='Toggle animation'></div>"
      );
  } else {
    $(".layer[data-object='" + object.get('id') + "']")
      .find('.properties')
      .append(
        "<div class='property-name' data-property='" +
          prop +
          "'><span class='property-keyframe' title='Create a new keyframe'></span>" +
          prop +
          "<img class='freeze-prop " +
          classfreeze +
          "' src='assets/" +
          srcfreeze +
          ".svg' title='Toggle animation'></div>"
      );
  }
  $('#' + object.get('id'))
    .find('.keyframe-row' + '.' + prop)
    .toggle();
}

// Create a layer
function newLayer(object) {
  layer_count++;
  var color;
  if (object.get('type') == 'image') {
    if (
      object.get('assetType') &&
      object.get('assetType') == 'video'
    ) {
      color = '#106CF6';
    } else {
      color = '#92F711';
    }
  } else if (object.get('type') == 'textbox') {
    color = '#F7119B';
  } else if (
    object.get('type') == 'rect' ||
    object.get('type') == 'group' ||
    object.get('type') == 'circle' ||
    object.get('type') == 'path'
  ) {
    color = '#9211F7';
    if (object.get('assetType') == 'animatedText') {
      color = '#F7119B';
    } else if (object.get('assetType') == 'audio') {
      color = '#11C0F7';
    }
  }
  if (
    (object.get('assetType') && object.get('assetType') == 'video') ||
    object.get('type') == 'lottie' ||
    object.get('assetType') == 'audio'
  ) {
    objects.push({
      object: object,
      id: object.get('id'),
      label: object.get('id'),
      color: color,
      defaults: [],
      locked: [],
      mask: 'none',
      start: 0,
      end: object.get('duration'),
    });
    if (object.get('duration') < duration) {
      p_keyframes.push({
        start: currenttime,
        end: object.get('duration') + currenttime,
        trimstart: 0,
        trimend: object.get('duration') + currenttime,
        object: object,
        id: object.get('id'),
      });
    } else {
      p_keyframes.push({
        start: currenttime,
        end: duration - currenttime,
        trimstart: 0,
        trimend: duration - currenttime,
        object: object,
        id: object.get('id'),
      });
    }
  } else {
    objects.push({
      object: object,
      id: object.get('id'),
      label: object.get('id'),
      color: color,
      defaults: [],
      locked: [],
      mask: 'none',
    });
    if (object.get('notnew')) {
      p_keyframes.push({
        start: object.get('starttime'),
        end: duration - object.get('starttime'),
        trimstart: 0,
        trimend: duration - currenttime,
        object: object,
        id: object.get('id'),
      });
    } else {
      p_keyframes.push({
        start: currenttime,
        end: duration - currenttime,
        trimstart: 0,
        trimend: duration - currenttime,
        object: object,
        id: object.get('id'),
      });
    }
  }
  renderLayer(object);
  if (
    !object.get('assetType') ||
    object.get('assetType') != 'audio'
  ) {
    props.forEach(function (prop) {
      if (prop == 'lineHeight' || prop == 'charSpacing') {
        if (object.get('type') == 'textbox') {
          if (prop != 'lineHeight') {
            renderProp(prop, object);
          }
          objects
            .find((x) => x.id == object.id)
            .defaults.push({ name: prop, value: object.get(prop) });
        }
      } else if (
        prop == 'shadow.opacity' ||
        prop == 'shadow.blur' ||
        prop == 'shadow.offsetX' ||
        prop == 'shadow.offsetY' ||
        prop == 'shadow.color'
      ) {
        if (object.get('type') != 'group') {
          if (prop == 'shadow.color') {
            renderProp(prop, object);
            objects
              .find((x) => x.id == object.id)
              .defaults.push({
                name: prop,
                value: object.shadow.color,
              });
          } else if (prop == 'shadow.blur') {
            objects
              .find((x) => x.id == object.id)
              .defaults.push({
                name: prop,
                value: object.shadow.blur,
              });
          } else if (prop == 'shadow.offsetX') {
            objects
              .find((x) => x.id == object.id)
              .defaults.push({
                name: prop,
                value: object.shadow.offsetX,
              });
          } else if (prop == 'shadow.offsetY') {
            objects
              .find((x) => x.id == object.id)
              .defaults.push({
                name: prop,
                value: object.shadow.offsetY,
              });
          } else if (prop == 'shadow.opacity') {
            objects
              .find((x) => x.id == object.id)
              .defaults.push({
                name: prop,
                value: object.shadow.opacity,
              });
          }
        }
      } else {
        if (
          prop != 'top' &&
          prop != 'scaleY' &&
          prop != 'stroke' &&
          prop != 'width' &&
          prop != 'height'
        ) {
          renderProp(prop, object);
        }
        objects
          .find((x) => x.id == object.id)
          .defaults.push({ name: prop, value: object.get(prop) });
      }
    });
  } else {
    renderProp('volume', object);
    objects
      .find((x) => x.id == object.id)
      .defaults.push({ name: 'volume', value: 0 });
  }
  $('.layer-selected').removeClass('layer-selected');
  $(".layer[data-object='" + object.get('id') + "']").addClass(
    'layer-selected'
  );
  document
    .getElementsByClassName('layer-selected')[0]
    .scrollIntoView();
  objects.find((x) => x.id == object.id).animate = [];
  animate(false, currenttime);
  save();
  checkFilter();
}

// Add a (complex) SVG shape to the canvas
function newSVG(svg, x, y, width, center) {
  var svggroup = [];
  fabric.loadSVGFromURL(svg, function (objects, options) {
    var newsvg = objects[0];
    if (objects.length > 1) {
      newsvg = fabric.util.groupSVGElements(objects, options);
    }
    newsvg.set({
      id: 'Shape' + layer_count,
      stroke: '#000',
      left: x,
      top: y,
      strokeWidth: 0,
      strokeUniform: true,
      originX: 'center',
      originY: 'center',
      strokeDashArray: false,
      absolutePositioned: true,
      paintFirst: 'stroke',
      objectCaching: true,
      sourcePath: svg,
      inGroup: false,
      shadow: {
        color: '#000',
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        opacity: 0,
      },
    });
    newsvg.scaleToWidth(width);
    newsvg.set({
      scaleX: parseFloat(newsvg.get('scaleX').toFixed(2)),
      scaleY: parseFloat(newsvg.get('scaleY').toFixed(2)),
    });
    canvas.add(newsvg);
    newLayer(newsvg);
    canvas.setActiveObject(newsvg);
    canvas.bringToFront(newsvg);
    canvas.renderAll();
    if (center) {
      newsvg.set(
        'left',
        artboard.get('left') + artboard.get('width') / 2
      );
      newsvg.set(
        'top',
        artboard.get('top') + artboard.get('height') / 2
      );
      canvas.renderAll();
    }
  });
}

// Add a video to the canvas
function newVideo(file, src, x, y, duration, center) {
  var newvid = new fabric.Image(file, {
    left: x,
    top: y,
    width: file.width,
    height: file.height,
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
    source: src,
    duration: duration * 1000,
    assetType: 'video',
    id: 'Video' + layer_count,
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
  files.push({ name: newvid.get('id'), file: src });
  newvid.saveElem = newvid.getElement();
  canvas.add(newvid);
  if (newvid.get('width') > artboard.get('width')) {
    newvid.scaleToWidth(artboard.get('width'));
  }
  newvid.scaleToWidth(150);
  canvas.renderAll();
  if (window.duration < newvid.duration + currenttime) {
    window.duration =
      ((newvid.duration + currenttime) / 1000).toFixed(2) * 1000;
  }
  newLayer(newvid);
  canvas.setActiveObject(newvid);
  canvas.bringToFront(newvid);
  if (center) {
    newvid.set(
      'left',
      artboard.get('left') + artboard.get('width') / 2
    );
    newvid.set(
      'top',
      artboard.get('top') + artboard.get('height') / 2
    );
    canvas.renderAll();
  }
  $('#load-video').removeClass('loading-active');
}

// Load a video
function loadVideo(src, x, y, center) {
  var vidObj = document.createElement('video');
  var vidSrc = document.createElement('source');
  vidSrc.src = src;
  vidObj.crossOrigin = 'anonymous';
  vidObj.appendChild(vidSrc);
  vidObj.addEventListener('loadeddata', function () {
    vidObj.width = this.videoWidth;
    vidObj.height = this.videoHeight;
    vidObj.currentTime = 0;
    vidObj.muted = false;
    function waitLoad() {
      if (vidObj.readyState >= 3) {
        newVideo(vidObj, src, x, y, vidObj.duration, center);
      } else {
        window.setTimeout(function () {
          waitLoad();
        }, 100);
      }
    }
    window.setTimeout(function () {
      waitLoad();
    }, 100);
  });
  vidObj.currentTime = 0;
}

// Check that crop controls are inside image
function checkCrop(obj) {
  if (obj.isContainedWithinObject(cropobj)) {
    croptop = obj.get('top');
    cropleft = obj.get('left');
    cropscalex = obj.get('scaleX');
    cropscaley = obj.get('scaleY');
  } else {
    obj.top = croptop;
    obj.left = cropleft;
    obj.scaleX = cropscalex;
    obj.scaleY = cropscaley;
    obj.setCoords();
    obj.saveState();
  }
  obj.set({
    borderColor: '#51B9F9',
  });
  canvas.renderAll();
  crop(canvas.getItemById('cropped'));
}

// Perform a crop
function crop(obj) {
  var crop = canvas.getItemById('crop');
  cropobj.setCoords();
  crop.setCoords();
  var cleft =
    crop.get('left') - (crop.get('width') * crop.get('scaleX')) / 2;
  var ctop =
    crop.get('top') - (crop.get('height') * crop.get('scaleY')) / 2;
  var height =
    (crop.get('height') / cropobj.get('scaleY')) * crop.get('scaleY');
  var width =
    (crop.get('width') / cropobj.get('scaleX')) * crop.get('scaleX');
  var img_height = cropobj.get('height') * cropobj.get('scaleY');
  var img_width = cropobj.get('width') * cropobj.get('scaleX');
  var left =
    cleft -
    (cropobj.get('left') -
      (cropobj.get('width') * cropobj.get('scaleX')) / 2);
  var top =
    ctop -
    (cropobj.get('top') -
      (cropobj.get('height') * cropobj.get('scaleY')) / 2);
  if (left < 0 && top > 0) {
    obj
      .set({ cropY: top / cropobj.get('scaleY'), height: height })
      .setCoords();
    canvas.renderAll();
    obj.set({
      top: ctop + (obj.get('height') * obj.get('scaleY')) / 2,
    });
    canvas.renderAll();
  } else if (top < 0 && left > 0) {
    obj
      .set({ cropX: left / cropobj.get('scaleX'), width: width })
      .setCoords();
    canvas.renderAll();
    obj.set({
      left: cleft + (obj.get('width') * obj.get('scaleX')) / 2,
    });
    canvas.renderAll();
  } else if (top > 0 && left > 0) {
    obj
      .set({
        cropX: left / cropobj.get('scaleX'),
        cropY: top / cropobj.get('scaleY'),
        height: height,
        width: width,
      })
      .setCoords();
    canvas.renderAll();
    obj.set({
      left: cleft + (obj.get('width') * obj.get('scaleX')) / 2,
      top: ctop + (obj.get('height') * obj.get('scaleY')) / 2,
    });
    canvas.renderAll();
  }
  if (obj.get('id') != 'cropped') {
    canvas.remove(crop);
    canvas.remove(canvas.getItemById('overlay'));
    canvas.remove(canvas.getItemById('cropped'));
    cropping = false;
    resetControls();
    canvas.uniformScaling = true;
    canvas.renderAll();
    newKeyframe('scaleX', obj, currenttime, obj.get('scaleX'), true);
    newKeyframe('scaleY', obj, currenttime, obj.get('scaleY'), true);
    newKeyframe('width', obj, currenttime, obj.get('width'), true);
    newKeyframe('height', obj, currenttime, obj.get('width'), true);
    newKeyframe('left', obj, currenttime, obj.get('left'), true);
    newKeyframe('top', obj, currenttime, obj.get('top'), true);
    $('#properties-overlay').removeClass('properties-disabled');
    save();
  }
  canvas.renderAll();
}

var tlcrop = new Image();
tlcrop.src = 'assets/tlcrop.svg';
var trcrop = new Image();
trcrop.src = 'assets/trcrop.svg';
var blcrop = new Image();
blcrop.src = 'assets/blcrop.svg';
var brcrop = new Image();
brcrop.src = 'assets/brcrop.svg';

function overlay() {
  canvas.add(
    new fabric.Rect({
      left: artboard.left,
      top: artboard.top,
      originX: 'left',
      originY: 'top',
      width: artboard.width,
      height: artboard.height,
      fill: 'rgba(0,0,0,0.5)',
      selectable: false,
      id: 'overlay',
    })
  );
}

// Start cropping an image
function cropImage(object) {
  if (!cropping) {
    $('#properties-overlay').addClass('properties-disabled');
    cropping = true;
    cropobj = object;
    canvas.uniformScaling = false;
    cropobj.setCoords();
    var left =
      cropobj.get('left') -
      (cropobj.get('width') * cropobj.get('scaleX')) / 2;
    var top =
      cropobj.get('top') -
      (cropobj.get('height') * cropobj.get('scaleY')) / 2;
    var cropx = cropobj.get('cropX');
    var cropy = cropobj.get('cropY');
    overlay();
    var cropUI = new fabric.Rect({
      left: object.get('left'),
      top: object.get('top'),
      width: object.get('width') * object.get('scaleX') - 5,
      height: object.get('height') * object.get('scaleY') - 5,
      originX: 'center',
      originY: 'center',
      id: 'crop',
      fill: 'rgba(0,0,0,0)',
      shadow: {
        color: 'black',
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        opacity: 0,
      },
    });
    cropobj.clone(function (cloned) {
      cloned.set({
        id: 'cropped',
        selectable: false,
        originX: 'center',
        originY: 'center',
      });
      canvas.add(cloned);
      canvas.bringToFront(cloned);
      canvas.bringToFront(cropUI);
      canvas.renderAll();
      cropobj = object;
    });
    cropobj
      .set({
        cropX: 0,
        cropY: 0,
        width: cropobj.get('ogWidth'),
        height: cropobj.get('ogHeight'),
      })
      .setCoords();
    canvas.renderAll();
    cropobj.set({
      left:
        left +
        (cropobj.get('width') * cropobj.get('scaleX')) / 2 -
        cropx * cropobj.get('scaleX'),
      top:
        top +
        (cropobj.get('height') * cropobj.get('scaleY')) / 2 -
        cropy * cropobj.get('scaleY'),
    });
    cropUI.setControlsVisibility({
      mt: false,
      mb: false,
      mr: false,
      ml: false,
      mtr: false,
    });
    cropUI.controls.tl = new fabric.Control({
      x: -0.5,
      y: -0.5,
      offsetX: 3,
      offsetY: 3,
      cursorStyleHandler:
        fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: function (ctx, left, top, styleOverride, fabricObject) {
        const wsize = 27;
        const hsize = 27;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(tlcrop, -wsize / 2, -hsize / 2, wsize, hsize);
        ctx.restore();
      },
    });
    cropUI.controls.tr = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetX: -3,
      offsetY: 3,
      cursorStyleHandler:
        fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: function (ctx, left, top, styleOverride, fabricObject) {
        const wsize = 27;
        const hsize = 27;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(trcrop, -wsize / 2, -hsize / 2, wsize, hsize);
        ctx.restore();
      },
    });
    cropUI.controls.bl = new fabric.Control({
      x: -0.5,
      y: 0.5,
      offsetX: 3,
      offsetY: -3,
      cursorStyleHandler:
        fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: function (ctx, left, top, styleOverride, fabricObject) {
        const wsize = 27;
        const hsize = 27;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(blcrop, -wsize / 2, -hsize / 2, wsize, hsize);
        ctx.restore();
      },
    });
    cropUI.controls.br = new fabric.Control({
      x: 0.5,
      y: 0.5,
      offsetX: -3,
      offsetY: -3,
      cursorStyleHandler:
        fabric.controlsUtils.scaleCursorStyleHandler,
      actionHandler: fabric.controlsUtils.scalingEqually,
      render: function (ctx, left, top, styleOverride, fabricObject) {
        const wsize = 27;
        const hsize = 27;
        ctx.save();
        ctx.translate(left, top);
        ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
        ctx.drawImage(brcrop, -wsize / 2, -hsize / 2, wsize, hsize);
        ctx.restore();
      },
    });
    canvas.add(cropUI);
    canvas.setActiveObject(cropUI);
    canvas.renderAll();
    cropleft = cropUI.get('left');
    croptop = cropUI.get('top');
    cropscalex = cropUI.get('scaleX') - 0.03;
    cropscaley = cropUI.get('scaleY') - 0.03;
  }
}
$(document).on('click', '#crop-image', function () {
  if (canvas.getActiveObject()) {
    cropImage(canvas.getActiveObject());
  }
});

// Add an image to the canvas
function newImage(file, x, y, width, center) {
  var newimg = new fabric.Image(file, {
    left: x,
    top: y,
    originX: 'center',
    originY: 'center',
    stroke: '#000',
    strokeUniform: true,
    strokeWidth: 0,
    paintFirst: 'stroke',
    absolutePositioned: true,
    id: 'Image' + layer_count,
    inGroup: false,
    strokeDashArray: false,
    objectCaching: true,
    shadow: {
      color: 'black',
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      opacity: 0,
    },
  });
  files.push({ name: newimg.get('id'), file: file.src });
  canvas.add(newimg);
  newimg.scaleToWidth(width);
  newimg.set({
    scaleX: parseFloat(newimg.get('scaleX').toFixed(2)),
    scaleY: parseFloat(newimg.get('scaleY').toFixed(2)),
    ogWidth: newimg.get('width'),
    ogHeight: newimg.get('height'),
  });
  canvas.bringToFront(newimg);
  canvas.renderAll();
  newLayer(newimg);
  canvas.setActiveObject(newimg);
  if (center) {
    newimg.set(
      'left',
      artboard.get('left') + artboard.get('width') / 2
    );
    newimg.set(
      'top',
      artboard.get('top') + artboard.get('height') / 2
    );
    canvas.renderAll();
  }
  $('#load-image').removeClass('loading-active');
}

function loadImage(src, x, y, width, center) {
  var image = new Image();
  image.onload = function (img) {
    newImage(image, x, y, width, center);
  };
  image.src = src;
}

function createVideoThumbnail(file, max, seekTo = 0.0, isURL) {
  return new Promise((resolve, reject) => {
    const videoPlayer = document.createElement('video');
    if (isURL) {
      videoPlayer.setAttribute('src', file);
    } else {
      videoPlayer.setAttribute('src', URL.createObjectURL(file));
    }
    videoPlayer.setAttribute('crossorigin', 'anonymous');
    videoPlayer.load();
    videoPlayer.addEventListener('error', (ex) => {
      reject('error when loading video file', ex);
    });
    videoPlayer.addEventListener('loadedmetadata', () => {
      if (videoPlayer.duration < seekTo) {
        reject('video is too short.');
        return;
      }
      setTimeout(() => {
        videoPlayer.currentTime = seekTo;
      }, 200);
      videoPlayer.addEventListener('seeked', () => {
        var oc = document.createElement('canvas');
        var octx = oc.getContext('2d');
        oc.width = videoPlayer.videoWidth;
        oc.height = videoPlayer.videoheight;
        octx.drawImage(videoPlayer, 0, 0);
        if (videoPlayer.videoWidth > videoPlayer.videoHeight) {
          oc.height =
            (videoPlayer.videoHeight / videoPlayer.videoWidth) * max;
          oc.width = max;
        } else {
          oc.width =
            (videoPlayer.videoWidth / videoPlayer.videoHeight) * max;
          oc.height = max;
        }
        octx.drawImage(oc, 0, 0, oc.width, oc.height);
        octx.drawImage(videoPlayer, 0, 0, oc.width, oc.height);
        resolve(oc.toDataURL());
      });
    });
  });
}

function createThumbnail(file, max) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function (event) {
      var img = new Image();
      img.onload = function () {
        if (img.width > max) {
          var oc = document.createElement('canvas');
          var octx = oc.getContext('2d');
          oc.width = img.width;
          oc.height = img.height;
          octx.drawImage(img, 0, 0);
          if (img.width > img.height) {
            oc.height = (img.height / img.width) * max;
            oc.width = max;
          } else {
            oc.width = (img.width / img.height) * max;
            oc.height = max;
          }
          octx.drawImage(oc, 0, 0, oc.width, oc.height);
          octx.drawImage(img, 0, 0, oc.width, oc.height);
          resolve(oc.toDataURL());
        } else {
          resolve(img.src);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], { type: mimeString });
  return blob;
}

async function uploadFromURL() {
  var url = $('#upload-link-input').val();
  let file = await fetch(url).then((r) => r.blob());
  if (file.type.split('/')[0] === 'image') {
    $('#upload-link-input').val('');
    $('.upload-show').removeClass('upload-show');
    createThumbnail(file, 250).then(function (data) {
      saveFile(
        dataURItoBlob(data),
        file,
        file.type.split('/')[0],
        'temp',
        false,
        false
      );
    });
  } else if (file.type.split('/')[0] === 'video') {
    $('.upload-show').removeClass('upload-show');
    createVideoThumbnail(file, 250, 0, false).then(function (data) {
      saveFile(
        dataURItoBlob(data),
        file,
        file.type.split('/')[0],
        'temp',
        false,
        false
      );
    });
    $('#upload-link-input').val('');
  } else {
    alert('File type not accepted');
  }
}
$(document).on('click', '#upload-link-add', uploadFromURL);

function handleUpload(custom = false) {
  var files2;
  if (custom == false) {
    files2 = $('#filepick').get(0).files;
  } else {
    files2 = custom.originalEvent.dataTransfer.files;
  }
  if (files2) {
    Array.from(files2).forEach((file) => {
      uploading = true;
      if (file.size / 1024 / 1024 <= 10) {
        $('#upload-button').html(
          "<img src='assets/upload.svg'> Uploading..."
        );
        $('#upload-button').addClass('uploading');
        if (file['type'].split('/')[0] === 'image') {
          $('.upload-show').removeClass('upload-show');
          createThumbnail(file, 250).then(function (data) {
            saveFile(
              dataURItoBlob(data),
              file,
              file['type'].split('/')[0],
              'temp',
              false,
              false
            );
          });
        } else if (file['type'].split('/')[0] === 'video') {
          $('.upload-show').removeClass('upload-show');
          createVideoThumbnail(file, 250, 0, false).then(function (
            data
          ) {
            saveFile(
              dataURItoBlob(data),
              file,
              file['type'].split('/')[0],
              'temp',
              false,
              false
            );
          });
        } else {
          alert('File type not accepted');
        }
      } else {
        alert('File is too big');
      }
    });
    if (files2.length == 1) {
      if (files2[0]['type'].split('/')[0] === 'image') {
        $('.upload-tab-active').removeClass('upload-tab-active');
        $('#images-tab').addClass('upload-tab-active');
      } else if (files2[0]['type'].split('/')[0] === 'video') {
        $('.upload-tab-active').removeClass('upload-tab-active');
        $('#videos-tab').addClass('upload-tab-active');
      } else if (files2[0]['type'].split('/')[0] === 'audio') {
        $('.upload-tab-active').removeClass('upload-tab-active');
        $('#audio-tab').addClass('upload-tab-active');
      }
    }
  }
}
$(document).on('change', '#filepick', function () {
  handleUpload(false);
});

// Upload audio
function audioUpload() {
  const files = $('#filepick2').get(0).files;
  if (files) {
    if (files.length == 1) {
      if (files[0]['type'].split('/')[0] === 'audio') {
        if (files[0].size / 1024 / 1024 <= 10) {
          $('#audio-upload-button').html('Uploading...');
          $('#audio-upload-button').addClass('uploading');
          saveAudio(files[0]);
        } else {
          alert('File is too big');
        }
      } else {
        alert('Wrong file type');
      }
    }
  }
}
$(document).on('change', '#filepick2', audioUpload);

// Create a rectangle
function newRectangle(color) {
  var newrect = new fabric.Rect({
    left: 0,
    top: 0,
    originX: 'center',
    originY: 'center',
    width: 200,
    height: 200,
    stroke: '#000',
    strokeWidth: 0,
    strokeUniform: true,
    backgroundColor: 'rgba(255,255,255,0)',
    rx: 0,
    ry: 0,
    fill: color,
    cursorWidth: 1,
    cursorDuration: 1,
    paintFirst: 'stroke',
    cursorDelay: 250,
    strokeDashArray: false,
    inGroup: false,
    id: 'Shape' + layer_count,
    shadow: {
      color: '#000',
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      opacity: 0,
    },
  });
  canvas.add(newrect);
  newLayer(newrect);
  canvas.setActiveObject(newrect);
  canvas.bringToFront(newrect);
  canvas.renderAll();
}

// Change text format
function formatText() {
  var isselected = false;
  if (!canvas.getActiveObject().isEditing) {
    canvas.getActiveObject().enterEditing();
    canvas.getActiveObject().selectAll();
    isselected = true;
  }
  if ($(this).hasClass('format-text-active')) {
    if ($(this).attr('id') == 'format-bold') {
      $(this).find('img').attr('src', 'assets/bold.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ fontWeight: 'normal' });
    } else if ($(this).attr('id') == 'format-italic') {
      $(this).find('img').attr('src', 'assets/italic.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ fontStyle: 'normal' });
    } else if ($(this).attr('id') == 'format-underline') {
      $(this).find('img').attr('src', 'assets/underline.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ underline: false });
    } else {
      $(this).find('img').attr('src', 'assets/strike.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ linethrough: false });
    }
    $(this).removeClass('format-text-active');
  } else {
    $(this).addClass('format-text-active');
    if ($(this).attr('id') == 'format-bold') {
      $(this).find('img').attr('src', 'assets/bold-active.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ fontWeight: 'bold' });
    } else if ($(this).attr('id') == 'format-italic') {
      $(this).find('img').attr('src', 'assets/italic-active.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ fontStyle: 'italic' });
    } else if ($(this).attr('id') == 'format-underline') {
      $(this).find('img').attr('src', 'assets/underline-active.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ underline: true });
    } else {
      $(this).find('img').attr('src', 'assets/strike-active.svg');
      canvas
        .getActiveObject()
        .setSelectionStyles({ linethrough: true });
    }
  }
  if (isselected) {
    canvas.getActiveObject().exitEditing();
  }
  canvas.renderAll();
  save();
}
$(document).on('click', '.format-text', formatText);

// Change stroke type (e.g. dashed), ignore naming (used to be for line join)
function lineJoin() {
  if ($('.line-join-active').attr('id') == 'miter') {
    $('.line-join-active')
      .find('img')
      .attr('src', 'assets/miter.svg');
  } else if ($('.line-join-active').attr('id') == 'bevel') {
    $('.line-join-active')
      .find('img')
      .attr('src', 'assets/bevel.svg');
  } else if ($('.line-join-active').attr('id') == 'round') {
    $('.line-join-active')
      .find('img')
      .attr('src', 'assets/round.svg');
  } else if ($('.line-join-active').attr('id') == 'small-dash') {
    $('.line-join-active')
      .find('img')
      .attr('src', 'assets/dash2.svg');
  }
  $('.line-join-active').removeClass('line-join-active');
  $(this).addClass('line-join-active');
  if ($(this).attr('id') == 'miter') {
    $(this).find('img').attr('src', 'assets/miter-active.svg');
    canvas
      .getActiveObject()
      .set({ strokeWidth: 0, strokeDashArray: false });
    canvas.renderAll();
    updatePanelValues();
  } else if ($(this).attr('id') == 'bevel') {
    $(this).find('img').attr('src', 'assets/bevel-active.svg');
    canvas.getActiveObject().set({ strokeDashArray: false });
    if (canvas.getActiveObject().get('strokeWidth') == 0) {
      canvas.getActiveObject().set({ strokeWidth: 1 });
      canvas.renderAll();
      updatePanelValues();
    }
  } else if ($(this).attr('id') == 'round') {
    $(this).find('img').attr('src', 'assets/round-active.svg');
    canvas.getActiveObject().set({ strokeDashArray: [10, 5] });
    if (canvas.getActiveObject().get('strokeWidth') == 0) {
      canvas.getActiveObject().set({ strokeWidth: 1 });
      canvas.renderAll();
      updatePanelValues();
    }
  } else {
    $(this).find('img').attr('src', 'assets/dash2-active.svg');
    canvas.getActiveObject().set({ strokeDashArray: [3, 3] });
    if (canvas.getActiveObject().get('strokeWidth') == 0) {
      canvas.getActiveObject().set({ strokeWidth: 1 });
      canvas.renderAll();
      updatePanelValues();
    }
  }
  canvas.renderAll();
  save();
}
$(document).on('click', '.line-join', lineJoin);

// Change text alignment
function alignText() {
  var textalign;
  if ($('.align-text-active').attr('id') == 'align-text-left') {
    $('.align-text-active')
      .find('img')
      .attr('src', 'assets/align-text-left.svg');
  } else if (
    $('.align-text-active').attr('id') == 'align-text-center'
  ) {
    $('.align-text-active')
      .find('img')
      .attr('src', 'assets/align-text-center.svg');
  } else if (
    $('.align-text-active').attr('id') == 'align-text-right'
  ) {
    $('.align-text-active')
      .find('img')
      .attr('src', 'assets/align-text-right.svg');
  } else {
    $('.align-text-active')
      .find('img')
      .attr('src', 'assets/align-text-justify.svg');
  }
  $('.align-text-active').removeClass('align-text-active');
  $(this).addClass('align-text-active');
  if ($(this).attr('id') == 'align-text-left') {
    textalign = 'left';
    $(this)
      .find('img')
      .attr('src', 'assets/align-text-left-active.svg');
  } else if ($(this).attr('id') == 'align-text-center') {
    textalign = 'center';
    $(this)
      .find('img')
      .attr('src', 'assets/align-text-center-active.svg');
  } else if ($(this).attr('id') == 'align-text-right') {
    textalign = 'right';
    $(this)
      .find('img')
      .attr('src', 'assets/align-text-right-active.svg');
  } else {
    textalign = 'justify';
    $(this)
      .find('img')
      .attr('src', 'assets/align-text-justify-active.svg');
  }
  canvas.getActiveObject().set({ textAlign: textalign });
  canvas.renderAll();
  save();
}
$(document).on('click', '.align-text', alignText);

// Change font
function changeFont() {
  var font = $('#font-picker').val();
  if (canvas.getActiveObject().get('assetType')) {
    WebFont.load({
      google: {
        families: [font],
      },
      active: () => {
        var object = canvas.getActiveObject();
        animatedtext
          .find((x) => x.id == object.id)
          .reset(
            animatedtext.find((x) => x.id == object.id).text,
            $.extend(
              animatedtext.find((x) => x.id == object.id).props,
              { fontFamily: font }
            ),
            canvas
          );
        save();
      },
    });
    save();
  } else {
    WebFont.load({
      google: {
        families: [font],
      },
      active: () => {
        canvas.getActiveObject().set('fontFamily', font);
        canvas.renderAll();
        save();
      },
    });
  }
}
$(document).on('change', '#font-picker', changeFont);

// Calculate text width to display it in 1 line
function calculateTextWidth(text, font) {
  var ctx = canvas.getContext('2d');
  ctx.font = font;
  return ctx.measureText(text).width + 10;
}

// Create an audio layer
function newAudioLayer(src) {
  var audio = new Audio(src);
  audio.crossOrigin = 'anonymous';
  audio.addEventListener('loadeddata', () => {
    var nullobject = new fabric.Rect({
      id: 'Audio' + layer_count,
      width: 10,
      height: 10,
      audioSrc: src,
      duration: audio.duration * 1000,
      opacity: 0,
      selectable: false,
      volume: 0.5,
      assetType: 'audio',
      shadow: {
        color: '#000',
        offsetX: 0,
        offsetY: 0,
        blur: 0,
        opacity: 0,
      },
    });
    canvas.add(nullobject);
    newLayer(nullobject);
  });
}

// Create a textbox
function newTextbox(
  fontsize,
  fontweight,
  text,
  x,
  y,
  width,
  center,
  font
) {
  var newtext = new fabric.Textbox(text, {
    left: x,
    top: y,
    originX: 'center',
    originY: 'center',
    fontFamily: 'Inter',
    fill: '#000',
    fontSize: fontsize,
    fontWeight: fontweight,
    textAlign: 'center',
    cursorWidth: 1,
    stroke: '#000',
    strokeWidth: 0,
    cursorDuration: 1,
    paintFirst: 'stroke',
    objectCaching: false,
    absolutePositioned: true,
    strokeUniform: true,
    inGroup: false,
    cursorDelay: 250,
    strokeDashArray: false,
    width: calculateTextWidth(
      text,
      fontweight + ' ' + fontsize + 'px Inter'
    ),
    id: 'Text' + layer_count,
    shadow: {
      color: '#000',
      offsetX: 0,
      offsetY: 0,
      blur: 0,
      opacity: 0,
    },
  });
  newtext.setControlsVisibility({
    mt: false,
    mb: false,
  });
  canvas.add(newtext);
  newLayer(newtext);
  canvas.setActiveObject(newtext);
  canvas.bringToFront(newtext);
  newtext.enterEditing();
  newtext.selectAll();
  canvas.renderAll();
  if (center) {
    newtext.set(
      'left',
      artboard.get('left') + artboard.get('width') / 2
    );
    newtext.set(
      'top',
      artboard.get('top') + artboard.get('height') / 2
    );
    canvas.renderAll();
  }
  canvas.getActiveObject().set('fontFamily', font);
  canvas.renderAll();
}

function deleteObject(object, def = true) {
  if (object.get('assetType') == 'animatedText' && def) {
    animatedtext = $.grep(animatedtext, function (a) {
      return a.id != object.id;
    });
  }
  if (object.type == 'image') {
    var temp = files.find((x) => x.name == object.get('id'));
    files = $.grep(files, function (a) {
      return a != temp.name;
    });
  }
  $(".layer[data-object='" + object.get('id') + "']").remove();
  $('#' + object.get('id')).remove();
  keyframes = $.grep(keyframes, function (e) {
    return e.id != object.get('id');
  });
  p_keyframes = $.grep(p_keyframes, function (e) {
    return e.id != object.get('id');
  });
  objects = $.grep(objects, function (e) {
    return e.id != object.get('id');
  });
  canvas.remove(object);
  canvas.renderAll();
  canvas.discardActiveObject();
  save();
  if (objects.length == 0) {
    $('#nolayers').removeClass('yaylayers');
  }
}

// Delete selected object
function deleteSelection() {
  if (
    canvas.getActiveObject() &&
    !canvas.getActiveObject().isEditing
  ) {
    const selection = canvas.getActiveObject();
    if (selection.type == 'activeSelection') {
      canvas.discardActiveObject();
      selection._objects.forEach(function (object) {
        deleteObject(object);
      });
    } else {
      deleteObject(canvas.getActiveObject());
    }
  }
}

// Expand / collapse layer
function toggleLayer() {
  const layerid = $(this).parent().parent().attr('data-object');
  $(this).parent().parent().find('.properties').toggle();
  $(this).parent().parent().find('.droparrow').toggleClass('layeron');
  $(".keyframe-row[data-object='" + layerid + "']").toggle();
  setTimelineZoom(timelinetime);
}
$(document).on('click', '.droparrow', toggleLayer);

// Select layer
function selectLayer(e) {
  if (!$(e.target).hasClass('droparrow')) {
    const layerid = $(this).parent().attr('data-object');
    $('.layer-selected').removeClass('layer-selected');
    $(this).parent().addClass('layer-selected');
    canvas.setActiveObject(canvas.getItemById(layerid));
  }
}
$(document).on('click', '.layer-name', selectLayer);

// Set video duration
function setDuration(length) {
  $('#inner-timeline').css('width', length / timelinetime + 50);
  $('#inner-seekarea').css('width', length / timelinetime + 50);
  duration = length;
  var minutes = Math.floor(duration / 1000 / 60);
  var seconds = (duration / 1000 - minutes * 60).toFixed(2);
  $('#total-time input').val(
    ('0' + minutes).slice(-2) +
      ':' +
      ('0' + Math.floor(seconds)).slice(-2) +
      ':' +
      ('0' + Math.floor((seconds % 1) * 100)).slice(-2)
  );
  $('.object-props').each(function () {
    $(this).css(
      'width',
      duration / timelinetime -
        p_keyframes.find((x) => x.id == $(this).attr('id')).start /
          timelinetime +
        'px'
    );
    p_keyframes.find((x) => x.id == $(this).attr('id')).end =
      duration;
    if (
      p_keyframes.find((x) => x.id == $(this).attr('id')).trimend >
      p_keyframes.find((x) => x.id == $(this).attr('id')).end
    ) {
      p_keyframes.find((x) => x.id == $(this).attr('id')).trimend =
        duration;
      $(this)
        .find('.trim-row')
        .css(
          'width',
          duration / timelinetime -
            p_keyframes.find((x) => x.id == $(this).attr('id'))
              .trimstart /
              timelinetime +
            'px'
        );
    }
  });
  setTimelineZoom(timelinetime);
  save();
}

// Render time markers
function renderTimeMarkers() {
  var renderoffset = 1000 / timelinetime - 20;
  var timenumber = 0;
  var modulo = 1;
  if (timelinetime > 18) {
    modulo = 5;
  } else if (timelinetime > 12) {
    modulo = 2;
  }
  $('#time-numbers').html('');
  $('#time-numbers').append(
    "<div class='time-number' style='margin-left:" +
      offset_left +
      "px'>" +
      timenumber +
      's<span></span></div>'
  );
  timenumber++;
  while (timenumber * 1000 <= duration) {
    $('#time-numbers').append(
      "<div class='time-number' style='margin-left:" +
        renderoffset +
        "px'>" +
        timenumber +
        's<span></span></div>'
    );
    if (timenumber % modulo != 0) {
      $('.time-number:last-child()').css('opacity', '0');
    }
    timenumber++;
  }
}

// Change timeline zoom level
function setTimelineZoom(time) {
  $('.object-props').each(function () {
    $(this).offset({
      left:
        p_keyframes.find((x) => x.id == $(this).attr('id')).start /
          time +
        $('#inner-timeline').offset().left +
        offset_left,
    });
    $(this).css({ width: ($(this).width() * timelinetime) / time });
    $(this)
      .find('.trim-row')
      .css({
        left:
          p_keyframes.find((x) => x.id == $(this).attr('id'))
            .trimstart / time,
      });
    $(this)
      .find('.trim-row')
      .css({
        width:
          ($(this).find('.trim-row').width() * timelinetime) / time,
      });
  });
  timelinetime = time;
  $('.keyframe').each(function () {
    $(this).offset({
      left:
        $(this).attr('data-time') / timelinetime +
        $('#inner-timeline').offset().left +
        offset_left,
    });
  });
  $('#seekbar').offset({
    left:
      $('#inner-timeline').offset().left +
      currenttime / timelinetime +
      offset_left,
  });
  $('#inner-timeline').css({ width: duration / timelinetime + 50 });
  $('#inner-seekarea').css({
    minWidth: duration / timelinetime + 50,
  });
  renderTimeMarkers();
}
$(document).on('input', '#timeline-zoom', function () {
  setTimelineZoom($('#timeline-zoom').val());
});

function removeKeyframe() {
  keyframes = $.grep(keyframes, function (e) {
    return (
      e.t != selectedkeyframe.attr('data-time') ||
      e.id != selectedkeyframe.attr('data-object') ||
      e.name != selectedkeyframe.attr('data-property')
    );
  });
  if (selectedkeyframe.attr('data-property') == 'left') {
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'top'
      );
    });
  } else if (selectedkeyframe.attr('data-property') == 'scaleX') {
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'scaleY'
      );
    });
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'width'
      );
    });
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'height'
      );
    });
  } else if (
    selectedkeyframe.attr('data-property') == 'strokeWidth'
  ) {
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'stroke'
      );
    });
  } else if (
    selectedkeyframe.attr('data-property') == 'shadow.color'
  ) {
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'shadow.blur'
      );
    });
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'shadow.offsetX'
      );
    });
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'shadow.offsetY'
      );
    });
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'shadow.opacity'
      );
    });
  } else if (
    selectedkeyframe.attr('data-property') == 'charSpacing'
  ) {
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != selectedkeyframe.attr('data-time') ||
        e.id != selectedkeyframe.attr('data-object') ||
        e.name != 'lineHeight'
      );
    });
  }
  selectedkeyframe.remove();
  $('#keyframe-properties').removeClass('show-properties');
}

// Delete a keyframe
function deleteKeyframe() {
  if (shiftkeys.length > 0) {
    shiftkeys.forEach(function (key) {
      selectedkeyframe = $(key.keyframe);
      removeKeyframe();
    });
    shiftkeys = [];
  } else {
    removeKeyframe();
  }
  animate(false, currenttime);
  save();
}
$(document).on('click', '#delete-keyframe', deleteKeyframe);

// Copy keyframes
function copyKeyframes() {
  clipboard.sort(function (a, b) {
    return a.t - b.t;
  });
  var inittime = clipboard[0].t;
  clipboard.forEach(function (keyframe) {
    var newtime = keyframe.t - inittime + currenttime;
    newKeyframe(
      keyframe.name,
      canvas.getItemById(keyframe.id),
      newtime,
      keyframe.value,
      true
    );
    var keyprop = keyframe.name;
    if (keyprop == 'left') {
      const keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t && e.id == keyframe.id && e.name == 'top'
        );
      });
      newKeyframe(
        'top',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
    } else if (keyprop == 'scaleX') {
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'scaleY'
        );
      });
      newKeyframe(
        'scaleY',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'width'
        );
      });
      if (keyarr2.length > 0) {
        newKeyframe(
          'width',
          canvas.getItemById(keyframe.id),
          newtime,
          keyarr2[0].value,
          true
        );
      }
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'height'
        );
      });
      if (keyarr2.length > 0) {
        newKeyframe(
          'height',
          canvas.getItemById(keyframe.id),
          newtime,
          keyarr2[0].value,
          true
        );
      }
    } else if (keyprop == 'strokeWidth') {
      const keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'stroke'
        );
      });
      newKeyframe(
        'stroke',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
    } else if (keyprop == 'charSpacing') {
      const keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'lineHeight'
        );
      });
      newKeyframe(
        'lineHeight',
        canvas.getItemByid(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
    } else if (keyprop == 'shadow.color') {
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'shadow.opacity'
        );
      });
      newKeyframe(
        'shadow.opacity',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'shadow.offsetX'
        );
      });
      newKeyframe(
        'shadow.offsetX',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'shadow.offsetY'
        );
      });

      newKeyframe(
        'shadow.offsetY',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
      var keyarr2 = $.grep(keyframes, function (e) {
        return (
          e.t == keyframe.t &&
          e.id == keyframe.id &&
          e.name == 'shadow.blur'
        );
      });
      newKeyframe(
        'shadow.blur',
        canvas.getItemById(keyframe.id),
        newtime,
        keyarr2[0].value,
        true
      );
    }
    save();
  });
}

// Update keyframe (after dragging)
function updateKeyframe(drag, newval, offset) {
  var time = parseFloat(
    (drag.position().left * timelinetime).toFixed(1)
  );
  const keyprop = drag.attr('data-property');
  const keytime = drag.attr('data-time');
  const keyarr = $.grep(keyframes, function (e) {
    return (
      e.t == parseFloat(keytime) &&
      e.id == drag.attr('data-object') &&
      e.name == keyprop
    );
  });
  const keyobj = canvas.getItemById(keyarr[0].id);
  time =
    parseFloat(
      p_keyframes.find((x) => x.id == keyobj.get('id')).start
    ) + time;
  if (newval) {
    time = currenttime;
  }
  var keyval = keyarr[0].value;
  if (newval) {
    if (keyprop == 'shadow.color') {
      keyval = keyobj.shadow.color;
    } else if (keyprop == 'volume') {
      keyval = parseFloat($('#object-volume input').val() / 200);
    } else {
      keyval = keyobj.get(keyprop);
    }
  } else if (keyprop == 'left') {
    keyval = keyval + artboard.get('left');
  }
  keyframes = $.grep(keyframes, function (e) {
    return (
      e.t != parseFloat(keytime) ||
      e.id != drag.attr('data-object') ||
      e.name != keyprop
    );
  });
  newKeyframe(keyprop, keyobj, time, keyval, false);
  if (keyprop == 'left') {
    const keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'top'
      );
    });
    var keyval2 = keyarr2[0].value + artboard.get('top');
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).get('top');
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'top'
      );
    });
    newKeyframe('top', keyobj, time, keyval2, false);
  } else if (keyprop == 'scaleX') {
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'scaleY'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).get('scaleY');
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'scaleY'
      );
    });
    newKeyframe('scaleY', keyobj, time, keyval2, false);
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'width'
      );
    });
    if (keyarr2.length > 0) {
      var keyval2 = keyarr2[0].value;
      if (newval) {
        keyval2 = canvas.getItemById(keyarr2[0].id).get('width');
      }
      keyframes = $.grep(keyframes, function (e) {
        return (
          e.t != parseFloat(keytime) ||
          e.id != drag.attr('data-object') ||
          e.name != 'width'
        );
      });
      newKeyframe('width', keyobj, time, keyval2, false);
    }
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'height'
      );
    });
    if (keyarr2.length > 0) {
      var keyval2 = keyarr2[0].value;
      if (newval) {
        keyval2 = canvas.getItemById(keyarr2[0].id).get('height');
      }
      keyframes = $.grep(keyframes, function (e) {
        return (
          e.t != parseFloat(keytime) ||
          e.id != drag.attr('data-object') ||
          e.name != 'height'
        );
      });
      newKeyframe('height', keyobj, time, keyval2, false);
    }
  } else if (keyprop == 'strokeWidth') {
    const keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'stroke'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).get('stroke');
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'stroke'
      );
    });
    newKeyframe('stroke', keyobj, time, keyval2, false);
  } else if (keyprop == 'charSpacing') {
    const keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'lineHeight'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).get('lineHeight');
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'lineHeight'
      );
    });
    newKeyframe('lineHeight', keyobj, time, keyval2, false);
  } else if (keyprop == 'shadow.color') {
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'shadow.opacity'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).shadow.opacity;
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'shadow.opacity'
      );
    });
    newKeyframe('shadow.opacity', keyobj, time, keyval2, false);
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'shadow.offsetX'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).shadow.offsetX;
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'shadow.offsetX'
      );
    });
    newKeyframe('shadow.offsetX', keyobj, time, keyval2, false);
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'shadow.offsetY'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).shadow.offsetY;
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'shadow.offsetY'
      );
    });
    newKeyframe('shadow.offsetY', keyobj, time, keyval2, false);
    var keyarr2 = $.grep(keyframes, function (e) {
      return (
        e.t == parseFloat(keytime) &&
        e.id == drag.attr('data-object') &&
        e.name == 'shadow.blur'
      );
    });
    var keyval2 = keyarr2[0].value;
    if (newval) {
      keyval2 = canvas.getItemById(keyarr2[0].id).shadow.blur;
    }
    keyframes = $.grep(keyframes, function (e) {
      return (
        e.t != parseFloat(keytime) ||
        e.id != drag.attr('data-object') ||
        e.name != 'shadow.blur'
      );
    });
    newKeyframe('shadow.blur', keyobj, time, keyval2, false);
  }
  if (offset) {
    drag.attr('data-time', time);
  } else {
    drag.attr(
      'data-time',
      time + p_keyframes.find((x) => x.id == keyarr[0].id).start
    );
  }
  keyframes.sort(function (a, b) {
    if (a.id.indexOf('Group') >= 0 && b.id.indexOf('Group') == -1) {
      return 1;
    } else if (
      b.id.indexOf('Group') >= 0 &&
      a.id.indexOf('Group') == -1
    ) {
      return -1;
    } else {
      return 0;
    }
  });
}

function keyframeSnap(drag) {
  if (shiftkeys.length == 0) {
    if (
      drag.offset().left > $('#seekbar').offset().left - 5 &&
      drag.offset().left < $('#seekbar').offset().left + 5
    ) {
      drag.offset({ left: $('#seekbar').offset().left });
      $('#line-snap').offset({
        left: $('#seekbar').offset().left,
        top: drag.parent().parent().offset().top,
      });
      $('#line-snap').css({
        height: drag.parent().parent().height(),
      });
      $('#line-snap').addClass('line-active');
    } else {
      drag
        .parent()
        .parent()
        .find('.keyframe')
        .each(function (index) {
          if (!drag.is($(this))) {
            if (
              drag.offset().left > $(this).offset().left - 5 &&
              drag.offset().left < $(this).offset().left + 5
            ) {
              drag.offset({ left: $(this).offset().left });
              $('#line-snap').offset({
                left: $(this).offset().left,
                top: drag.parent().parent().offset().top,
              });
              $('#line-snap').css({
                height: drag.parent().parent().height(),
              });
              $('#line-snap').addClass('line-active');
              return false;
            }
          }
          if (index == $('.keyframe').length - 1) {
            $('#line-snap').removeClass('line-active');
          }
        });
    }
  }
}

// Dragging a keyframe
function dragKeyframe(e) {
  if (e.which == 3) {
    return false;
  }
  e.stopPropagation();
  e.preventDefault();
  var inst = this;
  var drag = $(this);
  var pageX = e.pageX;
  var offset = $(this).offset();
  var move = false;
  if (e.shiftKey) {
    if (!$(this).hasClass('keyframe-selected')) {
      shiftkeys.push({
        keyframe: this,
        offset: $(this).offset().left,
      });
      $(this).addClass('keyframe-selected');
    } else {
      shiftkeys = $.grep(shiftkeys, function (e) {
        return e.keyframe != this;
      });
      $(this).removeClass('keyframe-selected');
    }
  }
  if (shiftkeys.length > 0) {
    shiftkeys.forEach(function (key) {
      key.offset = $(key.keyframe).offset().left;
    });
  }
  function draggingKeyframe(e) {
    move = true;
    var left = offset.left + (e.pageX - pageX);
    if (shiftkeys.length == 0) {
      if (left > $('#timearea').offset().left + offset_left) {
        drag.offset({ left: left });
      } else {
        drag.offset({
          left: $('#timearea').offset().left + offset_left,
        });
      }
      keyframeSnap(drag);
    } else {
      shiftkeys.forEach(function (key) {
        if (key.keyframe != inst) {
          $(key.keyframe).offset({
            left: key.offset + (e.pageX - pageX),
          });
          keyframeSnap($(key.keyframe));
        } else {
          drag.offset({ left: left });
          keyframeSnap(drag);
        }
      });
    }
  }
  function releasedKeyframe(e) {
    $('body')
      .off('mousemove', draggingKeyframe)
      .off('mouseup', releasedKeyframe);
    $('#line-snap').removeClass('line-active');
    if (move) {
      if (shiftkeys.length == 0) {
        // Check for 60FPS playback, 16ms "slots"
        var time = parseFloat(
          (drag.position().left * timelinetime).toFixed(1)
        );
        if (time % 16.666 != 0) {
          drag.offset({
            left:
              (Math.ceil(time / 16.666) * 16.666) / timelinetime +
              drag.parent().offset().left,
          });
          updateKeyframe(drag, false);
        } else {
          updateKeyframe(drag, false);
        }
      } else {
        shiftkeys.forEach(function (key) {
          // Check for 60FPS playback, 16ms "slots"
          var time = parseFloat(
            ($(key.keyframe).position().left * timelinetime).toFixed(
              1
            )
          );
          if (time % 16.666 != 0) {
            $(key.keyframe).offset({
              left:
                (Math.ceil(time / 16.666) * 16.666) / timelinetime +
                $(key.keyframe).parent().offset().left,
            });
            updateKeyframe($(key.keyframe), false);
          } else {
            updateKeyframe($(key.keyframe), false);
          }
        });
      }
    } else if (!e.shiftDown) {
      keyframeProperties(inst);
    }
    move = false;
    $('.line-active').removeClass('line-active');
    save();
  }
  $('body')
    .on('mouseup', releasedKeyframe)
    .on('mousemove', draggingKeyframe);
}
$(document).on('mousedown', '.keyframe', dragKeyframe);

// Render current time in the playback area
function renderTime() {
  var minutes = Math.floor(currenttime / 1000 / 60);
  var seconds = (currenttime / 1000 - minutes * 60).toFixed(2);
  $('#current-time input').val(
    ('0' + minutes).slice(-2) +
      ':' +
      ('0' + Math.floor(seconds)).slice(-2) +
      ':' +
      ('0' + Math.floor((seconds % 1) * 100)).slice(-2)
  );
}

// Update current time (and account for frame "slots")
function updateTime(drag, check) {
  if ($('#timeline').scrollLeft() > offset_left) {
    currenttime = parseFloat(
      (
        (drag.position().left +
          $('#timeline').scrollLeft() -
          offset_left) *
        timelinetime
      ).toFixed(1)
    );
  } else {
    currenttime = parseFloat(
      (
        (drag.position().left +
          $('#timeline').scrollLeft() -
          offset_left) *
        timelinetime
      ).toFixed(1)
    );
  }
  // Check for 60FPS playback, 16ms "slots"
  if (currenttime % 16.666 != 0 && !check) {
    currenttime = Math.ceil(currenttime / 16.666) * 16.666;
  }
  renderTime();
  pause();
  animate(false, currenttime);
}

// Dragging the seekbar
function dragSeekBar(e) {
  if (e.which == 3) {
    return false;
  }
  var drag = $(this);
  var pageX = e.pageX;
  var offset = $(this).offset();
  tempselection = canvas.getActiveObject();
  canvas.discardActiveObject();
  function dragging(e) {
    paused = true;
    var left = offset.left + (e.pageX - pageX);
    if (
      left > $('#timearea').offset().left + offset_left &&
      left - $('#timearea').offset().left <
        duration / timelinetime + offset_left
    ) {
      drag.offset({ left: left });
    } else if (left < $('#timearea').offset().left + offset_left) {
      drag.offset({
        left: offset_left + $('#timearea').offset().left,
      });
    }
    if ($('#timeline').scrollLeft() > offset_left) {
      currenttime = parseFloat(
        (
          (drag.position().left +
            $('#timeline').scrollLeft() -
            offset_left) *
          timelinetime
        ).toFixed(1)
      );
    } else {
      currenttime = parseFloat(
        (
          (drag.position().left +
            $('#timeline').scrollLeft() -
            offset_left) *
          timelinetime
        ).toFixed(1)
      );
    }
    animate(false, currenttime);
    seeking = true;
    renderTime();
  }
  function released(e) {
    $('body').off('mousemove', dragging).off('mouseup', released);
    updateTime(drag, false);
    seeking = false;
    if (tempselection && tempselection.type != 'activeSelection') {
      reselect(tempselection);
    }
    updatePanelValues();
  }
  $('body').on('mouseup', released).on('mousemove', dragging);
}
$(document).on('mousedown', '#seekbar', dragSeekBar);

// Dragging layer horizontally
function dragObjectProps(e) {
  if (e.which == 3) {
    return false;
  }
  var drag = $(this).parent();
  var drag2 = $(this).find('.trim-row');
  var target = e.target;
  var pageX = e.pageX;
  var offset = drag.offset();
  var offset2 = drag2.offset();
  var initwidth = drag2.width();
  var initpos = drag2.position().left;
  var opened = false;
  var trim = 'no';
  // Trim layer to hovered area
  if (e.metaKey) {
    if (e.shiftKey) {
      if (drag2.position().left + e.pageX >= 0) {
        drag2.offset({
          left:
            hovertime / timelinetime -
            p_keyframes.find((x) => x.id == drag.attr('id'))
              .trimstart /
              timelinetime +
            offset2.left,
        });
        const leftval = parseFloat(
          (drag2.position().left * timelinetime).toFixed(1)
        );
        p_keyframes.find((x) => x.id == drag.attr('id')).trimstart =
          leftval;
        drag2.css({
          width:
            (p_keyframes.find((x) => x.id == drag.attr('id'))
              .trimend -
              p_keyframes.find((x) => x.id == drag.attr('id'))
                .trimstart) /
            timelinetime,
        });
        return false;
      }
    } else {
      if (
        hovertime +
          p_keyframes.find((x) => x.id == drag.attr('id')).start <
        duration
      ) {
        drag2.css({
          width:
            hovertime / timelinetime -
            p_keyframes.find((x) => x.id == drag.attr('id'))
              .trimstart /
              timelinetime,
        });
        save();
        p_keyframes.find((x) => x.id == drag.attr('id')).end =
          hovertime;
        p_keyframes.find((x) => x.id == drag.attr('id')).trimend =
          hovertime;
      }
      return false;
    }
  }
  if (pageX - $(this).find('.trim-row').offset().left < 7) {
    trim = 'left';
  } else if (
    pageX - $(this).find('.trim-row').offset().left >
    $(this).find('.trim-row').width() - 7
  ) {
    trim = 'right';
  }
  function dragging(e) {
    if (trim == 'no') {
      var left = offset.left + (e.pageX - pageX);
      if (
        left >
        $('#timearea').offset().left +
          offset_left -
          $('#timeline').scrollLeft()
      ) {
        drag.offset({ left: left });
      } else if (
        left + $('#timeline').scrollLeft() <
        $('#timearea').offset().left + offset_left
      ) {
        drag.css({ left: offset_left });
      }
      p_keyframes.find((x) => x.id == drag.attr('id')).start =
        parseFloat(
          (
            (drag.position().left -
              offset_left +
              $('#timeline').scrollLeft()) *
            timelinetime
          ).toFixed(1)
        );
      p_keyframes.find((x) => x.id == drag.attr('id')).end =
        parseFloat(
          (
            (drag.position().left +
              drag.width() -
              offset_left +
              $('#timeline').scrollLeft()) *
            timelinetime
          ).toFixed(1)
        );
      if (
        $(".keyframe-row[data-object='" + drag.attr('id') + "']").is(
          ':hidden'
        )
      ) {
        opened = true;
        $(".layer[data-object='" + drag.attr('id') + "']")
          .find('.properties')
          .toggle();
        $(".layer[data-object='" + drag.attr('id') + "']")
          .find('.properties')
          .toggleClass('layeron');
        $(
          ".keyframe-row[data-object='" + drag.attr('id') + "']"
        ).toggle();
        setTimelineZoom(timelinetime);
      }
      drag.find('.keyframe').each(function () {
        updateKeyframe($(this), false, true);
      });
      animate(false, currenttime);
    } else if (trim == 'left') {
      if (drag2.position().left + (e.pageX - pageX) >= 0) {
        drag2.offset({
          left: offset2.left + (e.pageX - pageX),
        });
        drag2.css({
          width: initwidth - (-initpos + drag2.position().left),
        });
        const leftval = parseFloat(
          (drag2.position().left * timelinetime).toFixed(1)
        );
        p_keyframes.find((x) => x.id == drag.attr('id')).trimstart =
          leftval;
      }
    } else if (trim == 'right') {
      if (initwidth + (e.pageX - pageX) < duration / timelinetime) {
        drag2.css({
          width: initwidth + (e.pageX - pageX),
        });
      } else {
        drag2.css({
          width:
            duration / timelinetime -
            drag.position().left -
            $('#timeline').scrollLeft() +
            offset_left,
        });
      }
      const rightval = parseFloat(
        (
          (drag2.position().left + drag2.width()) *
          timelinetime
        ).toFixed(1)
      );
      p_keyframes.find((x) => x.id == drag.attr('id')).end = rightval;
      p_keyframes.find((x) => x.id == drag.attr('id')).trimend =
        rightval;
    }
  }
  function released(e) {
    $('body').off('mousemove', dragging).off('mouseup', released);
    if (opened) {
      $(".layer[data-object='" + drag.attr('id') + "']")
        .find('.properties')
        .toggle();
      $(".layer[data-object='" + drag.attr('id') + "']")
        .find('.properties')
        .toggleClass('layeron');
      $(
        ".keyframe-row[data-object='" + drag.attr('id') + "']"
      ).toggle();
      setTimelineZoom(timelinetime);
    }
    animate(false, currenttime);
    save();
  }
  $('body').on('mouseup', released).on('mousemove', dragging);
}
$(document).on('mousedown', '.main-row', dragObjectProps);

function resetHeight() {
  var top = $(window).height() - oldtimelinepos - 92;
  if ($('#upload-tool').hasClass('tool-active')) {
    $('#browser').css('top', '150px');
    $('#browser').css(
      'height',
      'calc(100% - ' + (top + 97 + 150) + 'px)'
    );
  } else {
    $('#browser').css('top', '110px');
    $('#browser').css(
      'height',
      'calc(100% - ' + (top + 97 + 100) + 'px)'
    );
  }
  $('#timearea').css('height', top);
  $('#layer-list').css('height', top);
  $('#toolbar').css('height', 'calc(100% - ' + (top + 97) + 'px)');
  $('#canvas-area').css(
    'height',
    'calc(100% - ' + (top + 97) + 'px)'
  );
  $('#properties').css('height', 'calc(100% - ' + (top + 97) + 'px)');
  $('#timeline-handle').css('bottom', top + 95);
  resizeCanvas();
}

// Dragging timeline vertically
function dragTimeline(e) {
  const disableselect = (e) => {  
    return false  
  }  
  document.onselectstart = disableselect  
  document.onmousedown = disableselect
  
  oldtimelinepos = e.pageY;
  if (e.which == 3) {
    return false;
  }
  function draggingKeyframe(e) {
    oldtimelinepos = e.pageY;
    resetHeight(e);
  }
  function releasedKeyframe(e) {
    $('body')
      .off('mousemove', draggingKeyframe)
      .off('mouseup', releasedKeyframe);
  }
  $('body')
    .on('mouseup', releasedKeyframe)
    .on('mousemove', draggingKeyframe);
}

$(document).on('mousedown', '#timeline-handle', dragTimeline);

oldtimelinepos = $(window).height() - 92 - $('#timearea').height();

// Sync scrolling (vertical)
function syncScroll(el1, el2) {
  var $el1 = $(el1);
  var $el2 = $(el2);
  var forcedScroll = false;
  $el1.scroll(function () {
    performScroll($el1, $el2);
  });
  $el2.scroll(function () {
    performScroll($el2, $el1);
  });

  function performScroll($scrolled, $toScroll) {
    if (forcedScroll) return (forcedScroll = false);
    var percent =
      ($scrolled.scrollTop() /
        ($scrolled[0].scrollHeight - $scrolled.outerHeight())) *
      100;
    setScrollTopFromPercent($toScroll, percent);
  }

  function setScrollTopFromPercent($el, percent) {
    var scrollTopPos =
      (percent / 100) * ($el[0].scrollHeight - $el.outerHeight());
    forcedScroll = true;
    $el.scrollTop(scrollTopPos);
  }
}

// Sync scrolling (horizontal)
function syncScrollHoz(el1, el2) {
  var $el1 = $(el1);
  var $el2 = $(el2);
  var forcedScroll = false;
  $el1.scroll(function () {
    performScroll($el1, $el2);
  });
  $el2.scroll(function () {
    performScroll($el2, $el1);
  });

  function performScroll($scrolled, $toScroll) {
    if (forcedScroll) return (forcedScroll = false);
    var percent =
      ($scrolled.scrollLeft() / $scrolled.outerWidth()) * 100;
    setScrollLeftFromPercent($toScroll, percent);
  }

  function setScrollLeftFromPercent($el, percent) {
    var scrollLeftPos = (percent / 100) * $el.outerWidth();
    forcedScroll = true;
    $el.scrollLeft(scrollLeftPos);
  }
}

// Show keyframe properties
function keyframeProperties(inst) {
  if (!shiftdown) {
    selectedkeyframe = $(inst);
    const popup = $('#keyframe-properties');
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == selectedkeyframe.attr('data-property')
      );
    });
    $('#easing select').val(keyarr[0].easing);
    $('#easing select').niceSelect('update');
    popup.css({
      left: $(inst).offset().left - popup.width() / 2,
      top: $(inst).offset().top - popup.height() - 20,
    });
    popup.addClass('show-properties');
    $(inst).addClass('keyframe-selected');
  }
}

// Apply easing to keyframe
function applyEasing() {
  var keyarr = keyframes.filter(function (e) {
    return (
      e.t == selectedkeyframe.attr('data-time') &&
      e.id == selectedkeyframe.attr('data-object') &&
      e.name == selectedkeyframe.attr('data-property')
    );
  });
  keyarr[0].easing = $(this).attr('data-value');
  if (selectedkeyframe.attr('data-property') == 'left') {
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'top'
      );
    });
    keyarr[0].easing = $('#easing select').val();
  } else if (selectedkeyframe.attr('data-property') == 'scaleX') {
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'scaleY'
      );
    });
    keyarr[0].easing = $('#easing select').val();
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'width'
      );
    });
    keyarr[0].easing = $('#easing select').val();
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'height'
      );
    });
    keyarr[0].easing = $('#easing select').val();
  } else if (
    selectedkeyframe.attr('data-property') == 'strokeWidth'
  ) {
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'stroke'
      );
    });
    keyarr[0].easing = $('#easing select').val();
  } else if (
    selectedkeyframe.attr('data-property') == 'shadow.color'
  ) {
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'shadow.opacity'
      );
    });
    keyarr[0].easing = $('#easing select').val();
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'shadow.offsetX'
      );
    });
    keyarr[0].easing = $('#easing select').val();
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'shadow.offsetY'
      );
    });
    keyarr[0].easing = $('#easing select').val();
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'shadow.blur'
      );
    });
    keyarr[0].easing = $('#easing select').val();
  } else if (
    selectedkeyframe.attr('data-property') == 'charSpacing'
  ) {
    var keyarr = keyframes.filter(function (e) {
      return (
        e.t == selectedkeyframe.attr('data-time') &&
        e.id == selectedkeyframe.attr('data-object') &&
        e.name == 'lineHeight'
      );
    });
    keyarr[0].easing = $('#easing select').val();
  }
  $('#keyframe-properties').removeClass('show-properties');
  selectedkeyframe.removeClass('keyframe-selected');
  save();
}
$(document).on('mouseup', '#easing li', applyEasing);

// Click on seek area to seek (still not working properly)
function seekTo(e) {
  if ($(e.target).hasClass('keyframe')) {
    return false;
  }
  paused = true;
  if ($('#seekarea').scrollLeft() > offset_left) {
    currenttime = parseFloat(
      (
        (e.pageX +
          $('#seekarea').scrollLeft() -
          $('#timearea').offset().left -
          offset_left) *
        timelinetime
      ).toFixed(1)
    );
  } else {
    currenttime = parseFloat(
      (
        (e.pageX +
          $('#seekarea').scrollLeft() -
          $('#timearea').offset().left -
          offset_left) *
        timelinetime
      ).toFixed(1)
    );
  }
  if (currenttime < 0) {
    currenttime = 0;
  }
  // Check for 60FPS playback, 16ms "slots"
  if (currenttime % 16.666 != 0) {
    currenttime = Math.ceil(currenttime / 16.666) * 16.666;
  }
  renderTime();
  $('#seekbar').offset({
    left:
      offset_left +
      $('#inner-timeline').offset().left +
      currenttime / timelinetime,
  });
  animate(false, currenttime);
  updatePanelValues();
}
$(document).on('click', '#seekevents', seekTo);
$(document).on('click', '#timearea', seekTo);

function hideSeekbar() {
  $('#seek-hover').css({ opacity: 0 });
}
function followCursor(e) {
  $('#seek-hover').css({ opacity: 0.3 });
  if ($('#seekarea').scrollLeft() > offset_left) {
    hovertime = parseFloat(
      (
        (e.pageX +
          $('#seekarea').scrollLeft() -
          $('#timearea').offset().left -
          offset_left) *
        timelinetime
      ).toFixed(1)
    );
  } else {
    hovertime = parseFloat(
      (
        (e.pageX +
          $('#seekarea').scrollLeft() -
          $('#timearea').offset().left -
          offset_left) *
        timelinetime
      ).toFixed(1)
    );
  }
  if (e.pageX >= offset_left + $('#inner-timeline').offset().left) {
    $('#seek-hover').offset({ left: e.pageX });
  }
}
$(document).on('mousemove', '#timearea', followCursor);
$(document).on('mousemove', '#seekevents', followCursor);
$(document).on('mousemove', '#toolbar', hideSeekbar);
$(document).on('mousemove', '#canvas-area', hideSeekbar);
$(document).on('mousemove', '#browser', hideSeekbar);
$(document).on('mousemove', '#properties', hideSeekbar);
$(document).on('mousemove', '#controls', hideSeekbar);

function orderLayers() {
  $('.layer').each(function (index) {
    const object = canvas.getItemById($(this).attr('data-object'));
    canvas.sendToBack(object);
    canvas.renderAll();
    objects.splice(
      $('.layer').length - index - 1,
      0,
      objects.splice(
        objects.findIndex((x) => x.id == object.get('id')),
        1
      )[0]
    );
  });
  save();
}

function handTool() {
  if ($(this).hasClass('hand-active')) {
    $(this).removeClass('hand-active');
    $(this).find('img').attr('src', 'assets/hand-tool.svg');
    handtool = false;
    canvas.defaultCursor = 'default';
    canvas.renderAll();
  } else {
    $(this).addClass('hand-active');
    $(this).find('img').attr('src', 'assets/hand-tool-active.svg');
    handtool = true;
    canvas.defaultCursor = 'grab';
    canvas.renderAll();
  }
}
$(document).on('click', '#hand-tool', handTool);
// Set defaults
setDuration(10000);
checkDB();
