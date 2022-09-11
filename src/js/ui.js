// Update panel (when selecting / de-selecting objects)
function updatePanel(selection) {
  if (!selection) {
    $('#align').addClass('align-off');
    $('#object-specific').html(canvas_panel);
    $('#preset').append("<option value='custom'>Custom</option>");
    presets.forEach(function (preset) {
      $('#preset').append(
        "<option value='" +
          preset.id +
          "'>" +
          preset.name +
          '</option>'
      );
    });
    $('#preset').val(activepreset);
    $('#canvas-duration input').val(duration / 1000);
    $('#preset').niceSelect();
    updatePanelValues();
    colormode = 'back';
    o_fill.setColor(canvas.backgroundColor);
  } else if (
    selection &&
    canvas.getActiveObjects().length == 1 &&
    canvas.getActiveObject().get('assetType') == 'audio'
  ) {
    $('#object-specific').html(audio_panel);
    $('#object-volume input').val(
      canvas.getActiveObject().get('volume') * 200
    );
  } else if (
    selection &&
    canvas.getActiveObjects().length == 1 &&
    canvas.getActiveObject().get('type') != 'group'
  ) {
    if (!cropping) {
      updateChromaUI();
      checkFilter();
    }
    $('#align').removeClass('align-off');
    $('#object-specific').html(object_panel);
    if (
      canvas.getActiveObject().get('type') == 'image' &&
      !canvas.getActiveObject().get('assetType')
    ) {
      $('#object-specific').append(image_panel);
      $('#object-specific').append(image_more_panel);
    } else if (
      canvas.getActiveObject().get('id').indexOf('Video') >= 0
    ) {
      $('#object-specific').append(image_panel);
      $('#object-specific').append(video_more_panel);
    } else {
      $('#object-specific').append(back_panel);
    }
    objects.forEach(function (object) {
      if (object.id != canvas.getActiveObject().get('id')) {
        $('#masks').append(
          "<option value='" +
            object.id +
            "'>" +
            object.id +
            '</option>'
        );
      }
    });
    $('#masks').niceSelect();
    var selectme = document.getElementById('select-opacity');
    o_slider = new RangeSlider(selectme, {
      design: '2d',
      theme: 'default',
      handle: 'round',
      popup: null,
      showMinMaxLabels: false,
      unit: '%',
      min: 0,
      max: 100,
      value: 100,
      onmove: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        canvas.getActiveObject().set({
          opacity: x / 100,
        });
        canvas.renderAll();
      },
      onfinish: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        updateObjectValues('opacity');
      },
      onstart: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
      },
    });
    if (canvas.getActiveObject().get('type') == 'rect') {
      $('#object-specific').append(shape_panel);
    } else if (
      canvas.getActiveObject().get('type') == 'path' ||
      canvas.getActiveObject().get('type') == 'circle'
    ) {
      $('#object-specific').append(path_panel);
    } else if (canvas.getActiveObject().get('type') == 'textbox') {
      $('#object-specific').append(text_panel);
      selectme = document.getElementById('select-letter');
      o_letter_slider = new RangeSlider(selectme, {
        design: '2d',
        theme: 'default',
        handle: 'round',
        popup: null,
        showMinMaxLabels: false,
        unit: '%',
        min: -200,
        max: 200,
        value: parseFloat(
          (canvas.getActiveObject().get('charSpacing') / 10).toFixed(
            2
          )
        ),
        onmove: function (x) {
          document
            .getElementById('text-h')
            .getElementsByTagName('input')[0].value = x;
          canvas.getActiveObject().set({ charSpacing: x * 10 });
          canvas.renderAll();
          updatePanelValues();
        },
        onfinish: function (x) {
          document
            .getElementById('text-h')
            .getElementsByTagName('input')[0].value = x;
          updateObjectValues('opacity3');
        },
        onstart: function (x) {
          document
            .getElementById('text-h')
            .getElementsByTagName('input')[0].value = x;
        },
      });
      selectme = document.getElementById('select-line');
      o_line_slider = new RangeSlider(selectme, {
        design: '2d',
        theme: 'default',
        handle: 'round',
        popup: null,
        showMinMaxLabels: false,
        unit: '%',
        min: 1,
        max: 500,
        value: parseFloat(
          (canvas.getActiveObject().get('lineHeight') * 100).toFixed(
            2
          )
        ),
        onmove: function (x) {
          document
            .getElementById('text-v')
            .getElementsByTagName('input')[0].value = x;
          canvas
            .getActiveObject()
            .set({ lineHeight: parseFloat(x / 100) });
          canvas.renderAll();
        },
        onfinish: function (x) {
          document
            .getElementById('text-v')
            .getElementsByTagName('input')[0].value = x;
          updateObjectValues('opacity3');
        },
        onstart: function (x) {
          document
            .getElementById('text-v')
            .getElementsByTagName('input')[0].value = x;
        },
      });
      updateTextValues();
    }
    $('#object-specific').append(stroke_panel);
    $('#object-specific').append(shadow_panel);
    $('#line-cap').niceSelect();
    updatePanelValues();
  } else if (
    canvas.getActiveObjects().length > 1 ||
    canvas.getActiveObject().get('type') == 'group'
  ) {
    $('#align').removeClass('align-off');
    $('#object-specific').html(object_panel);
    if (canvas.getActiveObject().get('type') == 'group') {
      if (
        canvas.getActiveObject().get('assetType') == 'animatedText'
      ) {
        $('#object-specific').append(other_panel);
        $('#object-specific').append(animated_text_panel);
        $('#object-specific').append(start_animation_panel);
        fonts.forEach(function (font) {
          $('#font-picker').append(
            "<option value='" + font + "'>" + font + '</option>'
          );
        });
        $('#font-picker').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.fontFamily
        );
        $('#font-picker').niceSelect();
        $('#text-color input').val(
          convertToHex(
            animatedtext.find(
              (x) => x.id == canvas.getActiveObject().id
            ).props.fill
          )
        );
        $('#color-text-side').css(
          'background-color',
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.fill
        );
        text_animation_list.forEach(function (preset) {
          $('#preset-picker').append(
            "<option value='" +
              preset.name +
              "'>" +
              preset.label +
              '</option>'
          );
        });
        $('#preset-picker').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.preset
        );
        $('#preset-picker').niceSelect();
        $('.order-toggle-item-active').removeClass(
          'order-toggle-item-active'
        );
        $('.order-toggle-item-active-2').removeClass(
          'order-toggle-item-active-2'
        );
        if (
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.order == 'backward'
        ) {
          $('#order-backward').addClass('order-toggle-item-active');
        } else {
          $('#order-forward').addClass('order-toggle-item-active');
        }
        if (
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.typeAnim == 'letter'
        ) {
          $('#type-letters').addClass('order-toggle-item-active-2');
        } else {
          $('#type-words').addClass('order-toggle-item-active-2');
        }
        $('#easing-picker').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.easing
        );
        $('#easing-picker').niceSelect();
        $('#durationinput').val(
          animatedtext.find(
            (x) => x.id == canvas.getActiveObject().id
          ).props.duration / 1000
        );
        $('#masks').niceSelect();
      }
      /*
            if (canvas.getActiveObject().isGroup) {
                $("#object-specific").append(group_panel);
            } else {
                $("#object-specific").append(other_panel);
            }
            objects.forEach(function(object){
                if (object.id != canvas.getActiveObject().get("id")) {
                    $("#masks").append("<option value='"+object.id+"'>"+object.id+"</option>");
                }
            });
            $("#masks").niceSelect();
						*/
    } else {
      $('#object-specific').append(selection_panel);
    }
    var selectme = document.getElementById('select-opacity');
    o_slider = new RangeSlider(selectme, {
      design: '2d',
      theme: 'default',
      handle: 'round',
      popup: null,
      showMinMaxLabels: false,
      unit: '%',
      min: 0,
      max: 100,
      value: 100,
      onmove: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        canvas.getActiveObject().set({ opacity: x / 100 });
        canvas.renderAll();
      },
      onfinish: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
        updateObjectValues('opacity');
      },
      onstart: function (x) {
        document
          .getElementById('object-o')
          .getElementsByTagName('input')[0].value = x;
      },
    });
    updatePanelValues();
  }
}

