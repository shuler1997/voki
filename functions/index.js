// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');
const path = require('path');
const os = require('os');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.processAudio = functions.storage.object().onFinalize(async (object) => {
	const data = new FormData();

	const fileName = object.name;
	const fileBucket = object.bucket;
	const bucket = admin.storage().bucket(fileBucket);
	const tempFilePath = path.join(os.tmpdir(), fileName);
	await bucket.file(fileName).download({ destination: tempFilePath });
	data.append('audiofile', fs.createReadStream(tempFilePath));
	const config = {
		method: 'post',
		url: 'http://a2c5-128-178-84-41.ngrok.io/speech2text',
		headers: {
			...data.getHeaders(),
		},
		data: data,
	};
	const cloudFunctionPromise = axios(config)
		.then(function (response) {
			const apiOutput = JSON.stringify(response.data);
			const db = admin.firestore();
			const chatsRef = db.collection('chats');
			const allChats = chatsRef.get().then((snapshot) => {
				snapshot.forEach((doc) => {
					console.log(doc.id, '=>', doc.data());
					console.log(fileName);
					const q = db
						.collection('chats')
						.doc(doc.id)
						.collection('messages')
						.where('fileId', '==', fileName.split('.')[0])
						.get()
						.then((snapshot) => {
							if (!snapshot.empty) {
								snapshot.forEach((newdoc) => {
									admin
										.firestore()
										.collection('chats')
										.doc(doc.id)
										.collection('messages')
										.doc(newdoc.id)
										.update({ dataApi: apiOutput });
								});

								return true;
							}
						});
				});
			});
		})
		.catch(function (error) {
			console.log(error);
		});
	return cloudFunctionPromise;
});
