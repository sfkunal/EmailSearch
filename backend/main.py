from flask import Flask, request
from flask_cors import CORS, cross_origin
import chromadb
from chromadb.utils import embedding_functions
from groq import Groq

import json
import re
import configparser

CONFIG = configparser.ConfigParser()
CONFIG.read("TOKENS.ini")

GROQ_API_KEY = CONFIG["SECRETS"]["GROQ_API_KEY"]

# flask --app backend/main --debug run

app = Flask(__name__)
CORS(app, origins="*")


embedder = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")

client = chromadb.Client()
collection = client.create_collection(
    "emails",
    metadata={"hnsw:space": "cosine"},
    embedding_function=embedder,
)


client = Groq(
    api_key=GROQ_API_KEY,
)


def synth_initialize():
    with open("./backend/data/synth_data.json") as fobj:
        data = json.load(fobj)
        for id, d in enumerate(data):
            merged_data = d["subject"]+" "+re.sub(r"[\n]", " ", d["body"])
            collection.add(
                documents=[merged_data], # we embed for you, or bring your own
                metadatas=[{
                    "from": d["from"],
                    "to": d["to"],
                    "subject": d["subject"],
                    "body": d["body"],
                }], # filter on arbitrary metadata!
                ids=[str(id)], # must be unique for each doc
            )


@app.get('/result')
def return_result():
    query = request.args.get("query")

    results = collection.query(
        query_texts=[query],
        n_results=5,
    )
    
    return results

@app.post('/message')
def ai_message():
    body_json = request.get_json()

    ids = body_json.get("ids")
    prompt = body_json.get("prompt")

    results = collection.get(
        ids=ids.split(","),
        # where={"style": "style1"}
    )

    textual_data = ""
    for ind, metadata in enumerate(results["metadatas"]):
        textual_data += f"[#{ind}] An email sent from {metadata['from']} to {metadata['to']} with subject line {metadata['subject']} with content of <<<{metadata['body']}>>>\n"

    print(textual_data)

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"Helpful assistant that assists users to find their content from emails for the given data, where individual emails are separated by [#]. {textual_data}"
            },
            {
                "role": "user",
                "content": prompt,
            }
        ],
        model="llama3-8b-8192",
    )

    response = chat_completion.choices[0].message.content

    return {"response": response}


synth_initialize()
