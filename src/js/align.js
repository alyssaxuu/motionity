// Center line reference
function initLines() {
  if (canvas.getItemById('center_h')) {
    canvas.remove(canvas.getItemById('center_h'));
    canvas.remove(canvas.getItemById('center_v'));
  }
  if (canvas.getItemById('line_h')) {
    canvas.remove(canvas.getItemById('line_h'));
    canvas.remove(canvas.getItemById('line_v'));
  }

  // Canvas center reference
  canvas.add(
    new fabric.Line(
      [
        canvas.get('width') / 2,
        0,
        canvas.get('width') / 2,
        canvas.get('height'),
      ],
      {
        opacity: 0,
        selectable: false,
        evented: false,
        id: 'center_h',
      }
    )
  );
  canvas.add(
    new fabric.Line(
      [
        0,
        canvas.get('height') / 2,
        canvas.get('width'),
        canvas.get('height') / 2,
      ],
      {
        opacity: 0,
        selectable: false,
        evented: false,
        id: 'center_v',
      }
    )
  );

  // Canvas alignemnt guides
  line_h = new fabric.Line(
    [
      canvas.get('width') / 2,
      artboard.get('top'),
      canvas.get('width') / 2,
      artboard.get('height') + artboard.get('top'),
    ],
    {
      stroke: 'red',
      opacity: 0,
      selectable: false,
      evented: false,
      id: 'line_h',
    }
  );
  line_v = new fabric.Line(
    [
      artboard.get('left'),
      canvas.get('height') / 2,
      artboard.get('width') + artboard.get('left'),
      canvas.get('height') / 2,
    ],
    {
      stroke: 'red',
      opacity: 0,
      selectable: false,
      evented: false,
      id: 'line_v',
    }
  );
  canvas.add(line_h);
  canvas.add(line_v);
}

function alignControls(object, type) {
  if (type == 'align-top') {
    object.set(
      'top',
      artboard.get('top') +
        (object.get('height') * object.get('scaleY')) / 2
    );
  } else if (type == 'align-center-v') {
    object.set(
      'top',
      artboard.get('top') + artboard.get('height') / 2
    );
  } else if (type == 'align-bottom') {
    object.set(
      'top',
      artboard.get('top') +
        artboard.get('height') -
        (object.get('height') * object.get('scaleY')) / 2
    );
  } else if (type == 'align-left') {
    object.set(
      'left',
      artboard.get('left') +
        (object.get('width') * object.get('scaleX')) / 2
    );
  } else if (type == 'align-center-h') {
    object.set(
      'left',
      artboard.get('left') + artboard.get('width') / 2
    );
  } else {
    object.set(
      'left',
      artboard.get('left') +
        artboard.get('width') -
        (object.get('width') * object.get('scaleX')) / 2
    );
  }
}

// Align object
function alignObject() {
  const type = $(this).attr('id');
  const object = canvas.getActiveObject();
  console.log(canvas.getActiveObject().type);
  if (canvas.getActiveObject().type == 'activeSelection') {
    const tempselection = canvas.getActiveObject();
    canvas.discardActiveObject();
    tempselection._objects.forEach(function (object) {
      alignControls(object, type);
      canvas.renderAll();
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
    });
    reselect(tempselection);
  } else {
    alignControls(object, type);
    canvas.renderAll();
    newKeyframe(
      'left',
      object,
      currenttime,
      object.get('left'),
      true
    );
    newKeyframe('top', object, currenttime, object.get('top'), true);
  }
}
$(document).on('click', '.align', alignObject);

