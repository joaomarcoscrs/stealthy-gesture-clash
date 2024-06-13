import threading
import cv2
import supervision

from inference.core.interfaces.camera.entities import VideoFrame
from flask import Flask, render_template, Response
from chord_inference import infer
from typing import Optional

app = Flask(__name__)

frame_to_render: Optional[bytes] = None

annotator = supervision.BoxAnnotator()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/inference_pipeline")
def inference_pipeline():
    infer(
        "rock-paper-scissors-sxsw/11",
        0,
        on_prediction=save_annotated_frame,
    )
    return "Inference started"


@app.route("/camera")
def camera():
    return Response(
        display_annotated_frame(), mimetype="multipart/x-mixed-replace; boundary=frame"
    )


def save_annotated_frame(predictions: dict, video_frame: VideoFrame):
    global frame_to_render

    labels = [p["class"] for p in predictions["predictions"]]
    detections = supervision.Detections.from_inference(predictions)
    image = annotator.annotate(
        scene=video_frame.image.copy(), detections=detections, labels=labels
    )

    frame_to_render = image

    # display the annotated image
    # cv2.imshow("Predictions", image)
    # cv2.waitKey(1)


def display_annotated_frame():
    global frame_to_render

    while True:
        if frame_to_render is not None:
            ret, buffer = cv2.imencode(".jpg", frame_to_render)
            frame = buffer.tobytes()
            yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


# def gen_frames():
#     while True:
#         success, frame = video_source.read()
#         if not success:
#             break
#         else:
#             ret, buffer = cv2.imencode(".jpg", frame)
#             frame = buffer.tobytes()
#             yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")


if __name__ == "__main__":
    app.run(debug=True)
