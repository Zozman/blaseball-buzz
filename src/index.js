import { LitElement, html, css } from "lit";
import { Howl } from "howler";
import "@vaadin/vaadin-button";

class MainApp extends LitElement {
  static get styles() {
    return css`
      .app {
        flex: 1;
        display: flex;
        height: 100%;
        align-items: center;
        justify-content: center;
        background-color: black;
      }
      vaadin-button {
        cursor: pointer;
      }
      .content {
        display: flex;
        flex-direction: column;
      }
      .currentMessage {
        color: white;
        font-family: "Lora", "Courier New", monospace, serif;
      }
    `;
  }

  static get properties() {
    return {
      _isTransmitting: {
        type: Boolean,
      },
      _morse: {
        type: Object,
      },
      _stream: {
        type: Object,
      },
      _eventList: {
        type: Array,
      },
      _currentMessage: {
        type: String,
      },
      _currentAudio: {
        type: Object,
      },
    };
  }

  constructor() {
    super();
    this._isTransmitting = false;
    this._currentMessage = "Awaiting Transmission...";
    this._eventList = [];
    this._morse = require("morse-decoder");
    // const streamUrl = 'https://before.sibr.dev/events/streamData';
    const startTime = "2021-07-01T01:00:08.17Z";
    const streamUrl = "https://api.sibr.dev/replay/v1/replay?from=" + startTime;
    this._stream = new EventSource(streamUrl);
    this._stream.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      const games = data?.value?.games?.schedule;
      if (games) {
        const randomGame = games[Math.floor(Math.random() * games.length)];
        const gameUpdate = randomGame.lastUpdate;
        if (this._isTransmitting && gameUpdate) {
          this._eventList = [...this._eventList, gameUpdate];
        }
      }
    });
  }

  update(changedProperties) {
    super.update(changedProperties);
    if (changedProperties.has("_eventList")) {
      this.checkEvents();
    }
  }

  checkEvents() {
    if (!this._currentAudio && this._isTransmitting) {
      this.transmitNextItem();
    }
  }

  transmitNextItem() {
    if (this._eventList && this._eventList.length) {
      const message = this._eventList[0];
      this._currentMessage = this._morse.encode(message);
      const morseAudio = this._morse.audio(message);
      morseAudio.getWaveBlob().then((result) => {
        const blobUrl = window.URL.createObjectURL(result);
        this._currentAudio = new Howl({
          src: [blobUrl],
          format: ["wav"],
          onend: () => {
            this._currentAudio = null;
            this.checkEvents();
          },
        });
        this._currentAudio.play();
        this._eventList.shift();
      });
    }
  }

  startTransmitting() {
    this._isTransmitting = true;
  }

  stopTransmitting() {
    this._isTransmitting = false;
    this._eventList = [];
    this._currentMessage = "Awaiting Transmission...";
    if (this._currentAudio && this._currentAudio.stop) {
      this._currentAudio.stop();
    }
    this._currentAudio = null;
  }

  renderIsTransmitting() {
    this._morse.audio("Wind Wings Up To Bat");
    return html`
      <div class="currentMessage">${this._currentMessage}</div>
      <vaadin-button
        @click="${() => this.stopTransmitting()}"
        aria-label="Stop Transmitting"
        >Stop Transmitting
      </vaadin-button>
    `;
  }

  renderNotTransmitting() {
    return html`
      <vaadin-button
        @click="${() => this.startTransmitting()}"
        aria-label="Start Transmitting"
        >Start Transmitting
      </vaadin-button>
    `;
  }

  render() {
    return html`
      <div class="app">
        <div class="content">
          ${this._isTransmitting
            ? this.renderIsTransmitting()
            : this.renderNotTransmitting()}
        </div>
      </div>
    `;
  }
}

customElements.define("main-app", MainApp);