function convertToHex(nonHexColorString) {
  var ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = nonHexColorString;
  return ctx.fillStyle.toUpperCase();
}

function updateStrokeValues() {
  const object = canvas.getActiveObject();
  $('.line-join-active').removeClass('line-join-active');
  if (
    object.get('strokeDashArray') == false &&
    object.get('strokeWidth') == 0
  ) {
    $('#miter').addClass('line-join-active');
    $('#miter img').attr('src', 'assets/miter-active.svg');
  } else if (object.get('strokeDashArray') == false) {
    $('#bevel').addClass('line-join-active');
    $('#bevel img').attr('src', 'assets/bevel-active.svg');
  } else if (object.get('strokeDashArray') == [10, 5]) {
    $('#round').addClass('line-join-active');
    $('#round img').attr('src', 'assets/round-active.svg');
  } else {
    $('#small-dash').addClass('line-join-active');
    $('#small-dash img').attr('src', 'assets/dash2-active.svg');
  }
}

function toggleAnimationOrder() {
  var object = canvas.getActiveObject();
  $('.order-toggle-item-active').removeClass(
    'order-toggle-item-active'
  );
  if ($(this).attr('id') == 'order-backward') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ order: 'backward' }, canvas);
  } else if ($(this).attr('id') == 'order-forward') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ order: 'forward' }, canvas);
  }
  $(this).addClass('order-toggle-item-active');
  animate(currenttime, false);
  save();
}
function toggleAnimationType() {
  var object = canvas.getActiveObject();
  $('.order-toggle-item-active-2').removeClass(
    'order-toggle-item-active-2'
  );
  if ($(this).attr('id') == 'type-words') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ typeAnim: 'word' }, canvas);
  } else if ($(this).attr('id') == 'type-letters') {
    animatedtext
      .find((x) => x.id == object.id)
      .setProp({ typeAnim: 'letter' }, canvas);
  }
  $(this).addClass('order-toggle-item-active-2');
  animate(currenttime, false);
  save();
}
$(document).on(
  'click',
  '.order-toggle-item:not(.order-toggle-item-active)',
  toggleAnimationOrder
);
$(document).on(
  'click',
  '.order-toggle-item-2:not(.order-toggle-item-active-2)',
  toggleAnimationType
);

function updateTextValues() {
  const object = canvas.getActiveObject();
  fonts.forEach(function (font) {
    $('#font-picker').append(
      "<option value='" + font + "'>" + font + '</option>'
    );
  });
  $('#font-picker').val(object.get('fontFamily'));
  $('#font-picker').niceSelect();
  $('#text-h input').val(
    parseFloat((object.get('charSpacing') / 10).toFixed(2))
  );
  $('#text-v input').val(
    parseFloat((object.get('lineHeight') * 100).toFixed(2))
  );
  if (object.get('textAlign') == 'left') {
    $('#align-text-left').addClass('align-text-active');
    $('#align-text-left img').attr(
      'src',
      'assets/align-text-left-active.svg'
    );
  } else if (object.get('textAlign') == 'center') {
    $('#align-text-center').addClass('align-text-active');
    $('#align-text-center img').attr(
      'src',
      'assets/align-text-center-active.svg'
    );
  } else if (object.get('textAlign') == 'right') {
    $('#align-text-right').addClass('align-text-right-active');
    $('#align-text-right img').attr(
      'src',
      'assets/align-text-right-active.svg'
    );
  } else {
    $('#align-text-justify').addClass('align-text-justify-active');
    $('#align-text-justify img').attr(
      'src',
      'assets/align-text-justify-active.svg'
    );
  }
  if (
    object.get('fontWeight') == 'bold' ||
    object.get('fontWeight') == 700
  ) {
    $('#format-bold').addClass('format-text-active');
    $('#format-bold img').attr('src', 'assets/bold-active.svg');
  }
  if (object.get('fontStyle') == 'italic') {
    $('#format-italic').addClass('format-text-active');
    $('#format-italic img').attr('src', 'assets/italic-active.svg');
  }
  if (object.get('underline') == true) {
    $('#format-underline').addClass('format-text-active');
    $('#format-underline img').attr(
      'src',
      'assets/underline-active.svg'
    );
  }
  if (object.get('linethrough') == true) {
    $('#format-strike').addClass('format-text-active');
    $('#format-strike img').attr('src', 'assets/strike-active.svg');
  }
}

// Update panel inputs based on object values
function updatePanelValues() {
  if (canvas.getActiveObject()) {
    if (canvas.getActiveObject().get('assetType') == 'audio') {
      $('#object-volume input').val(
        canvas.getActiveObject().get('volume') * 200
      );
      return false;
    }
    setting = true;
    var tempstore = false;
    var object = canvas.getActiveObject();
    if (
      canvas.getActiveObjects.length > 1 ||
      object.get('type') == 'activeSelection'
    ) {
      object = object.toGroup();
      object.set({
        shadow: {
          blur: 0,
          color: 'black',
          offsetX: 0,
          offsetY: 0,
          opacity: 0,
        },
      });
      tempstore = true;
    }
    if (object.get('assetType') == 'animatedText') {
      $('#animated-text input').val(
        animatedtext.find((x) => x.id == object.id).text
      );
    }
    if (objects.find((x) => x.id == object.get('id'))) {
      if (
        $(
          "#masks option[value='" +
            objects.find((x) => x.id == object.get('id')).mask +
            "']"
        ).length == 0
      ) {
        $('#masks').val('none');
        objects.find((x) => x.id == object.get('id')).mask = 'none';
        object.clipPath = null;
        canvas.renderAll();
      } else {
        $('#masks').val(
          objects.find((x) => x.id == object.get('id')).mask
        );
      }
      $('#masks').niceSelect('update');
    }
    updateStrokeValues();
    $('#object-x input').val(
      parseFloat(
        (
          object.get('left') -
          artboard.get('left') -
          (object.get('width') * object.get('scaleX')) / 2
        ).toFixed(2)
      )
    );
    $('#object-y input').val(
      parseFloat(
        (
          object.get('top') -
          artboard.get('top') -
          (object.get('height') * object.get('scaleY')) / 2
        ).toFixed(2)
      )
    );
    $('#object-w input').val(
      parseFloat(
        (object.get('width') * object.get('scaleX')).toFixed(2)
      )
    );
    $('#object-h input').val(
      parseFloat(
        (object.get('height') * object.get('scaleY')).toFixed(2)
      )
    );
    $('#object-r input').val(
      parseFloat(object.get('angle').toFixed(2))
    );
    $('#object-stroke input').val(
      parseFloat(object.get('strokeWidth').toFixed(2))
    );
    if (object.get('type') != 'group') {
      $('#object-shadow-x input').val(
        parseFloat(object.shadow.offsetX.toFixed(2))
      );
      $('#object-shadow-y input').val(
        parseFloat(object.shadow.offsetY.toFixed(2))
      );
      $('#object-blur input').val(
        parseFloat(object.shadow.blur.toFixed(2))
      );
      colormode = 'stroke';
      o_fill.setColor(object.get('stroke'));
      colormode = 'shadow';
      o_fill.setColor(object.shadow.color);
    }
    o_slider.setValue(object.get('opacity') * 100);
    if (object.get('type') == 'rect') {
      $('#object-corners input').val(
        parseFloat(object.get('rx').toFixed(2))
      );
      colormode = 'fill';
      o_fill.setColor(object.get('fill'));
    } else if (
      object.get('type') == 'path' ||
      object.get('type') == 'circle' ||
      object.get('type') == 'textbox'
    ) {
      colormode = 'fill';
      o_fill.setColor(object.get('fill'));
    }
    if (tempstore) {
      object.toActiveSelection();
      canvas.renderAll();
    }
    setting = false;
  } else {
    $('#canvas-w input').val(artboard.get('width'));
    $('#canvas-h input').val(artboard.get('height'));
  }
}

