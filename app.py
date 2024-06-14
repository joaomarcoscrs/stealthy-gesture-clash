import cv2
import supervision
import asyncio
import threading
import logging
import time

from inference.core.interfaces.camera.entities import VideoFrame
from flask import Flask, render_template, Response
from flask_sock import Sock
from chord_inference import infer
from typing import Optional
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socket = SocketIO(app)

annotator = supervision.BoxAnnotator()


@app.route("/")
def index():
    logging.info("Index route called, starting inference")
    # Start the inference in a background thread
    inference_thread = threading.Thread(target=start_inference)
    inference_thread.daemon = True
    inference_thread.start()
    return render_template("index.html")


async def async_inference():
    await asyncio.to_thread(
        infer, "rock-paper-scissors-sxsw/11", 0, on_prediction=publish_annotated_frame
    )


def start_inference():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(async_inference())


def publish_buffered_frame_to_socket(frame):
    _, buffer = cv2.imencode(".jpg", frame)
    frame = buffer.tobytes()

    logging.error("SOCKET: Sending frame to socket")
    logging.error(f"SOCKET: Frame size: {len(frame)}")

    socket.emit("update-frame", frame)


def annotated_frame(predictions: dict, video_frame: VideoFrame):
    labels = [p["class"] for p in predictions["predictions"]]
    detections = supervision.Detections.from_inference(predictions)
    return annotator.annotate(
        scene=video_frame.image.copy(), detections=detections, labels=labels
    )


def publish_annotated_frame(predictions: dict, video_frame: VideoFrame):
    frame_to_render = annotated_frame(predictions, video_frame)

    publish_buffered_frame_to_socket(frame_to_render)


if __name__ == "__main__":
    socket.run(app, debug=True)
