from flask import Flask, redirect, request, url_for
from flask_cors import CORS, cross_origin
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction, OpenCLIPEmbeddingFunction
from chromadb.utils.data_loaders import ImageLoader
from groq import Groq
import os
from google_auth_oauthlib.flow import InstalledAppFlow

import logging
import json
import re
import configparser

from gmail import GmailAPI, download_images


logging.basicConfig(level=logging.INFO)

CONFIG = configparser.ConfigParser()
CONFIG.read("TOKENS.ini")

GROQ_API_KEY = CONFIG["SECRETS"]["GROQ_API_KEY"]

# flask --app backend/main --debug run

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})


groq_client = Groq(
    api_key=GROQ_API_KEY,
)

gmail = GmailAPI()

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = '1'


embedder = SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
multimodal_embedder = OpenCLIPEmbeddingFunction()
data_loader = ImageLoader()

chromadb_client = chromadb.Client()
email_collection = chromadb_client.create_collection(
    "email_collection",
    metadata={"hnsw:space": "l2"},
    embedding_function=embedder,
)


# collection = chromadb_client.create_collection(
#     "emails",
#     metadata={"hnsw:space": "cosine"},
#     embedding_function=embedder,
# )
# multimodal_collection = chromadb_client.create_collection(
#     "emails_and_attachments",
#     metadata={"hnsw:space": "cosine"},
#     embedding_function=multimodal_embedder,
#     data_loader=data_loader
# )

# multimodal_collection.add(
#     ids=["cat", "dog"],
#     uris=download_images(
#         ["https://www.cdc.gov/healthy-pets/media/images/2024/04/Cat-on-couch.jpg",
#          "https://hips.hearstapps.com/hmg-prod/images/dog-puppy-on-garden-royalty-free-image-1586966191.jpg"]
#         )
# )

# img_result = multimodal_collection.query(
#     query_uris=download_images(["https://d6vhjw8wa28ve.cloudfront.net/wp-content/uploads/2021/03/kitten-sitting-on-floor-031621.jpg"]) # A list of strings representing URIs to data
# )

# print(img_result)
# txt_result = multimodal_collection.query(
#     query_texts=["Kitten"]
# )
# print(txt_result)
# txt_result = multimodal_collection.query(
#     query_texts=["Puppy"]
# )
# print(txt_result)


def synth_initialize():
    with open("./backend/data/synth_data.json") as fobj:
        data = json.load(fobj)
        for id, d in enumerate(data):
            merged_data = d["subject"]+" "+re.sub(r"[\n]", " ", d["body"])
            email_collection.upsert(
                documents=[merged_data],  # we embed for you, or bring your own
                metadatas=[{
                    "from": d["from"],
                    "to": d["to"],
                    "subject": d["subject"],
                    "body": d["body"],
                }],  # filter on arbitrary metadata!
                ids=[str(id)],  # must be unique for each doc
            )


def initialize_live_data():
    try:
        print("STARTS")
        emails, image_urls = gmail.get_emails(count=50)
        print(len(emails), len(image_urls))
        print("ENDS")

        default = lambda x: "" if x is None else x

        for id, (email, image_urls) in enumerate(zip(emails, image_urls)):
            try:
                merged_data = email.subject + " " + re.sub(r"[\n]", " ", default(email.body))
                email_collection.upsert(
                    documents=[merged_data],
                    metadatas=[{
                        "from": default(email.from_),
                        "to": default(email.to),
                        "subject": default(email.subject),
                        "body": default(email.body),
                    }],
                    ids=[str(id)]
                )

                # print("ATTACHMENTS:", len(email.attachments))
                for iid, attachment in enumerate(email.attachments):
                    merged_data = email.subject + " " + re.sub(r"[\n]", " ", default(attachment.body))
                    email_collection.upsert(
                        documents=[merged_data],
                        metadatas=[{
                            "from": default(email.from_),
                            "to": default(email.to),
                            "subject": default(email.subject),
                            "body": default(attachment.body),
                            "content_type": default(attachment.content_type),
                            "email_ref": str(id),
                        }],
                        ids=[str(id) + "A" + str(iid)]
                    )

                for image_url in image_urls:
                    try:
                        uris = download_images([image_url])
                        if len(uris) > 0:
                            email_collection.add(
                                uris=uris,
                                metadatas=[{"email": str(id)}],
                                ids=[str(id) + "I" + str(iid)
                                        for iid in range(len(uris))]
                            )
                    except Exception as e:
                        logging.error(f"Error downloading image: {e}")

            except Exception as e:
                logging.error(f"Error processing email {id}: {e}")

        print("READY TO QUERY")
        return True

    except Exception as e:
        logging.error(f"Critical error in initialize_live_data: {e}")
        return False


@app.get('/result')
def return_result():
    query = request.args.get("query")

    results = email_collection.query(
        query_texts=[query],
        n_results=5,
    )

    # remove duplicate email if the attachment is present with the associated email
    # remove any attachment with same email_ref below
    # NOTE: There might be multiple attachments of the same email (we can aggregate them into one if needed or do something about it)
    for metadata in results["metadatas"][0]:
        print(results["metadatas"][0])
        print(metadata)
        if (email_ref := metadata.get("email_ref", None)) is not None:
            # this result item is an attachment
            if email_ref in results["ids"][0]:
                # the email associated from this attachment is present
                email_ind = results["ids"][0].index(email_ref)
                del results["distances"][0][email_ind]
                del results["documents"][0][email_ind]
                del results["ids"][0][email_ind]
                del results["metadatas"][0][email_ind]

    return results


@app.post('/message')
def ai_message():
    body_json = request.get_json()
    ids = body_json.get("ids")
    prompt = body_json.get("prompt")

    results = email_collection.get(
        ids=ids.split(","),
    )

    textual_data = ""
    for ind, metadata in enumerate(results["metadatas"]):
        textual_data += f"[#{ind}] An email sent from {metadata['from']} to {metadata['to']} with subject line {metadata['subject']} with content of <<<{metadata['body']}>>>\n"

    chat_completion = groq_client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": f"Helpful assistant that assists users to find their content from emails for the given data, where individual emails are separated by [#]. Your job is to response as concisely as possible with the given context. Please limit your response to 1-2 sentences max. If there is not enough context to answer the question, please let the user know. The user may give you a vague prompt, or ask a direct question. If given a vague prompt, please supply a concise response regarding relevant information to the prompt. Again, only 1-2 sentences max. \n\n {textual_data}"
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


@app.route('/is_logged_in')
def is_logged_in():
    result = {}
    if gmail.creds is not None:
        result["is_logged_in"] = True
        result["email"] = gmail.get_email()
    else:
        result["is_logged_in"] = False
    return result


@app.route("/login")
@cross_origin()
def login():
    auth_url = gmail.login()

    if gmail.creds is not None:
        initialize_live_data()

    if auth_url:
        return {"url": auth_url}
    return {}


@app.route("/callback")
def callback():
    if request.args.get('state') != gmail.auth_state:
        raise Exception('Invalid state')

    gmail.login_callback(request.url)

    initialize_live_data()

    return redirect("http://localhost:3000")

# synth_initialize()
# initialize_live_data()
