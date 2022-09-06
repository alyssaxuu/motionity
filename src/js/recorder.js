const FPS = 30;
let frame = 0;
var chunks = [];
var stream;
var rec;
var track;

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function initRecorder() {
  stream = document.getElementById('canvasrecord').captureStream(0);
  track = stream.getVideoTracks()[0];

  if (!track.requestFrame) {
    track.requestFrame = () => stream.requestFrame();
  }

  rec = new MediaRecorder(stream, {
    bitsPerSecond: 3200000,
  });

  rec.ondataavailable = function (evt) {
    console.log('chunky');
    chunks.push(evt.data);
  };

  rec.start();

  console.log('Recorder has been started');

  rec.onstart = function () {
    rec.pause();
    console.log('start!');
  };
}

async function recordFrame() {
  console.log(frame);

  waitForEvent(rec, 'pause');

  //rec.onpause = async function(e) {

  // wake up the recorder
  rec.resume();
  recordAnimate(false, (frame / FPS) * 1000);
  //animate(false, (frame/FPS)*1000)
  // force write the frame
  track.requestFrame();

  // wait until our frame-time elapsed
  await timeout(1000 / FPS);

  // sleep recorder
  rec.pause();
  //}
}

async function exportRecording() {
  rec.stop();
  stream.getTracks().forEach((track) => track.stop());
  await waitForEvent(rec, 'stop');
  return new Blob(chunks);
}

// Record canvas
async function record() {
  updateRecordCanvas();
  if ($('input[name=radio]:checked').val() == 'image') {
    recording = true;
    paused = true;
    animate(false, currenttime);
    const dataURL = canvasrecord.toDataURL({
      format: 'png',
    });
    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    recording = false;
  } else {
    if (!recording) {
      recording = true;
      paused = true;
      recordAnimate(false, (frame / FPS) * 1000);
      recording = true;
      $('#download-real').html('Rendering...');
      $('#download-real').addClass('downloading');
      var fps = 60;
      var aCtx = new AudioContext();
      function audioTimerLoop(callback, frequency) {
        var freq = frequency / 1000;
        var silence = aCtx.createGain();
        silence.gain.value = 0;
        silence.connect(aCtx.destination);
        onOSCend();
        var stopped = false;
        function onOSCend() {
          osc = aCtx.createOscillator();
          osc.onended = onOSCend;
          osc.connect(silence);
          osc.start(0);
          osc.stop(aCtx.currentTime + freq);
          callback(aCtx.currentTime);
          if (stopped) {
            osc.onended = function () {
              return;
            };
          }
        }
        return function () {
          stopped = true;
        };
      }
      var stopAnim = audioTimerLoop(renderAnim, 1000 / fps);
      var stream = document
        .getElementById('canvasrecord')
        .captureStream(fps);
      objects.forEach(function (object) {
        if (
          canvasrecord.getItemById(object.id).get('assetType') &&
          canvasrecord.getItemById(object.id).get('assetType') ==
            'video'
        ) {
          var audio = $(
            canvasrecord.getItemById(object.id).getElement()
          )[0];
          var audioContext = new AudioContext();
          var audioSource =
            audioContext.createMediaElementSource(audio);
          var audioDestination =
            audioContext.createMediaStreamDestination();
          audioSource.connect(audioDestination);
          stream.addTrack(
            audioDestination.stream.getAudioTracks()[0]
          );
        }
      });
      if (background_audio != false) {
        var audioContext = new AudioContext();
        var audioSource =
          audioContext.createMediaElementSource(background_audio);
        var audioDestination =
          audioContext.createMediaStreamDestination();
        audioSource.connect(audioDestination);
        stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
        background_audio.currentTime = 0;
        background_audio.play();
      }
      let chunks = [];
      var recorder = new MediaRecorder(stream, {
        bitsPerSecond: 3200000,
      });
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = (e) => {
        stopAnim();
        downloadRecording(chunks);
        animate(false, 0);
        $('#seekbar').offset({
          left:
            offset_left +
            $('#inner-timeline').offset().left +
            currenttime / timelinetime,
        });
        canvas.renderAll();
        console.log('Finished rendering');
      };
      recorder.start();

      setTimeout(function () {
        recorder.stop();
      }, duration);

      async function renderAnim(time) {
        await recordAnimate(time * 1000);
      }
    }
  }
}

