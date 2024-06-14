import cv2
import supervision
import asyncio
import threading
import logging
import time

from inference.core.interfaces.camera.entities import VideoFrame
from flask import Flask, render_template
from computer_vision import infer
from flask_socketio import SocketIO
from game import run_game

app = Flask(__name__)
socket = SocketIO(app)

label_annotator = supervision.LabelAnnotator()
box_annotator = supervision.BoundingBoxAnnotator()

active_games = set()


@app.route("/play", methods=["POST"])
def play():
    # Start the inference in a background thread
    # inference_thread = threading.Thread(target=start_inference)
    # inference_thread.daemon = True
    # inference_thread.start()
    room_key = request.form.get("room_key")

    socket.emit("game-started", room_key, broadcast=True)

    run_game(room_key)

    socket.emit("game-ended", room_key, broadcast=True)

    active_games.remove(room_key)

    return "Ok"


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/room/<room_key>")
def room(room_key):
    # Start the inference in a background thread
    # inference_thread = threading.Thread(target=start_inference)
    # inference_thread.daemon = True
    # inference_thread.start()
    return render_template("room.html", room_key=room_key)


async def async_inference(room_key):
    if not room_key in active_games:
        publish_frame_to_socket(room_key)
    else:
        await asyncio.to_thread(
            infer,
            "rock-paper-scissors-sxsw/14",
            0,
            on_prediction=publish_annotated_frame,
        )


def start_inference(room_key):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(async_inference(room_key))


def publish_buffered_frame_to_socket(frame):
    _, buffer = cv2.imencode(".jpg", frame)
    frame = buffer.tobytes()

    socket.emit("update-frame", frame)


def annotated_frame(predictions: dict, video_frame: VideoFrame):
    socket.emit("debug", predictions)
    labels = [p["class"] for p in predictions["predictions"]]
    detections = supervision.Detections.from_inference(predictions)

    annotated = box_annotator.annotate(
        scene=video_frame.image.copy(), detections=detections
    )

    annotated = label_annotator.annotate(
        scene=annotated, labels=labels, detections=detections
    )

    return annotated


def publish_frame_to_socket(room_key):
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()

        if not ret:
            break

        if not room_key in active_games:
            publish_buffered_frame_to_socket(frame)

        time.sleep(1 / 6)


def publish_annotated_frame(predictions: dict, video_frame: VideoFrame):
    frame_to_render = annotated_frame(predictions, video_frame)

    publish_buffered_frame_to_socket(frame_to_render)


if __name__ == "__main__":
    socket.run(app, debug=True, host="0.0.0.0", port=10000)
