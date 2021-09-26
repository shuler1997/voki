# voki - audio messaging reimagined

<p align="center">
<img src="./doc_media/logo_text.png" alt="voki logo" width="250" />
</p>
	
voki is an audio messaging app that leverages the power of AI to put your communication bandwidth on steroids. Beautiful visualisation of messages based on sentiment, automatically generated transcript and tags.


<p align="center">
<img src="./doc_media/login_screen.gif" alt="login_screen" width="250" /> | <img src="./doc_media/record_msg.gif" alt="record_msg" width="250" /> | <img src="./doc_media/summary.gif" alt="summary" width="250" />    
</p>

## Building the app 

### Dependencies:
- [React Native](https://github.com/facebook/react-native) 
- [Expo](https://github.com/expo/expo)

### Configuration
Add Firebase API configuration in [firebase.js](firebase.js):
```Javascript
const firebaseConfig = {
	apiKey: 'your-api-key',
	authDomain: 'your-auth-domain',
	projectId: 'your-project-id,
	storageBucket: 'your-storage-bucket',
	messagingSenderId: 'your-messaging-sender-id',
	appId: 'your-app-id',
	measurementId: 'your-measurement-id',
};
```

## Running

Use a terminal in the `root` dir of the repo.

### Front-end
```bash
npm install
expo start
```

### ML Backend

```shell
pip install /r requirements.txt
python main.py
ngrok http 4030
```

