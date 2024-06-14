import time


def run_game(room_key):
    # starts a game, then after 10s, ends the game
    print(f"Starting game in room {room_key}")
    time.sleep(10)
    print(f"Ending game in room {room_key}")
    return room_key
