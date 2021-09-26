speech_key = 'd5da5b312758448ba1c1b07121f3434c'
service_region = 'switzerlandnorth'
from dataclasses import dataclass
import json

from flask import request, jsonify, Flask
from flask_cors import CORS
from pyngrok import ngrok
from rake_nltk import Rake
import nltk
import time
import azure.cognitiveservices.speech as speechsdk
import transformers
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline

from pydub import AudioSegment

nltk.download('punkt')
nltk.download('stopwords')

def speech_recognize_continuous_from_file(filename: str):
    """Performs continuous speech recognition with input from an audio file and returns the results."""

    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)
    speech_config.request_word_level_timestamps()
    audio_config = speechsdk.audio.AudioConfig(filename=filename)

    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    done = False

    def stop_cb(evt):
        """callback that stops continuous recognition upon receiving an event evt"""
        print('CLOSING on {}'.format(evt))
        speech_recognizer.stop_continuous_recognition()
        nonlocal done
        done = True

    all_results = []
    def handle_final_result(evt):
        all_results.append(evt.result)

    speech_recognizer.recognized.connect(handle_final_result)
    # Connect callbacks to the events fired by the speech recognizer
    speech_recognizer.recognizing.connect(lambda evt: print('RECOGNIZING: {}'.format(evt)))
    speech_recognizer.recognized.connect(lambda evt: print('RECOGNIZED: {}'.format(evt)))
    speech_recognizer.session_started.connect(lambda evt: print('SESSION STARTED: {}'.format(evt)))
    speech_recognizer.session_stopped.connect(lambda evt: print('SESSION STOPPED {}'.format(evt)))
    speech_recognizer.canceled.connect(lambda evt: print('CANCELED {}'.format(evt)))
    # stop continuous recognition on either session stopped or canceled events
    speech_recognizer.session_stopped.connect(stop_cb)
    speech_recognizer.canceled.connect(stop_cb)

    # Start continuous speech recognition
    speech_recognizer.start_continuous_recognition()
    while not done:
        time.sleep(.5)

    print("Printing all results:")
    print(all_results)
    return all_results

def azure_batch_stt(filename: str):
    """Process azure transcript with NLP."""
    results = speech_recognize_continuous_from_file(filename)
    utterances = [result.text for result in results]
    full_transcript = ''.join(utterances)
    all_jsons = [result.json for result in results]

    # Get token level timestamps
    # confidences_in_nbest = [item['Confidence'] for item in stt['NBest']]
    best_index = 0  # confidences_in_nbest.index(max(confidences_in_nbest))
    words = [word for result_json in all_jsons for word in json.loads(result_json)['NBest'][best_index]['Words']]
    print(words)

    print(f"Word\tOffset\tDuration")
    tokens_data = []
    for word in words:
        print(f"{word['Word']}\t{word['Offset']}\t{word['Duration']}")
        tokens_data.append({"word": word['Word'], "offset": word['Offset'], "duration": word['Duration']})

    # Sentiments
    tokenizer = AutoTokenizer.from_pretrained("lordtt13/emo-mobilebert")
    model = AutoModelForSequenceClassification.from_pretrained("lordtt13/emo-mobilebert")
    sentiment_classifier = transformers.pipeline('sentiment-analysis', model=model, tokenizer=tokenizer)
    sentiments = [sentiment_classifier(speech_utterance) for speech_utterance in utterances]
    print(sentiments)

    # NER
    ner_pipeline = pipeline('ner')
    ners = ner_pipeline(full_transcript)
    for ner in ners:
        ner['start'] = int(ner['start'])
        ner['end'] = int(ner['end'])
        ner['score'] = float(ner['score'])

    # Keywords
    rake_nltk_processor = Rake()
    rake_nltk_processor.extract_keywords_from_text(full_transcript)
    keywords_ranked = rake_nltk_processor.get_ranked_phrases()
    num_phrases = len(full_transcript.split('.'))
    keywords = keywords_ranked[:min(num_phrases, len(keywords_ranked))]

    speech_length= len(words)
    print(speech_length)
    if speech_length <= 20:
        summary = full_transcript
    else:
        summarizer = pipeline('summarization')
        summary = summarizer(full_transcript, min_length=int(0.1*speech_length), max_length=int(0.8*speech_length))[0]["summary_text"]
    print(summary)
    if results[0].reason == speechsdk.ResultReason.RecognizedSpeech:
        return full_transcript, tokens_data, sentiments, summary, ners, keywords
    else:
        return "", "", "", ""


def create_app(*args, ) -> Flask:
    """ Entry point. Creates app without autostart. """
    app = App(port=4030, start=True)  # start=False for gunicorn
    return app.server


@dataclass
class App:
    """ Controller for the application.
    Implements a basic API including /speech2text POST request.
    """

    port: int = None
    threaded: bool = True
    host: str = None
    debug: bool = None
    start: bool = True

    def __post_init__(self):
        app = Flask(__name__)
        CORS(app, origins=["*"], resources={'/*': {"origins": "*"}})
        self.server = app
        self.server.add_url_rule("/speech2text", "speech2text", self.speech2text, methods=["POST"])
        self.server.add_url_rule("/", "default", self.catch, defaults={"path": ""})
        self.server.add_url_rule(
            "/<path:path>", "default", self.catch, defaults={"path": ""}
        )
        self.server.after_request(self.after_request)

        #public_url = ngrok.connect(port='5000').public_url
        #print(public_url)
        #app.config["BASE_URL"] = public_url

        if self.start:
            self.run()

    def after_request(self, response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    def run(self):
        self.server.run(
            port=self.port, host=self.host, debug=self.debug, threaded=self.threaded
        )

    def speech2text(self):
        data = request.files["audiofile"]
        print(data)
        print("Received audio sample")

        # Convert m4a to wav
        data.save("sample.m4a")
        mp4_data = AudioSegment.from_file("sample.m4a")
        mp4_data.export("sample.wav", format="wav")

        # Call model
        transcript, token_times, sentiment, summary, ners, keywords = azure_batch_stt("sample.wav")
        return jsonify({"transcript": transcript, "token_times":token_times, "sentiment": sentiment, "summary": summary, "ners": ners, "keywords": keywords})

    @staticmethod
    def catch(*args, **kwargs):
        return "Invalid route. Valid routes are /speech2text [POST]"

create_app()