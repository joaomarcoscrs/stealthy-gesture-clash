import time
import random

GAME_ACTION_WINNERS_MAP = {
    "rock": "paper",
    "paper": "scissors",
    "scissors": "rock",
}


def bot_action():
    return random.choice(["rock", "paper", "scissors"])


def is_playing(games, room_key):
    return games[room_key].get("playing", False)


def run_game(games, socket, room_key):
    if not room_key in games:
        raise Exception("Game does not exist")

    if is_playing(games, room_key):
        return

    # starts to play then after 10s ends the game
    games[room_key]["playing"] = True
    socket.emit(
        "game-started",
        {"room_key": room_key},
        broadcast=True,
    )

    time.sleep(10)

    games[room_key]["playing"] = False
    socket.emit(
        "game-ended",
        {"room_key": room_key},
        broadcast=True,
    )


def get_action_from_predictions(predictions):
    return "rock"


def decide_result(player_action, bot_action):
    if player_action == bot_action:
        return "draw"

    if GAME_ACTION_WINNERS_MAP[player_action] == bot_action:
        return "lose"

    if GAME_ACTION_WINNERS_MAP[bot_action] == player_action:
        return "win"


def process_result(games, room_key, socket, player_action):
    if not room_key in games:
        raise Exception("Game does not exist")

    if not is_playing(games, room_key):
        return

    oponent_action = bot_action()
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
            broadcast=True,
        )


def account_player_action(games, socket, room_key, player_name, predictions):
    if not room_key in games:
        raise Exception("Game does not exist")

    if not is_playing(games, room_key):
        return

    action = get_action_from_predictions(predictions)

    socket.emit(
        "player-action",
        {"room_key": room_key, "player_name": player_name, "action": action},
        broadcast=True,
    )

    process_result(games, room_key, socket, action)