// Update opacity input
function updateInputs(id) {
  if (canvas.getActiveObject().get('assetType') == 'audio') {
    return false;
  }
  if ($('#object-o input').val() > 100) {
    $('#object-o input').val(100);
  } else if ($('#object-o input').val() < 0) {
    $('#object-o input').val(0);
  }
  o_slider.setValue($('#object-o input').val());
  if (
    !isNaN(parseFloat($('#object-color-fill-opacity input').val())) &&
    id == 'object-color-fill-opacity'
  ) {
    if ($('#object-color-fill-opacity input').val() > 100) {
      $('#object-color-fill-opacity').val(100);
    } else if ($('#object-color-fill-opacity input').val() < 0) {
      $('#object-color-fill-opacity input').val(0);
    }
    colormode = 'fill';
    o_fill.setColor(
      'rgba(' +
        o_fill.getColor().toRGBA()[0] +
        ',' +
        o_fill.getColor().toRGBA()[1] +
        ',' +
        o_fill.getColor().toRGBA()[2] +
        ',' +
        $('#object-color-fill-opacity input').val() / 100 +
        ')'
    );
  }
  if (
    !isNaN(
      parseFloat($('#object-color-stroke-opacity input').val())
    ) &&
    id == 'object-color-stroke-opacity'
  ) {
    if ($('#object-color-stroke-opacity input').val() > 100) {
      $('#object-color-stroke-opacity').val(100);
    } else if ($('#object-color-stroke-opacity input').val() < 0) {
      $('#object-color-stroke-opacity input').val(0);
    }
    colormode = 'stroke';
    o_fill.setColor(
      'rgba(' +
        o_fill.getColor().toRGBA()[0] +
        ',' +
        o_fill.getColor().toRGBA()[1] +
        ',' +
        o_fill.getColor().toRGBA()[2] +
        ',' +
        $('#object-color-stroke-opacity input').val() / 100 +
        ')'
    );
  }
  if (
    !isNaN(
      parseFloat($('#object-color-shadow-opacity input').val())
    ) &&
    id == 'object-color-shadow-opacity'
  ) {
    if ($('#object-color-shadow-opacity input').val() > 100) {
      $('#object-color-shadow-opacity').val(100);
    } else if ($('#object-color-shadow-opacity input').val() < 0) {
      $('#object-color-shadow-opacity input').val(0);
    }
    colormode = 'shadow';
    o_fill.setColor(
      'rgba(' +
        o_fill.getColor().toRGBA()[0] +
        ',' +
        o_fill.getColor().toRGBA()[1] +
        ',' +
        o_fill.getColor().toRGBA()[2] +
        ',' +
        $('#object-color-shadow-opacity input').val() / 100 +
        ')'
    );
  }
}

// Update object position based on panel input values
function updateObjectValues(type) {
  autoSave();
  if (canvas.getActiveObjects().length > 0) {
    if ($(this).find('input').val() || type) {
      var object = canvas.getActiveObject();
      if ($(this).attr('id') == 'animated-text') {
        return false;
      }
      if ($(this).attr('id') == 'animated-text-duration') {
        var obj = p_keyframes.find((x) => x.id == object.id);
        var length = obj.end - obj.start;
        if ($(this).find('input').val() * 1000 > length) {
          $(this)
            .find('input')
            .val(length / 1000);
        }
        animatedtext
          .find((x) => x.id == object.id)
          .setProp(
            { duration: $(this).find('input').val() * 1000 },
            canvas
          );
        save();
        return false;
      }
      if ($(this).attr('id') == 'object-volume') {
        newKeyframe(
          'volume',
          canvas.getActiveObject(),
          currenttime,
          parseFloat($(this).find('input').val()) / 200,
          true
        );
        canvas
          .getActiveObject()
          .set(
            'volume',
            parseFloat($(this).find('input').val()) / 200
          );
      }
      editingpanel = true;
      var selection = false;
      const tempselection = canvas.getActiveObjects();
      const id = $(this).attr('id');
      updateInputs(id);
      if (tempselection.length > 1) {
        object = object.toGroup();
        selection = true;
      }
      if (objects.find((x) => x.id == object.get('id'))) {
        objects.find((x) => x.id == object.get('id')).mask =
          $('#masks').val();
        if ($('#masks').val() == 'none') {
          object.clipPath = null;
          canvas.renderAll();
        } else {
          object.clipPath = canvas.getItemById($('#masks').val());
          canvas.renderAll();
        }
      }
      object.set({
        left:
          parseFloat($('#object-x input').val()) +
          artboard.get('left') +
          (object.get('width') * object.get('scaleX')) / 2,
        top:
          parseFloat($('#object-y input').val()) +
          artboard.get('top') +
          (object.get('height') * object.get('scaleY')) / 2,
        scaleX: parseFloat(
          $('#object-w input').val() / object.get('width')
        ),
        scaleY: parseFloat(
          $('#object-h input').val() / object.get('height')
        ),
        angle: parseFloat($('#object-r input').val()),
        opacity: parseFloat($('#object-o input').val() / 100),
        strokeWidth: parseFloat($('#object-stroke input').val()),
      });
      if (object.get('type') != 'group') {
        object.set({
          shadow: {
            color: object.shadow.color,
            offsetX: parseFloat($('#object-shadow-x input').val()),
            offsetY: parseFloat($('#object-shadow-y input').val()),
            opacity: 1,
            blur: parseFloat($('#object-blur input').val()),
          },
        });
      }
      canvas.renderAll();
      if (tempselection.length > 1) {
        object.toActiveSelection();
        object = canvas.getActiveObject();
      }
      canvas.discardActiveObject();
      tempselection.forEach(function (obj) {
        keyframeChanges(obj, type, id, selection);
      });
      if (object) {
        reselect(object);
        editingpanel = false;
      }
      $('#' + id + ' input').focus();
      save();
      if (type) {
        updatePanelValues();
      } else if ($(this).find('input').val().length > 0) {
        updatePanelValues();
      }
    }
  } else {
    if (
      $(this).attr('id') == 'canvas-w' ||
      $(this).attr('id') == 'canvas-h'
    ) {
      artboard.set({
        width: parseFloat($('#canvas-w input').val()),
        height: parseFloat($('#canvas-h input').val()),
      });
      canvas.renderAll();
      resizeCanvas();
      if (activepreset != 'custom') {
        if (
          presets.find((x) => x.id == activepreset).width !=
            $('#canvas-w input').val() ||
          presets.find((x) => x.id == activepreset).height !=
            $('#canvas-h input').val()
        ) {
          activepreset = 'custom';
          updatePanel();
        }
      }
    } else if ($(this).attr('id') == 'canvas-duration') {
      if (!isNaN(parseFloat($(this).find('input').val()))) {
        setDuration(parseFloat($(this).find('input').val()) * 1000);
      }
    }
    if (!isNaN(parseFloat($('#canvas-color-opacity input').val()))) {
      if ($('#canvas-color-opacity input').val() > 100) {
        $('#canvas-color-opacity input').val(100);
      } else if ($('#canvas-color-opacity input').val() < 0) {
        $('#canvas-color-opacity input').val(0);
      }
      colormode = 'back';
      o_fill.setColor(
        'rgba(' +
          o_fill.getColor().toRGBA()[0] +
          ',' +
          o_fill.getColor().toRGBA()[1] +
          ',' +
          o_fill.getColor().toRGBA()[2] +
          ',' +
          $('#canvas-color-opacity input').val() / 100 +
          ')'
      );
    }
  }
}
function setTextAnimation() {
  var object = canvas.getActiveObject();
  animatedtext
    .find((x) => x.id == object.id)
    .reset(
      $(this).parent().find('input').val(),
      animatedtext.find((x) => x.id == object.id).props,
      canvas
    );
}

$(document).on('input', '.property-input', updateObjectValues);
$(document).on('change', '.property-input', updateObjectValues);
$(document).on('change', '#masks', updateObjectValues);
$(document).on('click', '#animatedset', setTextAnimation);

