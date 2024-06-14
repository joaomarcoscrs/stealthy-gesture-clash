document.addEventListener("DOMContentLoaded", function () {
  startSocket();
  handleInputs();
});

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

  // Form submission handler
  gameForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Perform any additional form handling here

    // For demonstration purposes, alert the form data
    alert(`Name: ${nameInput.value}\nRoom Key: ${roomKeyInput.value}`);
  });

  // Button click handler for "Create a Room"
  document.getElementById("createRoomButton").addEventListener("click", function () {
    // Perform any action for creating a room here
    alert("Create a room functionality will be implemented here.");
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