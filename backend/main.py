from flask import Flask, Request
import json

# flask --app main --debug run

app = Flask(__name__)

with open("./data/synth_data.json") as fobj:
    GENERATED_SYNTHETIC_DATA = json.load(fobj)


@app.get('/result')
def return_result():
    print(GENERATED_SYNTHETIC_DATA)
    return GENERATED_SYNTHETIC_DATA

