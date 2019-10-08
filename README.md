# Cross-Browser Generic Media Player

## Plain old `<audio>` &#128265; | HTML5 Audio 🔊 | `<video>` with HLS Polyfill &#128249;

A pleasure to give you one smooth experience to work with either audio or video across all web browsers.

Usually, users face slow connections and the handshake between the web browser and the media server tend to be unsuccessful, which prompt them to refresh the page in order to continue their music experience.

In addition to those obstacles, developers confront the usual browser issues when working with media, and the regular development of workarounds to overcome such matters.

## Demo

[Anghami](https://play.anghami.com), the leader in online media streaming in the MENA region, uses Galactic as a media player.

## Weight

The bundle is less than 30kb and is increased by 75% when compressed through gzip.

## Problems & Browser Issues Taken into Consideration

1. The `play()` must be initiated by a user gesture event
2. The `play()` request was interrupted by a call to `pause()`
3. Online / Offline reloading
4. Advanced error handling for perfect asynchronous media streaming
5. Fast media download across all JavaScript supported browsers
6. Works on browsers that doesn't support native HLS video streaming - use `hls.js` as a polyfill

## API Description

Galactic is a light weight Generic JavaScript media library that is strictly based on the HtmlMediaElement implementation. It supports HTML5 Audio, `<audio>` element, and video streaming (mp4 & HLS).
It makes it easier on developers to manage huge playlists, and to create player-like behavior really simple and easy.

It simply reloads the current media instance when facing any error and also after losing internet connection.

Very easy to setup in any JavaScript project - straight forward implementation.

## Methods

### loadEmpty()

Unlocks the infamous browsers error: The `play()` must be initiated by a user gesture event

```
  const myTrack;

  // A nice trick to be able to play() without a user gesture event on mobile
  // Mobile browsers do not allow applications to play HTML5 audio without an explicit action by the user
  const loadedEmpty = galatic.loadEmpty(); // for mobile only

  fetch(myTrack).then( url => {
    galatic.load(url); // plays by default
    //or
    galactic.load(url).play();
  });

```

### init(options: Object)

| Prop Name     |          Type          | Default |                                  Usage |
| ------------- | :--------------------: | ------: | -------------------------------------: |
| reloadOnInit  | Number In Milliseconds |   10000 |  Reload time value for on init failure |
| reloadOnError | Number In Milliseconds |    5000 | Reload time value for on error failure |
| reloadCount   |         Number         |       5 |   How many times the media is reloaded |
| playOnLoad    |        boolean         |    true | If `false`, media is paused after load |
| volume        |         Number         |       1 |                  Value from `0` to `1` |
| fadeIn        |        boolean         |   false |           Fade in the last few seconds |
| onInit        |        Function        |         |               Called on initialization |
| html5         |        boolean         |    true |        Either <audio> or `new Audio()` |
| video         |        boolean         |         |         `True` to switch to `<video>`  |
| poster        |         string         |         |      URL for the `<video>` background  |
| hls           |        boolean         |   false |                  Turn on HLS streaming |

### load(url: string)

Loads a media file from a source url - accepts m4a, mp4, mpeg4, aac, flv, mov, m4v, f4v, m4b, mp4v, 3gp, 3g2, mp4, m3u8.

### reload(time?: number)

Reload the media file and plays from the given time if any.

### setPosition(time: number)

Adjusts the current time value of the media file to a given value in milliseconds.

### setVolume(volume: number)

Sets the volume of the player to a value between 0 and 1.

### play()

Plays the media file.

### pause(forcePause?: boolean)

Pauses the playing media object. forcePause is passed if the object is expected to be paused after loading.

### stop(callback?: Function)

Stops the media object, then flushes all the variables, and resets the media src url. Dispatches an event durationChange with progress, remainingTime, and position time values set to 0. Accepts a callback function to be called after cleansing the environment.

### next(type 'shuffleIndex' | 'curentIndex': string, callback?: Function)

Increases the index of either the shuffle list or the current playing list. If a callback function is passed, it will be called after iterating through the desired Array list.

### previous(type 'shuffleIndex' | 'curentIndex': string, callback?: Function)

Decreases the index of either the shuffle list or the current playing list. If a callback function is passed, it will be called after iterating through the desired Array list.

### repeat(callback?: Function)

Switches repeat on and calls a callback method if any.

### shuffle(callback?: Function)

Shuffles the playlist and turns shuffle on. Calls a callback if a method is provided with an object that looks like this:

```
{
  track: Object,
  list: Array<Object>
}
```

Dispatches an event called shuffle status change with an object as the following:

```
{
  shuffle: boolean, // true
  track: Object
}
```

### applyPreviousAction(callback?: Function)

Toggles repeat off then iterates backwards through the shuffle list, if shuffle is on, or the current playing list. A callback method is called if one is provided.

### applyNextAction(callback?: Function)

This methods does four checks.

First, if there is a next playing item and shuffle is on, it picks the shuffled track from the nextPlayingList, else it picks the regular next item from the nextPlayingList.

Second else, if there is repeat is on, is repeats.

Third else, if shuffle is on, it shuffles and increases the shuffle index.

Fourth else, it just increases the current index of playing list.

### getNextPlayingListItem()

Returns the current item from the next playing list.

### setNextPlayingListItem(media: Object | Array)

Concats either a track object or an additional playlist on top of the next playing list.

### on(eventName: string, callback: Function)

Pushes a callback to be dispatched upon a certain event.

Note: You can attach as many events of the same name as you want.

Event names which can also be used when clearing the event name by using off():

`error`, `play`, `pause`, `end`, `wait`, `whilePlaying`, `readyToPlay`, `rateChange`, `volumeChange`, `durationChange`, `repeatStatusChange`, `playlistChange`, `bufferChange`

### off(eventName: string, value: any | null)

Clears the current events list which belongs to a specific type, and fills it with a given null or any value.

### addToPlaylist(data: Object | Array, type 'shuffleList' | 'list'?: string, callback?: Function)

Concats either a track item or another playlist on top of the existing shuffle or regular playing list. Calls a callback if a function is provided. Dispatches an event called "playlistChange" with an object as follows:

```
{
  playlist: Array<Object>,
  shuffleList: Array<Object>
}
```

### clearPlaylist(type 'list' | 'shuffleList': string, callback: Function)

Clears either the shuffle or the regular list and calls a callback method if there is one. Emits an event called "playlistChange" with an object as follows:

```
{
  'shuffleList' | 'list': Array<Object> // an empty []
}
```

### setAttribute(type: string, value?: string)

Sets the `<audio>` or `<video>` element attribute with a given string value.

### removeAttribute(type: string)

Removes a given attribute from the `<audio>` or `<video>` element.

## Props

| Name                          |       Type       |             Notes |
| ----------------------------- | :--------------: | ----------------: |
| audioElement                  | HTMLMediaElement |                   |
| list                          |  Array<Object>   |                   |
| shuffleList                   |  Array<Object>   |                   |
| playNextList                  |  Array<Object>   |                   |
| currentMediaItem              |      Object      |                   |
| options                       |      Object      |                   |
| currentSrc                    |      string      |                   |
| audioTrackPlaying             |     boolean      |    true: playing, |
|                               |                  |    false: paused, |
|                               |                  | undfined: loading |
| isRepeating                   |     boolean      |                   |
| isShuffling                   |     boolean      |                   |
| isReloading                   |     boolean      |                   |
| isPaused                      |     boolean      |                   |
| forceDurationChangeForAudioAd |     boolean      |                   |
| currentIndex                  |      number      |                   |
| shuffleIndex                  |      number      |                   |
| progress                      |      number      |                   |
| position                      |      number      |                   |
| duration                      |      number      |                   |
| remainingTime                 |      number      |                   |
| bufferProgress                |      number      |                   |

## Importing & Initialization

```

import { Galactic } from "Galactic":

// or
declare const Galactic;

var galatic = new Galactic().init({
    //optional
    reloadOnInit: "Numner In Milliseconds", // defaults to 10000
    reloadOnError: "Numner In Milliseconds", // defaults to 5000
    reloadCount: "Integer", // defaults to 5
    playOnLoad: true | false, // defaults to true
    volume: "Integer 0 -> 1", // defaults to 1
    fadeIn: true | false, // defaults to false
    onInit?: Function,

    //just for audio + defaults to audio
    html5: true | false,
    // defaults to true, if false an HTML <audio> element is appended // to the <body>

    //just for video
    video: true,
    poster: "any image url",
    hls: true | false, //defaults to false
  }).setPlaylist(myArrayOfSongs, function () {
  //do anything
});
```

## Events

### On end

```
galatic.on('end', function () {
  // In some cases, when the song reaches the end, you may want to either shuffle if shuffle is on, repeat if repeat is on, or  simply move to the next song
  // Use galatic.applyNextAction(callback);
});
```

#### On durationChange

```
galatic.on('durationChange', function (data) {
  progressElement.value = data.progress;
  position.innerHTML = humanTime(data.position);
  remaining.innerHTML = humanTime(data.remainingTime);
});
```

#### On play

```
galatic.on('play', (audioTrackPlaying: boolean) => {
  console.log('on play.........'); // audioTrackPlaying: true
});
```

#### On pause

```
galatic.on('pause', (audioTrackPlaying: boolean) => {
  console.log('on pause.........'); // audioTrackPlaying: false
});
```

#### On bufferChange

```
galatic.on('bufferChange', data => {
  console.log('on bufferChange: ', data.bufferProgress);
});
```

#### On wait

```
galatic.on('wait', (audioTrackPlaying: undefined) => {
  console.log('is waiting.........');
});
```

#### On error

```
// Error that cannot be handled by Galatic .i.e when the src is not supported
galatic.on('error', _ => {
  console.log('on fatal error.........');
});
```

#### On readyToPlay

```
galatic.on('readyToPlay', _ => {
  console.log('is ready to play.........');
});
```

### Handle `previous` &#10554; in your web player

```
function previousAction() {
  galatic.applyPreviousAction(function (data) {
    fetchplay(data.track);
  });
}
const previousClickFn = function () {
  // handled by default in the player class since the default actions always moves forward so that's wwhy it's handled there
  // galatic.isRepeating && galatic.toggle('repeat', false);
  previousAction();
};
```

### Handle `next` &#10555; in your web player

```
function nextAction() {
  galatic.applyNextAction(function (data) {
    fetchplay(data.track);
  });
}

const nextClickFn = () => {
  if (galatic.isRepeating) {
    galatic.toggle('repeat', false);
  }
  nextAction();
};
```

### Handle `shuffle` &#128256; in your web player

```
// Just toggle the `shuffle` property and let Galatic shuffle through the list
const shuffle = () => {
  galatic.toggle('shuffle');
  // or
  galatic.shuffle(function (data) {
    // do whatever
  });
};
```

### Handle `repeat` &#128257; property to repeat

```
const repeat = () => {
  galatic.toggle('repeat');
};
```
