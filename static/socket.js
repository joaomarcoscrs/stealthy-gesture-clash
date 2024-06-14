export function startSocket() {
  console.log("Opening SocketIO connection");
  var socket = io.connect("http://192.168.18.15:10000");
  var videoContainer = document.getElementById("video-container");
  var video = document.getElementById("video");

  socket.on("connect", function () {
    console.log("SocketIO connection opened");
  });

  socket.on("debug", function (data) {
    console.log("Received debug message from server");
  });

  socket.on("result", function (data) {
    console.log("Received result from server");
    console.log(data);
  });

  socket.on("update-frame", function (data) {
    if (videoContainer) videoContainer.style.display = "block";

    var blob = new Blob([data.frame], { type: "image/jpeg" });
    var url = URL.createObjectURL(blob);
    video.src = url;
    video.onload = function () {
      URL.revokeObjectURL(url);
    };
  });

  socket.on("disconnect", function () {
    console.log("SocketIO connection closed");
  });

  return socket;
};