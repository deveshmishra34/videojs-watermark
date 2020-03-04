import videojs from 'video.js';
import {version as VERSION} from '../package.json';

const Plugin = videojs.getPlugin('plugin');

// Default options for the plugin.
const defaults = {
  position: 'top-right',
  fadeIn: 2000,
  fadeOut: 5000,
  after: 10000,
  url: '',
  image: '',
  text: '',
  width: 0,
  height: 0
};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class Watermark extends Plugin {

  /**
   * Create a Watermark plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    this.options = videojs.mergeOptions(defaults, options);

    this.player.ready(() => {
      this.player.addClass('vjs-watermark');

      // if there is no image or text just exit
      if (!this.options.image && !this.options.text) {
        return;
      }

      this.setupWatermark(player, this.options);
      let timeInterval;

      player.on('play', () => {
        // console.log(this.player.videoHeight(), this.player.videoWidth(), this.player.duration(), this);

        if (!this.options.height) {
          this.options.height = this.player.videoHeight() - 100;
        }

        if (!this.options.width) {
          this.options.width = this.player.videoWidth() - 100;
        }

        timeInterval = setInterval( () => {
          const watermarkEle = document.getElementsByClassName('vjs-watermark-content')[0];
          const top_bottom = this.getRandomInt(this.options.height);
          const left_right = this.getRandomInt(this.options.width);
          watermarkEle.classList.remove('vjs-watermark-fade-out');
          watermarkEle.classList.add('vjs-watermark-fade-in');
          watermarkEle.style.top = top_bottom + 'px';
          watermarkEle.style.right = left_right + 'px';
          this.fadeWatermark(this.options);
        },this.options.after);

      });

      player.on('ended', () => {
        // console.log('Finish');
        clearInterval(timeInterval)
      });
    });
  }

  setupWatermark(player, options) {
    // console.log('setupWatermark');
    // Add a div and img tag
    const videoEl = player.el();
    const div = document.createElement('div');
    const p = document.createElement('p');
    const img = document.createElement('img');

    div.classList.add('vjs-watermark-content');
    div.classList.add(`vjs-watermark-${options.position}`);
    div.classList.add(`vjs-watermark-fade-out`);
    p.classList.add(`vjs-watermark-text`);

    // if a url is provided make the image link to that URL.
    if (options.url) {
      const a = document.createElement('a');

      a.href = options.url;
      // if the user clicks the link pause and open a new window
      a.onclick = (e) => {
        e.preventDefault();
        player.pause();
        window.open(options.url);
      };

      if (options.image) {
        img.src = options.image;
        a.appendChild(img);
      }

      if (options.text) {
        p.innerHTML = options.text;
        a.appendChild(p);
      }

      div.appendChild(a);
    } else {
      if (options.image) {
        img.src = options.image;
        div.appendChild(img);
      }

      if (options.text) {
        p.innerText = options.text;
        div.appendChild(p);
      }
    }
    videoEl.appendChild(div);

    // this.options.width = div.clientWidth;
    // this.options.height = div.clientHeight;
    // console.log('div: ', div, div.clientWidth, div.clientHeight)
  }

  fadeWatermark(options) {
    setTimeout(() => {
      document.getElementsByClassName('vjs-watermark-content')[0].classList.add('vjs-watermark-fade-out');
    }, options.fadeOut);
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}

// Define default values for the plugin's `state` object here.
Watermark.defaultState = {};

// Include the version number.
Watermark.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('watermark', Watermark);

export default Watermark;