/*

			initRecorder();

			//await timeout(2000)
		
			// draw one frame at a time
			while (frame++ < FPS * (duration/1000)) {
				await longDraw(); // do the long drawing
				await recordFrame(); // record at constant FPS 
			}
			// now all the frames have been drawn
			const recorded = await exportRecording(); // we can get our final video file
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href =  URL.createObjectURL(recorded);
			a.download = "test.webm";
			document.body.appendChild(a);
			a.click();
			recording = false;
			currenttime = 0;
			animate(false, 0);
			$("#seekbar").offset({left:offset_left+$("#inner-timeline").offset().left+(currenttime/timelinetime)});
			canvas.renderAll();
				resizeCanvas();
				if (background_audio != false) {
						background_audio.pause();
						background_audio = new Audio(background_audio.src)
				}
			$("#download-real").html("Download");
			$("#download-real").removeClass("downloading");
			updateRecordCanvas();
		
			// Fake long drawing operations that make real-time recording impossible
			function longDraw() {
				recordAnimate((frame/FPS)*1000)
				return wait(Math.random() * 300)
					.then(recordAnimate((frame/FPS)*1000));
			}*/

/*
paused = true;
			recording = true;
			$("#download-real").html("Rendering...");
			$("#download-real").addClass("downloading");
			var fps = 60;
			var aCtx = new AudioContext();
			function audioTimerLoop(callback, frequency) {
					var freq = frequency / 1000;
					var silence = aCtx.createGain();
					silence.gain.value = 0;
					silence.connect(aCtx.destination);
					onOSCend();
					var stopped = false;
					function onOSCend() {
							osc = aCtx.createOscillator();
							osc.onended = onOSCend;
							osc.connect(silence);
							osc.start(0);
							osc.stop(aCtx.currentTime + freq);
							callback(aCtx.currentTime);
							if (stopped) {
									osc.onended = function() {
											return;
									};
							}
					};
					return function() {
					stopped = true;
					};
			}
			var stopAnim = audioTimerLoop(renderAnim, 1000/(fps));
			var stream = document.getElementById("canvasrecord").captureStream(fps);
			objects.forEach(function(object){
					if (canvasrecord.getItemById(object.id).get("assetType") && canvasrecord.getItemById(object.id).get("assetType") == "video") {
							var audio = $(canvasrecord.getItemById(object.id).getElement())[0];
							var audioContext = new AudioContext();
							var audioSource = audioContext.createMediaElementSource(audio);
							var audioDestination = audioContext.createMediaStreamDestination();
							audioSource.connect(audioDestination);
							stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
					}
			})
			if (background_audio != false) {
					var audioContext = new AudioContext();
					var audioSource = audioContext.createMediaElementSource(background_audio);
					var audioDestination = audioContext.createMediaStreamDestination();
					audioSource.connect(audioDestination);
					stream.addTrack(audioDestination.stream.getAudioTracks()[0]);
					background_audio.currentTime = 0;
					background_audio.play();
			}
			let chunks = [];
			var recorder = new MediaRecorder(stream, {
				bitsPerSecond : 3200000,
			});
			recorder.ondataavailable = e => chunks.push(e.data);
			recorder.onstop = e => {
					stopAnim();
					downloadRecording(chunks);
					animate(false, 0);
					$("#seekbar").offset({left:offset_left+$("#inner-timeline").offset().left+(currenttime/timelinetime)});
					canvas.renderAll();
					console.log("Finished rendering")
			}
			recorder.start();

			setTimeout(function() {
					recorder.stop();
			}, duration)

			async function renderAnim(time) {
					await animate(false, time*1000);
			} 

*/

/*
$("#download-real").html("Rendering...");
			$("#download-real").addClass("downloading");
		
			// browser check
			if (typeof MediaStreamTrackGenerator === undefined || typeof MediaStream === undefined || typeof VideoFrame === undefined) {
				console.log('Your browser does not support the web APIs used in this demo');
				return;
			}
		
			// recording setup
			const fps = 60;
			const generator = new MediaStreamTrackGenerator({ kind: "video" });
			const writer = generator.writable.getWriter();
			const stream = new MediaStream();
			stream.addTrack(generator);
			const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
			recorder.start();

			function timeout(ms) {
				return new Promise(resolve => setTimeout(resolve, ms));
		}
		
			// animate stuff
			console.log('rendering...')
			console.log(duration);
			for (let i = 0; i < (duration/1000)*fps; i++) {
				animate(false, (i/fps)*1000);
				const frame = new VideoFrame(document.getElementById("canvasrecord"), { 
					timestamp: (i / fps)*1000
				});
				await writer.write(frame);
				await timeout(100)
				console.log("frame "+(i/fps)*1000);
			}
			console.log('rendering done');
		
			// stop recording and 
			recorder.addEventListener("dataavailable", (evt) => {
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href =  URL.createObjectURL(evt.data);
				a.download = "test.webm";
				document.body.appendChild(a);
				a.click();
				recording = false;
				currenttime = 0;
				animate(false, 0);
				$("#seekbar").offset({left:offset_left+$("#inner-timeline").offset().left+(currenttime/timelinetime)});
				canvas.renderAll();
					resizeCanvas();
					if (background_audio != false) {
							background_audio.pause();
							background_audio = new Audio(background_audio.src)
					}
				$("#download-real").html("Download");
				$("#download-real").removeClass("downloading");
				updateRecordCanvas();
			});
			recorder.stop();
			*/
