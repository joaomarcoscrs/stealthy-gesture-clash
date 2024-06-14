document.addEventListener("DOMContentLoaded", function () {
  startSocket();
  handleInputs();
  handlePlaceholders();
});

function notSoRandomNouns() {
  const nouns = [
    "people",
    "friends",
    "buddies",
    "pals",
    "fellows",
    "chums",
    "mates",
    "companions",
    "associates",
    "partners",
    "allies",
    "confidants",
    "acquaintances",
    "colleagues",
    "neighbors",
    "roommates",
    "classmates",
    "teammates",
    "cohorts",
    "collaborators",
    "conspirators",
    "co-workers",
    "co-pilots",
    "sheriffs",
    "shenanigators",
  ];

  return nouns[Math.floor(Math.random() * nouns.length)];
}

function notSoRandomAdjective() {
  const adjectives = [
    "amazing",
    "awesome",
    "beautiful",
    "brilliant",
    "cool",
    "crazy",
    "delightful",
    "epic",
    "excellent",
    "extraordinary",
    "fabulous",
    "fantastic",
    "fun",
    "great",
    "incredible",
    "insane",
    "interesting",
    "lovely",
    "magnificent",
    "marvelous",
    "outstanding",
    "perfect",
    "phenomenal",
    "rad",
    "remarkable",
    "spectacular",
    "splendid",
    "stellar",
    "stunning",
    "super",
    "terrific",
    "unbelievable",
    "wonderful",
    "wondrous",
  ];

  return adjectives[Math.floor(Math.random() * adjectives.length)];
}

function createRoom(roomKey) {
  const name = 'host-racoon'
  // pushes to the room page
  window.location.href = `/room/${roomKey}?name=${name}`;
};

function joinRoom(name, roomKey) {
  window.location.href = `/room/${roomKey}?name=${name}`;
  alert("Join a room functionality will be implemented here.");
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


function startSocket() {
  console.log("Opening SocketIO connection");
  var socket = io.connect("http://127.0.0.1:5000");
  var video = document.getElementById("video");

  socket.on("connect", function () {
    console.log("SocketIO connection opened");
  });

  socket.on("debug", function (data) {
    console.log("Received debug message from server");
  });

  socket.on("update-frame", function (data) {
    console.log("Received frame from SocketIO");
    var blob = new Blob([data], { type: "image/jpeg" });
    var url = URL.createObjectURL(blob);
    video.src = url;
    video.onload = function () {
      URL.revokeObjectURL(url);
    };
  });

  socket.on("disconnect", function () {
    console.log("SocketIO connection closed");
  });
};