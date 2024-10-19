from flask import Flask, request
import chromadb
import json

# flask --app backend/main --debug run

app = Flask(__name__)

client = chromadb.Client()
collection = client.create_collection(
    "emails",
    metadata={"hnsw:space": "cosine"}
)


def synth_initialize():
    with open("./backend/data/synth_data.json") as fobj:
        data = json.load(fobj)
        for id, d in enumerate(data):
            collection.add(
                # TODO: merge subject w/ body
                documents=[d["body"].strip("\n")], # we embed for you, or bring your own
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
    print(query)
    results = collection.query(
        query_texts=[query],
        n_results=5,
    )
    print(results)
    return results


synth_initialize()
