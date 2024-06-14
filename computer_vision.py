import argparse
import signal
import sys
import os
import threading
from functools import partial
from typing import Union, Optional

from inference.core.interfaces.stream.inference_pipeline import InferencePipeline
from inference.core.interfaces.stream.sinks import render_boxes

PIPELINE: Optional[InferencePipeline] = None

ROBOFLOW_API_KEY: str = os.getenv("ROBOFLOW_API_KEY")

FPS: int = 5


def infer(
    model_id: str,
    source: Union[str, int],
    on_prediction: Optional[callable] = partial(render_boxes, display_statistics=True),
):
    global PIPELINE
    PIPELINE = InferencePipeline.init(
        model_id=model_id,
        video_reference=source,
        on_prediction=on_prediction,
        api_key=ROBOFLOW_API_KEY,
        max_fps=FPS,
    )
    PIPELINE.start()


# Stuff to handle things if you execute via terminal


def signal_handler(sig, frame):
    print("Terminating")
    if PIPELINE is not None:
        PIPELINE.terminate()
        PIPELINE.join()
    sys.exit(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Simple InferencePipeline demo")
    parser.add_argument(
        "--model_id",
        help=f"ID of the model",
        required=False,
        type=str,
        default="rock-paper-scissors-sxsw/11",
    )
    parser.add_argument(
        "--source",
        help=f"Reference to video source - can be file, stream or id of device",
        required=False,
        default=0,
    )
    signal.signal(signal.SIGINT, signal_handler)
    print("Press Ctrl+C to terminate")
    args = parser.parse_args()
    infer(model_id=args.model_id, source=args.source)
