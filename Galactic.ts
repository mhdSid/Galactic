declare var module: any;
declare var define: any;
let w: any = this;
let d: any = w.document;
const a: string = 'audio';
const v: string = 'video';
const s: string = 'script';

'use strict';
class PlatformDetector {
  private regex: Object = {
    platform: {
      playstation: new RegExp(
        '^Mozilla/[0-9].[0-9]\\s.(PlayStation [3-5]).*\\sSCEE/[1-9].[0-9]\\sNuanti/[1-9].[0-9]'
      ),
      mobile: new RegExp(
        'Mobile|Android|Tab|Tablet|GT|SM-(T|P)|Silk-Accelerated',
        'i'
      ),
      tablet: new RegExp('Tab|Tablet|iPad|SM-(T|P)|GT|Silk-Accelerated', 'i'),
      desktop: new RegExp(
        '(?:(?!Mobile|Android|Tab|Tablet|GT|SM-(T|P)|Silk-Accelerated).)',
        'i'
      )
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
  private canInit: boolean = false;

  constructor() {
    if (
      w.navigator &&
      w.navigator.userAgent &&
      w['RegExp'] &&
      typeof w['RegExp'] === 'function'
    ) {
      this.canInit = true;
    } else {
      this.throwErr();
    }
  }

  public detectDevice(): Object {
    return {
      platform: this.detect('platform'),
      os: this.detect('os'),
      browser: this.detect('browser')
    };
  }

  public detect(type): string {
    if (this.canInit) {
      let obj = this.regex[type];
      let regxName: string;
      for (regxName in obj) {
        if (obj[regxName].test(w.navigator.userAgent)) {
          return regxName;
        }
      }
    } else {
      this.throwErr();
    }
  }

  private throwErr(): void {
    if (w['Error'] && typeof w['Error'] === 'function') {
      throw new Error("This browser doesn't supprot platform detection.");
    } else {
      console.error("This browser doesn't supprot platform detection.");
    }
  }
}
interface GalacticInterface {
  list: any;
  shuffleList: any;
  playNextList: Array<any>;
  currentIndex: number;
  shuffleIndex: number;
  options: any;
  currentMediaItem: Object;
  audioElement: HTMLAudioElement;
  currentSrc: string;
  audioElementEvents: {};
  progress: number;
  position: number;
  remainingTime: number;
  lastPosition: number;
  bufferProgress: number;
  lastBufferProgress: number;
  audioTrackPlaying: boolean;
  audioTrackOnload: boolean;
  online: boolean;
  errorTimeout: any;
  interval: any;
  error: boolean;
  metadata: boolean;
  isRepeating: boolean;
  isShuffling: boolean;
  isPaused: boolean;
  eventMap: Object;
  duration: number;
  isReloading: boolean;
  mimeRegx: RegExp;
  device: any;
  windows: boolean;
  playstation: boolean;
  onlinecbreload: boolean;
  playState: boolean;
  emptyWaveFileBase64: string;
  emptyVideoFileBase64: string;
  playPromise: any;
  forceDurationChangeForAudioAd: boolean;
  script: HTMLScriptElement;
  hasCustomScript: HTMLScriptElement;
  forcePause: boolean;
  hlsjsErrorHandler: Function;
  hlsVideoTagErrorHandler: Function;
  loadEmpty: Function;
  isUsingHLSPolyfill: boolean;
  hls: any;
  tempElRef: HTMLElement;
  setup(options?: any): any;
  init(): any;
  destroy(): any;
  isValid(): boolean;
  load(withSrc?: any, afterReload?: boolean): any;
  reload(time: number): any;
  onBufferChange(e: Event): void;
  onDurationChange(e: Event): void;
  play(): any;
  pause(): any;
  stop(callback?: Function): any;
  next(prop: string, callback?: Function): any;
  previous(prop: string, callback?: Function): any;
  repeat(callback?: Function): any;
  flush(): any;
  loadAudio(): any;
  setSrc(src: string): any;
  setPosition(position: number): any;
  setTimeValues(
    progress: number,
    remainingTime: number,
    position: number
  ): void;
  setVolume(volume: number): any;
  dispatchEvent(type: string, args: Object): void;
  catchErrorVulnerability(e: Event): void;
  setNextPlayingListItem(mediaItem: Object): any;
  getNextPlayingListItem(): Object;
  removeNextPlayingListItem(): any;
  hasNextPlayingListItem(): boolean;
  applyNextAction(): any;
  on(type: string, callback: Function): void;
  off(type: string, filler: any): void;
  shuffle(callback?: Function): any;
  createShuffleList(list: Array<any>): Array<any>;
  toggle(prop: string): any;
  isValid(): boolean;
  isBufferValid(): boolean;
  hasBuffer(): boolean;
  waitUntilOnline(): any;
  clearWaiters(): any;
  setAttribute(type: string, value: string): any;
  addToPlaylist(data: any, type?: string, callback?: Function): any;
  createElement(parent: HTMLElement, type: string): any;
  addEventListeners(element: HTMLElement, events: Object): any;
  setOptions(options: Object): any;
}

class Galactic implements GalacticInterface {
  'use strict';

  /*
   * Media Item & Lists
   */
  public currentMediaItem: Object;
  public list: any;
  public shuffleList: any;
  public playNextList: Array<any>;

  /*
   * Main Used Indexes
   */
  public currentIndex: number;
  public shuffleIndex: number;

  /*
   * Main Elements
   */
  public audioElement: HTMLAudioElement;
  //public audioSourceElement: HTMLSourceElement;

  /*
   * Audio Source URL
   */
  public currentSrc: string;

  /*
   * Main Events Objects
   */
  public audioElementEvents: Object;
  public eventMap: Object;

  /*
   * Main Options
   */
  public options: any;

  /*
   * To Handle the case of loading for mobile and handle all mobile browsers exceptions & warnings
   */
  public loadEmpty: any;
  private emptyWaveFileBase64: string;

  /*
   * Main Regex for to check for audio Type
   */
  private mimeRegx: RegExp;

  /*
   * Audio State Flags
   */
  private playState: boolean;
  public audioTrackPlaying: boolean;
  private audioTrackOnload: boolean;
  public isRepeating: boolean;
  public isShuffling: boolean;
  public isPaused: boolean;
  private isReloading: boolean;
  private metadata: boolean;

  /*
   * Handle Error and interval for reloading and on online callback
   */
  private errorTimeout: any;
  private interval: any;
  private onlinecbreload: boolean;
  private online: boolean;
  private error: boolean;

  /*
   * Devices & Platfornms Falgs
   */
  private device: any;
  private windows: boolean;
  private playstation: boolean;

  /*
   * Handle Data About Time, Duration, Position, etc
   */
  private progress: number;
  private position: number;
  private remainingTime: number;
  private bufferProgress: number;
  private lastBufferProgress: number;
  private lastPosition: number;
  private duration: number;

  /*
   * This promise object that is retuned when the browser has safely played the media element
   * It is mainly used to play() pause() load() safely and to handle exceptions thrown by the browser
   */
  private playPromise: any;

  /*
     * Audio Ads Data Management
     * Used to handle sending duration for the audio ad of type m4a 
     *************************** 
      TO-DO: check this
     ***************************
     */
  public forceDurationChangeForAudioAd: boolean;

  private hlsjsErrorHandler: any;
  private hlsVideoTagErrorHandler: any;
  private isUsingHLSPolyfill: boolean;
  private hls: any;
  private script: HTMLScriptElement;
  private hasCustomScript: HTMLScriptElement;
  private tempElRef: HTMLElement;
  private emptyVideoFileBase64: string;
  private forcePause: boolean;

  constructor() {
    this.setup();
  }

  /****************************************************************************************************************************
   * Boilerplate: set default values
   */
  private setup(): any {
    //Main Audio Events
    this.audioElementEvents = {
      abort: e => {
        console.log(
          'The abort event occurs when the loading of an audio/video is aborted. Sent when playback is aborted; for example, if the media is playing and is restarted from the beginning, this event is sent.'
        );
        this.checkError(e);
      },
      stalled: e => {
        console.log(
          'browser is trying to get media data, but data is not available'
        );
        this.checkError(e); //when it's not paused
      },
      suspend: e => {
        console.log(
          'loading of the media is suspended (prevented from continuing). This can happen when the download has completed, or because it has been paused for some reason.'
        );
        if (this.bufferProgress <= 98) {
          this.checkError(e);
        }
      },
      error: e => {
        console.log(
          'an error occurred during the loading of an audio error: ' +
            e.target.error.code +
            ' ' +
            e.target.error.message
        );
        this.checkError(e);

        if (this.options.video && this.isUsingHLSPolyfill) {
          const mediaError: any = e.currentTarget.error;
          if (mediaError.code === mediaError.MEDIA_ERR_DECODE) {
            this.hlsVideoTagErrorHandler();
          }
        }
      },
      emptied: e => {
        // *** TO DO *** // check for error in this state
        this.audioTrackPlaying = undefined;
      },
      waiting: e => {
        this.audioTrackPlaying = undefined;
        console.log('audio stops because it needs to buffer the next frame.');
        this.checkError(e);
        if (this.hasBuffer()) {
          this.onBufferChange(e);
        }
        this.dispatchEvent('wait', { status: this.audioTrackPlaying });
      },
      loadedmetadata: e => {
        console.log(
          'loaded meta data for audio/video consists of: duration, dimensions (video only) and text tracks.'
        );
        this.metadata = true;
      },
      loadstart: e => {
        this.audioTrackPlaying = undefined;
        console.log(
          'the browser is currently looking for the specified audio/video'
        );
        this.dispatchEvent('wait', { status: this.audioTrackPlaying });
        if (this.hasBuffer()) {
          this.onBufferChange(e);
        }
      },
      durationchange: e => {
        console.log(
          'when an audio/video is loaded, the duration will change from "NaN" to the actual duration of the audio/video'
        );
        if (this.isValid()) {
          this.onDurationChange(e);
        }

        if (this.lastPosition) {
          this.setPosition(this.lastPosition);
          this.lastPosition = undefined;
        }

        this.duration = e.target.duration;
      },
      timeupdate: e => {
        console.log('playing position of an audio/video has changed.', this);
        this.playState = true;
        if (this.isValid()) {
          this.onDurationChange(e);
          this.audioTrackPlaying = true;
        }

        if (this.hasBuffer()) {
          this.onBufferChange(e);
        }

        if (this.isReloading) {
          this.isReloading = this.error = false;
        }

        if (this.bufferProgress === 100) {
          this.clearWaiters(); //kill waiters in case it is fully downloaded
        }
      },
      canplay: e => {
        if (this.forcePause && !this.audioElement.paused) {
          this.pause(undefined, true);
        }

        console.log(
          'can start playing the audio/video, enough has loaded to play...'
        );

        this.dispatchEvent('readyToPlay', {
          track: this.currentMediaItem,
          src: this.currentSrc,
          progress: this.progress
        });

        if (this.options.playOnLoad) {
          this.play();
        }
      },
      playing: e => {
        if (this.forcePause && !this.audioElement.paused) {
          this.pause(undefined, true);
        }
        console.log(
          'audio is playing after having been paused or stopped for buffering'
        );
        if (this.playstation) {
          this.audioTrackPlaying = true;
        }
        if (this.isValid()) {
          this.dispatchEvent('play', { status: this.audioTrackPlaying });
        }
        if (this.hasBuffer()) {
          this.onBufferChange(e);
        }
      },
      pause: e => {
        this.forcePause = false;
        this.isPaused = true;
        this.audioTrackPlaying = false;
        if (this.isValid()) {
          this.dispatchEvent('pause', { status: this.audioTrackPlaying });
        }
      },
      ended: e => {
        if (this.isValid()) {
          this.dispatchEvent('end', { progress: this.progress });
        }
      },
      progress: e => {
        console.log('downloading the specified audio/video... ');
        if (this.hasBuffer()) {
          this.onBufferChange(e);
        }
      },
      ratechange: e => {
        if (this.isValid()) {
          this.dispatchEvent('rateChange');
        }
      },
      volumechange: e => {
        if (this.isValid()) {
          this.dispatchEvent('volumeChange');
        }
      },
      seeking: e => {
        this.pause();
      },
      seeked: e => {
        if (this.options.playOnLoad) {
          this.play();
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
    this.mimeRegx = new RegExp(
      /\.m4a|mp4|mpeg4|aac|flv|mov|m4v|f4v|.m4b|mp4v|3gp|3g2|mp4|m3u8/
    );

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
    this.loadEmpty = (() => {
      return () => {
        this.forcePause = false;
        this.load(false);
      };
    })();

    if (!this.windows && !this.playstation) {
      w.addEventListener('offline', this.offlinecb, false);
      w.addEventListener('online', this.onlinecb, false);
    }
  }
  /****************************************************************************************************************************/

  private appendHLSEvents(): void {
    this.hls.on(w.Hls.Events.MANIFEST_PARSED, () => {
      if (this.options.playOnLoad) {
        this.play();
      }
    });
    // try to recover on fatal errors
    this.hls.on(w.Hls.Events.ERROR, (event: Object, data: any) => {
      if (data.fatal) {
        switch (data.type) {
          case w.Hls.ErrorTypes.NETWORK_ERROR:
            this.hls.startLoad();
            break;
          case w.Hls.ErrorTypes.MEDIA_ERROR:
            this.hlsjsErrorHandler();
            break;
          default:
            console.error('Error loading media: File could not be played');
            this.destoryHLS();
            break;
        }
      }
    });
  }

  /****************************************************************************************************************************
   * Main Initializer
   */
  public init(options?: any): any {
    this.setOptions(options);
    this.createMedia();

    return this;
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Connecitivty Manager: Methods Needed
   */
  private isOnline(): boolean {
    // Handle IE and more capable browsers
    let xhr: XMLHttpRequest = new XMLHttpRequest();

    // Open new request as a HEAD to the root hostname with a random param to bust the cache
    xhr.open(
      'HEAD',
      `//${w.location.hostname}/?rand=${w.Math.floor(
        (1 + w.Math.random()) * 0x10000
      )}`,
      false
    ); // secon argument async :

    // Issue request and handle response
    try {
      xhr.send();
      return xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304);
    } catch (error) {
      return false;
    }
  }

  private waitUntilOnline(): any {
    if (this.windows || this.playstation) {
      if (!this.interval) {
        this.interval = w.setInterval(() => {
          this.online = this.isOnline();
          if (this.online) {
            this.reload(0);
          }
        }, 2000);
      }
    } else {
      this.onlinecbreload = true;
    }
    return this;
  }

  private onlinecb(): void {
    console.log('is online...onlinecbreload: ', this.onlinecbreload);
    this.online = true;
    if (this.onlinecbreload) {
      this.reload(0);
    }
  }

  private offlinecb(): void {
    console.log('is offline...');
    this.online = false;
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Buffer Progress Management
   */
  private onBufferChange(e: any): void {
    try {
      let duration: number = e.target.duration;
      let buffered: any = e.target.buffered;
      let currentTime: number = e.target.currentTime;
      let i: number = 0;
      let buffLen: number = buffered.length;
      this.lastBufferProgress = this.bufferProgress;

      if (duration > 0 && buffLen > 0) {
        for (; i < buffLen; i++) {
          if (buffered.start(buffLen - 1 - i) < currentTime) {
            this.bufferProgress = w.Math.ceil(
              (buffered.end(buffLen - 1 - i) / duration) * 100
            );
            break;
          }
        }
      } else {
        this.bufferProgress = undefined;
      }
      if (this.isBufferValid()) {
        this.dispatchEvent('bufferChange', {
          bufferProgress: this.bufferProgress
        });
      }
    } catch (e) {}
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Duration Management
   */
  private onDurationChange(e: any): void {
    let d: number = e.target.duration ? e.target.duration * 1000 : 0;
    let c: number = e.target.currentTime ? e.target.currentTime * 1000 : 0;
    let p: number = (c / d) * 100;

    //p: progress , d-c: remainingTime, c: position
    this.setTimeValues(p, d - c, c);
  }

  private setTimeValues(
    progress: number,
    remainingTime: number,
    position: number
  ): void {
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
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Seek To A Certain Position
   */
  public setPosition(position: number): any {
    if (this.playState) {
      try {
        // try-catch block: for ie exception
        this.audioElement.currentTime = Number(position) / 1000;
      } catch (e) {}
    }
    return this;
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Reload Management
   */
  private reload(time: number, force?: boolean): any {
    if (this.position > 1000) {
      this.lastPosition = this.position;
    }
    if (!this.errorTimeout) {
      this.errorTimeout = w.setTimeout(() => {
        if (this.online && !this.audioTrackPlaying && this.error) {
          if (
            this.audioElement.readyState >= 2 &&
            this.audioElement.networkState === 2
          ) {
            this.isReloading = true;
            this.clearWaiters().play(true);
          } else {
            this.load(this.currentSrc, true);
          }
        } else {
          this.error = false;
          this.isReloading = false;
          this.clearWaiters();
        }
      }, time);
    }
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Volume Management
   */
  public setVolume(volume: number): any {
    // from 0 to 100
    try {
      if (volume > 1.0) {
        return;
      }
      this.audioElement.volume = volume;
      this.dispatchEvent('volumeChange', { volume: this.audioElement.volume });
      return this;
    } catch (e) {}
  }

  public getVolume(): number {
    return this.audioElement.volume;
  }
  /***************************************************************************************************************************/

  /****************************************************************************************************************************
   * Main Audio Functionality: Play, Pause, Shuffle, Next, Previous, Repeat
   */
  private loadAudio(): any {
    if (this.options.video && this.isUsingHLSPolyfill) {
      this.createNewHlsContext();
      this.hls.loadSource(this.currentSrc);
    } else {
      this.audioElement.load();
    }
    return this;
  }

  public load(withSrc?: any, afterReload?: boolean): any {
    this.flush(true);
    if (afterReload) {
      this.loadAudio();
    }

    if (withSrc) {
      this.setSrc(withSrc);
    } else {
      this.setSrc(
        this.options.video
          ? this.emptyVideoFileBase64
          : this.emptyWaveFileBase64
      );
    }

    this.setAttribute('src', this.currentSrc);
    this.loadAudio();
    return this;
  }

  public fadeIn(
    start: number,
    end: number,
    duration: number,
    cb?: Function
  ): void {
    end = Math.round(end);
    let delta: number = end - start;
    let startTime: number = null;
    let t: number;
    let factor: number;
    let frame: any;

    this.setVolume(0);

    let tweenLoop: FrameRequestCallback = (time?: number) => {
      if (!time) {
        time = new Date().getTime();
      }
      if (startTime === null) {
        startTime = time;
      }

      t = time - startTime;
      factor = t / duration;

      this.setVolume(start + delta * factor);

      if (t < duration && this.getVolume() < end) {
        console.log('animating ', this.getVolume());
        frame = w.requestAnimationFrame(tweenLoop);
        return;
      }
      w.cancelAnimationFrame(frame);
      console.log('done animating ', this.getVolume());
      if (cb) {
        cb();
      }
      tweenLoop = delta = startTime = t = time = start = frame = null;
    };
    frame = w.requestAnimationFrame(tweenLoop);
  }

  public play(): any {
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
      this.audioElement.play().catch(e => {});
    } catch (e) {}
    // }
    return this;
  }

  private checkFadeIn(): void {
    if (this.options.fadeIn) {
      this.fadeIn(0.0, 0.9, 5000);
    }
  }

  public pause(forcePause?: boolean, force?: boolean): any {
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
      } catch (e) {}
    }
    return this;
  }

  public stop(callback?: Function): any {
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
  }

  public next(prop: string, callback?: Function): any {
    this[prop] = this[prop] === this.list.length - 1 ? 0 : ++this[prop];

    this.currentMediaItem = this.list[this[prop]];

    if (typeof callback === 'function') {
      callback({ track: this.currentMediaItem });
    }
    return this;
  }

  public previous(prop: string, callback?: Function): any {
    this[prop] = this[prop] <= 0 ? this.list.length - 1 : --this[prop];

    this.currentMediaItem = this.list[this[prop]];

    if (typeof callback === 'function') {
      callback({ track: this.currentMediaItem });
    }
    return this;
  }

  public repeat(callback?: Function): any {
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
  }

  public createShuffleList(list): Array<any> {
    let currentIndex = list.length,
      temporaryValue,
      randomIndex;

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
  }

  public shuffle(callback?: Function): any {
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
  }

  public addToPlaylist(data: any, type?: string, callback?: Function): any {
    let copy: Array<any>;

    if (typeof arguments[1] === 'string') {
      if (data.constructor === Array) {
        this[type] = copy = data.length > 0 ? data : this[type];
      } else {
        this[type].push(data);
        copy = this[type];
      }
    } else {
      if (data.constructor === Array) {
        this.list = this.shuffleList = copy =
          data.length > 0 ? data : this.list;
      } else {
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
  }

  public clearPlaylist(type: string, callback?: Function): any {
    this[type] = [];

    if (typeof callback === 'function') {
      callback();
    }

    this.dispatchEvent('playlistChange', {
      [type]: this[type]
    });
    return this;
  }

  public setNextPlayingListItem(media: any): any {
    if (media.constructor === Array) {
      this.playNextList = this.playNextList.concat(media);
    } else {
      this.playNextList.push(media);
    }
    return this;
  }

  public getNextPlayingListItem(): Object {
    return this.playNextList[this.playNextList.length - 1];
  }

  // Remove the item played which is the last item
  public removeNextPlayingListItem(): any {
    // Remove the first item since the queue always plays the first
    this.playNextList.splice(this.playNextList.length - 1, 1);
    return this;
  }

  public hasNextPlayingListItem(): boolean {
    return this.playNextList.length > 0 ? true : false;
  }

  public applyNextAction(callback?: Function): any {
    // this.stop();
    if (this.hasNextPlayingListItem()) {
      const call: Function = (mediaItem: Object) => {
        this.removeNextPlayingListItem();
        this.currentMediaItem = mediaItem;
        callback({ track: this.currentMediaItem });
      };

      const track: any = this.getNextPlayingListItem();

      if (this.isShuffling) {
        this.shuffleList.forEach(mediaItem => {
          if (mediaItem.id == track.id) {
            call(mediaItem);
          }
        });
      } else {
        call(track);
      }
    } else if (this.isRepeating) {
      this.repeat(callback);
    } else if (this.isShuffling) {
      this.shuffle().next('shuffleIndex', callback);
    } else {
      this.next('currentIndex', callback);
    }
    return this;
  }

  // This will be called from a click event: since the player always moves forward so that's why we toggle repeat by default
  public applyPreviousAction(callback?: Function): any {
    // this.stop();
    if (this.isRepeating) {
      this.toggle('repeat', false);
    }

    if (this.isShuffling) {
      this.shuffle().previous('shuffleIndex', callback);
    } else {
      this.previous('currentIndex', callback);
    }
    return this;
  }

  //  Force toggle: toggle('repeat', true|false);
  //  Regular toggle toggles the property and the opposite:
  //  Toggle('repeat'); sets repeat to true and shuffle to false
  //  Toggle('shuffle'); sets shuffle to true and repeat to false
  public toggle(prop: string, forceTrue?: boolean): any {
    const propName: string =
      prop === 'shuffle'
        ? 'isShuffling'
        : prop === 'repeat'
        ? 'isRepeating'
        : '';

    const oppositePropName: string =
      prop === 'shuffle'
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
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Flush Everyting
   * Reset all attributes to defaults
   * Clear everythihg
   */
  private flush(reset?: boolean): any {
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
  }

  private clearWaiters(): any {
    w.clearTimeout(this.errorTimeout);

    this.errorTimeout = undefined;

    if (this.windows || this.playstation) {
      w.clearInterval(this.interval);
      this.interval = undefined;
    } else {
      this.onlinecbreload = false;
    }
    return this;
  }
  /****************************************************************************************************************************/

  /****************************************************************************************************************************
   * Utility Methods Everyting
   */
  private setOptions(options: Object): any {
    if (options) {
      let opt: string;

      for (opt in options) {
        this.options[opt] = options[opt];

        if (opt === 'volume') {
          this.setVolume(options[opt]);
        } else if (opt === 'controls') {
          this.audioElement.controls = options[opt];
        } else if (opt === 'poster') {
          this.setAttribute('poster', options[opt]);
        }
      }
    }
    return this;
  }

  private createMedia(): any {
    if (this.options.vr) {
      // Playing around just for testing purposes
      this.hasCustomScript = d.getElementById('gl-vr');

      if (!!this.hasCustomScript) {
        this.createVRElement();
      } else {
        this.script = d.createElement(s);

        this.script.src =
          'https://storage.googleapis.com/vrview/2.0/build/vrview.min.js';

        this.script.id = 'gl-vr';

        this.script.async = false;

        d.head.appendChild(this.script);

        this.script.onload = () => {
          console.log('script hls.js latest has loaded');
          this.createVRElement();
          delete this.script;
        };
      }

      delete this.hasCustomScript;
    } else if (this.options.html5) {
      this.audioElement = new Audio();

      this.updateDomElement();
    } else {
      if (this.options.hls) {
        this.hasCustomScript = d.getElementById('gl-hls');

        if (!!this.hasCustomScript) {
          this.createElement();
        } else {
          this.script = d.createElement(s);

          this.script.src =
            'https://anghamiwebcdn.akamaized.net/web/vendor/hls.min.js';

          this.script.id = 'gl-hls';

          this.script.async = false;

          d.head.appendChild(this.script);

          this.script.onload = () => {
            this.createElement();
            delete this.script;
          };
        }

        delete this.hasCustomScript;
      } else {
        this.createElement();
      }
    }
    return this;
  }

  private createNewHlsContext(): void {
    this.hls = new w.Hls({
      autoStartLoad: true,
      startPosition: -1,
      capLevelToPlayerSize: true, //false,
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
      stretchShortVideoTrack: true, //false,
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
  }

  private createVRElement(): void {
    // Selector '#vrview' finds element with id 'vrview'.
    const vrView = new w['VRView'].Player('#vrview', {
      video: this.options.vrSrc
    });

    vrView.play();
  }

  private createElement(): any {
    let element: any;

    try {
      if (this.options.video) {
        // Any DOM element where the newely created video element will be injected
        let videoElementParent: HTMLElement = d.getElementById(v);

        this.audioElement = videoElementParent.appendChild(d.createElement(v));

        videoElementParent = null;

        //either chrome or fireflox
        if (this.device.browser && this.options.hls) {
          this.isUsingHLSPolyfill = true;
        }

        this.updateDomElement();
      } else {
        this.audioElement = d.body.appendChild(d.createElement(a));
        this.updateDomElement();
      }
    } catch (e) {}
  }

  private updateDomElement(): void {
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

      this.setSrc(this.emptyVideoFileBase64).setAttribute(
        'type',
        this.options.hls ? 'application/x-mpegURL' : 'video/mp4'
      );
    } else {
      this.setSrc(this.emptyWaveFileBase64).setAttribute(
        'type',
        'audio/mp4; codecs="mp4a.40.2"'
      );
    }

    if (typeof this.options.onInit === 'function') {
      this.options.onInit();
    }
  }

  private addEventListeners(): any {
    if (this.audioElement) {
      let e: string;

      for (e in this.audioElementEvents) {
        this.audioElement.addEventListener(
          e,
          this.audioElementEvents[e],
          false
        );
      }

      if (this.options.video && this.isUsingHLSPolyfill) {
        // create separate error handlers for hlsjs and the video tag
        this.hlsjsErrorHandler = this.hlsPolyfillVideoTagErrorHandlerFactory();
        this.hlsVideoTagErrorHandler = this.hlsPolyfillVideoTagErrorHandlerFactory();
      }
    }
    return this;
  }

  private isValid(): boolean {
    return this.forceDurationChangeForAudioAd
      ? true
      : this.currentSrc.match(this.mimeRegx) !== null; // > 0;
  }

  private isBufferValid(): boolean {
    return (
      this.bufferProgress > 0 && this.bufferProgress !== this.lastBufferProgress
    );
  }

  private hasBuffer(): boolean {
    return !this.playstation && this.bufferProgress !== 100;
  }

  private setSrc(src: string): any {
    try {
      this.currentSrc = src;
    } catch (e) {}
    return this;
  }

  private setAttribute(type: string, value?: string): any {
    if (typeof value !== 'undefined') {
      try {
        this.audioElement[type] = value;
      } catch (e) {}
    }
    return this;
  }

  private removeAttribute(type: string): any {
    try {
      this.audioElement.removeAttribute(type);
      // delete this.audioElement[type];
    } catch (e) {}
    return this;
  }
  /****************************************************************************************************************************/

  /***************************************************************************************************************************
   * Events Dispatcher
   */
  public on(type: string, callback: Function): void {
    if (!this.eventMap[type]) {
      this.eventMap[type] = [];
    }
    this.eventMap[type].push(callback);
  }

  public off(type: string, filler: any): void {
    this.eventMap[type] = filler;
  }

  private dispatchEvent(type: any, args?: Object): any {
    let objValue: any = this.eventMap[type];
    if (!objValue) {
      return this;
    }
    objValue.forEach(function(item: Function) {
      if (typeof item === 'function') {
        item(args);
      }
    });
    return this;
  }
  /***************************************************************************************************************************/

  /***************************************************************************************************************************
   * On Destory
   */
  public destroy(): any {
    let e: string;

    if (this.audioElement) {
      for (e in this.audioElementEvents) {
        this.audioElement.removeEventListener(
          e,
          this.audioElementEvents[e],
          false
        );
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
  }

  private destoryHLS(): void {
    if (this.hls) {
      this.hls.destroy();
      this.hls.detachMedia();
    }
  }
  /***************************************************************************************************************************/

  /****************************************************************************************************************************
   * Error Police Management
   */
  private hlsPolyfillVideoTagErrorHandlerFactory(): Function {
    let _recoverDecodingErrorDate: number = null;
    let _recoverAudioCodecErrorDate: number = null;

    return () => {
      const now: number = Date.now();

      if (
        !_recoverDecodingErrorDate ||
        now - _recoverDecodingErrorDate > 2000
      ) {
        _recoverDecodingErrorDate = now;
        this.hls.recoverMediaError();
      } else if (
        !_recoverAudioCodecErrorDate ||
        now - _recoverAudioCodecErrorDate > 2000
      ) {
        _recoverAudioCodecErrorDate = now;
        this.hls.swapAudioCodec();
        this.hls.recoverMediaError();
      } else {
        console.error('Error loading media: File could not be played ');
        this.destoryHLS();
      }
    };
  }
  /***************************************************************************************************************************/

  /****************************************************************************************************************************
   * Error Police Management
   */
  private checkError(e: Event): boolean {
    if (this.isValid()) {
      this.catchErrorVulnerability(e);
    }
    return;
  }

  private showLoading(): void {
    this.audioTrackPlaying = undefined;
    this.dispatchEvent('wait', { status: this.audioTrackPlaying });
  }

  private catchErrorVulnerability(e: any): any {
    if (this.bufferProgress === 100) {
      return;
    }

    let readyState: any = e.target.readyState;
    let networkState: any = e.target.networkState;
    let safeState: boolean = readyState >= 2 && this.metadata;
    let isLoading: boolean = networkState === 2;
    let error: any = e.target.error;
    let code: number = error && error.code ? error.code : undefined;

    const wait: Function = (time?: number) => {
      this.showLoading();
      this.error = true;
      this.waitUntilOnline();
    };

    const callReload: Function = (time?: number) => {
      this.showLoading();
      this.error = true;
      this.reload(time);
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
      else if (
        (error && code > 1) ||
        ((this.bufferProgress > 0 && !isLoading && !safeState) ||
          (this.playstation && this.playState))
      ) {
        callReload(this.options.reloadOnError);
      } else if (
        this.bufferProgress === 0 ||
        (this.playstation && !this.playState)
      ) {
        // Audio is loading but not safe so give it a maximum time limit of user's input plus 10 seconds in advance
        if (isLoading && !safeState) {
          callReload(this.options.reloadOnInit + 10000);
        }

        // Audio is not loading and not safe so reload on user's given time
        else if ((!isLoading && !safeState) || (safeState && !isLoading)) {
          callReload(this.options.reloadOnInit);
        }
      }
    } else {
      /*** browser is offline **/

      // wait until online and then reload
      wait(1000);
    }
  }
  /****************************************************************************************************************************/
}

if (
  typeof module === 'object' &&
  module &&
  typeof module.exports === 'object'
) {
  /**
   * commonJS module
   */
  module.exports = Galactic;
} else if (typeof define === 'function' && define.amd) {
  /**
   * AMD - requireJS
   * basic usage:
   * require(["/path/to/Galactic.js"], function(Galactic) {
   *   Galactic.instance.init()
   * });
   *
   */
  define(function() {
    return {
      constructor: Galactic,
      instance: Galactic
    };
  });
} else {
  w.Galactic = Galactic;
}
