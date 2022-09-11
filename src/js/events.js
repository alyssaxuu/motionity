$(document).ready(function () {
  // An object is being moved in the canvas
  canvas.on('object:moving', function (e) {
    e.target.hasControls = false;
    centerLines(e);
    if (cropping) {
      if (
        canvas.getItemById('crop').isContainedWithinObject(cropobj)
      ) {
        cropleft = canvas.getItemById('crop').get('left');
        croptop = canvas.getItemById('crop').get('top');
        cropscalex = canvas.getItemById('crop').get('scaleX');
        cropscaley = canvas.getItemById('crop').get('scaleY');
      }
      crop(canvas.getItemById('cropped'));
    } else if (
      lockmovement &&
      e.e.shiftKey &&
      canvas.getActiveObject()
    ) {
      if (canvasx < shiftx + 30 && canvasx > shiftx - 30) {
        canvas.getActiveObject().set({ left: shiftx });
        canvas.getActiveObject().lockMovementX = true;
        canvas.getActiveObject().lockMovementY = false;
      } else {
        canvas.getActiveObject().set({ top: shifty });
        canvas.getActiveObject().lockMovementX = false;
        canvas.getActiveObject().lockMovementY = true;
      }
    } else if (canvas.getActiveObject() && !e.e.shiftKey) {
      lockmovement = false;
      canvas.getActiveObject().lockMovementX = false;
      canvas.getActiveObject().lockMovementY = false;
    }
  });

  // An object is being scaled in the canvas
  canvas.on('object:scaling', function (e) {
    e.target.hasControls = false;
    centerLines(e);
    if (cropping) {
      if (
        canvas.getItemById('crop').isContainedWithinObject(cropobj)
      ) {
        cropleft = canvas.getItemById('crop').get('left');
        croptop = canvas.getItemById('crop').get('top');
        cropscalex = canvas.getItemById('crop').get('scaleX');
        cropscaley = canvas.getItemById('crop').get('scaleY');
      }
      crop(canvas.getItemById('cropped'));
    }
  });

  // An object is being resized in the canvas
  canvas.on('object:resizing', function (e) {
    e.target.hasControls = false;
    centerLines(e);
    if (cropping) {
      if (
        canvas.getItemById('crop').isContainedWithinObject(cropobj)
      ) {
        cropleft = canvas.getItemById('crop').get('left');
        croptop = canvas.getItemById('crop').get('top');
        cropscalex = canvas.getItemById('crop').get('scaleX');
        cropscaley = canvas.getItemById('crop').get('scaleY');
      }
      crop(canvas.getItemById('cropped'));
    }
  });

  // An object is being rotated in the canvas
  canvas.on('object:rotating', function (e) {
    if (e.e.shiftKey) {
      canvas.getActiveObject().snapAngle = 15;
    } else {
      canvas.getActiveObject().snapAngle = 0;
    }
    e.target.hasControls = false;
  });

  // An object has been modified in the canvas
  canvas.on('object:modified', function (e) {
    e.target.hasControls = true;
    if (!editinggroup && !cropping) {
      canvas.getActiveObject().lockMovementX = false;
      canvas.getActiveObject().lockMovementY = false;
      canvas.renderAll();
      if (e.target.type == 'activeSelection') {
        const tempselection = canvas.getActiveObject();
        canvas.discardActiveObject();
        e.target._objects.forEach(function (object) {
          autoKeyframe(object, e, true);
        });
        reselect(tempselection);
      } else {
        autoKeyframe(e.target, e, false);
      }
      updatePanelValues();
      save();
    }
    if (cropping) {
      var obj = e.target;
      checkCrop(obj);
    }
  });

  // A selection has been updated in the canvas
  canvas.on('selection:updated', function (e) {
    updatePanel(true);
    updatePanelValues();
    updateSelection(e);
    closeFilters();
  });

  // A selection has been made in the canvas
  canvas.on('selection:created', function (e) {
    shiftx = canvas.getActiveObject().get('left');
    shifty = canvas.getActiveObject().get('top');
    if (!editingpanel) {
      updatePanel(true);
    }
    updateSelection(e);
    canvas.renderAll();
    closeFilters();
  });

  // A selection has been cleared in the canvas
  canvas.on('selection:cleared', function (e) {
    if (!editingpanel && !setting) {
      updatePanel(false);
    }
    $('.layer-selected').removeClass('layer-selected');
    if (cropping) {
      crop(cropobj);
    }
    closeFilters();
  });

  function kFormatter(num) {
    return Math.abs(num) > 999
      ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
      : Math.sign(num) * Math.abs(num);
  }

  // Zoom in/out of the canvas
  canvas.on('mouse:wheel', function (opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    $('#zoom-level span').html(
      kFormatter((zoom * 100).toFixed(0)) + '%'
    );
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  // Start panning if space is down or hand tool is enabled
  canvas.on('mouse:down', function (opt) {
    var e = opt.e;
    if (spaceDown || handtool) {
      this.isDragging = true;
      this.selection = false;
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
    if (opt.target) {
      opt.target.hasControls = true;
      wip = false;
    }
  });

  // Pan while dragging mouse
  canvas.on('mouse:move', function (opt) {
    var pointer = canvas.getPointer(opt.e);
    canvasx = pointer.x;
    canvasy = pointer.y;
    if (this.isDragging) {
      var e = opt.e;
      var vpt = this.viewportTransform;
      vpt[4] += e.clientX - this.lastPosX;
      vpt[5] += e.clientY - this.lastPosY;
      this.requestRenderAll();
      this.lastPosX = e.clientX;
      this.lastPosY = e.clientY;
    }
  });

  // Stop panning
  canvas.on('mouse:up', function (opt) {
    this.setViewportTransform(this.viewportTransform);
    this.isDragging = false;
    this.selection = true;
    line_h.opacity = 0;
    line_v.opacity = 0;
  });

  // Detect mouse over canvas (for dragging objects from the library)
  canvas.on('mouse:move', function (e) {
    overCanvas = true;
    if (
      e.target &&
      !canvas.getActiveObject() &&
      draggingPanel &&
      e.target.type == 'image'
    ) {
      wip = true;
      e.target.hasControls = false;
      canvas.setActiveObject(e.target);
    }
  });
  canvas.on('mouse:out', function (e) {
    overCanvas = false;
    if (wip) {
      e.target.hasControls = true;
      canvas.discardActiveObject();
      wip = false;
      canvas.renderAll();
    }
  });

  // Double click on image to get into cropping mode
  fabric.util.addListener(
    canvas.upperCanvasEl,
    'dblclick',
    function (e) {
      var target = canvas.findTarget(e);
      if (target) {
        if (target.type == 'image') {
          cropImage(target);
        }
      }
    }
  );

  // Key event handling
  $(document)
    .keyup(function (e) {
      // Space bar (panning and playback)
      if (
        e.keyCode == 32 &&
        !editinglayer &&
        !editingproject &&
        $(e.target)[0].tagName != 'INPUT'
      ) {
        spacerelease = true;
        spaceDown = false;
        canvas.defaultCursor = 'default';
        canvas.renderAll();
        if (!spacehold) {
          if (
            !(
              canvas.getActiveObject() &&
              canvas.getActiveObject().isEditing
            )
          ) {
            if (paused) {
              play();
            } else {
              pause();
            }
          }
        } else {
          if (!handtool) {
            $('#hand-tool').removeClass('hand-active');
            $('#hand-tool')
              .find('img')
              .attr('src', 'assets/hand-tool.svg');
          }
        }
        spacehold = false;
      }
      // Delete object/keyframe
      if (
        (e.keyCode == 46 ||
          e.key == 'Delete' ||
          e.code == 'Delete' ||
          e.key == 'Backspace') &&
        !focus &&
        !editinglayer
      ) {
        if (
          $('.show-properties').length > 0 ||
          shiftkeys.length > 0
        ) {
          deleteKeyframe();
        } else {
          deleteSelection();
        }
      }
      // Shift key is up (stop locking horizontal/vertical object movement)
      if (e.keyCode == 16) {
        lockmovement = false;
        shiftdown = false;
      }
    })
    .keydown(function (e) {
      // Space bar (panning and playback)
      if (
        e.keyCode == 32 &&
        !editinglayer &&
        !editingproject &&
        $(e.target)[0].tagName != 'INPUT'
      ) {
        spacerelease = false;
        spaceDown = true;
        canvas.defaultCursor = 'grab';
        canvas.renderAll();
        window.setTimeout(function () {
          if (!spacerelease) {
            spacehold = true;
            if (!handtool) {
              $('#hand-tool').addClass('hand-active');
              $('#hand-tool')
                .find('img')
                .attr('src', 'assets/hand-tool-active.svg');
            }
          }
        }, 1000);
      }
      // Redo
      if (e.which === 90 && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        undoRedo(redo, undo, redoarr, undoarr);
      }
      // Undo
      if (e.which === 90 && (e.ctrlKey || e.metaKey)) {
        undoRedo(undo, redo, undoarr, redoarr);
      }
      // Duplicate object
      if (e.which === 68 && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (canvas.getActiveObject()) {
          clipboard = canvas.getActiveObject();
          copyObject();
        }
      }
      // Shift key (Lock horizontal/vertical movement for objects)
      if (e.shiftKey) {
        shiftdown = true;
        lockmovement = true;
        if (canvas.getActiveObject()) {
          shiftx = canvas.getActiveObject().get('left');
          shifty = canvas.getActiveObject().get('top');
        }
      }
      // Return (save layer name)
      if (e.keyCode === 13 && editinglayer) {
        saveLayerName();
      }
      // Return (save project name)
      if (e.keyCode === 13 && editingproject) {
        saveProjectName();
      }
      // Left arrow key (move object to the left)
      if (e.keyCode === 37 && canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        var step = 2;
        // Bigger step if shift is down
        if (e.shiftKey) {
          step = 7;
        }
        obj.left = obj.left - step;
        canvas.renderAll();
        autoKeyframe(obj, { action: 'drag' }, false);
      }
      // Up arrow key (move object up)
      if (e.keyCode === 38 && canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        var step = 2;
        // Bigger step if shift is down
        if (e.shiftKey) {
          step = 7;
        }
        obj.top = obj.top - step;
        canvas.renderAll();
        autoKeyframe(obj, { action: 'drag' }, false);
      }
      // Right arrow key  (move object to the right)
      if (e.keyCode === 39 && canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        var step = 2;
        // Bigger step if shift is down
        if (e.shiftKey) {
          step = 7;
        }
        obj.left = obj.left + step;
        canvas.renderAll();
        autoKeyframe(obj, { action: 'drag' }, false);
      }
      // Down arrow key   (move object down)
      if (e.keyCode === 40 && canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        var step = 2;
        // Bigger step if shift is down
        if (e.shiftKey) {
          step = 7;
        }
        obj.top = obj.top + step;
        canvas.renderAll();
        autoKeyframe(obj, { action: 'drag' }, false);
      }

      // Move object up layer list
      if (
        e.keyCode === 221 &&
        canvas.getActiveObjects() &&
        e.metaKey
      ) {
        if (canvas.getActiveObjects().length == 1) {
          var obj = canvas.getActiveObject();
          $(".layer[data-object='" + obj.id + "']")
            .prev()
            .insertAfter($(".layer[data-object='" + obj.id + "']"));
          $('#' + obj.id)
            .prev()
            .insertAfter($('#' + obj.id));
          orderLayers();
        } else {
          canvas.getActiveObjects().forEach(function (obj) {
            $(".layer[data-object='" + obj.id + "']")
              .prev()
              .insertAfter($(".layer[data-object='" + obj.id + "']"));
            $('#' + obj.id)
              .prev()
              .insertAfter($('#' + obj.id));
            orderLayers();
          });
        }
      }

      // Move object down layer list
      if (
        e.keyCode === 219 &&
        canvas.getActiveObjects() &&
        e.metaKey
      ) {
        if (canvas.getActiveObjects().length == 1) {
          var obj = canvas.getActiveObject();
          $(".layer[data-object='" + obj.id + "']")
            .next()
            .insertBefore($(".layer[data-object='" + obj.id + "']"));
          $('#' + obj.id)
            .next()
            .insertBefore($('#' + obj.id));
          orderLayers();
        } else {
          canvas.getActiveObjects().forEach(function (obj) {
            $(".layer[data-object='" + obj.id + "']")
              .next()
              .insertBefore(
                $(".layer[data-object='" + obj.id + "']")
              );
            $('#' + obj.id)
              .next()
              .insertBefore($('#' + obj.id));
            orderLayers();
          });
        }
      }

      // Move object top of layer list
      if (
        e.keyCode === 221 &&
        canvas.getActiveObjects() &&
        e.altKey
      ) {
        if (canvas.getActiveObjects().length == 1) {
          var obj = canvas.getActiveObject();
          $('#layer-inner-list').prepend(
            $(".layer[data-object='" + obj.id + "']")
          );
          $('#inner-timeline').prepend($('#' + obj.id));
          orderLayers();
        } else {
          canvas.getActiveObjects().forEach(function (obj) {
            $('#layer-inner-list').prepend(
              $(".layer[data-object='" + obj.id + "']")
            );
            $('#inner-timeline').prepend($('#' + obj.id));
            orderLayers();
          });
        }
      }

      // Move object bottom of layer list
      if (e.keyCode === 219 && canvas.getActiveObject() && e.altKey) {
        if (canvas.getActiveObjects().length == 1) {
          var obj = canvas.getActiveObject();
          $('#layer-inner-list').append(
            $(".layer[data-object='" + obj.id + "']")
          );
          $('#inner-timeline').append($('#' + obj.id));
          orderLayers();
        } else {
          canvas.getActiveObjects().forEach(function (obj) {
            $('#layer-inner-list').append(
              $(".layer[data-object='" + obj.id + "']")
            );
            $('#inner-timeline').append($('#' + obj.id));
            orderLayers();
          });
        }
      }

      // Zoom in
      if (e.keyCode === 187 && e.shiftKey) {
        var zoom = canvas.getZoom() + 0.2;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.setZoom(1);
        canvas.renderAll();
        var vpw = canvas.width / zoom;
        var vph = canvas.height / zoom;
        var x = artboard.left + artboard.width / 2 - vpw / 2;
        var y = artboard.top + artboard.height / 2 - vph / 2;
        canvas.absolutePan({ x: x, y: y });
        canvas.setZoom(zoom);
        canvas.renderAll();
        $('#zoom-level span').html(
          (canvas.getZoom() * 100).toFixed(0) + '%'
        );
      }

      // Zoom out
      if (e.keyCode === 189 && e.shiftKey) {
        var zoom = canvas.getZoom() - 0.2;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        canvas.setZoom(1);
        canvas.renderAll();
        var vpw = canvas.width / zoom;
        var vph = canvas.height / zoom;
        var x = artboard.left + artboard.width / 2 - vpw / 2;
        var y = artboard.top + artboard.height / 2 - vph / 2;
        canvas.absolutePan({ x: x, y: y });
        canvas.setZoom(zoom);
        canvas.renderAll();
        $('#zoom-level span').html(
          (canvas.getZoom() * 100).toFixed(0) + '%'
        );
      }
    });

  // Copy event
  window.addEventListener('copy', function (e) {
    // Copy selected object
    if (
      canvas.getActiveObject() &&
      shiftkeys.length == 0 &&
      !canvas.getActiveObject().isEditing
    ) {
      var emptyInp = document.getElementById('emptyInput');
      emptyInp.select();
      emptyInp.focus();
      setTimeout(function () {
        document.execCommand('copy');
      }, 0);
      clipboard = canvas.getActiveObject();
      cliptype = 'object';
      // Copy selected keyframe(s)
    } else if (
      shiftkeys.length > 0 &&
      !canvas.getActiveObject().isEditing
    ) {
      var emptyInp = document.getElementById('emptyInput');
      emptyInp.select();
      emptyInp.focus();
      setTimeout(function () {
        document.execCommand('copy');
      }, 0);
      clipboard = [];
      shiftkeys.forEach(function (keyframe) {
        var drag = $(keyframe.keyframe);
        var keyarr = $.grep(keyframes, function (e) {
          return (
            e.t == drag.attr('data-time') &&
            e.id == drag.attr('data-object') &&
            e.name == drag.attr('data-property')
          );
        });
        clipboard.push(keyarr[0]);
      });
      cliptype = 'keyframe';
    }
  });

  // Paste event
  window.addEventListener('paste', function (e) {
    var imgs = e.clipboardData.items;
    if (imgs == undefined) return false;

    // Paste object or keyframe(s)
    if (imgs.length == 1 && e.clipboardData.getData('text') == ' ') {
      copyObject();
      // Paste external image (by uploading it)
    } else {
      for (var i = 0; i < imgs.length; i++) {
        if (imgs[i].type.indexOf('image') == -1) continue;
        var imgObj = imgs[i].getAsFile();
        if (imgObj.size / 1024 / 1024 <= 10) {
          createThumbnail(imgObj, 250).then(function (data) {
            saveFile(
              dataURItoBlob(data),
              imgObj,
              imgObj['type'].split('/')[0],
              'temp',
              true,
              true
            );
          });
        } else {
          alert('Image is too big');
        }
      }
    }
  });

  // Stop cropping when clicking on the blacked out properties panel
  $(document).on('click', '#properties-overlay', function () {
    if (cropping) {
      canvas.discardActiveObject();
    }
  });

  // Scroll horizontally through assets in the library
  $(document).on('click', '.right-arrow', function () {
    $(this).parent().animate({ scrollLeft: '+=1000' }, 500);
  });
  $(document).on('click', '.left-arrow', function () {
    $(this).parent().animate({ scrollLeft: '-=1000' }, 500);
  });

  // Playback
  $(document).on('click', '#play-button', function () {
    if (paused) {
      play();
    } else {
      pause();
    }
  });

  // Detect when not clicking on certain elements
  $(document).on('mousedown', function (e) {
    // De-select keyframes
    if (
      !$('#keyframe-properties').is(e.target) &&
      $('#keyframe-properties').has(e.target).length === 0 &&
      !$('.keyframe').is(e.target) &&
      $('.keyframe').has(e.target).length === 0
    ) {
      $('#keyframe-properties').removeClass('show-properties');
      $('.keyframe-selected').removeClass('keyframe-selected');
      shiftkeys = [];
    }

    // Hide color picker
    if (
      !$('.object-color').is(e.target) &&
      $('.object-color').has(e.target).length === 0 &&
      !$('.pcr-app').is(e.target) &&
      $('.prc-app').has(e.target).length === 0 &&
      !$('.pcr-selection').is(e.target) &&
      $('.pcr-selection').has(e.target).length === 0 &&
      !$('.pcr-swatches').is(e.target) &&
      $('.pcr-swatches').has(e.target).length === 0 &&
      !$('.pcr-interaction').is(e.target) &&
      $('.pcr-interaction').has(e.target).length === 0
    ) {
      o_fill.hide();
    }

    // Hide zoom controls
    if (
      !$('#other-controls').is(e.target) &&
      $('#other-controls').has(e.target).length === 0
    ) {
      $('#zoom-options').addClass('zoom-hidden');
      $('#zoom-level img').removeClass('zoom-open');
    }

    // Hide speed settings
    if (
      !$('#speed').is(e.target) &&
      $('#speed').has(e.target).length === 0
    ) {
      $('#speed-settings').removeClass('show-speed');
      $('#speed-arrow').removeClass('arrow-on');
    }

    // Hide more menu
    if (
      !$('#more-tool').is(e.target) &&
      $('#more-tool').has(e.target).length === 0 &&
      !$('#more-over').is(e.target) &&
      $('#more-over').has(e.target).length === 0
    ) {
      hideMore();
    }
  });

  // Detect focus on an input in the properties
  $(document)
    .on('focus', '.property-input', function () {
      focus = true;
    })
    .on('focusout', function () {
      focus = false;
    });

  // Toggle zoom dropdown
  $(document).on('click', '#zoom-level', function () {
    $('#zoom-options').toggleClass('zoom-hidden');
    $('#zoom-level img').toggleClass('zoom-open');
  });

  // Skip to the beginning or end
  $(document).on('click', '#skip-backward', function () {
    animate(false, 0);
    $('#seekbar').offset({
      left:
        offset_left +
        $('#inner-timeline').offset().left +
        currenttime / timelinetime,
    });
  });
  $(document).on('click', '#skip-forward', function () {
    animate(false, duration);
    $('#seekbar').offset({
      left:
        offset_left +
        $('#inner-timeline').offset().left +
        currenttime / timelinetime,
    });
  });

  // Change layer name
  $(document).on('dblclick', '.layer-custom-name', function () {
    $(this).prop('readonly', false);
    $(this).addClass('name-active');
    $(this).focus();
    document.execCommand('selectAll', false, null);
    editinglayer = true;
  });

  // Trigger file picker when clicking the upload button
  $(document).on('click', '#upload-button', function () {
    $('#upload-popup').addClass('upload-show');
  });

  $(document).on('click', '#upload-overlay', function () {
    $('.upload-show').removeClass('upload-show');
  });

  $(document).on('click', '#upload-popup-close', function () {
    $('.upload-show').removeClass('upload-show');
  });

  $(document).on('click', '#upload-drop-area', function () {
    $('#filepick').click();
  });

  $(document).on('dragover', function (e) {
    e.preventDefault();
    e.stopPropagation();
  });

  $(document).on('dragover', '#upload-drop-area', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#upload-drop-area').addClass('dropping');
  });

  $(document).on('dragenter', '#upload-drop-area', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#upload-drop-area').addClass('dropping');
  });

  $(document).on('drop', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $('#upload-drop-area').removeClass('dropping');
    handleUpload(e);
  });

  $(document).on('dragleave', function () {
    $('#upload-drop-area').removeClass('dropping');
  });

  $(document).on('dragend', function () {
    $('#upload-drop-area').removeClass('dropping');
  });

  // Upload or remove background audio
  $(document).on('click', '#audio-upload-button', function () {
    $('#filepick2').click();
  });

  // Sync scrolling for the timeline
  syncScroll($('#layer-inner-list'), $('#timeline'));
  syncScrollHoz($('#timeline'), $('#seekarea'));

  // Initialize layer sorting
  sortable('#layer-inner-list', {
    customDragImage: (draggedElement, elementOffset, event) => {
      return {
        element: document.getElementById('nothing'),
        posX: event.pageX - elementOffset.left,
        posY: event.pageY - elementOffset.top,
      };
    },
  })[0].addEventListener('sortstop', function (e) {
    const id = $(e.detail.item).attr('data-object');
    const previd = $(e.detail.item).prev().attr('data-object');
    if ($('.sortable-dragging').length == 1) {
      $('.sortable-dragging').remove();
      if (previd == undefined) {
        $('#inner-timeline').prepend($('#' + id));
      } else {
        $('#' + id).insertAfter($('#' + previd));
      }
      orderLayers();
    }
  });

  // Initialize dropdown for keyframe easing
  $('#easing select').niceSelect();

  // Initialize properties panel
  updatePanel(false);

  // Initialize library
  updateBrowser('shape-tool');

  function initFilterSliders() {
    var filters = [
      'filter-brightness',
      'filter-contrast',
      'filter-saturation',
      'filter-hue',
      'filter-vibrance',
    ];
    filters.forEach(function (filter) {
      var selectme = document.getElementById(filter);
      var slider = new RangeSlider(selectme, {
        design: '2d',
        theme: 'default',
        handle: 'round',
        popup: null,
        showMinMaxLabels: false,
        unit: '%',
        min: -100,
        max: 100,
        value: 0,
        step: 1,
        onmove: function (x) {
          if (canvas.getActiveObject()) {
            var obj = canvas.getActiveObject();
            if (filter == 'filter-brightness') {
              if (obj.filters.find((i) => i.type == 'Brightness')) {
                obj.filters.find(
                  (i) => i.type == 'Brightness'
                ).brightness = x / 100;
              } else {
                obj.filters.push(
                  new f.Brightness({ brightness: x / 100 })
                );
              }
            } else if (filter == 'filter-contrast') {
              if (obj.filters.find((i) => i.type == 'Contrast')) {
                obj.filters.find(
                  (i) => i.type == 'Contrast'
                ).contrast = x / 100;
              } else {
                obj.filters.push(
                  new f.Contrast({ contrast: x / 100 })
                );
              }
            } else if (filter == 'filter-saturation') {
              if (obj.filters.find((i) => i.type == 'Saturation')) {
                obj.filters.find(
                  (i) => i.type == 'Saturation'
                ).saturation = x / 100;
              } else {
                obj.filters.push(
                  new f.Saturation({ saturation: x / 100 })
                );
              }
            } else if (filter == 'filter-vibrance') {
              if (obj.filters.find((i) => i.type == 'Vibrance')) {
                obj.filters.find(
                  (i) => i.type == 'Vibrance'
                ).vibrance = x / 100;
              } else {
                obj.filters.push(
                  new f.Vibrance({ vibrance: x / 100 })
                );
              }
            } else if (filter == 'filter-hue') {
              if (obj.filters.find((i) => i.type == 'HueRotation')) {
                obj.filters.find(
                  (i) => i.type == 'HueRotation'
                ).rotation = x / 100;
              } else {
                obj.filters.push(
                  new f.HueRotation({ rotation: x / 100 })
                );
              }
            }
            obj.applyFilters();
            canvas.renderAll();
          }
        },
        onfinish: function (x) {
          save();
        },
      });
      sliders.push({ name: filter, slider: slider });
    });
  }

  var selectchroma = document.getElementById('chroma-distance');
  chromaslider = new RangeSlider(selectchroma, {
    design: '2d',
    theme: 'default',
    handle: 'round',
    popup: null,
    showMinMaxLabels: false,
    unit: '%',
    min: 1,
    max: 100,
    value: 1,
    step: 1,
    onmove: function (x) {
      if (canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        if (obj.filters.find((x) => x.type == 'RemoveColor')) {
          obj.filters.find((x) => x.type == 'RemoveColor').distance =
            x / 100;
        }
        obj.applyFilters();
        canvas.renderAll();
      }
    },
    onfinish: function (x) {
      save();
    },
  });

  var selectnoise = document.getElementById('filter-noise');
  noiseslider = new RangeSlider(selectnoise, {
    design: '2d',
    theme: 'default',
    handle: 'round',
    popup: null,
    showMinMaxLabels: false,
    unit: '%',
    min: 0,
    max: 1000,
    value: 0,
    step: 1,
    onmove: function (x) {
      if (canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        if (obj.filters.find((x) => x.type == 'Noise')) {
          obj.filters.find((x) => x.type == 'Noise').noise = x;
        } else {
          obj.filters.push(
            new f.Noise({
              noise: x,
            })
          );
        }
        obj.applyFilters();
        canvas.renderAll();
      }
    },
    onfinish: function (x) {
      save();
    },
  });

  var selectblur = document.getElementById('filter-blur');
  blurslider = new RangeSlider(selectblur, {
    design: '2d',
    theme: 'default',
    handle: 'round',
    popup: null,
    showMinMaxLabels: false,
    unit: '%',
    min: 0,
    max: 100,
    value: 0,
    step: 1,
    onmove: function (x) {
      if (canvas.getActiveObject()) {
        var obj = canvas.getActiveObject();
        if (obj.filters.find((x) => x.type == 'Blur')) {
          obj.filters.find((x) => x.type == 'Blur').blur = x / 100;
        } else {
          obj.filters.push(
            new f.Blur({
              blur: x / 100,
            })
          );
        }
      }
      obj.applyFilters();
      canvas.renderAll();
    },
    onfinish: function (x) {
      save();
    },
  });

  $('#filters-list').val('none');
  $('#filters-list').niceSelect();

  initFilterSliders();
});
