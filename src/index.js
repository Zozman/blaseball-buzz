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
        margin-left: 15px;
        margin-right: 15px;
      }
      .currentMessage {
        color: white;
        font-family: "Lora", "Courier New", monospace, serif;
      }
      .currentEmoji {
        margin-left: auto;
        margin-right: auto;
      }
      .teamSelector {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
      }
      .teamSelectorButton {
        margin-bottom: 30px;
      }
      .emojiHolder {
        padding: 5px;
        border-radius: 50%;
        font-size: 30px;
      }
      .transmittingMessage {
        margin-top: 20px;
        margin-bottom: 10px;
      }
    `;
  }

  static get properties() {
    return {
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
      _teamList: {
        type: Array,
      },
      _currentTeam: {
        type: Object,
      },
    };
  }

  constructor() {
    super();
    this._currentTeam = null;
    this._currentMessage = "Awaiting Transmission...";
    this._eventList = [];
    this._morse = require("morse-decoder");
    // const streamUrl = 'https://before.sibr.dev/events/streamData';
    const startTime = "2021-07-01T01:00:08.17Z";
    const streamUrl = "https://api.sibr.dev/replay/v1/replay?from=" + startTime;
    this._stream = new EventSource(streamUrl);
    this._stream.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (!this._teamList) {
        const schedule = data?.value?.games?.schedule;
        this._teamList =
          schedule && schedule.length
            ? schedule.map((item) => {
                // We do it by away team since home team data has a weird mix of hex and non-hex values for whatever reason
                return {
                  id: item.awayTeam,
                  emoji: item.awayTeamEmoji,
                  color: item.awayTeamColor,
                };
              })
            : null;
      }
      if (this._currentTeam) {
        const games = data?.value?.games?.schedule;
        if (games) {
          const chosenGame = games.find(
            (game) =>
              game.homeTeam === this._currentTeam ||
              game.awayTeam === this._currentTeam
          );
          const gameUpdate = chosenGame ? chosenGame.lastUpdate : null;
          if (gameUpdate) {
            this._eventList = [...this._eventList, gameUpdate];
          }
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
    if (!this._currentAudio && this._currentTeam) {
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

  startTransmitting(team) {
    this._currentTeam = team;
  }

  stopTransmitting() {
    this._currentTeam = null;
    this._eventList = [];
    this._currentMessage = "Awaiting Transmission...";
    if (this._currentAudio && this._currentAudio.stop) {
      this._currentAudio.stop();
    }
    this._currentAudio = null;
  }

  renderIsTransmitting() {
    const currentTeam = this._teamList.find(
      (team) => team.id === this._currentTeam
    );
    const currentEmoji = String.fromCodePoint(currentTeam.emoji);
    return html`
      <div class="currentEmoji">
        <div
          class="emojiHolder"
          style="background-color: ${currentTeam.color};"
        >
          ${currentEmoji}
        </div>
      </div>
      <div class="currentMessage transmittingMessage">
        ${this._currentMessage}
      </div>
      <vaadin-button
        @click="${() => this.stopTransmitting()}"
        aria-label="Stop Transmitting"
        >Stop Transmitting
      </vaadin-button>
    `;
  }

  renderNotTransmitting() {
    return html`
      <div class="teamSelector">
        ${this._teamList.map((team) => {
          const emoji = String.fromCodePoint(team.emoji);
          return html`
            <vaadin-button
              @click="${() => this.startTransmitting(team.id)}"
              aria-label="Transmit Team ${team.id}"
              class="teamSelectorButton"
              ><div
                class="emojiHolder"
                style="background-color: ${team.color};"
              >
                ${emoji}
              </div>
            </vaadin-button>
          `;
        })}
      </div>
    `;
  }

  renderHasNotInitialized() {
    return html`<div class="currentMessage">Awaiting Data...</div>`;
  }

  renderHasInitialized() {
    return this._currentTeam
      ? this.renderIsTransmitting()
      : this.renderNotTransmitting();
  }

  render() {
    return html`
      <div class="app">
        <div class="content">
          ${this._teamList
            ? this.renderHasInitialized()
            : this.renderHasNotInitialized()}
        </div>
      </div>
    `;
  }
}

customElements.define("main-app", MainApp);
