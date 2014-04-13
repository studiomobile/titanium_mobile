/*
 * Appcelerator Titanium Mobile
 * Copyright (c) 2011-2012 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = new function() {
	var finish;
	var valueOf;
	this.init = function(testUtils) {
		finish = testUtils.finish;
		valueOf = testUtils.valueOf;
	}

	this.name = "media";
	this.tests = [
		{name: "constants"},
		{name: "soundAPIs"},
		{name: "audioPlayerAPIs"},
		{name: "videoPlayerAPIs"},
		{name: "audioTimeValidation", timeout: 5000},
		{name: "screenshot", timeout: 2000},
		{name: "Media_Android_scanMediaFiles", timeout: 60000},
		{name: "getUrlMethod", timeout: 60000},
		{name: "changeState", timeout: 100000}
	];

	this.constants = function(testRun) {
		valueOf(testRun, Ti.Media).shouldNotBeNull();
		
		// Video Scaling
		valueOf(testRun, Ti.Media.VIDEO_SCALING_NONE).shouldNotBeNull();
		valueOf(testRun, Ti.Media.VIDEO_SCALING_ASPECT_FILL).shouldNotBeNull();
		valueOf(testRun, Ti.Media.VIDEO_SCALING_ASPECT_FIT).shouldNotBeNull();
		valueOf(testRun, Ti.Media.VIDEO_SCALING_MODE_FILL).shouldNotBeNull();

		finish(testRun);
	}

	this.soundAPIs = function(testRun) {
		valueOf(testRun, Ti.Media.createSound).shouldBeFunction();
		
		var sound = Ti.Media.createSound({ url : "sound.wav" });
		valueOf(testRun, sound).shouldNotBeNull();
		valueOf(testRun, sound.getTime).shouldBeFunction();
		valueOf(testRun, sound.setTime).shouldBeFunction();
		valueOf(testRun, sound.time).shouldBeNumber();
		
		valueOf(testRun, sound.isLooping).shouldBeFunction();
		valueOf(testRun, sound.setLooping).shouldBeFunction();
		valueOf(testRun, sound.looping).shouldBeBoolean();
		
		valueOf(testRun, sound.isPaused).shouldBeFunction();
		valueOf(testRun, sound.paused).shouldBeBoolean();
		
		valueOf(testRun, sound.isPlaying).shouldBeFunction();
		valueOf(testRun, sound.playing).shouldBeBoolean();
		
		valueOf(testRun, sound.pause).shouldBeFunction();
		valueOf(testRun, sound.play).shouldBeFunction();
		valueOf(testRun, sound.release).shouldBeFunction();
		valueOf(testRun, sound.reset).shouldBeFunction();
		valueOf(testRun, sound.stop).shouldBeFunction();

		finish(testRun);
	}

	// https://appcelerator.lighthouseapp.com/projects/32238-titanium-mobile/tickets/2586
	this.audioPlayerAPIs = function(testRun) {
		var isAndroid = (Ti.Platform.osname === 'android');
		valueOf(testRun, Ti.Media.createAudioPlayer).shouldBeFunction();
		var player = Ti.Media.createAudioPlayer();
		valueOf(testRun, player).shouldNotBeNull();
		valueOf(testRun, player.pause).shouldBeFunction();
		valueOf(testRun, player.start).shouldBeFunction();
		valueOf(testRun, player.setUrl).shouldBeFunction();
		if (!isAndroid) valueOf(testRun, player.stateDescription).shouldBeFunction();
		valueOf(testRun, player.stop).shouldBeFunction();
		if (!isAndroid) valueOf(testRun, player.idle).shouldBeBoolean();
		if (!isAndroid) valueOf(testRun, player.state).shouldBeNumber();
		valueOf(testRun, player.paused).shouldBeBoolean();
		if (!isAndroid) valueOf(testRun, player.waiting).shouldBeBoolean();
		if (!isAndroid) valueOf(testRun, player.bufferSize).shouldBeNumber();

		finish(testRun);
	}

	this.videoPlayerAPIs = function(testRun) {
		var isAndroid = (Ti.Platform.osname === 'android');
		
		valueOf(testRun, Ti.Media.createVideoPlayer).shouldBeFunction();
		var player = Ti.Media.createVideoPlayer();
		valueOf(testRun, player).shouldNotBeNull();
		valueOf(testRun, player.add).shouldBeFunction();
		valueOf(testRun, player.pause).shouldBeFunction();
		valueOf(testRun, player.play).shouldBeFunction(); // this is the documented way to start playback.
		valueOf(testRun, player.start).shouldBeFunction(); // backwards compat.
		valueOf(testRun, player.stop).shouldBeFunction();
		if (!isAndroid) valueOf(testRun, player.setUrl).shouldBeFunction();
		valueOf(testRun, player.hide).shouldBeFunction();
		valueOf(testRun, player.setMediaControlStyle).shouldBeFunction();
		valueOf(testRun, player.getMediaControlStyle).shouldBeFunction();
		valueOf(testRun, player.getScalingMode).shouldBeFunction();
		valueOf(testRun, player.setScalingMode).shouldBeFunction();

		finish(testRun);
	}

	this.audioTimeValidation = function(testRun) {
		var sound = Ti.Media.createSound({ url : "/suites/media/sound.wav" });
		var initial_pos = 3000;
		sound.time = initial_pos;
		sound.setTime(initial_pos);
		valueOf(testRun, sound.getTime()).shouldBe(initial_pos);
		valueOf(testRun, sound.time).shouldBe(initial_pos);
		sound.play();
		setTimeout(function(e) {
			var time = sound.getTime();
			Ti.API.info("PROGRESS: " + time);
			valueOf(testRun, time).shouldBeGreaterThan(initial_pos);
			// assume we get an event in < 2 seconds.
			valueOf(testRun, time).shouldBeLessThan(initial_pos + 3000); 
			sound.stop();
			sound = null;
			finish(testRun);
		}, 1000);
	}

	this.screenshot = function(testRun) {
		callback = function(e) {
			valueOf(testRun, e).shouldBeObject();
			valueOf(testRun, e.media).shouldBeObject();
			valueOf(testRun, e.media.mimeType).shouldBeString();
			valueOf(testRun, e.media.mimeType.substr(0, 5)).shouldBe("image");

			finish(testRun);
		};
		valueOf(testRun, function() {
			Titanium.Media.takeScreenshot(callback);
		}).shouldNotThrowException();
	}

	//TIMOB-6809
	this.Media_Android_scanMediaFiles = function(testRun){
		if (Ti.Platform.osname === 'android') {
			var win = Titanium.UI.createWindow({  
				exitOnClose: true
			});
			var lbl = Ti.UI.createLabel({
				height: '80dp',
				left: '5dp',
				right: '5dp'
			});
			win.add(lbl);
			win.addEventListener('open', function(){
				var f = Ti.Filesystem.getFile('image.png');
				f.copy("appdata://image.png");
				f = Ti.Filesystem.getFile("appdata://image.png");
				valueOf(testRun, function(){
					Ti.Media.Android.scanMediaFiles([ f.nativePath ], null, function(e) {
						lbl.text = e.uri;
					})
				}).shouldNotThrowException();
				finish(testRun);
			});
			win.open();
		}
		else {
			finish(testRun);
		}
	}

	//TIMOB-7365
	this.getUrlMethod = function(testRun){
		var audioPlayer = Ti.Media.createAudioPlayer({ 
			url: 'www.example.com/podcast.mp3',
			allowBackground: true
		});
		valueOf(testRun, audioPlayer.getUrl()).shouldNotBeNull();

		finish(testRun);
	}

	//TIMOB-2135
	this.changeState = function(testRun){
		if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad') {
			var win = Ti.UI.createWindow();
			Ti.Media.audioSessionMode = Ti.Media.AUDIO_SESSION_MODE_PLAYBACK;
			var streamer = Ti.Media.createAudioPlayer({
				url : 'http://www.archive.org/download/jungle_book_mh_0808_librivox/junglebook_kipling_01.mp3'
			});
			win.addEventListener('open', function(){
				streamer.start();
				setTimeout(function(){
					streamer.stop();
				}, 5000);
			});
			var starting = false;
			var waiting_for_data = false;
			var waiting_for_queue = false;
			var playing = false;
			var stopping = false;
			var stopped = false;
			streamer.addEventListener('change', function(e) {
				if(e.state == 1){
					starting = true;
				} 
				else if(e.state == 2){
					waiting_for_data = true;
				} 
				else if(e.state == 3){
					waiting_for_queue =true;
				} 	
				else if(e.state == 4){
					playing = true;
				}
				else if(e.state == 6){
					stopping = true;
				} 	
				else if(e.state == 7){
					stopped = true;
					valueOf(testRun,stopped ).shouldBeTrue();
					valueOf(testRun,stopping ).shouldBeTrue();
					valueOf(testRun,playing ).shouldBeTrue();
					valueOf(testRun,waiting_for_data ).shouldBeTrue();
					valueOf(testRun,starting ).shouldBeTrue();
					valueOf(testRun,waiting_for_queue ).shouldBeTrue();

					finish(testRun);
				} 
			});
			win.open();
		}
		else {
			finish(testRun);
		}
	}
}
