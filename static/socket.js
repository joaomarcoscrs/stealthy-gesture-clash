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
    var winPercent = total > 0 ? (count.win / total) * 100 : 0;
    var drawPercent = total > 0 ? (count.draw / total) * 100 : 0;
    var losePercent = total > 0 ? (count.lose / total) * 100 : 0;

    // Check if chart already exists
    if (resultDiv.chart) {
      // If chart exists, update the data
      resultDiv.chart.data.datasets[0].data = [winPercent];
      resultDiv.chart.data.datasets[1].data = [drawPercent];
      resultDiv.chart.data.datasets[2].data = [losePercent];
      resultDiv.chart.update();
    } else {
      // If chart does not exist, create a new one
      var data = {
        labels: ["your results"],
        datasets: [
          {
            label: "won",
            data: [winPercent],
            backgroundColor: "rgba(75, 192, 192, 1)",
            borderWidth: 0,
            barThickness: 30
          },
          {
            label: "draw",
            data: [drawPercent],
            backgroundColor: "rgba(255, 255, 255, 1)",
            borderWidth: 0,
            barThickness: 30
          },
          {
            label: "lost",
            data: [losePercent],
            backgroundColor: "rgba(255, 99, 132, 1)",
            borderWidth: 0,
            barThickness: 30
          }
        ]
      };

      var options = {
        indexAxis: 'y', // Makes the bar chart horizontal
        scales: {
          x: {
            beginAtZero: true,
            stacked: true,
            max: 100,
            ticks: {
              color: 'white' // Color of x-axis labels
            }
          },
          y: {
            stacked: true,
            ticks: {
              color: 'white' // Color of y-axis labels
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: 'white' // Color of legend labels
            }
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
  var socket = io.connect("http://192.168.18.15:8080");
  var videoContainer = document.getElementById("video-container");
  var video = document.getElementById("video");

  socket.on("connect", function () {
    console.log("SocketIO connection opened");
  });

  socket.on("debug", function (data) {
    console.log("Received debug message from server");
    console.log(data)
  });

  socket.on("result", function (data) {
    // appends the result to the result
    result.push(data);
    appendResult(result);
  });

  socket.on("frame", function (frame) {
    console.log('frame received. frame length', frame.length);
    if (videoContainer) videoContainer.style.display = "block";

    var blob = new Blob([frame], { type: "image/jpeg" });
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