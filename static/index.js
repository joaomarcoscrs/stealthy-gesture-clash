import { notSoRandomAdjective, notSoRandomNouns } from "./not-so-random.js";
import { startSocket } from "./socket.js";

document.addEventListener("DOMContentLoaded", function () {
  const socket = startSocket();
  handleInputs(socket);
});


function createRoom(socket, roomKey) {
  const name = 'host-racoon'

  window.location.href = `/room/${roomKey}?name=${name}`;

  socket.emit("created-room", { name, roomKey });
  socket.on("joined-room", (data) => {
    if (data.roomKey === roomKey) {
      alert(`${data.name} joined the room!`);
    }
  });
};

function joinRoom(socket, name, roomKey) {
  window.location.href = `/room/${roomKey}?name=${name}`;
  socket.emit("joined-room", { name, roomKey });
}

function handleInputs(socket) {
  const nameInput = document.getElementById("name");
  const roomKeyInput = document.getElementById("roomKey");
  const playButton = document.getElementById("playButton");
  const createRoomButton = document.getElementById("createRoomButton");
  const gameForm = document.getElementById("gameForm");

  // Enable the play button if both inputs are filled
  const checkInputs = () => {
    playButton.disabled = !(nameInput.value.trim() && roomKeyInput.value.trim());
  };

  // Event listeners for input changes
  nameInput?.addEventListener("input", checkInputs);
  roomKeyInput?.addEventListener("input", checkInputs);

  const adjective = notSoRandomAdjective();

  // Creates good placeholders
  if (nameInput) {
    nameInput.placeholder = `${adjective} raccoon`;
  }

  if (roomKeyInput) {
    roomKeyInput.placeholder = `${adjective}-raccoon-and-friend`;
  }

  // Form submission handler
  gameForm?.addEventListener("submit", function (event) {
    event.preventDefault();

    // Perform any additional form handling here

    // For demonstration purposes, alert the form data
    joinRoom(socket, nameInput.value, roomKeyInput.value);
  });

  // Button click handler for "Create a Room"
  createRoomButton?.addEventListener("click", function () {
    console.log('create room')
    const roomKey = `${notSoRandomAdjective()}-${notSoRandomNouns()}`;
    // Perform any action for creating a room here
    createRoom(socket, roomKey);
  });
}