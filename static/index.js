import { notSoRandomAdjective, notSoRandomNouns } from "./not-so-random.js";
import { startSocket } from "./socket.js";

document.addEventListener("DOMContentLoaded", function () {
  startSocket();
  handleInputs();
});


function createRoom(roomKey) {
  const name = 'host-racoon'

  window.location.href = `/room/${roomKey}?name=${name}`;
};

function joinRoom(name, roomKey) {
  window.location.href = `/room/${roomKey}?name=${name}`;
}

function handleInputs() {
  const nameInput = document.getElementById("name");
  const roomKeyInput = document.getElementById("roomKey");
  const playButton = document.getElementById("playButton");
  const gameForm = document.getElementById("gameForm");

  // Enable the play button if both inputs are filled
  const checkInputs = () => {
    playButton.disabled = !(nameInput.value.trim() && roomKeyInput.value.trim());
  };

  // Event listeners for input changes
  nameInput.addEventListener("input", checkInputs);
  roomKeyInput.addEventListener("input", checkInputs);

  const adjective = notSoRandomAdjective();

  // Creates good placeholders
  nameInput.placeholder = `${adjective} raccoon`;
  roomKeyInput.placeholder = `${adjective}-raccoon-and-friend`;

  // Form submission handler
  gameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Perform any additional form handling here

    // For demonstration purposes, alert the form data
    joinRoom(nameInput.value, roomKeyInput.value);
  });

  // Button click handler for "Create a Room"
  document.getElementById("createRoomButton").addEventListener("click", function () {
    const roomKey = `${notSoRandomAdjective()}-${notSoRandomNouns()}`;
    // Perform any action for creating a room here
    createRoom(roomKey);
  });
}