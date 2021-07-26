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
      .awaitingMessage {
        color: white;
        font-family: "Lora", "Courier New", monospace, serif;
        justify-content: center;
        font-size: 5vw;
      }
      .currentMessage {
        color: white;
        font-family: "Lora", "Courier New", monospace, serif;
        justify-content: center;
        font-size: 3vw;
        text-align: center;
      }
      .currentEmoji {
        margin-left: auto;
        margin-right: auto;
      }
      .teamSelector {
        flex: 1;
        display: flex;
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
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
      }
      .transmittingMessage {
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .blaseballButton {
        font-size: 1rem;
        border: 1px solid #fff;
        font-family: "Open Sans", "Helvetica Neue", sans-serif;
        color: #fff;
        padding: 0.375rem 0.75rem;
        border-radius: 20px;
        width: 150px;
        margin-left: auto;
        margin-right: auto;
      }
      .blaseballButton:hover {
        opacity: 0.8;
      }
      .blaseballCancelButton {
        background-color: #ad0900;
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
    this._currentMessage = "Awaiting Feedback...";
    this._eventList = [];
    this._morse = require("morse-decoder");
    this.getSettings();
  }

  update(changedProperties) {
    super.update(changedProperties);
    if (changedProperties.has("_eventList")) {
      this.checkEvents();
    }
  }

  getSettings() {
    fetch("/settings")
      .then((e) => e.json())
      .then((response) => {
        if (response && response.EventStream) {
          this.buildEventStream(response.EventStream);
        } else {
          throw new Exception("Unable To Get Settings; Trying Again");
        }
      })
      .catch((e) => {
        console.error(e);
        this.getSettings();
      });
  }

  buildEventStream(eventStream) {
    this._stream = new EventSource(eventStream);
    this._stream.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      if (!this._teamList) {
        const divisions = data?.value?.leagues?.divisions || [];
        let activeTeams = [];
        divisions.forEach((division) => {
          activeTeams = activeTeams.concat(division.teams);
        });
        const teams = data?.value?.leagues?.teams || [];
        this._teamList = teams.filter(
          (team) => activeTeams.indexOf(team.id) !== -1
        );
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
    this._currentMessage = "Awaiting Feedback...";
    if (this._currentAudio && this._currentAudio.stop) {
      this._currentAudio.stop();
    }
    this._currentAudio = null;
  }

  renderIsTransmitting() {
    const currentTeam = this._teamList.find(
      (team) => team.id === this._currentTeam
    );
    const currentEmoji = currentTeam.emoji.startsWith("0x")
      ? String.fromCodePoint(currentTeam.emoji)
      : currentTeam.emoji;
    return html`
      <div class="currentEmoji">
        <div
          class="emojiHolder"
          style="background-color: ${currentTeam.mainColor};"
        >
          ${currentEmoji}
        </div>
      </div>
      <div class="currentMessage transmittingMessage">
        ${this._currentMessage}
      </div>
      <vaadin-button
        class="blaseballButton blaseballCancelButton"
        @click="${() => this.stopTransmitting()}"
        aria-label="Stop Receiving"
        >Stop Receiving
      </vaadin-button>
    `;
  }

  renderNotTransmitting() {
    return html`
      <div class="teamSelector">
        ${this._teamList.map((team) => {
          const emoji = team.emoji.startsWith("0x")
            ? String.fromCodePoint(team.emoji)
            : team.emoji;
          return html`
            <vaadin-button
              @click="${() => this.startTransmitting(team.id)}"
              aria-label="Transmit Team ${team.id}"
              class="teamSelectorButton"
              ><div
                class="emojiHolder"
                style="background-color: ${team.mainColor};"
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
    return html`<div class="awaitingMessage">Awaiting Feedback...</div>`;
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
