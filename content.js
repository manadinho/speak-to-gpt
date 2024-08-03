/**
 * Author: Muhammad Imran Israr
 * Email: mimranisrar6@gamil.com
 * Date: 03-08-2024
 * Description: Extension content script that listens to the user's speech and converts it to text.
 */

let SEND_BTN = document.querySelector('[data-testid="send-button"]');
const recognition = new webkitSpeechRecognition();
recognition.lang = "en-US";
recognition.continuous = true;
recognition.interimResults = true;
let RECORDING_BUTTON_ACTION = "start";
ez_recording_btn = recordingButton();

ez_recording_btn.onclick = function (event) {
  startStopRecording(event);
};

let transcript = "";

// Append the recording button to dom
// appendRecordingButton();

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.type === "page_changed") {
    await sleep(500);

    appendRecordingButton();
  }
});

/**
 * Appends a recording button to the parent div of the send button.
 */
function appendRecordingButton() {
  // need to change new element on every page change because when page changes
  // the button is removed from the dom
  SEND_BTN = document.querySelector('[data-testid="send-button"]');

  // Access the parent of the SEND_BTN (the div element)
  const parentDiv = SEND_BTN.parentElement;

  // Append the recording button to the parent div
  // infront of send button
  SEND_BTN.parentElement.appendChild(ez_recording_btn);
}

function startStopRecording(event) {
  event.preventDefault();

  // with same button we will achive start and stop functionality
  // if action is start then start the recognition
  // we will change action to stop
  if (RECORDING_BUTTON_ACTION == "start") {
    recognition.start();
    RECORDING_BUTTON_ACTION = "stop";
    ez_recording_btn.style.backgroundColor = "red";

    return;
  }

  recognition.stop();
  RECORDING_BUTTON_ACTION = "start";
  ez_recording_btn.style.backgroundColor = "#d7d7d7";

  // if we have transcript then append it to the textarea
  const ez_textarea = document.querySelector("#prompt-textarea");
  const ez_textarea_value = ez_textarea.value;
  ez_textarea.value = "";
  document.execCommand("insertText", false, ez_textarea_value);
}

recognition.onresult = (event) => {
  transcript = Array.from(event.results)
    .map((result) => result[0])
    .map((result) => result.transcript)
    .join("");

  appendTranscript(transcript);
  transcript = "";
};

function appendTranscript(transcript) {
  // create transcript array from transcript
  const transcriptArray = transcript.split(" ");

  // updatedTranscript will be the final transcript we will handle some our own commands
  // like "line break" will add \n in the transcript
  // todo:: in future we will add more commands
  let updatedTranscript = "";
  for (let i = 0; i < transcriptArray.length; i++) {
    if (transcriptArray[i] === "line" && transcriptArray[++i] === "break") {
      updatedTranscript += "\n";
    } else {
      updatedTranscript += transcriptArray[i] + " ";
    }
  }

  const ez_textarea = document.querySelector("#prompt-textarea");
  ez_textarea.focus();
  ez_textarea.value = updatedTranscript;

  // make enable send button
  SEND_BTN.disabled = false;
}

/**
 * Creates a recording button element.
 * @returns {HTMLButtonElement} The created button element.
 */
function recordingButton() {
  let btn = document.createElement("button");
  btn.id = "ez-recording-btn";
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" zoomAndPan="magnify" viewBox="0 0 30 30.000001" height="40" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="id1"><path d="M 6.65625 3.191406 L 23.351562 3.191406 L 23.351562 26.417969 L 6.65625 26.417969 Z M 6.65625 3.191406 " clip-rule="nonzero"/></clipPath></defs><g clip-path="url(#id1)"><path fill="rgb(6.269836%, 5.879211%, 5.099487%)" d="M 21.332031 14.203125 C 21.332031 17.824219 18.308594 20.359375 15.007812 20.359375 C 11.714844 20.359375 8.6875 17.824219 8.6875 14.203125 L 6.65625 14.203125 C 6.65625 18.324219 9.902344 21.730469 13.816406 22.320312 L 13.816406 26.277344 L 16.203125 26.277344 L 16.203125 22.320312 C 20.117188 21.730469 23.363281 18.324219 23.363281 14.203125 Z M 15.007812 17.824219 C 16.984375 17.824219 18.574219 16.199219 18.574219 14.203125 L 18.585938 6.957031 C 18.585938 4.949219 16.988281 3.332031 15.007812 3.332031 C 13.035156 3.332031 11.429688 4.949219 11.429688 6.957031 L 11.429688 14.203125 C 11.429688 16.199219 13.035156 17.824219 15.007812 17.824219 " fill-opacity="1" fill-rule="nonzero"/></g></svg>`;
  btn.className =
    "mb-1 me-1 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:opacity-70 focus-visible:outline-none focus-visible:outline-black disabled:bg-[#D7D7D7] disabled:text-[#f4f4f4] disabled:hover:opacity-100 dark:bg-white dark:text-black dark:focus-visible:outline-white disabled:dark:bg-token-text-quaternary dark:disabled:text-token-main-surface-secondary";

  return btn;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
