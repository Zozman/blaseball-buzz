import { LitElement, html, css } from "lit";
import { Howl } from "howler";
import "@vaadin/vaadin-button";
import { library, icon } from "@fortawesome/fontawesome-svg-core";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
library.add(faGithub);

class MainApp extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        background-color: black;
      }
      .app {
        flex: 1;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        align-items: center;
        justify-content: center;
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
      footer {
        width: 100%;
        font-family: "Lora", "Courier New", monospace, serif;
        color: white;
        padding-botton: 10px;
        display: flex;
        justify-content: space-between;
      }
      .monitorText {
        color: #5988ff;
        text-shadow: 0 0 20px #5988ff;
        font-weight: 700;
      }
      .tarotText {
        color: #a16dc3;
        text-shadow: 0 0 10px #a16dc3;
        font-weight: 700;
      }
      .footerText {
        color: rgb(110, 118, 125);
        cursor: pointer;
        transition: all 1s;
      }
      .footerText svg {
        width: 20px;
        height: 20px;
      }
      .footerText:hover {
        color: #a16dc3;
        text-shadow: 0 0 10px #a16dc3;
        font-weight: 700;
      }
      footer a {
        color: inherit;
      }
      .footerLeft {
        padding-left: 10px;
      }
      .footerRight {
        padding-right: 10px;
      }
      @media only screen and (max-width: 1100px) {
        footer {
          justify-content: center;
        }
        .currentMessage {
          font-size: 8vw;
        }
        .footerRight {
          margin-left: 10px;
        }
      }
    `;
  }

  static get properties() {
    return {
      // The object responsible for converting text to morse code and creating the sound
      _morse: {
        type: Object,
      },
      // The EventStream object we will subscribe to in order to receive updates and data
      _stream: {
        type: Object,
      },
      // Array of updates that have yet to be converted to morse code and played
      _eventList: {
        type: Array,
      },
      // The current message being displayed on screen
      _currentMessage: {
        type: String,
      },
      // The current audio object being played
      _currentAudio: {
        type: Object,
      },
      // List of all active ILB teams with Team ID, Emoji, and Primary Color
      _teamList: {
        type: Array,
      },
      // The ID of the team we are currently subscribed to
      _currentTeam: {
        type: Object,
      },
    };
  }

  constructor() {
    super();
    // Reset the app
    this._currentTeam = null;
    this._currentMessage = "Awaiting Feedback...";
    this._eventList = [];
    // Initialize the morse object
    this._morse = require("morse-decoder");
    // Get the settings so we can load the app
    this.getSettings();
  }

  // Function that runs on a property update
  update(changedProperties) {
    super.update(changedProperties);
    // If the _eventList has updated we want to check if we need to start playing audio
    // This is normally triggered by our first event post-subscribing
    if (changedProperties.has("_eventList")) {
      this.checkEvents();
    }
  }

  // Function to get the settings from our settings endpoint
  // This will allow us to get what EventStream endpoint we want to subscribe to
  getSettings() {
    fetch("/settings")
      .then((e) => e.json())
      .then((response) => {
        // If we got an EventStream then continue initializing the app
        if (response && response.EventStream) {
          this.buildEventStream(response.EventStream);
        } else {
          throw new Exception("Unable To Get Settings; Trying Again");
        }
      })
      .catch((e) => {
        // If we failed to get the EventStream we need to try again because otherwise we can't do anything
        console.error(e);
        this.getSettings();
      });
  }

  // Function to build and subscribe to the EventStream from where we will get our data
  buildEventStream(eventStream) {
    // Build the _stream object
    this._stream = new EventSource(eventStream);
    this._stream.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      // If we have not prepaired the _teamList then we need to do that first
      // Happens on our first message
      if (!this._teamList) {
        // To get the list of active ILB teams we will get the divisions, get each team from the divisions, and use this list to filter the list of teams
        // This is because the endpoint returns every team including ones Parker I incinerated
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
      // If we have subscribed to a team's updates then we want to catch their updates and add them to the _eventList
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
            // This is done weird so the update function triggers
            this._eventList = [...this._eventList, gameUpdate];
          }
        }
      }
    });
  }

  // Function to check and see if we need to transmit the next event
  checkEvents() {
    if (!this._currentAudio && this._currentTeam) {
      this.transmitNextItem();
    }
  }

  // Function to transmit the next event on the _eventList
  transmitNextItem() {
    if (this._eventList && this._eventList.length) {
      const message = this._eventList[0];
      // Encode the text into morse code text
      this._currentMessage = this._morse.encode(message);
      // Create the morse code audio
      const morseAudio = this._morse.audio(message);
      // While the morse code library can play audio, it has no hook to do something when its done
      // So we're going to instead make a Blob and have Howler play it since it does have an onend hook
      morseAudio.getWaveBlob().then((result) => {
        const blobUrl = window.URL.createObjectURL(result);
        this._currentAudio = new Howl({
          src: [blobUrl],
          format: ["wav"],
          onend: () => {
            // When the item finishes playing we need to clean up the audio object and see if we need to play another event
            this._currentAudio = null;
            this.checkEvents();
          },
        });
        // Start playing
        this._currentAudio.play();
        // Remove the now playing item from the queue
        this._eventList.shift();
      });
    }
  }

  // Function to run when clicking on a team to start transmitting for
  startTransmitting(team) {
    this._currentTeam = team;
  }

  // Function to stop playing transmissions
  stopTransmitting() {
    // Reset our current team and list of events
    this._currentTeam = null;
    this._eventList = [];
    this._currentMessage = "Awaiting Feedback...";
    // Stop playing audio
    if (this._currentAudio && this._currentAudio.stop) {
      this._currentAudio.stop();
    }
    this._currentAudio = null;
  }

  // Function to render the state where we are transmitting morse code
  renderIsTransmitting() {
    const currentTeam = this._teamList.find(
      (team) => team.id === this._currentTeam
    );
    // This startsWith is a hack because sometimes the EventStream returns a hexidecimal value and sometimes it returns an emoji character
    // The startsWith lets us know which, with any of the hex values starting with "0x"
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

  // Function to render when a team has not been chosen to receive events from
  renderNotTransmitting() {
    return html`
      <div class="teamSelector">
        ${this._teamList.map((team) => {
          // This startsWith is a hack because sometimes the EventStream returns a hexidecimal value and sometimes it returns an emoji character
          // The startsWith lets us know which, with any of the hex values starting with "0x"
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

  // Function to render the first waiting screen while we are initializing the app
  renderHasNotInitialized() {
    return html`<div class="awaitingMessage">Awaiting Feedback...</div>`;
  }

  // Function to render when we have initialized the app
  renderHasInitialized() {
    return this._currentTeam
      ? this.renderIsTransmitting()
      : this.renderNotTransmitting();
  }

  render() {
    const githubIcon = icon({ prefix: "fab", iconName: "github" }).node;
    return html`
      <div class="app">
        <div class="content">
          ${this._teamList
            ? this.renderHasInitialized()
            : this.renderHasNotInitialized()}
        </div>
      </div>
      <footer>
        <div class="footerText footerLeft">
          Cobbled Together By Zoz (aka
          <a target="_blank" href="https://twitter.com/zwlovoy">@zwlovoy</a>)
        </div>
        <div class="footerText footerRight">
          <a target="_blank" href="https://github.com/Zozman/blaseball-buzz"
            >${githubIcon}</a
          >
        </div>
      </footer>
    `;
  }
}

customElements.define("main-app", MainApp);
