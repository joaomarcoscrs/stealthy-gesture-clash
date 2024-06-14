import time
import random

from db import db

GAME_ACTION_WINNERS_MAP = {
    "rock": "paper",
    "paper": "scissors",
    "scissors": "rock",
}


def bot_action():
    return random.choice(["rock", "paper", "scissors"])


def run_game(socket, room_key):
    # starts to play then after 10s ends the game
    socket.emit(
        "game-started",
        {"room_key": room_key},
    )

    time.sleep(10)

    socket.emit(
        "game-ended",
        {"room_key": room_key},
    )


def get_action_from_predictions(predictions):
    class_translation_map = {"Paper": "paper", "Rock": "rock", "Scissors": "scissors"}

    if predictions:
        return class_translation_map[predictions[0]["class"]]


def decide_result(player_action, bot_action):
    if player_action == bot_action:
        return "draw"

    if GAME_ACTION_WINNERS_MAP[player_action] == bot_action:
        return "lose"

    if GAME_ACTION_WINNERS_MAP[bot_action] == player_action:
        return "win"


def process_result(room_key, socket, player_action):
    oponent_action = bot_action()

    if player_action:
        result = decide_result(player_action, oponent_action)

        if result:
            socket.emit(
                "result",
                {
                    "room_key": room_key,
                    "result": result,
                    "player_action": player_action,
                    "bot_action": oponent_action,
                },
            )


def account_player_action(socket, room_key, player_name, predictions):
    action = get_action_from_predictions(predictions["predictions"])

    socket.emit(
        "player-action",
        {"room_key": room_key, "player_name": player_name, "action": action},
    )

    process_result(room_key, socket, action)
