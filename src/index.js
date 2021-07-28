import { LitElement, html, css } from "lit";
import { Howl, Howler } from "howler";
import "@vaadin/vaadin-button";
import "@vaadin/vaadin-text-field";
import "@vaadin/vaadin-notification";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/paper-slider/paper-slider.js";
import { library, icon } from "@fortawesome/fontawesome-svg-core";
import { faCog, faTimes } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
library.add(faCog);
library.add(faTimes);
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
        font-size: 1rem;
        line-height: 1.5;
        font-weight: 700;
      }
      .blaseballButton:hover {
        opacity: 0.8;
      }
      .blaseballCancelButton {
        background-color: #ad0900;
      }
      .blaseballConfirmButton {
        background-color: #28a745;
      }
      header {
        width: 100%;
        display: flex;
        justify-content: space-between;
      }
      .headerRight {
        padding-right: 10px;
        padding-top: 5px;
      }
      .dialog {
        border-color: #fff;
        background-color: #000;
        border: 1px solid;
        width: 500px;
        max-width: 95%;
        height: 750px;
        max-height: 80vh;
        color: #fff;
      }
      .modalContent {
        display: flex;
        flex-direction: column;
        padding: 12px;
        margin-top: 0;
      }
      .closeModalButton {
        color: #fff;
        width: 20px;
        align-self: flex-end;
        width: 40px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        border: 1px solid;
        border-radius: 50%;
        border-color: #000;
        padding: 5px;
      }
      .closeModalButton svg {
        width: 26px;
        height: 36px;
      }
      .closeModalButton:hover {
        border-color: #fff;
      }
      .closeModalButton:hover svg {
        width: 26px;
        height: 36px;
      }
      .volumeSlider {
        width: 100%;
        --paper-slider-knob-color: #fff;
        --paper-slider-active-color: #fff;
        --paper-slider-container-color: #1e1e1e;
      }
      .settingsTitle {
        font-size: 24px;
        text-align: center;
        margin-bottom: 20px;
        -webkit-font-smoothing: antialiased;
        font-weight: 400;
        line-height: 1.5;
        font-family: "Lora", "Courier New", monospace, serif;
      }
      .settingsSubheader {
        font-size: 18px;
        margin-bottom: 10px;
        color: #c4c4c4;
        text-align: center;
        width: 100%;
        font-family: "Lora", "Courier New", monospace, serif;
      }
      .settingSubheaderWithSpacer {
        margin-top: 20px;
      }
      .saveSettingsButton {
        margin-top: 20px;
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
      .textBox {
        --lumo-body-text-color: #fff;
        border: 1px solid #fff;
        border-radius: 4px;
        font-family: "Open Sans", "Helvetica Neue", sans-serif;
        font-weight: 400;
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
      // The current Event Stream we are reading from
      _eventStream: {
        type: String,
      },
    };
  }

  constructor() {
    super();
    // Initialize the morse object
    this._morse = require("morse-decoder");
    this.resetApp();
  }

  resetApp(eventStreamInput) {
    // Reset the app
    if (this._stream && this._stream.close) {
      this._stream.close();
    }
    this._stream = null;
    this._teamList = null;
    this._currentTeam = null;
    this._currentMessage = "Awaiting Feedback...";
    this._eventList = [];
    // If there's audio playing then stop it
    if (this._currentAudio && this._currentAudio.stop) {
      this._currentAudio.stop();
    }
    if (eventStreamInput) {
      // If we got an event stream then get straight to building the stream
      this.buildEventStream(eventStreamInput);
      // Else get the default stream from settings
    } else {
      this.getSettings();
    }
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
          this._eventStream = response.EventStream;
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
    // Commenting this notification out for now because it's finicky
    /* this._stream.addEventListener("error", (event) => {
      console.error(`An error occured on Event Steam ${eventStream}`);
      this.showNotification(`An error occured on Event Steam ${eventStream}`);
    }); */
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

  // Function to show a notification at the top of the screen
  showNotification(text) {
    const notification = this.shadowRoot.getElementById("notification");
    if (notification) {
      notification.renderer = (root) => {
        root.textContent = text;
      };
      notification.open();
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

  // Function to show the settings modal
  showSettings() {
    this.shadowRoot.getElementById("settingsDialog").open();
  }

  // Function to hide the settings modal
  closeSettings() {
    this.shadowRoot.getElementById("settingsDialog").close();
  }

  // Function to save the settings
  saveSettings() {
    // Get the volume from the slider
    const volume = this.shadowRoot.getElementById("volumeSlider").value;
    // Set it here so that it affects all sounds played after the save
    Howler.volume(volume);
    // Now see if the Event Stream changed and if we need to rebuild the app with a new one
    const settingsEventStream = this.shadowRoot.getElementById(
      "settingsEventStream"
    ).value;
    // If we have a new Event Stream we need to reset everything
    if (settingsEventStream && settingsEventStream !== this._eventStream) {
      this._eventStream = settingsEventStream;
      this.resetApp(this._eventStream);
    }
    this.closeSettings();
  }

  // Function to make sure the slider is synced to the real volume
  onSettingsModalChange(e) {
    // Get the volume from Howler and set it to the slider
    const volume = Howler.volume();
    this.shadowRoot.getElementById("volumeSlider").value = volume;
    // Set the Event Stream URL correctly
    this.shadowRoot.getElementById("settingsEventStream").value =
      this._eventStream;
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

  // Function to render the settings modal
  renderSettingsModal() {
    const timesButton = icon({ prefix: "fas", iconName: "times" }).node;
    return html`
      <paper-dialog
        class="dialog"
        id="settingsDialog"
        with-backdrop
        @opened-changed="${(e) => this.onSettingsModalChange(e)}"
      >
        <div class="modalContent">
          <div
            class="closeModalButton"
            @click="${() => this.closeSettings()}"
            aria-label="Close Settings"
          >
            ${timesButton}
          </div>
          <div class="settingsTitle">Settings</div>
          <div class="settingsSubheader">Volume</div>
          <paper-slider
            class="volumeSlider"
            id="volumeSlider"
            value="1"
            min="0"
            max="1"
            step="0.1"
          >
          </paper-slider>
          <div class="settingsSubheader settingSubheaderWithSpacer">
            Event Stream
          </div>
          <vaadin-text-field
            placeholder="Event Stream URL"
            class="textBox"
            id="settingsEventStream"
            value="${this._eventStream}"
          ></vaadin-text-field>
          <vaadin-button
            class="blaseballButton blaseballConfirmButton saveSettingsButton"
            @click="${() => this.saveSettings()}"
            aria-label="Save Changes"
            >Save Changes
          </vaadin-button>
        </div>
      </paper-dialog>
    `;
  }

  // Main function to render the application
  render() {
    const githubIcon = icon({ prefix: "fab", iconName: "github" }).node;
    const cogIcon = icon({ prefix: "fas", iconName: "cog" }).node;
    return html`
      <vaadin-notification
        class="notification"
        id="notification"
        duration="10000"
        position="top-center"
      ></vaadin-notification>
      <header>
        <div class="headerLeft"></div>
        <div class="headerRight">
          <span class="footerText" @click="${() => this.showSettings()}"
            >${cogIcon}</span
          >
        </div>
      </header>
      <div class="app">
        <div class="content">
          ${this._teamList && this._teamList.length
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
      ${this.renderSettingsModal()}
    `;
  }
}

customElements.define("main-app", MainApp);