// Alignment guides
function centerLines(e) {
  if (!cropping) {
    line_h.opacity = 0;
    line_v.opacity = 0;
    canvas.renderAll();
    const snapZone = 5;
    const obj_left = e.target.left;
    const obj_top = e.target.top;
    const obj_width = e.target.get('width') * e.target.get('scaleX');
    const obj_height =
      e.target.get('height') * e.target.get('scaleY');
    canvas.forEachObject(function (obj, index, array) {
      // Check for horizontal snapping
      function checkHSnap(a, b, snapZone, e, type) {
        if (a > b - snapZone && a < b + snapZone) {
          line_h.opacity = 1;
          line_h.bringToFront();
          var value = b;
          if (type == 1) {
            value = b;
          } else if (type == 2) {
            value =
              b -
              (e.target.get('width') * e.target.get('scaleX')) / 2;
          } else if (type == 3) {
            value =
              b +
              (e.target.get('width') * e.target.get('scaleX')) / 2;
          }
          e.target
            .set({
              left: value,
            })
            .setCoords();
          line_h
            .set({
              x1: b,
              y1: artboard.get('top'),
              x2: b,
              y2: artboard.get('height') + artboard.get('top'),
            })
            .setCoords();
          canvas.renderAll();
        }
      }

      // Check for vertical snapping
      function checkVSnap(a, b, snapZone, e, type) {
        if (a > b - snapZone && a < b + snapZone) {
          line_v.opacity = 1;
          line_v.bringToFront();
          var value = b;
          if (type == 1) {
            value = b;
          } else if (type == 2) {
            value =
              b -
              (e.target.get('height') * e.target.get('scaleY')) / 2;
          } else if (type == 3) {
            value =
              b +
              (e.target.get('height') * e.target.get('scaleY')) / 2;
          }
          e.target
            .set({
              top: value,
            })
            .setCoords();
          line_v
            .set({
              y1: b,
              x1: artboard.get('left'),
              y2: b,
              x2: artboard.get('width') + artboard.get('left'),
            })
            .setCoords();
          canvas.renderAll();
        }
      }
      if (obj != e.target && obj != line_h && obj != line_v) {
        if (
          obj.get('id') == 'center_h' ||
          obj.get('id') == 'center_v'
        ) {
          var check1 = [[obj_left, obj.get('left'), 1]];
          var check2 = [[obj_top, obj.get('top'), 1]];

          for (var i = 0; i < check1.length; i++) {
            checkHSnap(
              check1[i][0],
              check1[i][1],
              snapZone,
              e,
              check1[i][2]
            );
            checkVSnap(
              check2[i][0],
              check2[i][1],
              snapZone,
              e,
              check2[i][2]
            );
          }
        } else {
          var check1 = [
            [obj_left, obj.get('left'), 1],
            [
              obj_left,
              obj.get('left') +
                (obj.get('width') * obj.get('scaleX')) / 2,
              1,
            ],
            [
              obj_left,
              obj.get('left') -
                (obj.get('width') * obj.get('scaleX')) / 2,
              1,
            ],
            [obj_left + obj_width / 2, obj.get('left'), 2],
            [
              obj_left + obj_width / 2,
              obj.get('left') +
                (obj.get('width') * obj.get('scaleX')) / 2,
              2,
            ],
            [
              obj_left + obj_width / 2,
              obj.get('left') -
                (obj.get('width') * obj.get('scaleX')) / 2,
              2,
            ],
            [obj_left - obj_width / 2, obj.get('left'), 3],
            [
              obj_left - obj_width / 2,
              obj.get('left') +
                (obj.get('width') * obj.get('scaleX')) / 2,
              3,
            ],
            [
              obj_left - obj_width / 2,
              obj.get('left') -
                (obj.get('width') * obj.get('scaleX')) / 2,
              3,
            ],
          ];
          var check2 = [
            [obj_top, obj.get('top'), 1],
            [
              obj_top,
              obj.get('top') +
                (obj.get('height') * obj.get('scaleY')) / 2,
              1,
            ],
            [
              obj_top,
              obj.get('top') -
                (obj.get('height') * obj.get('scaleY')) / 2,
              1,
            ],
            [obj_top + obj_height / 2, obj.get('top'), 2],
            [
              obj_top + obj_height / 2,
              obj.get('top') +
                (obj.get('height') * obj.get('scaleY')) / 2,
              2,
            ],
            [
              obj_top + obj_height / 2,
              obj.get('top') -
                (obj.get('height') * obj.get('scaleY')) / 2,
              2,
            ],
            [obj_top - obj_height / 2, obj.get('top'), 3],
            [
              obj_top - obj_height / 2,
              obj.get('top') +
                (obj.get('height') * obj.get('scaleY')) / 2,
              3,
            ],
            [
              obj_top - obj_height / 2,
              obj.get('top') -
                (obj.get('height') * obj.get('scaleY')) / 2,
              3,
            ],
          ];

          for (var i = 0; i < check1.length; i++) {
            checkHSnap(
              check1[i][0],
              check1[i][1],
              snapZone,
              e,
              check1[i][2]
            );
            checkVSnap(
              check2[i][0],
              check2[i][1],
              snapZone,
              e,
              check2[i][2]
            );
          }
        }
      }
    });
  }
}
