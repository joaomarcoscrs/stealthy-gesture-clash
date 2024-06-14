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

    // Calculate total for percentages
    var total = count.win + count.draw + count.lose;
    var winPercent = (count.win / total) * 100;
    var drawPercent = (count.draw / total) * 100;
    var losePercent = (count.lose / total) * 100;

    // Check if chart already exists
    if (resultDiv.chart) {
      // If chart exists, update the data
      resultDiv.chart.data.datasets[0].data = [winPercent, drawPercent, losePercent];
      resultDiv.chart.update();
    } else {
      // If chart does not exist, create a new one
      var data = {
        labels: ["Results"],
        datasets: [
          {
            label: "Win",
            data: [winPercent],
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Green for win
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
          },
          {
            label: "Draw",
            data: [drawPercent],
            backgroundColor: "rgba(255, 255, 255, 0.2)", // White for draw
            borderColor: "rgba(255, 255, 255, 1)",
            borderWidth: 1
          },
          {
            label: "Lose",
            data: [losePercent],
            backgroundColor: "rgba(255, 99, 132, 0.2)", // Red for lose
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1
          }
        ]
      };

      var options = {
        indexAxis: 'y', // Makes the bar chart horizontal
        scales: {
          x: {
            beginAtZero: true,
            stacked: true,
            max: 100
          },
          y: {
            stacked: true
          }
        }
      };

      resultDiv.chart = new Chart(ctx, {
        type: "bar",
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