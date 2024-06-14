import json


def db():
    return MyDatabase("db.json")


class MyDatabase:
    def __init__(self, json_file):
        self.json_file = json_file
        try:
            with open(json_file, "r") as file:
                self.data = json.load(file)
        except FileNotFoundError:
            self.data = {}

    def save(self, key, value):
        self.data[key] = value
        with open(self.json_file, "w") as file:
            json.dump(self.data, file)

    def get(self, key):
        return self.data.get(key)


# Usage example:
if __name__ == "__main__":
    db().save("is_playing", False)
    print(db().get("is_playing"))  # Output: False
