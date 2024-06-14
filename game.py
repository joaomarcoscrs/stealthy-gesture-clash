import time


def is_playing(games, room_key):
    return games[room_key].get("playing", False)


def run_game(games, room_key):
    # starts a game, then after 10s, ends the game
    games[room_key]["playing"] = True
    time.sleep(10)
    games[room_key]["playing"] = False

    return room_key


def add_player_to_game(games, room_key, player_name):
    if not room_key in games:
        games[room_key] = {"players": [player_name]}
        return

    players = games[room_key].get("players", [])

    if player_name in players:
        return

    if len(players) == 1:
        games[room_key]["players"] = players + [player_name]

    # TODO: Publish a message to the room that the game is full, kick someone out of it
    # and handle it in the frontend
    raise Exception("Game is full")


def get_action_from_predictions(predictions):
    return "rock"


def account_player_action(games, socket, room_key, player_name, predictions):
    if not room_key in games:
        raise Exception("Game does not exist")

    if not player_name in games[room_key].get("players", []):
        raise Exception("Player is not in the game")

    if not is_playing(games, room_key):
        return

    games[room_key]["actions"] = games[room_key].get("actions", {})

    player_actions = games[room_key]["actions"].get(player_name, [])

    action = get_action_from_predictions(predictions)

    games[room_key]["actions"][player_name] = player_actions + [action]

    socket.emit(
        "player-action",
        {"room_key": room_key, "player_name": player_name, "action": action},
        broadcast=True,
    )
