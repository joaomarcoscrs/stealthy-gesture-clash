export function startSocket() {
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