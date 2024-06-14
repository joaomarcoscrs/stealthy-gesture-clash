import cv2
import supervision
import asyncio
import threading
import logging

from functools import partial
from inference.core.interfaces.camera.entities import VideoFrame
from flask import Flask, render_template, request
from computer_vision import infer
from flask_socketio import SocketIO
from flask_cors import CORS
from game import run_game, account_player_action
from db import db

app = Flask(__name__)
CORS(app)
socket = SocketIO(app, cors_allowed_origins="*")

label_annotator = supervision.LabelAnnotator()
box_annotator = supervision.BoundingBoxAnnotator()

logger = logging.getLogger(__name__)

db().save("is_playing", False)


@app.route("/play", methods=["POST"])
def play():
    room_key = request.form.get("room_key")

    db().save("is_playing", True)
    run_game(socket, room_key)
    db().save("is_playing", False)

    return {"message": "Game started"}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/room/<room_key>")
def room(room_key):
    # gets player name from query string
    player_name = request.args.get("name")

    if not player_name:
        return "Player name is required", 400

    # Start the inference in a background thread
    inference_thread = threading.Thread(
        target=partial(start_inference, room_key, player_name)
    )
    inference_thread.daemon = True
    inference_thread.start()

    return render_template("room.html", room_key=room_key, player_name=player_name)


async def async_inference(room_key, player_name):
    await asyncio.to_thread(
        infer,
        "rock-paper-scissors-sxsw/11",
        0,
        on_prediction=partial(
            process_predictions, room_key=room_key, player_name=player_name
        ),
    )


def start_inference(room_key, player_name):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(async_inference(room_key, player_name))


def publish_buffered_frame_to_socket(room_key, player_name, frame):
    _, buffer = cv2.imencode(".jpg", frame)
    frame = buffer.tobytes()

    socket.emit("debug", "emitting frame")
    socket.emit("frame", frame)


def annotated_frame(predictions: dict, video_frame: VideoFrame):
    labels = [p["class"] for p in predictions["predictions"]]
    detections = supervision.Detections.from_inference(predictions)

    annotated = box_annotator.annotate(
        scene=video_frame.image.copy(), detections=detections
    )

    annotated = label_annotator.annotate(
        scene=annotated, labels=labels, detections=detections
    )

    return annotated


def process_predictions(
    predictions: dict,
    video_frame: VideoFrame,
    room_key: str = None,
    player_name: str = None,
):
    if db().get("is_playing"):
        frame_to_render = annotated_frame(predictions, video_frame)
        account_player_action(socket, room_key, player_name, predictions)
    else:
        frame_to_render = video_frame.image

    publish_buffered_frame_to_socket(room_key, player_name, frame_to_render)


if __name__ == "__main__":
    socket.run(app, debug=True, host="0.0.0.0", port=8080)