// Toggle picker (maybe it could be condensed?)
function togglePicker() {
  const object = canvas.getActiveObject();
  if (!o_fill.isOpen()) {
    newcolorkeyframe = true;
    if ($(this).attr('id') == 'object-color-fill') {
      colormode = 'fill';
      o_fill.setColor(object.get('fill'));
    } else if ($(this).attr('id') == 'object-color-stroke') {
      colormode = 'stroke';
      o_fill.setColor(object.get('stroke'));
    } else if ($(this).attr('id') == 'canvas-color') {
      colormode = 'back';
      o_fill.setColor(canvas.backgroundColor);
    } else if ($(this).attr('id') == 'chroma-color') {
      colormode = 'chroma';
      if (object.filters.find((x) => x.type == 'RemoveColor')) {
        o_fill.setColor(
          object.filters.find((x) => x.type == 'RemoveColor').color
        );
      } else {
        o_fill.setColor('#FFF');
      }
    } else if ($(this).attr('id') == 'text-color') {
      colormode = 'text';
      o_fill.setColor(
        animatedtext.find((x) => x.id == object.id).props.fill
      );
    } else {
      colormode = 'shadow';
      o_fill.setColor(object.shadow.color);
    }
    newcolorkeyframe = false;
    o_fill.show();
  } else {
    o_fill.hide();
  }
}
$(document).on('click', '#canvas-color', togglePicker);
$(document).on('click', '#object-color-fill', togglePicker);
$(document).on('click', '#object-color-stroke', togglePicker);
$(document).on('click', '#object-color-shadow', togglePicker);
$(document).on('click', '#chroma-color', togglePicker);
$(document).on('click', '#text-color', togglePicker);

window.onLoadImage = function (temp) {
  $(temp).css('background-image', 'none');
};

