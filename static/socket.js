function renderResult(count) {
  var resultDiv = document.getElementById("result");
  if (resultDiv) {
    var canvas = resultDiv.querySelector("canvas");
    if (!canvas) {
      // If canvas does not exist, create one
      canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 200;
      resultDiv.appendChild(canvas);
    }

    var ctx = canvas.getContext("2d");

    // Check if chart already exists
    if (resultDiv.chart) {
      // If chart exists, update the data
      resultDiv.chart.data.datasets[0].data = [count.win, count.draw, count.lose];
      resultDiv.chart.update();
    } else {
      // If chart does not exist, create a new one
      var data = {
        labels: ["Win", "Draw", "Lose"],
        datasets: [{
          label: "Result Counts",
          data: [count.win, count.draw, count.lose],
          backgroundColor: [
            "rgba(75, 192, 192, 0.2)", // Green for win
            "rgba(255, 255, 255, 0.2)", // White for draw
            "rgba(255, 99, 132, 0.2)" // Red for lose
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 255, 255, 1)",
            "rgba(255, 99, 132, 1)"
          ],
          borderWidth: 1
        }]
      };

      var options = {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      };

      resultDiv.chart = new Chart(ctx, {
        type: "line",
        data: data,
        options: options
      });
    }
  }
}



function appendResult(result) {
  // Count the occurrences of each result type
  var count = {
    win: 0,
    lose: 0,
    draw: 0
  };

  result.forEach(function (item) {
    // Increment the count based on the result type
    count[item.result]++;
  });

  // renders result
  renderResult(count);
}


export function startSocket(result) {
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
    // appends the result to the result
    result.push(data);
    appendResult(result);
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