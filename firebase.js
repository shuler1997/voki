import * as firebase from 'firebase';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
	apiKey: 'AIzaSyBLoMqRYCs4u4_OCq-kLJ_HjS_lC58he6s',
	authDomain: 'circle-7d444.firebaseapp.com',
	projectId: 'circle-7d444',
	storageBucket: 'circle-7d444.appspot.com',
	messagingSenderId: '569460265424',
	appId: '1:569460265424:web:0cb9f167cae38132e1e9d5',
	measurementId: 'G-E82M3N5FCV',
};

let app;

if (firebase.apps.length === 0) {
	app = firebase.initializeApp(firebaseConfig);
} else {
	app = firebase.app();
}

const db = app.firestore();
const auth = app.auth();

export { db, auth };