// Populate shape grid on left panel
function populateGrid(type) {
  if (type == 'shape-tool') {
    $('#shapes-row').html('');
    $('#emojis-row').html('');
    shape_grid_items.forEach(function (item) {
      $('#shapes-row').append(
        "<div class='grid-item'><img onload='onLoadImage(this)' draggable=false src='" +
          item +
          "'></div>"
      );
    });
    emoji_items.forEach(function (item) {
      $('#emojis-row').append(
        "<div class='grid-emoji-item'><img  onload='onLoadImage(this)' draggable=false src='" +
          item +
          "'></div>"
      );
    });
  } else if (type == 'image-tool') {
    $('#images-grid').html('');
    image_categories.forEach(function (category) {
      $('#categories').append(
        "<div class='category' data-name='" +
          category.name +
          "'><img onload='onLoadImage(this)' src='" +
          category.image +
          "'>" +
          category.name +
          '</div>'
      );
    });
  } else if (type == 'video-tool') {
    $('#images-grid').html('');
    video_categories.forEach(function (category) {
      $('#categories').append(
        "<div class='category' data-name='" +
          category.name +
          "'><img onload='onLoadImage(this)' src='" +
          category.image +
          "'>" +
          category.name +
          '</div>'
      );
    });
  } else if (type == 'images-tab') {
    $('#images-grid').html('');
    var flag = false;
    uploaded_images
      .slice()
      .reverse()
      .forEach(function (item) {
        if (!item.hidden) {
          flag = true;
          $('#images-grid').append(
            "<div class='image-grid-item' data-src='" +
              item.src +
              "' data-type='" +
              item.type +
              "' data-key='" +
              item.key +
              "'><img class='delete-media' draggable=false src='assets/more-options.svg'><img draggable=false onload='onLoadImage(this)' class='image-thing' src='" +
              item.thumb +
              "'</div>"
          );
        }
      });
    $('#landing').remove();
    if (!flag) {
      $('#upload-tabs').after(
        '<div id="landing" class="upload-landing"><div id="landing-text">Your uploaded images will show up here for easy access.</div></div>'
      );
    }
  } else if (type == 'videos-tab') {
    $('#images-grid').html('');
    var flag = false;
    uploaded_videos
      .slice()
      .reverse()
      .forEach(function (item) {
        if (!item.hidden) {
          flag = true;
          $('#images-grid').append(
            "<div class='video-grid-item' data-src='" +
              item.src +
              "' data-type='" +
              item.type +
              "' data-key='" +
              item.key +
              "'><img class='delete-media' draggable=false src='assets/more-options.svg'><img draggable=false onload='onLoadImage(this)' class='image-thing' src='" +
              item.thumb +
              "'></div>"
          );
        }
      });
    $('#landing').remove();
    if (!flag) {
      $('#upload-tabs').after(
        '<div id="landing" class="upload-landing"><div id="landing-text">Your uploaded videos will show up here for easy access.</div></div>'
      );
    }
  } else if (type == 'audio-tool') {
    var flag = false;
    audio_items.forEach(function (item) {
      if (item.src == background_key) {
        flag = true;
        $('#audio-list').append(
          "<div class='audio-item audio-item-active' data-src='" +
            item.src +
            "'><div class='audio-preview'><img src='assets/play-button.svg'></div><img class='audio-thumb' src='" +
            item.thumb +
            "'><div class='audio-info'><div class='audio-info-title'>" +
            item.name +
            "</div><a href='" +
            item.link +
            "' target='_blank' class='audio-info-desc'>" +
            item.desc +
            "</a><div class='audio-info-duration'>" +
            item.duration +
            '</div></div></div></div>'
        );
      } else {
        $('#audio-list').append(
          "<div class='audio-item' data-src='" +
            item.src +
            "'><div class='audio-preview'><img src='assets/play-button.svg'></div><img class='audio-thumb' src='" +
            item.thumb +
            "'><div class='audio-info'><div class='audio-info-title'>" +
            item.name +
            "</div><a href='" +
            item.link +
            "' target='_blank' class='audio-info-desc'>" +
            item.desc +
            "</a><div class='audio-info-duration'>" +
            item.duration +
            '</div></div></div></div>'
        );
      }
    });
  } else if (type == 'text-tool') {
    $('#shapes-cont').append("<p class='row-title'>Animated</p>");
    $('#shapes-cont').append(
      "<div class='animated-text-grid'></div>"
    );
    text_animation_list.forEach(function (text) {
      $('.animated-text-grid').append(
        "<div class='animated-text-item noselect' data-id='" +
          text.name +
          "'><img draggable='false' class='noselect' src='" +
          text.src +
          "'></div>"
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Sans Serif</p>");
    text_items.sansserif.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          ", sans-serif'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Serif</p>");
    text_items.serif.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Monospace</p>");
    text_items.monospace.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Handwriting</p>");
    text_items.handwriting.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
    $('#shapes-cont').append("<p class='row-title'>Display</p>");
    text_items.display.forEach(function (text) {
      WebFont.load({
        google: {
          families: [text.fontname],
        },
      });
      $('#shapes-cont').append(
        "<div id='item-text' class='add-text noselect' data-font='" +
          text.fontname +
          "' style='font-family: " +
          text.fontname +
          "'>" +
          text.name +
          '</div>'
      );
    });
  }
}

function scrollBottom() {
  if (
    $(this).scrollTop() + $(this).innerHeight() >=
    $(this)[0].scrollHeight - 50
  ) {
    loadMoreMedia();
  }
  if ($(this).scrollTop() > 0) {
    $('#search-fixed').addClass('search-scrolling');
  } else {
    $('.search-scrolling').removeClass('search-scrolling');
  }
}

function addAnimatedText() {
  var newtext = new AnimatedText('Your text', {
    left: artboard.get('left') + artboard.get('width') / 2,
    top: artboard.get('top') + artboard.get('height') / 2,
    preset: $(this).attr('data-id'),
    typeAnim: 'letter',
    order: 'forward',
    fontFamily: 'Syne',
    duration: 1000,
    easing: 'easeInQuad',
    fill: '#FFFFFF',
  });
  animatedtext.push(newtext);
  newtext.render(canvas);
}

$(document).on('click', '.animated-text-item', addAnimatedText);

// Switch active panel in the library
function updateBrowser(type) {
  $('#browser').scrollTop(0);
  if (type == 'image-tool') {
    $('#browser-container').html(image_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'shape-tool') {
    $('#browser-container').html(shape_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'video-tool') {
    $('#browser-container').html(video_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'text-tool') {
    $('#browser-container').html(text_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'upload-tool') {
    $('#browser-container').html(upload_browser);
    populateGrid('images-tab');
    $('#browser').on('scroll', scrollBottom);
  } else if (type == 'audio-tool') {
    $('#browser-container').html(audio_browser);
    populateGrid(type);
    $('#browser').on('scroll', scrollBottom);
  }
}

// Switch tab in the uploads depending on item being uploaded
function updateUploadType() {
  $('.upload-tab-active').removeClass('upload-tab-active');
  $(this).addClass('upload-tab-active');
  populateGrid($(this).attr('id'));
}
$(document).on(
  'click',
  '.upload-tab:not(.upload-tab-active)',
  updateUploadType
);

// Switch tool
function switchTool(e) {
  $('#browser').removeClass('collapsed');
  $('#canvas-area').removeClass('canvas-full');
  if ($(this).attr('id') == 'more-tool') {
    showMore();
    return false;
  }
  resizeCanvas();
  var act = $('.tool-active');
  if (act.attr('id') == 'image-tool') {
    act.find('img').attr('src', 'assets/image.svg');
  } else if (act.attr('id') == 'text-tool') {
    act.find('img').attr('src', 'assets/text.svg');
  } else if (act.attr('id') == 'mockup-tool') {
    act.find('img').attr('src', 'assets/mockup.svg');
  } else if (act.attr('id') == 'video-tool') {
    act.find('img').attr('src', 'assets/video.svg');
  } else if (act.attr('id') == 'shape-tool') {
    act.find('img').attr('src', 'assets/shape.svg');
  } else if (act.attr('id') == 'upload-tool') {
    act.find('img').attr('src', 'assets/uploads.svg');
  } else if (act.attr('id') == 'audio-tool') {
    act.find('img').attr('src', 'assets/audio.svg');
  }
  $('.tool-active').removeClass('tool-active');
  $(this).addClass('tool-active');
  if ($(this).attr('id') == 'image-tool') {
    $(this).find('img').attr('src', 'assets/image-active.svg');
  } else if ($(this).attr('id') == 'text-tool') {
    $(this).find('img').attr('src', 'assets/text-active.svg');
  } else if ($(this).attr('id') == 'mockup-tool') {
    $(this).find('img').attr('src', 'assets/mockup-active.svg');
  } else if ($(this).attr('id') == 'video-tool') {
    $(this).find('img').attr('src', 'assets/video-active.svg');
  } else if ($(this).attr('id') == 'shape-tool') {
    $(this).find('img').attr('src', 'assets/shape-active.svg');
  } else if ($(this).attr('id') == 'upload-tool') {
    $(this).find('img').attr('src', 'assets/uploads-active.svg');
  } else if ($(this).attr('id') == 'audio-tool') {
    $(this).find('img').attr('src', 'assets/audio-active.svg');
  }
  updateBrowser($(this).attr('id'));
  resetHeight();
}
$(document).on('click', '.tool:not(.tool-active)', switchTool);

// Replace image or video by dragging on top and holding a key
function replaceObject(src, object) {
  var img = new Image();
  var width = object.width;
  var height = object.height;
  oldsrc = object._originalElement.currentSrc;
  oldobj = object;
  img.onload = function () {
    object.setElement(img);
    object.set('width', width);
    object.set('height', height);
    canvas.renderAll();
  };
  img.src = src;
}

// Drag object from the panel
function dragObject(e) {
  if (e.which == 3) {
    return false;
  }
  var drag = $(this).clone();
  drag.css({
    background: 'transparent',
    boxShadow: 'none',
    color: '#000',
  });
  drag.appendTo('body');
  drag.css({
    position: 'absolute',
    zIndex: 9999999,
    left: $(this).offset().left,
    top: $(this).offset().top,
    width: canvas.getZoom() * drag.width(),
    pointerEvents: 'none',
    opacity: 0,
  });
  var pageX = e.pageX;
  var pageY = e.pageY;
  var offset = drag.offset();
  var offsetx = drag.offset().left + drag.width() / 2 - e.pageX;
  var offsety = drag.offset().top + drag.height() / 2 - e.pageY;
  var replacing = false;
  draggingPanel = true;
  var move = false;
  canvas.discardActiveObject();
  canvas.renderAll();
  function dragging(e) {
    $('#bottom-area').addClass('noselect');
    $('#toolbar').addClass('noselect');
    $('#browser').addClass('noselect');
    $('#properties').addClass('noselect');
    $('#controls').addClass('noselect');
    move = true;
    var left = offset.left + (e.pageX - pageX);
    var top = offset.top + (e.pageY - pageY);
    drag.offset({ left: left, top: top });

    if (
      overCanvas &&
      canvas.getActiveObject() &&
      !replacing &&
      canvas.getActiveObject().type == 'image' &&
      (drag.hasClass('image-grid-item') ||
        drag.hasClass('video-grid-item'))
    ) {
      if (e.ctrlKey) {
        drag.css('visibility', 'hidden');
        replaceObject(
          drag.attr('data-src'),
          canvas.getActiveObject()
        );
        replacing = true;
      } else {
        $('#replace-image').addClass('replace-active');
      }
    } else if (
      (replacing && !canvas.getActiveObject()) ||
      (replacing && !e.ctrlKey)
    ) {
      drag.css('visibility', 'visible');
      replaceObject(oldsrc, oldobj);
      replacing = false;
      canvas.discardActiveObject();
      $('#replace-image').removeClass('replace-active');
    } else {
      $('#replace-image').removeClass('replace-active');
    }

    if (overCanvas) {
      drag.css({ opacity: 1 });
    } else {
      drag.css({ opacity: 0.5 });
    }
  }
  function released(e) {
    $('#replace-image').removeClass('replace-active');
    $('#bottom-area').removeClass('noselect');
    $('#toolbar').removeClass('noselect');
    $('#browser').removeClass('noselect');
    $('#properties').removeClass('noselect');
    $('#controls').removeClass('noselect');
    draggingPanel = false;
    $('body').off('mousemove', dragging).off('mouseup', released);
    canvasx = canvas.getPointer(e).x;
    canvasy = canvas.getPointer(e).y;
    var xpos = canvasx + offsetx - artboard.get('left');
    var ypos = canvasy + offsety - artboard.get('top');
    if (!overCanvas && move) {
      drag.remove();
      return false;
    }
    if (move && !replacing) {
      if (drag.hasClass('grid-item')) {
        newSVG(
          drag.find('img').attr('src'),
          xpos,
          ypos,
          drag.width(),
          false
        );
      } else if (drag.hasClass('image-external-grid-item')) {
        $('#load-image').addClass('loading-active');
        savePixabayImage(
          drag.attr('data-src'),
          xpos,
          ypos,
          drag.width()
        );
      } else if (drag.hasClass('video-external-grid-item')) {
        savePixabayVideo(
          drag.attr('data-src'),
          drag.find('img').attr('src'),
          xpos,
          ypos
        );
      } else if (drag.hasClass('image-grid-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.attr('data-src'),
          xpos,
          ypos,
          drag.width(),
          false
        );
      } else if (drag.hasClass('grid-emoji-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.find('img').attr('src'),
          xpos,
          ypos,
          drag.width(),
          false
        );
      } else if (drag.hasClass('add-text')) {
        if (drag.attr('id') == 'heading-text') {
          newTextbox(
            50,
            700,
            'Add a heading',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'subheading-text') {
          newTextbox(
            22,
            500,
            'Add a subheading',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'body-text') {
          newTextbox(
            18,
            400,
            'Add body text',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        } else {
          newTextbox(
            18,
            400,
            'Your text',
            canvasx - artboard.get('left'),
            canvasy - artboard.get('top'),
            drag.width(),
            false,
            drag.attr('data-font')
          );
        }
      } else if (drag.hasClass('video-grid-item')) {
        $('#load-video').addClass('loading-active');
        loadVideo(drag.attr('data-src'), canvasx, canvasy);
      }
    } else if (!move && !replacing) {
      if (drag.hasClass('grid-item')) {
        newSVG(
          drag.find('img').attr('src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          100,
          true
        );
      } else if (drag.hasClass('image-external-grid-item')) {
        savePixabayImage(
          drag.attr('data-src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          150
        );
      } else if (drag.hasClass('video-external-grid-item')) {
        savePixabayVideo(
          drag.attr('data-src'),
          drag.find('img').attr('src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2
        );
      } else if (drag.hasClass('image-grid-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.attr('data-src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          150,
          true
        );
      } else if (drag.hasClass('grid-emoji-item')) {
        $('#load-image').addClass('loading-active');
        loadImage(
          drag.find('img').attr('src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          50,
          true
        );
      } else if (drag.hasClass('add-text')) {
        if (drag.attr('id') == 'heading-text') {
          newTextbox(
            50,
            700,
            'Add a heading',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'subheading-text') {
          newTextbox(
            22,
            500,
            'Add a subheading',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        } else if (drag.attr('id') == 'body-text') {
          newTextbox(
            18,
            400,
            'Add body text',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        } else {
          newTextbox(
            18,
            400,
            'Your text',
            artboard.get('left') + artboard.get('width') / 2,
            artboard.get('top') + artboard.get('height') / 2,
            drag.width(),
            true,
            drag.attr('data-font')
          );
        }
      } else if (drag.hasClass('video-grid-item')) {
        $('#load-video').addClass('loading-active');
        loadVideo(
          drag.attr('data-src'),
          artboard.get('left') + artboard.get('width') / 2,
          artboard.get('top') + artboard.get('height') / 2,
          true
        );
      }
    }
    drag.remove();
  }
  $('body').on('mouseup', released).on('mousemove', dragging);
}
$(document).on('mousedown', '.image-grid-item', dragObject);
$(document).on('mousedown', '.video-grid-item', dragObject);
$(document).on('mousedown', '.grid-item', dragObject);
$(document).on('mousedown', '.grid-emoji-item', dragObject);
$(document).on('mousedown', '.add-text', dragObject);
$(document).on('mousedown click mouseup', '.credit', function (e) {
  e.stopPropagation();
});

// Collapse library
function collapsePanel() {
  $('#browser').addClass('collapsed');
  $('#behind-browser').addClass('collapsed');
  $('#canvas-area').addClass('canvas-full');
  var act = $('.tool-active');
  if (act.attr('id') == 'image-tool') {
    act.find('img').attr('src', 'assets/image.svg');
  } else if (act.attr('id') == 'text-tool') {
    act.find('img').attr('src', 'assets/text.svg');
  } else if (act.attr('id') == 'mockup-tool') {
    act.find('img').attr('src', 'assets/mockup.svg');
  } else if (act.attr('id') == 'video-tool') {
    act.find('img').attr('src', 'assets/video.svg');
  } else if (act.attr('id') == 'shape-tool') {
    act.find('img').attr('src', 'assets/shape.svg');
  } else if (act.attr('id') == 'upload-tool') {
    act.find('img').attr('src', 'assets/uploads.svg');
  }
  $('.tool-active').removeClass('tool-active');
  resizeCanvas();
}
$(document).on('click', '#collapse', collapsePanel);
$(document).on('click', '.tool-active', collapsePanel);

// Change canvas dimensions to selected preset
function setPreset() {
  if ($(this).val() != 'custom') {
    artboard.set({
      width: presets.find((x) => x.id == $(this).val()).width,
      height: presets.find((x) => x.id == $(this).val()).height,
    });
    canvas.renderAll();
    resizeCanvas();
  }
  activepreset = $(this).val();
  updatePanel();
  save();
}
$(document).on('change', '#preset', setPreset);

function setTextPreset() {
  var object = canvas.getActiveObject();
  animatedtext
    .find((x) => x.id == object.id)
    .setProp({ preset: $(this).val() }, canvas);
  save();
}
function setTextEasing() {
  var object = canvas.getActiveObject();
  animatedtext
    .find((x) => x.id == object.id)
    .setProp({ easing: $(this).val() }, canvas);
  save();
}
$(document).on('change', '#preset-picker', setTextPreset);
$(document).on('change', '#easing-picker', setTextEasing);

// Delete media from the panel
function deleteMedia(e) {
  e.preventDefault();
  e.stopPropagation();
  var key = $(this).parent().attr('data-key');
  if (
    window.confirm(
      'Are you sure you want to permanently delete this asset? It will also remove any instances of it in the canvas.'
    )
  ) {
    deleteAsset(key);
  }
}
$(document).on('mousedown', '.delete-media', deleteMedia);

// Save layer name
function saveLayerName() {
  $('.name-active').prop('readonly', true);
  if ($('.name-active').val() == '') {
    $('.name-active').val('Untitled layer');
  }
  objects.find(
    (x) =>
      x.id == $('.name-active').parent().parent().attr('data-object')
  ).label = $('.name-active').val();
  save();
  $('.name-active').removeClass('name-active');
  if (window.getSelection) {
    if (window.getSelection().empty) {
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      window.getSelection().removeAllRanges();
    }
  } else if (document.selection) {
    document.selection.empty();
  }
  editinglayer = false;
}
$(document).on('focusout', '.layer-custom-name', saveLayerName);

// Zoom to specific level
function zoomTo() {
  var zoom;
  if ($(this).attr('data-zoom') == 'in') {
    zoom = canvas.getZoom() + 0.2;
  } else if ($(this).attr('data-zoom') == 'out') {
    zoom = canvas.getZoom() - 0.2;
  } else {
    zoom = parseInt($(this).attr('data-zoom')) / 100;
  }
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
$(document).on('click', '.zoom-options-item', zoomTo);

// Add background audio (temporary)
function addBackgroundAudio() {
  background_audio = new Audio('assets/audio.wav');
}

// Hide all modals
function hideModals() {
  $('.modal-open').removeClass('modal-open');
}
$('#background-overlay').on('click', hideModals);

// Open download modal
function downloadModal() {
  if (!recording) {
    hideModals();
    $('#download-modal').addClass('modal-open');
    $('#background-overlay').addClass('modal-open');
  }
}
$('#download').on('click', downloadModal);

// Open import/export modal
function importExportModal() {
  hideModals();
  $('#import-export-modal').toggleClass('modal-open');
  $('#background-overlay').toggleClass('modal-open');
}
$('#share').on('click', importExportModal);

function searchInput() {
  var value = $(this).val().toLowerCase();
  if (value == '') {
    $('#delete-search').removeClass('show-delete');
  } else {
    $('#delete-search').addClass('show-delete');
  }
}

function fancyTimeFormat(duration) {
  var hrs = ~~(duration / 3600);
  var mins = ~~((duration % 3600) / 60);
  var secs = ~~duration % 60;
  var ret = '';
  if (hrs > 0) {
    ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
  }
  ret += '' + mins + ':' + (secs < 10 ? '0' : '');
  ret += '' + secs;
  return ret;
}

function loadMoreMedia() {
  var value = $('#browser-search input').val();
  if (value != '' && page != false) {
    page += 1;
    if ($('#image-tool').hasClass('tool-active')) {
      var URL =
        'https://pixabay.com/api/?key=' +
        API_KEY +
        '&q=' +
        encodeURIComponent(value) +
        '&page=' +
        page;
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            $('#images-grid').append(
              "<div class='image-grid-item image-external-grid-item' data-src='" +
                hit.webformatURL +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><img draggable=false onload='onLoadImage(this)' src='" +
                hit.webformatURL +
                "'</div>"
            );
          });
        } else {
          page = false;
        }
      });
    } else if ($('#video-tool').hasClass('tool-active')) {
      var URL =
        'https://pixabay.com/api/videos/?key=' +
        API_KEY +
        '&q=' +
        encodeURIComponent(value) +
        '&page=' +
        page;
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            var video = hit.videos.medium.url;
            $('#images-grid').append(
              "<div class='image-grid-item video-external-grid-item' data-src='" +
                video +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><div id='time-video'>" +
                fancyTimeFormat(hit.duration) +
                "</div><img draggable=false onload='onLoadImage(this)' src='assets/transparent.png'</div>"
            );
            createVideoThumbnail(video, 250, 0, true).then(function (
              data
            ) {
              $(".image-grid-item[data-src='" + video + "']")
                .find('img')
                .attr('src', data);
            });
          });
        } else {
          page = false;
        }
      });
    }
  }
}

function search() {
  page = 1;
  var value = $('#browser-search input').val();
  if ($('#image-tool').hasClass('tool-active')) {
    var URL =
      'https://pixabay.com/api/?key=' +
      API_KEY +
      '&q=' +
      encodeURIComponent(value) +
      '&page=' +
      page;
    $('#images-grid').html('');
    if (value != '') {
      $('#pixabay').addClass('hide-pixabay');
      $('#landing').addClass('hide-landing');
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            $('#images-grid').append(
              "<div class='image-grid-item image-external-grid-item' data-src='" +
                hit.webformatURL +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><img draggable=false onload='onLoadImage(this)' src='" +
                hit.webformatURL +
                "'</div>"
            );
          });
        } else {
          $('#shapes-cont').html(
            "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
              encodeURIComponent(value) +
              '&#x22;. Please try a different query.</div>'
          );
        }
      });
    } else {
      $('#pixabay').removeClass('hide-pixabay');
      $('#landing').removeClass('hide-landing');
    }
  } else if ($('#video-tool').hasClass('tool-active')) {
    var URL =
      'https://pixabay.com/api/videos/?key=' +
      API_KEY +
      '&q=' +
      encodeURIComponent(value);
    $('#images-grid').html('');
    if (value != '') {
      $('#landing').addClass('hide-landing');
      $('#pixabay').addClass('hide-pixabay');
      $.getJSON(URL, function (data) {
        if (parseInt(data.totalHits) > 0) {
          $.each(data.hits, function (i, hit) {
            var video = hit.videos.medium.url;
            $('#images-grid').append(
              "<div class='image-grid-item video-external-grid-item' data-src='" +
                video +
                "'><a class='credit' href='" +
                hit.pageURL +
                "' target='_blank'>" +
                hit.user +
                "</a><div id='time-video'>" +
                fancyTimeFormat(hit.duration) +
                "</div><img draggable=false onload='onLoadImage(this)' src='assets/transparent.png'</div>"
            );
            //createVideoThumbnail(video, 250, 0, true).then(function(data){
            $(".image-grid-item[data-src='" + video + "']")
              .find('img')
              .attr(
                'src',
                'https://i.vimeocdn.com/video/' +
                  hit.picture_id +
                  '_640x360.jpg'
              );
            //});
          });
        } else {
          $('#shapes-cont').html(
            "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
              encodeURIComponent(value) +
              '&#x22;. Please try a different query.</div>'
          );
        }
      });
    } else {
      $('#pixabay').removeClass('hide-pixabay');
      $('#landing').removeClass('hide-landing');
    }
  } else if ($('#shape-tool').hasClass('tool-active')) {
    if (value == '') {
      $('#shapes-cont').html(
        '<p class="row-title">Shapes</p><div class="gallery-row" id="shapes-row"></div><p class="row-title">Emojis</p><div class="gallery-row" id="emojis-row"></div>'
      );
      populateGrid('shape-tool');
    } else {
      $('.row-title').remove();
      $('.gallery-row').remove();
      $('#shapes-cont').html("<div class='gallery-row'></div>");
      var combined = shape_grid_items.concat(emoji_items);
      var flag = false;
      combined.forEach(function (item) {
        if (item.indexOf(value) > -1) {
          flag = true;
          if (item.indexOf('emoji') > -1) {
            $('.gallery-row').append(
              "<div class='grid-emoji-item'><img draggable=false src='" +
                item +
                "'></div>"
            );
          } else {
            $('.gallery-row').append(
              "<div class='grid-item'><img draggable=false src='" +
                item +
                "'></div>"
            );
          }
        }
      });
      if (!flag) {
        $('#shapes-cont').html(
          "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
            encodeURIComponent(value) +
            '&#x22;. Please try a different query.</div>'
        );
      }
    }
  } else if ($('#text-tool').hasClass('tool-active')) {
    if (value == '') {
      $('#browser-container').html(text_browser);
      populateGrid('text-tool');
    } else {
      $('#shapes-cont').html('');
      $('.row-title').remove();
      var flag = false;
      fonts.forEach(function (font) {
        if (font.toLowerCase().indexOf(value) > -1) {
          flag = true;
          WebFont.load({
            google: {
              families: [font],
            },
          });
          $('#shapes-cont').append(
            "<div id='item-text' class='add-text noselect' data-font='" +
              font +
              "' style='font-family: " +
              font +
              "'>" +
              font +
              '</div>'
          );
        }
      });
      if (!flag) {
        $('#shapes-cont').html(
          "<div id='no-results'>Sorry, we couldn't find any results for &#x22;" +
            encodeURIComponent(value) +
            '&#x22;. Please try a different query.</div>'
        );
      }
    }
  }
}

function searchCategory() {
  $('#browser-search input').val($(this).attr('data-name'));
  $('#delete-search').addClass('show-delete');
  search();
  $('#pixabay').addClass('hide-pixabay');
}

function deleteSearch() {
  $('#browser-search input').val('');
  $('#delete-search').removeClass('show-delete');
  if ($('#shape-tool').hasClass('tool-active')) {
    $('#shapes-cont').html(
      '<p class="row-title">Shapes</p><div class="gallery-row" id="shapes-row"></div><p class="row-title">Emojis</p><div class="gallery-row" id="emojis-row"></div>'
    );
    populateGrid('shape-tool');
  } else if ($('#image-tool').hasClass('tool-active')) {
    $('#images-grid').html('');
    $('#landing').removeClass('hide-landing');
    $('#pixabay').removeClass('hide-pixabay');
  } else if ($('#video-tool').hasClass('tool-active')) {
    $('#images-grid').html('');
    $('#landing').removeClass('hide-landing');
    $('#pixabay').removeClass('hide-pixabay');
  } else if ($('#text-tool').hasClass('tool-active')) {
    $('#browser-container').html(text_browser);
    populateGrid('text-tool');
  }
}
$(document).on('click', '#delete-search', deleteSearch);
$(document).on('input', '#browser-search input', searchInput);
$(document).on('click', '#search-button', search);
$(document).on('click', '.category', searchCategory);

function replaceAudioBackground() {
  var src = $(this).attr('data-src');
  newAudioLayer(src);
  /*
	if ($(this).hasClass("audio-item-active")) {
		background_audio = false;
		background_key = false;
		$(this).removeClass("audio-item-active");
		save();
	} else {
		var src = $(this).attr("data-src");
		if (background_audio != false) {
			$("#audio-upload-button").removeClass("remove-audio");
			$("#audio-upload-button").html('<img src="assets/upload.svg"> Upload audio');
		}
		db.collection("projects").doc({id: 1}).update({
			audiosrc: src,
		});
		background_audio = new Audio(src);
		background_audio.crossOrigin = "anonymous";
		background_key = src;
		save();
		$(this).addClass("audio-item-active");
	}		
	*/
}
$(document).on('click', '.audio-item', replaceAudioBackground);

function previewAudioBackground(e) {
  e.preventDefault();
  e.stopPropagation();
  var src = $(this).parent().attr('data-src');
  if ($(this).find('img').attr('src') == 'assets/play-button.svg') {
    temp_audio = new Audio(src);
    temp_audio.crossOrigin = 'anonymous';
    temp_audio.currentTime = 0;
    temp_audio.play();
    $(this).find('img').attr('src', 'assets/pause-button.svg');
  } else {
    if (temp_audio != false) {
      temp_audio.pause();
    }
    $(this).find('img').attr('src', 'assets/play-button.svg');
  }
}
$(document).on('click', '.audio-preview', previewAudioBackground);

/* Filters options */
function checkFilter() {
  resetFilters();
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if (
      canvas.getActiveObjects().length == 1 &&
      (obj.type == 'image' || obj.type == 'video')
    ) {
      var value = 'none';
      if (obj.filters.length > 0) {
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
            value = filter.type;
          } else if (filter.type == 'Brightness') {
            sliders
              .find((x) => x.name == 'filter-brightness')
              .slider.setValue(filter.brightness * 100);
          } else if (filter.type == 'Contrast') {
            sliders
              .find((x) => x.name == 'filter-contrast')
              .slider.setValue(filter.contrast * 100);
          } else if (filter.type == 'Vibrance') {
            sliders
              .find((x) => x.name == 'filter-vibrance')
              .slider.setValue(filter.vibrance * 100);
          } else if (filter.type == 'Saturation') {
            sliders
              .find((x) => x.name == 'filter-saturation')
              .slider.setValue(filter.saturation * 100);
          } else if (filter.type == 'HueRotation') {
            sliders
              .find((x) => x.name == 'filter-hue')
              .slider.setValue(filter.rotation * 100);
          } else if (filter.type == 'Blur') {
            blurslider.setValue(filter.blur * 100);
          } else if (filter.type == 'Noise') {
            noiseslider.setValue(filter.noise);
          }
          $('#filters-list').val(value);
          $('#filters-list').niceSelect('update');
        });
      } else {
        $('#filters-list').val(value);
        $('#filters-list').niceSelect('update');
      }
    }
  }
}
function clearFilters() {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    obj.filters = $.grep(obj.filters, function (i) {
      return (
        i.type != 'BlackWhite' &&
        i.type != 'Invert' &&
        i.type != 'Sepia' &&
        i.type != 'Kodachrome' &&
        i.type != 'Polaroid' &&
        i.type != 'Technicolor' &&
        i.type != 'Brownie' &&
        i.type != 'Vintage'
      );
    });
    canvas.renderAll();
  }
}
function applyFilter(name) {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if (name == 'Sepia') {
      obj.filters.push(new f.Sepia());
    } else if (name == 'Invert') {
      obj.filters.push(new f.Invert());
    } else if (name == 'BlackWhite') {
      obj.filters.push(new f.BlackWhite());
    } else if (name == 'Kodachrome') {
      obj.filters.push(new f.Kodachrome());
    } else if (name == 'Polaroid') {
      obj.filters.push(new f.Polaroid());
    } else if (name == 'Technicolor') {
      obj.filters.push(new f.Technicolor());
    } else if (name == 'Vintage') {
      obj.filters.push(new f.Vintage());
    } else if (name == 'Brownie') {
      obj.filters.push(new f.Brownie());
    }
    obj.applyFilters();
    canvas.renderAll();
    save();
  }
}
function updateMediaFilters() {
  var value = $(this).val();
  if (canvas.getActiveObject()) {
    clearFilters();
    applyFilter(value);
  }
}
$(document).on('change', '#filters select', updateMediaFilters);

