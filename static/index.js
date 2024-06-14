import { notSoRandomAdjective, notSoRandomNouns } from "./not-so-random.js";
import { startSocket } from "./socket.js";

document.addEventListener("DOMContentLoaded", function () {
  var result = [];

  const socket = startSocket(result);
  handleInputs(socket, result);
});


function createRoom(socket, roomKey, name) {
  window.location.href = `/room/${roomKey}?name=${name}`;

  socket?.emit("created-room", { name, roomKey });
  socket?.on("joined-room", (data) => {
    if (data.roomKey === roomKey) {
      alert(`${data.name} joined the room!`);
    }
  });
};

function getRoomKeyFromPath() {
  return window.location.pathname.split("/").pop();
}

function joinRoom(socket, name, roomKey) {
  window.location.href = `/room/${roomKey}?name=${name}`;
  console.log(socket, name, roomKey)
  socket?.emit("joined-room", { name, roomKey });
}

function handleInputs(socket, result) {
  const nameInput = document.getElementById("name");
  const roomKeyInput = document.getElementById("roomKey");
  const joinRoomButton = document.getElementById("joinRoomButton");
  const createRoomButton = document.getElementById("createRoomButton");
  const gameForm = document.getElementById("gameForm");
  const playButton = document.getElementById("playButton");

  // Enable the play button if both inputs are filled
  const checkInputs = () => {
    if (!joinRoomButton) return;
    joinRoomButton.disabled = !(nameInput.value.trim() && roomKeyInput.value.trim());
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
    roomKeyInput.placeholder = `${notSoRandomAdjective()}-${notSoRandomNouns()}`;
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
    // Perform any action for creating a room here
    createRoom(socket, roomKeyInput.value, nameInput.value);
  });

  // Button click handler for "play button"
  playButton?.addEventListener("click", function () {
    // removes focus from button
    playButton.blur();
    // resets result
    result.length = 0;

    var resultDiv = document.getElementById("result");
    if (resultDiv) {
      // Clear existing content
      resultDiv.innerHTML = "";
    }

    playButton.classList.add("playing");

    playButton.textContent = "🪨 📃 ✂️"

    // var counterDiv = document.getElementById("counter");
    // var secondsLeft = 10;

    // if (counterDiv) {
    //   counterDiv.textContent = secondsLeft.toString();
    // }

    // var countdown = setInterval(() => {
    //   secondsLeft--;
    //   if (counterDiv) {
    //     counterDiv.textContent = secondsLeft.toString();
    //   }

    //   if (secondsLeft <= 0) {
    //     clearInterval(countdown);
    //     if (counterDiv) {
    //       counterDiv.textContent = "";
    //     }
    //   }
    // }, 1000);

    // plays the game
    fetch("/play", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_key: getRoomKeyFromPath(),
      })
    }).then((response) => {
      if (response.ok) {
        // Remove 'playing' class and reset button text after the game starts
        playButton.classList.remove("playing");
        playButton.textContent = "play_";
      } else {
        // Handle error (optional)
        playButton.classList.remove("playing");
        playButton.textContent = "play_";
      }
    }).catch((error) => {
      // Handle error (optional)
      playButton.classList.remove("playing");
      playButton.textContent = "play_";
      console.error("Error:", error);
    });
  });
}