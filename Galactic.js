var w = this;
var d = w.document;
var a = 'audio';
var v = 'video';
var s = 'script';
'use strict';
var PlatformDetector = /** @class */ (function () {
    function PlatformDetector() {
        this.regex = {
            platform: {
                playstation: new RegExp('^Mozilla/[0-9].[0-9]\\s.(PlayStation [3-5]).*\\sSCEE/[1-9].[0-9]\\sNuanti/[1-9].[0-9]'),
                mobile: new RegExp('Mobile|Android|Tab|Tablet|GT|SM-(T|P)|Silk-Accelerated', 'i'),
                tablet: new RegExp('Tab|Tablet|iPad|SM-(T|P)|GT|Silk-Accelerated', 'i'),
                desktop: new RegExp('(?:(?!Mobile|Android|Tab|Tablet|GT|SM-(T|P)|Silk-Accelerated).)', 'i')
            },
            os: {
                android: new RegExp('Linux.*Android'),
                ios: new RegExp('like\\sMac\\sOS\\sX'),
                mac: new RegExp('Intel\\sMac\\sOS\\sX'),
                windows: new RegExp('Windows\\sNT')
            },
            browser: {
                ie: new RegExp('msie|trident', 'i'),
                edge: new RegExp('Edge'),
                chrome: new RegExp('Chrome'),
                firefox: new RegExp('Firefox'),
                safari: new RegExp('Safari')
            }
        };
        this.canInit = false;
        if (w.navigator &&
            w.navigator.userAgent &&
            w['RegExp'] &&
            typeof w['RegExp'] === 'function') {
            this.canInit = true;
        }
        else {
            this.throwErr();
        }
    }
    PlatformDetector.prototype.detectDevice = function () {
        return {
            platform: this.detect('platform'),
            os: this.detect('os'),
            browser: this.detect('browser')
        };
    };
    PlatformDetector.prototype.detect = function (type) {
        if (this.canInit) {
            var obj = this.regex[type];
            var regxName = void 0;
            for (regxName in obj) {
                if (obj[regxName].test(w.navigator.userAgent)) {
                    return regxName;
                }
            }
        }
        else {
            this.throwErr();
        }
    };
    PlatformDetector.prototype.throwErr = function () {
        if (w['Error'] && typeof w['Error'] === 'function') {
            throw new Error("This browser doesn't supprot platform detection.");
        }
        else {
            console.error("This browser doesn't supprot platform detection.");
        }
    };
    return PlatformDetector;
}());
var Galactic = /** @class */ (function () {
    function Galactic() {
        this.setup();
    }
    /****************************************************************************************************************************
     * Boilerplate: set default values
     */
    Galactic.prototype.setup = function () {
        var _this = this;
        //Main Audio Events
        this.audioElementEvents = {
            abort: function (e) {
                console.log('The abort event occurs when the loading of an audio/video is aborted. Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.');
                _this.checkError(e);
            },
            stalled: function (e) {
                console.log('browser is trying to get media data, but data is not available');
                _this.checkError(e); //when it's not paused
            },
            suspend: function (e) {
                console.log('loading of the media is suspended (prevented from continuing). This can happen when the download has completed, or because it has been paused for some reason.');
                if (_this.bufferProgress <= 98) {
                    _this.checkError(e);
                }
            },
            error: function (e) {
                console.log('an error occurred during the loading of an audio error: ' +
                    e.target.error.code +
                    ' ' +
                    e.target.error.message);
                _this.checkError(e);
                if (_this.options.video && _this.isUsingHLSPolyfill) {
                    var mediaError = e.currentTarget.error;
                    if (mediaError.code === mediaError.MEDIA_ERR_DECODE) {
                        _this.hlsVideoTagErrorHandler();
                    }
                }
            },
            emptied: function (e) {
                // *** TO DO *** // check for error in this state
                _this.audioTrackPlaying = undefined;
            },
            waiting: function (e) {
                _this.audioTrackPlaying = false;
                console.log('audio stops because it needs to buffer the next frame.');
                _this.checkError(e);
                if (_this.hasBuffer()) {
                    _this.onBufferChange(e);
                }
                _this.dispatchEvent('wait', { status: _this.audioTrackPlaying });
            },
            loadedmetadata: function (e) {
                console.log('loaded meta data for audio/video consists of: duration, dimensions (video only) and text tracks.');
                _this.metadata = true;
            },
            loadstart: function (e) {
                _this.audioTrackPlaying = false;
                console.log('the browser is currently looking for the specified audio/video');
                _this.dispatchEvent('wait', { status: _this.audioTrackPlaying });
                if (_this.hasBuffer()) {
                    _this.onBufferChange(e);
                }
            },
            durationchange: function (e) {
                console.log('when an audio/video is loaded, the duration will change from "NaN" to the actual duration of the audio/video');
                if (_this.isValid()) {
                    _this.onDurationChange(e);
                }
                if (_this.lastPosition) {
                    _this.setPosition(_this.lastPosition);
                    _this.lastPosition = undefined;
                }
                _this.duration = e.target.duration;
            },
            timeupdate: function (e) {
                console.log('playing position of an audio/video has changed.', _this);
                _this.playState = true;
                if (_this.isValid()) {
                    _this.onDurationChange(e);
                    _this.audioTrackPlaying = true;
                }
                if (_this.hasBuffer()) {
                    _this.onBufferChange(e);
                }
                if (_this.isReloading) {
                    _this.isReloading = _this.error = false;
                }
                if (_this.bufferProgress === 100) {
                    _this.clearWaiters(); //kill waiters in case it is fully downloaded
                }
            },
            canplay: function (e) {
                if (_this.forcePause && !_this.audioElement.paused) {
                    _this.pause(undefined, true);
                }
                console.log('can start playing the audio/video, enough has loaded to play...');
                _this.dispatchEvent('readyToPlay', {
                    track: _this.currentMediaItem,
                    src: _this.currentSrc,
                    progress: _this.progress
                });
                if (_this.options.playOnLoad) {
                    _this.play();
                }
            },
            playing: function (e) {
                if (_this.forcePause && !_this.audioElement.paused) {
                    _this.pause(undefined, true);
                }
                console.log('audio is playing after having been paused or stopped for buffering');
                if (_this.isValid()) {
                    _this.dispatchEvent('play', { status: _this.audioTrackPlaying });
                }
                if (_this.hasBuffer()) {
                    _this.onBufferChange(e);
                }
            },
            pause: function (e) {
                _this.forcePause = false;
                _this.isPaused = true;
                _this.audioTrackPlaying = false;
                if (_this.isValid()) {
                    _this.dispatchEvent('pause', { status: _this.audioTrackPlaying });
                }
            },
            ended: function (e) {
                if (_this.isValid()) {
                    _this.dispatchEvent('end', { progress: _this.progress });
                }
            },
            progress: function (e) {
                console.log('downloading the specified audio/video... ');
                if (_this.hasBuffer()) {
                    _this.onBufferChange(e);
                }
            },
            ratechange: function (e) {
                if (_this.isValid()) {
                    _this.dispatchEvent('rateChange');
                }
            },
            volumechange: function (e) {
                if (_this.isValid()) {
                    _this.dispatchEvent('volumeChange');
                }
            },
            seeking: function (e) {
                _this.pause();
            },
            seeked: function (e) {
                if (_this.options.playOnLoad) {
                    _this.play();
                }
            }
            // loadeddata: (e) => {
            //     console.log('data for the current frame is loaded, but not enough data to play next frame of the specified audio/video ');
            // },
            // play: (e) => {
            //     console.log('audio has been started or is no longer paused');
            // },
            // canplaythrough: (e) => {
            //     console.log('enough has loaded to play without buffering...');
            // },
        };
        //Default options
        this.options = {
            html5: true,
            reloadOnInit: 10000,
            reloadOnError: 5000,
            reloadCount: 5,
            volume: 1,
            fadeIn: false,
            hls: false,
            playOnLoad: true
        };
        this.emptyVideoFileBase64 =
            'data:application/x-mpegURL;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
        this.emptyWaveFileBase64 =
            'data:audio/wave;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==';
        this.mimeRegx = new RegExp(/\.m4a|mp4|mpeg4|aac|flv|mov|m4v|f4v|.m4b|mp4v|3gp|3g2|mp4|m3u8/);
        //Objects & arrays
        this.eventMap = {};
        this.list = this.playNextList = this.shuffleList = [];
        this.currentMediaItem = {};
        //Default values
        this.online = true;
        this.bufferProgress = this.progress = this.lastBufferProgress = this.position = this.remainingTime = this.currentIndex = this.shuffleIndex = this.duration = 0;
        this.audioElement = this.errorTimeout = this.lastPosition = this.error = this.metadata = this.isRepeating = this.isShuffling = this.isPaused = this.isReloading = this.interval = this.onlinecbreload = this.playState = this.forceDurationChangeForAudioAd = this.playPromise = undefined;
        //Device detections
        this.device = new PlatformDetector().detectDevice();
        this.windows = this.device.browser === 'ie'; //(this.device.os === 'windows');
        this.playstation = this.device.platform === 'playstation';
        //Load empty for mobile browsers
        this.loadEmpty = (function () {
            return function () {
                _this.forcePause = false;
                _this.load(false);
            };
        })();
        if (!this.windows && !this.playstation) {
            w.addEventListener('offline', this.offlinecb, false);
            w.addEventListener('online', this.onlinecb, false);
        }
    };
    /****************************************************************************************************************************/
    Galactic.prototype.appendHLSEvents = function () {
        var _this = this;
        this.hls.on(w.Hls.Events.MANIFEST_PARSED, function () {
            if (_this.options.playOnLoad) {
                _this.play();
            }
        });
        // try to recover on fatal errors
        this.hls.on(w.Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case w.Hls.ErrorTypes.NETWORK_ERROR:
                        _this.hls.startLoad();
                        break;
                    case w.Hls.ErrorTypes.MEDIA_ERROR:
                        _this.hlsjsErrorHandler();
                        break;
                    default:
                        console.error('Error loading media: File could not be played');
                        _this.destoryHLS();
                        break;
                }
            }
        });
    };
    /****************************************************************************************************************************
     * Main Initializer
     */
    Galactic.prototype.init = function (options) {
        this.setOptions(options);
        this.createMedia();
        return this;
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Connecitivty Manager: Methods Needed
     */
    Galactic.prototype.isOnline = function () {
        // Handle IE and more capable browsers
        var xhr = new XMLHttpRequest();
        // Open new request as a HEAD to the root hostname with a random param to bust the cache
        xhr.open('HEAD', "//" + w.location.hostname + "/?rand=" + w.Math.floor((1 + w.Math.random()) * 0x10000), false); // secon argument async :
        // Issue request and handle response
        try {
            xhr.send();
            return xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304);
        }
        catch (error) {
            return false;
        }
    };
    Galactic.prototype.waitUntilOnline = function () {
        var _this = this;
        if (this.windows || this.playstation) {
            if (!this.interval) {
                this.interval = w.setInterval(function () {
                    _this.online = _this.isOnline();
                    if (_this.online) {
                        _this.reload(0);
                    }
                }, 2000);
            }
        }
        else {
            this.onlinecbreload = true;
        }
        return this;
    };
    Galactic.prototype.onlinecb = function () {
        console.log('is online...onlinecbreload: ', this.onlinecbreload);
        this.online = true;
        if (this.onlinecbreload) {
            this.reload(0);
        }
    };
    Galactic.prototype.offlinecb = function () {
        console.log('is offline...');
        this.online = false;
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Buffer Progress Management
     */
    Galactic.prototype.onBufferChange = function (e) {
        try {
            var duration = e.target.duration;
            var buffered = e.target.buffered;
            var currentTime = e.target.currentTime;
            var i = 0;
            var buffLen = buffered.length;
            this.lastBufferProgress = this.bufferProgress;
            if (duration > 0 && buffLen > 0) {
                for (; i < buffLen; i++) {
                    if (buffered.start(buffLen - 1 - i) < currentTime) {
                        this.bufferProgress = w.Math.ceil((buffered.end(buffLen - 1 - i) / duration) * 100);
                        break;
                    }
                }
            }
            else {
                this.bufferProgress = undefined;
            }
            if (this.isBufferValid()) {
                this.dispatchEvent('bufferChange', {
                    bufferProgress: this.bufferProgress
                });
            }
        }
        catch (e) { }
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Duration Management
     */
    Galactic.prototype.onDurationChange = function (e) {
        var d = e.target.duration ? e.target.duration * 1000 : 0;
        var c = e.target.currentTime ? e.target.currentTime * 1000 : 0;
        var p = (c / d) * 100;
        //p: progress , d-c: remainingTime, c: position
        this.setTimeValues(p, d - c, c);
    };
    Galactic.prototype.setTimeValues = function (progress, remainingTime, position) {
        this.progress = progress;
        this.remainingTime = remainingTime;
        this.position = position;
        if (this.position > 0) {
            this.dispatchEvent('durationChange', {
                progress: this.progress,
                remainingTime: this.remainingTime,
                position: this.position,
                duration: this.audioElement.duration,
                status: this.audioTrackPlaying
            });
        }
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Seek To A Certain Position
     */
    Galactic.prototype.setPosition = function (position) {
        if (this.playState) {
            try {
                // try-catch block: for ie exception
                this.audioElement.currentTime = Number(position) / 1000;
            }
            catch (e) { }
        }
        return this;
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Reload Management
     */
    Galactic.prototype.reload = function (time, force) {
        var _this = this;
        if (this.position > 1000) {
            this.lastPosition = this.position;
        }
        if (!this.errorTimeout) {
            this.errorTimeout = w.setTimeout(function () {
                if (_this.online && !_this.audioTrackPlaying && _this.error) {
                    if (_this.audioElement.readyState >= 2 &&
                        _this.audioElement.networkState === 2) {
                        _this.isReloading = true;
                        _this.clearWaiters().play(true);
                    }
                    else {
                        _this.load(_this.currentSrc, true);
                    }
                }
                else {
                    _this.error = false;
                    _this.isReloading = false;
                    _this.clearWaiters();
                }
            }, time);
        }
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Volume Management
     */
    Galactic.prototype.setVolume = function (volume) {
        // from 0 to 100
        try {
            if (volume > 1.0) {
                return;
            }
            this.audioElement.volume = volume;
            this.dispatchEvent('volumeChange', { volume: this.audioElement.volume });
            return this;
        }
        catch (e) { }
    };
    Galactic.prototype.getVolume = function () {
        return this.audioElement.volume;
    };
    /***************************************************************************************************************************/
    /****************************************************************************************************************************
     * Main Audio Functionality: Play, Pause, Shuffle, Next, Previous, Repeat
     */
    Galactic.prototype.loadAudio = function () {
        if (this.options.video && this.isUsingHLSPolyfill) {
            this.createNewHlsContext();
            this.hls.loadSource(this.currentSrc);
        }
        else {
            this.audioElement.load();
        }
        return this;
    };
    Galactic.prototype.load = function (withSrc, afterReload) {
        this.flush(true);
        if (afterReload) {
            this.loadAudio();
        }
        if (withSrc) {
            this.setSrc(withSrc);
        }
        else {
            this.setSrc(this.options.video
                ? this.emptyVideoFileBase64
                : this.emptyWaveFileBase64);
        }
        this.setAttribute('src', this.currentSrc);
        this.loadAudio();
        return this;
    };
    Galactic.prototype.fadeIn = function (start, end, duration, cb) {
        var _this = this;
        end = Math.round(end);
        var delta = end - start;
        var startTime = null;
        var t;
        var factor;
        var frame;
        this.setVolume(0);
        var tweenLoop = function (time) {
            if (!time) {
                time = new Date().getTime();
            }
            if (startTime === null) {
                startTime = time;
            }
            t = time - startTime;
            factor = t / duration;
            _this.setVolume(start + delta * factor);
            if (t < duration && _this.getVolume() < end) {
                console.log('animating ', _this.getVolume());
                frame = w.requestAnimationFrame(tweenLoop);
                return;
            }
            w.cancelAnimationFrame(frame);
            console.log('done animating ', _this.getVolume());
            if (cb) {
                cb();
            }
            tweenLoop = delta = startTime = t = time = start = frame = null;
        };
        frame = w.requestAnimationFrame(tweenLoop);
    };
    Galactic.prototype.play = function () {
        this.isPaused = false;
        // Run this on your behalf: in case you want to disable call to play() call to load() errors & warnings
        //this.audioTrackPlaying = undefined;
        // if (!this.playstation && !this.options.video && !this.isReloading) {  //  //
        //     let isPlayingToPreventRaceCondition: boolean = this.audioElement.currentTime > 0 && !this.audioElement.paused && !this.audioElement.ended && this.audioElement.readyState >= 2;
        //     if (!isPlayingToPreventRaceCondition) {
        //         try {
        //             this.checkFadeIn();
        //             //https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
        //             this.playPromise = this.audioElement.play();
        //             if (this.playPromise) {
        //                 this.playPromise.then(_ => {
        //                     //this.audioTrackPlaying = true;
        //                     // if (this.options.video) {
        //                     //     this.audioElement.play();
        //                     // }
        //                     console.log('should play');
        //                 })
        //                 .catch(error => {});
        //             }
        //         } catch (e) {}
        //     }
        // }
        // else {
        try {
            this.checkFadeIn();
            this.audioElement.play().catch(function (e) { });
        }
        catch (e) { }
        // }
        return this;
    };
    Galactic.prototype.checkFadeIn = function () {
        if (this.options.fadeIn) {
            this.fadeIn(0.0, 0.9, 5000);
        }
    };
    Galactic.prototype.pause = function (forcePause, force) {
        if (forcePause) {
            this.forcePause = true;
        }
        if (this.audioTrackPlaying || force) {
            // Run this on your behalf: in case you want to disable call to play() call to load() errors & warnings
            // if (!this.playstation && !this.options.video && !this.device.browser.match(/safari|edge/)) { //this.device.browser !== 'safari'
            //      if (this.playPromise) {
            //          //https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
            //          this.playPromise.then(_ => {
            //              this.isPaused = true;
            //              this.audioElement.pause();
            //          })
            //          .catch(error => {
            //              this.isPaused = false;
            //          });
            //      }
            //  }
            //  else {
            try {
                this.audioElement.pause();
            }
            catch (e) { }
        }
        return this;
    };
    Galactic.prototype.stop = function (callback) {
        this.pause()
            .flush(true)
            .dispatchEvent('durationChange', {
            progress: 0,
            remainingTime: 0,
            position: 0
        });
        this.lastPosition = undefined;
        if (typeof callback === 'function') {
            callback();
        }
        return this;
    };
    Galactic.prototype.next = function (prop, callback) {
        this[prop] = this[prop] === this.list.length - 1 ? 0 : ++this[prop];
        this.currentMediaItem = this.list[this[prop]];
        if (typeof callback === 'function') {
            callback({ track: this.currentMediaItem });
        }
        return this;
    };
    Galactic.prototype.previous = function (prop, callback) {
        this[prop] = this[prop] <= 0 ? this.list.length - 1 : --this[prop];
        this.currentMediaItem = this.list[this[prop]];
        if (typeof callback === 'function') {
            callback({ track: this.currentMediaItem });
        }
        return this;
    };
    Galactic.prototype.repeat = function (callback) {
        if (!this.isRepeating) {
            this.toggle('repeat');
        }
        this.currentMediaItem = this.list[this.currentIndex];
        if (typeof callback === 'function') {
            callback({ track: this.currentMediaItem });
        }
        this.dispatchEvent('repeatStatusChange', {
            repeat: this.isRepeating,
            track: this.currentMediaItem
        });
        return this;
    };
    Galactic.prototype.createShuffleList = function (list) {
        var currentIndex = list.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            // And swap it with the current element.
            temporaryValue = list[currentIndex];
            list[currentIndex] = list[randomIndex];
            list[randomIndex] = temporaryValue;
        }
        return list;
    };
    Galactic.prototype.shuffle = function (callback) {
        if (!this.isShuffling) {
            this.toggle('shuffle');
        }
        this.shuffleList =
            this.shuffleIndex === 0
                ? this.createShuffleList(this.list)
                : this.shuffleList;
        if (typeof callback === 'function') {
            this.currentMediaItem = this.shuffleList[this.shuffleIndex];
            callback({ track: this.currentMediaItem, list: this.shuffleList });
        }
        this.dispatchEvent('shuffleStatusChange', {
            shuffle: this.isShuffling,
            track: this.currentMediaItem
        });
        return this;
    };
    Galactic.prototype.addToPlaylist = function (data, type, callback) {
        var copy;
        if (typeof arguments[1] === 'string') {
            if (data.constructor === Array) {
                this[type] = copy = data.length > 0 ? data : this[type];
            }
            else {
                this[type].push(data);
                copy = this[type];
            }
        }
        else {
            if (data.constructor === Array) {
                this.list = this.shuffleList = copy =
                    data.length > 0 ? data : this.list;
            }
            else {
                this.list.push(data);
                this.shuffleList = copy = this.list;
            }
        }
        if (typeof callback === 'function') {
            callback({ list: copy });
        }
        this.dispatchEvent('playlistChange', {
            playlist: this.list,
            shuffleList: this.shuffleList
        });
        return this;
    };
    Galactic.prototype.clearPlaylist = function (type, callback) {
        var _a;
        this[type] = [];
        if (typeof callback === 'function') {
            callback();
        }
        this.dispatchEvent('playlistChange', (_a = {},
            _a[type] = this[type],
            _a));
        return this;
    };
    Galactic.prototype.setNextPlayingListItem = function (media) {
        if (media.constructor === Array) {
            this.playNextList = this.playNextList.concat(media);
        }
        else {
            this.playNextList.push(media);
        }
        return this;
    };
    Galactic.prototype.getNextPlayingListItem = function () {
        return this.playNextList[this.playNextList.length - 1];
    };
    // Remove the item played which is the last item
    Galactic.prototype.removeNextPlayingListItem = function () {
        // Remove the first item since the queue always plays the first
        this.playNextList.splice(this.playNextList.length - 1, 1);
        return this;
    };
    Galactic.prototype.hasNextPlayingListItem = function () {
        return this.playNextList.length > 0 ? true : false;
    };
    Galactic.prototype.applyNextAction = function (callback) {
        var _this = this;
        // this.stop();
        if (this.hasNextPlayingListItem()) {
            var call_1 = function (mediaItem) {
                _this.removeNextPlayingListItem();
                _this.currentMediaItem = mediaItem;
                callback({ track: _this.currentMediaItem });
            };
            var track_1 = this.getNextPlayingListItem();
            if (this.isShuffling) {
                this.shuffleList.forEach(function (mediaItem) {
                    if (mediaItem.id == track_1.id) {
                        call_1(mediaItem);
                    }
                });
            }
            else {
                call_1(track_1);
            }
        }
        else if (this.isRepeating) {
            this.repeat(callback);
        }
        else if (this.isShuffling) {
            this.shuffle().next('shuffleIndex', callback);
        }
        else {
            this.next('currentIndex', callback);
        }
        return this;
    };
    // This will be called from a click event: since the player always moves forward so that's why we toggle repeat by default
    Galactic.prototype.applyPreviousAction = function (callback) {
        // this.stop();
        if (this.isRepeating) {
            this.toggle('repeat', false);
        }
        if (this.isShuffling) {
            this.shuffle().previous('shuffleIndex', callback);
        }
        else {
            this.previous('currentIndex', callback);
        }
        return this;
    };
    //  Force toggle: toggle('repeat', true|false);
    //  Regular toggle toggles the property and the opposite:
    //  Toggle('repeat'); sets repeat to true and shuffle to false
    //  Toggle('shuffle'); sets shuffle to true and repeat to false
    Galactic.prototype.toggle = function (prop, forceTrue) {
        var propName = prop === 'shuffle'
            ? 'isShuffling'
            : prop === 'repeat'
                ? 'isRepeating'
                : '';
        var oppositePropName = prop === 'shuffle'
            ? 'isRepeating'
            : prop === 'repeat'
                ? 'isShuffling'
                : '';
        this[propName] = forceTrue !== undefined ? forceTrue : !this[propName];
        if (forceTrue === undefined) {
            this[oppositePropName] = false;
        }
        if (propName === 'shuffle') {
            this.shuffleIndex = 0;
        }
        return this;
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Flush Everyting
     * Reset all attributes to defaults
     * Clear everythihg
     */
    Galactic.prototype.flush = function (reset) {
        if (reset) {
            this.isReloading = true;
            this.clearWaiters();
        }
        if (this.options.video && this.isUsingHLSPolyfill && this.hls) {
            this.destoryHLS();
        }
        this.bufferProgress = this.lastBufferProgress = this.progress = this.position = this.remainingTime = this.duration = 0;
        this.error = this.metadata = this.playState = undefined;
        this.currentMediaItem = {};
        if (!this.isUsingHLSPolyfill) {
            this.setAttribute('src', this.emptyWaveFileBase64);
        }
        this.setPosition(0);
        return this;
    };
    Galactic.prototype.clearWaiters = function () {
        w.clearTimeout(this.errorTimeout);
        this.errorTimeout = undefined;
        if (this.windows || this.playstation) {
            w.clearInterval(this.interval);
            this.interval = undefined;
        }
        else {
            this.onlinecbreload = false;
        }
        return this;
    };
    /****************************************************************************************************************************/
    /****************************************************************************************************************************
     * Utility Methods Everyting
     */
    Galactic.prototype.setOptions = function (options) {
        if (options) {
            var opt = void 0;
            for (opt in options) {
                this.options[opt] = options[opt];
                if (opt === 'volume') {
                    this.setVolume(options[opt]);
                }
                else if (opt === 'controls') {
                    this.audioElement.controls = options[opt];
                }
                else if (opt === 'poster') {
                    this.setAttribute('poster', options[opt]);
                }
            }
        }
        return this;
    };
    Galactic.prototype.createMedia = function () {
        var _this = this;
        if (this.options.vr) {
            // Playing around just for testing purposes
            this.hasCustomScript = d.getElementById('gl-vr');
            if (!!this.hasCustomScript) {
                this.createVRElement();
            }
            else {
                this.script = d.createElement(s);
                this.script.src =
                    'https://storage.googleapis.com/vrview/2.0/build/vrview.min.js';
                this.script.id = 'gl-vr';
                this.script.async = false;
                d.head.appendChild(this.script);
                this.script.onload = function () {
                    console.log('script hls.js latest has loaded');
                    _this.createVRElement();
                    delete _this.script;
                };
            }
            delete this.hasCustomScript;
        }
        else if (this.options.html5) {
            this.audioElement = new Audio();
            this.updateDomElement();
        }
        else {
            if (this.options.hls) {
                this.hasCustomScript = d.getElementById('gl-hls');
                if (!!this.hasCustomScript) {
                    this.createElement();
                }
                else {
                    this.script = d.createElement(s);
                    this.script.src =
                        'https://anghamiwebcdn.akamaized.net/web/vendor/hls.min.js';
                    this.script.id = 'gl-hls';
                    this.script.async = false;
                    d.head.appendChild(this.script);
                    this.script.onload = function () {
                        _this.createElement();
                        delete _this.script;
                    };
                }
                delete this.hasCustomScript;
            }
            else {
                this.createElement();
            }
        }
        return this;
    };
    Galactic.prototype.createNewHlsContext = function () {
        this.hls = new w.Hls({
            autoStartLoad: true,
            startPosition: -1,
            capLevelToPlayerSize: true,
            debug: false,
            defaultAudioCodec: undefined,
            initialLiveManifestSize: 1,
            maxBufferLength: 30,
            maxMaxBufferLength: 600,
            maxBufferSize: 60 * 1000 * 1000,
            maxBufferHole: 0.5,
            lowBufferWatchdogPeriod: 0.5,
            highBufferWatchdogPeriod: 3,
            nudgeOffset: 0.1,
            nudgeMaxRetry: 5,
            maxFragLookUpTolerance: 0.2,
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 10,
            enableWorker: true,
            enableSoftwareAES: true,
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 4,
            manifestLoadingRetryDelay: 500,
            manifestLoadingMaxRetryTimeout: 64000,
            startLevel: undefined,
            levelLoadingTimeOut: 10000,
            levelLoadingMaxRetry: 4,
            levelLoadingRetryDelay: 500,
            levelLoadingMaxRetryTimeout: 64000,
            fragLoadingTimeOut: 20000,
            fragLoadingMaxRetry: 6,
            fragLoadingRetryDelay: 500,
            fragLoadingMaxRetryTimeout: 64000,
            startFragPrefetch: false,
            appendErrorMaxRetry: 3,
            enableWebVTT: true,
            enableCEA708Captions: true,
            stretchShortVideoTrack: true,
            maxAudioFramesDrift: 1,
            forceKeyFrameOnDiscontinuity: true,
            abrEwmaFastLive: 5.0,
            abrEwmaSlowLive: 9.0,
            abrEwmaFastVoD: 4.0,
            abrEwmaSlowVoD: 15.0,
            abrEwmaDefaultEstimate: 500000,
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
            minAutoBitrate: 0
        });
        // attach hlsjs to videotag
        this.hls.attachMedia(this.audioElement);
        this.appendHLSEvents();
    };
    Galactic.prototype.createVRElement = function () {
        // Selector '#vrview' finds element with id 'vrview'.
        var vrView = new w['VRView'].Player('#vrview', {
            video: this.options.vrSrc
        });
        vrView.play();
    };
    Galactic.prototype.createElement = function () {
        var element;
        try {
            if (this.options.video) {
                // Any DOM element where the newely created video element will be injected
                var videoElementParent = d.getElementById(v);
                this.audioElement = videoElementParent.appendChild(d.createElement(v));
                videoElementParent = null;
                //either chrome or fireflox
                if (this.device.browser && this.options.hls) {
                    this.isUsingHLSPolyfill = true;
                }
                this.updateDomElement();
            }
            else {
                this.audioElement = d.body.appendChild(d.createElement(a));
                this.updateDomElement();
            }
        }
        catch (e) { }
    };
    Galactic.prototype.updateDomElement = function () {
        this.addEventListeners();
        this.setAttribute('preload', 'none');
        if (this.options.video) {
            this.audioElement['playsInline'] = true;
            this.audioElement.setAttribute('webkit-playsinline', 'true');
            this.audioElement.style.width = '100%';
            this.audioElement.style.height = '100%';
            this.audioElement.style.display = 'block';
            this.audioElement.style.position = 'absolute';
            this.audioElement.style.top = '0';
            this.audioElement.style.left = '0';
            this.audioElement.style.right = '0';
            this.audioElement.style.bottom = '0';
            this.audioElement.style.backgroundColor = 'black';
            this.setSrc(this.emptyVideoFileBase64).setAttribute('type', this.options.hls ? 'application/x-mpegURL' : 'video/mp4');
        }
        else {
            this.setSrc(this.emptyWaveFileBase64).setAttribute('type', 'audio/mp4; codecs="mp4a.40.2"');
        }
        if (typeof this.options.onInit === 'function') {
            this.options.onInit();
        }
    };
    Galactic.prototype.addEventListeners = function () {
        if (this.audioElement) {
            var e = void 0;
            for (e in this.audioElementEvents) {
                this.audioElement.addEventListener(e, this.audioElementEvents[e], false);
            }
            if (this.options.video && this.isUsingHLSPolyfill) {
                // create separate error handlers for hlsjs and the video tag
                this.hlsjsErrorHandler = this.hlsPolyfillVideoTagErrorHandlerFactory();
                this.hlsVideoTagErrorHandler = this.hlsPolyfillVideoTagErrorHandlerFactory();
            }
        }
        return this;
    };
    Galactic.prototype.isValid = function () {
        return this.forceDurationChangeForAudioAd
            ? true
            : this.currentSrc.match(this.mimeRegx) !== null; // > 0;
    };
    Galactic.prototype.isBufferValid = function () {
        return (this.bufferProgress > 0 && this.bufferProgress !== this.lastBufferProgress);
    };
    Galactic.prototype.hasBuffer = function () {
        return !this.playstation && this.bufferProgress !== 100;
    };
    Galactic.prototype.setSrc = function (src) {
        try {
            this.currentSrc = src;
        }
        catch (e) { }
        return this;
    };
    Galactic.prototype.setAttribute = function (type, value) {
        if (typeof value !== 'undefined') {
            try {
                this.audioElement[type] = value;
            }
            catch (e) { }
        }
        return this;
    };
    Galactic.prototype.removeAttribute = function (type) {
        try {
            this.audioElement.removeAttribute(type);
            // delete this.audioElement[type];
        }
        catch (e) { }
        return this;
    };
    /****************************************************************************************************************************/
    /***************************************************************************************************************************
     * Events Dispatcher
     */
    Galactic.prototype.on = function (type, callback) {
        if (!this.eventMap[type]) {
            this.eventMap[type] = [];
        }
        this.eventMap[type].push(callback);
    };
    Galactic.prototype.off = function (type, filler) {
        this.eventMap[type] = filler;
    };
    Galactic.prototype.dispatchEvent = function (type, args) {
        var objValue = this.eventMap[type];
        if (!objValue) {
            return this;
        }
        objValue.forEach(function (item) {
            if (typeof item === 'function') {
                item(args);
            }
        });
        return this;
    };
    /***************************************************************************************************************************/
    /***************************************************************************************************************************
     * On Destory
     */
    Galactic.prototype.destroy = function () {
        var e;
        if (this.audioElement) {
            for (e in this.audioElementEvents) {
                this.audioElement.removeEventListener(e, this.audioElementEvents[e], false);
            }
        }
        for (e in this.eventMap) {
            delete this.eventMap[e];
        }
        if (!this.options.html5 && this.audioElement) {
            this.audioElement.parentNode.removeChild(this.audioElement);
        }
        if (this.options.video && this.isUsingHLSPolyfill) {
            this.destoryHLS();
            this.options = {};
            this.isUsingHLSPolyfill = undefined;
            delete this.hlsjsErrorHandler;
            delete this.hlsVideoTagErrorHandler;
            delete this.hls;
        }
        delete this.eventMap;
        if (this.audioElement) {
            delete this.audioElement;
        }
        this.eventMap = {};
        this.audioElement = undefined;
        return this;
    };
    Galactic.prototype.destoryHLS = function () {
        if (this.hls) {
            this.hls.destroy();
            this.hls.detachMedia();
        }
    };
    /***************************************************************************************************************************/
    /****************************************************************************************************************************
     * Error Police Management
     */
    Galactic.prototype.hlsPolyfillVideoTagErrorHandlerFactory = function () {
        var _this = this;
        var _recoverDecodingErrorDate = null;
        var _recoverAudioCodecErrorDate = null;
        return function () {
            var now = Date.now();
            if (!_recoverDecodingErrorDate ||
                now - _recoverDecodingErrorDate > 2000) {
                _recoverDecodingErrorDate = now;
                _this.hls.recoverMediaError();
            }
            else if (!_recoverAudioCodecErrorDate ||
                now - _recoverAudioCodecErrorDate > 2000) {
                _recoverAudioCodecErrorDate = now;
                _this.hls.swapAudioCodec();
                _this.hls.recoverMediaError();
            }
            else {
                console.error('Error loading media: File could not be played ');
                _this.destoryHLS();
            }
        };
    };
    /***************************************************************************************************************************/
    /****************************************************************************************************************************
     * Error Police Management
     */
    Galactic.prototype.checkError = function (e) {
        if (this.isValid()) {
            this.catchErrorVulnerability(e);
        }
        return;
    };
    Galactic.prototype.showLoading = function () {
        this.audioTrackPlaying = undefined;
        this.dispatchEvent('wait', { status: this.audioTrackPlaying });
    };
    Galactic.prototype.catchErrorVulnerability = function (e) {
        var _this = this;
        if (this.bufferProgress === 100) {
            return;
        }
        var readyState = e.target.readyState;
        var networkState = e.target.networkState;
        var safeState = readyState >= 2 && this.metadata;
        var isLoading = networkState === 2;
        var error = e.target.error;
        var code = error && error.code ? error.code : undefined;
        var wait = function (time) {
            _this.showLoading();
            _this.error = true;
            _this.waitUntilOnline();
        };
        var callReload = function (time) {
            _this.showLoading();
            _this.error = true;
            _this.reload(time);
        };
        this.online =
            this.windows || this.playstation ? this.isOnline() : this.online;
        /*  *** error ***
            *************
            1 = MEDIA_ERR_ABORTED             fetching process aborted by user
            2 = MEDIA_ERR_NETWORK             error occurred when downloading
            3 = MEDIA_ERR_DECODE              error occurred when decoding
            4 = MEDIA_ERR_SRC_NOT_SUPPORTED   audio/video not supported
                
                *** networkState ***
            ********************
                0 = NETWORK_EMPTY    audio/video has not yet been initialized
            1 = NETWORK_IDLE         audio/video is active and has selected a resource, but is not using the network - no internet not loading
            2 = NETWORK_LOADING      browser is downloading data - is loading
            3 = NETWORK_NO_SOURCE    no audio/video source found - empty source
    
            *** readyState ***
            ******************
            0 = HAVE_NOTHING         no information whether or not the audio/video is ready
            1 = HAVE_METADATA        metadata for the audio/video is ready
            2 = HAVE_CURRENT_DATA    data for the current playback position is available, but not enough data to play next frame/millisecond
            3 = HAVE_FUTURE_DATA     data for the current and at least the next frame is available
            4 = HAVE_ENOUGH_DATA     enough data available to start playing
        */
        if (this.online) {
            /*** browser is online **/
            // cannot reload so dispatch a fatal error to fix the track src, url, etc or to move next
            if (error && code === 4) {
                this.showLoading();
                this.dispatchEvent('error', { progress: this.progress });
                return;
            }
            // regular error reload on user's given time
            else if ((error && code > 1) ||
                ((this.bufferProgress > 0 && !isLoading && !safeState) ||
                    (this.playstation && this.playState))) {
                callReload(this.options.reloadOnError);
            }
            else if (this.bufferProgress === 0 ||
                (this.playstation && !this.playState)) {
                // Audio is loading but not safe so give it a maximum time limit of user's input plus 10 seconds in advance
                if (isLoading && !safeState) {
                    callReload(this.options.reloadOnInit + 10000);
                }
                // Audio is not loading and not safe so reload on user's given time
                else if ((!isLoading && !safeState) || (safeState && !isLoading)) {
                    callReload(this.options.reloadOnInit);
                }
            }
        }
        else {
            /*** browser is offline **/
            // wait until online and then reload
            wait(1000);
        }
    };
    return Galactic;
}());
if (typeof module === 'object' &&
    module &&
    typeof module.exports === 'object') {
    /**
     * commonJS module
     */
    module.exports = Galactic;
}
else if (typeof define === 'function' && define.amd) {
    /**
     * AMD - requireJS
     * basic usage:
     * require(["/path/to/Galactic.js"], function(Galactic) {
     *   Galactic.instance.init()
     * });
     *
     */
    define(function () {
        return {
            constructor: Galactic,
            instance: Galactic
        };
    });
}
else {
    w.Galactic = Galactic;
}