function resetFilters() {
  if (canvas.getActiveObject()) {
    var object = canvas.getActiveObject();
    if (object.filters) {
      if (!object.filters.find((x) => x.type == 'Blur')) {
        blurslider.setValue(0);
      }
      if (!object.filters.find((x) => x.type == 'Noise')) {
        noiseslider.setValue(0);
      }
      if (object.filters.length > 0) {
        sliders.forEach(function (slider) {
          var name = '';
          if (slider.name == 'filter-hue') {
            name = 'HueRotation';
          } else if (slider.name == 'filter-brightness') {
            name = 'Brightness';
          } else if (slider.name == 'filter-vibrance') {
            name = 'Vibrance';
          } else if (slider.name == 'filter-contrast') {
            name = 'Contrast';
          } else if (slider.name == 'filter-saturation') {
            name = 'Saturation';
          }
          if (!object.filters.find((x) => x.type == name)) {
            slider.slider.setValue(0);
          }
        });
      } else {
        sliders.forEach(function (slider) {
          slider.slider.setValue(0);
        });
      }
    } else {
      sliders.forEach(function (slider) {
        slider.slider.setValue(0);
      });
    }
  }
}
function removeFilters() {
  sliders.forEach(function (slider) {
    slider.slider.setValue(0);
  });
}
$(document).on('click', '#reset-filters', removeFilters);

function updateChromaValues() {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if ($('.status-active').attr('id') == 'status-on') {
      if (obj.filters.find((x) => x.type == 'RemoveColor')) {
        obj.filters.find((x) => x.type == 'RemoveColor').distance =
          chromaslider.getValue() / 100;
        obj.filters.find((x) => x.type == 'RemoveColor').color = $(
          '#chroma-color input'
        ).val();
      } else {
        obj.filters.push(
          new f.RemoveColor({
            distance: chromaslider.getValue() / 100,
            color: $('#chroma-color input').val(),
          })
        );
      }
      obj.applyFilters();
      canvas.renderAll();
      save();
    } else {
      if (obj.filters.find((x) => x.type == 'RemoveColor')) {
        obj.filters = $.grep(obj.filters, function (i) {
          return i.type != 'RemoveColor';
        });
        obj.applyFilters();
        canvas.renderAll();
        save();
      }
    }
  }
}

function updateChromaUI() {
  if (canvas.getActiveObject()) {
    var obj = canvas.getActiveObject();
    if (obj.filters) {
      if (obj.filters.length > 0) {
        if (obj.filters.find((x) => x.type == 'RemoveColor')) {
          $('.status-active').removeClass('status-active');
          $('#status-on').addClass('status-active');
          chromaslider.setValue(
            obj.filters.find((x) => x.type == 'RemoveColor').distance
          );
          $('#chroma-color input').val(
            obj.filters.find((x) => x.type == 'RemoveColor').color
          );
          $('#color-chroma-side').css(
            'background-color',
            obj.filters.find((x) => x.type == 'RemoveColor').color
          );
        } else {
          $('.status-active').removeClass('status-active');
          $('#status-off').addClass('status-active');
          chromaslider.setValue(1);
          $('#chroma-color input').val('#FFFFFF');
          $('#color-chroma-side').css('background-color', '#FFFFF');
        }
      }
    }
  }
}

function toggleChroma() {
  if (canvas.getActiveObject()) {
    $('.status-active').removeClass('status-active');
    $(this).addClass('status-active');
    updateChromaValues();
  }
}

$(document).on(
  'click',
  '.status-trigger:not(.status-active)',
  toggleChroma
);

async function getColor() {
  try {
    const selectedColor = await eyeDropper.open();
    colormode = 'chroma';
    o_fill.setColor(selectedColor.sRGBHex);
  } catch (err) {}
}
$(document).on('click', '.pcr-current-color', getColor);

function closeFilters() {
  $('.show-filters').removeClass('show-filters');
}

function openFilters() {
  $('#filters-parent').addClass('show-filters');
}

$(document).on('click', '#filters-button', openFilters);
$(document).on('click', '#filters-close', closeFilters);

function toggleSpeed(e) {
  e.stopPropagation();
  e.preventDefault();
  $('#speed-settings').toggleClass('show-speed');
  $('#speed-arrow').toggleClass('arrow-on');
}
function setSpeed(e) {
  e.stopPropagation();
  e.preventDefault();
  speed = parseFloat($(this).attr('data-speed'));
  $('#speed span').html($(this).html());
  toggleSpeed(e);
  save();
}

$(document).on('click', '.speed', setSpeed);
$(document).on('click', '#speed', toggleSpeed);

function showMore() {
  $('#more-over').css(
    'top',
    $('#more-tool').offset().top + 5 - $('#more-over').height() / 4
  );
  $('#more-over').addClass('more-show');
}
function hideMore() {
  $('#more-over').removeClass('more-show');
}

function handleLottieUpload() {
  var filething = $('#filepick3').get(0).files;
  var reader = new FileReader();
  reader.onload = function (event) {
    newLottieAnimation(
      artboard.get('left') + artboard.get('width') / 2,
      artboard.get('top') + artboard.get('height') / 2,
      event.target.result
    );
  };
  reader.readAsDataURL(filething.item(0));
}

$(document).on('change', '#filepick3', handleLottieUpload);

function uploadLottie() {
  $('#filepick3').click();
}
$(document).on('click', '#upload-lottie', uploadLottie);
