import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableWithoutFeedback,
	Image,
	TouchableOpacity,
	Platform,
} from 'react-native';
import { Avatar } from 'react-native-elements';
import { Keyboard } from 'react-native';
import { db, auth } from '../firebase';
import * as firebase from 'firebase';
import { Audio } from 'expo-av';
import AudioPlayer from '../components/AudioPlayer';
import SummaryInfo from '../components/SummaryInfo';
import uuid from 'react-native-uuid';

const ChatScreen = ({ navigation, route }) => {
	const [messages, setMessages] = useState([]);
	const [recording, setRecording] = React.useState();
	const scrollViewRef = useRef(null);
	const abortedRecord = useRef(false);

	function sendAudioMessage(id) {
		db.collection('chats').doc(route.params.id).collection('messages').add({
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			message: 'this is an audio',
			type: 'audio',
			fileId: id,
			displayName: auth.currentUser.displayName,
			email: auth.currentUser.email,
			photoURL: auth.currentUser.photoURL,
		});
	}

	useEffect(() => {
		if (scrollViewRef.current !== null) {
			scrollViewRef.current.scrollToEnd();
		}
	}, [messages]);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: true,
			headerTintColor: '#4158D0',
			headerTitle: () => (
				<View style={styles.header}>
					<Text style={styles.headerText}>{route.params.chatName}</Text>
				</View>
			),
		});
	}, [navigation, route]);

	useLayoutEffect(() => {
		const unsubscribe = db
			.collection('chats')
			.doc(route.params.id)
			.collection('messages')
			.orderBy('timestamp', 'desc')
			.onSnapshot((snapshot) => {
				setMessages(
					snapshot.docs.map((doc) => ({
						id: doc.id,
						data: doc.data(),
					}))
				);
			});

		return unsubscribe;
	}, [route]);

	function sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	async function startRecording() {
		try {
			console.log('Requesting permissions..');
			await Audio.requestPermissionsAsync();
			await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				playsInSilentModeIOS: true,
			});
			console.log('Starting recording..');
			const { recording } = await Audio.Recording.createAsync(
				Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
			);
			if (abortedRecord.current) {
				console.log('in stop');
				await sleep(300);
				await recording.stopAndUnloadAsync();
				abortedRecord.current = false;
			} else {
				setRecording(recording);
				console.log('Recording started');
			}
		} catch (err) {
			console.error('Failed to start recording', err);
		}
	}

	async function stopRecording() {
		console.log('Stopping recording..');
		if (recording !== undefined) {
			setRecording(undefined);
			await recording.stopAndUnloadAsync();
			const uri = recording.getURI();
			console.log('Recording stopped and stored at', uri);
			const response = await fetch(uri);
			const blob = await response.blob();
			if (blob != null) {
				const uriParts = uri.split('.');
				const fileType = uriParts[uriParts.length - 1];
				const nameOfFile = uuid.v4();

				firebase
					.storage()
					.ref()
					.child(`${nameOfFile}.${fileType}`)
					.put(blob, {
						contentType: `audio/${fileType}`,
					})
					.then(() => {
						console.log('Sent!');
						sendAudioMessage(nameOfFile);
					})
					.catch((e) => console.log('error:', e));
			} else {
				console.log('error with blob');
			}
		} else {
			abortedRecord.current = true;
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.containerAvoid}
				keyboardVerticalOffset={90}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<>
						<ScrollView
							contentContainerStyle={{
								paddingTop: 15,
							}}
							ref={scrollViewRef}
						>
							{messages
								.slice(0)
								.reverse()
								.map(({ id, data }) => {
									let colors = ['#989898', '#989898'];

									if (data.dataApi) {
										const dataApi = JSON.parse(data.dataApi);
										const sentiments = dataApi.sentiment;
										colors = [];
										sentiments.forEach((item, index) => {
											if (
												item[0]['label'] === 'others' ||
												item[0]['score'] < 0.8
											) {
												colors.push('#606060');
											} else if (
												item[0]['label'] === 'sad' ||
												item[0]['label'] === 'angry'
											) {
												colors.push('#4158D0');
											} else {
												colors.push('#ff6666');
											}
										});
										if (colors.length === 1) {
											colors.push(colors[0]);
										}
									}
									return (
										<View style={styles.containerAudioText} key={id}>
											<View>
												<AudioPlayer
													id={data.fileId}
													data={data}
													origin={
														data.email === auth.currentUser.email
															? 'sender'
															: 'receiver'
													}
													colors={colors}
												/>
											</View>
										</View>
									);
								})}
						</ScrollView>

						<TouchableOpacity
							activeOpacity={0.5}
							onPressIn={startRecording}
							onPressOut={stopRecording}
							style={styles.containerRecord}
						>
							{recording ? (
								<Image
									style={styles.micActivated}
									source={require('../assets/logo.png')}
								/>
							) : (
								<Image
									style={styles.micDeactivated}
									source={require('../assets/logo.png')}
								/>
							)}
						</TouchableOpacity>
					</>
				</TouchableWithoutFeedback>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default ChatScreen;

const styles = StyleSheet.create({
	header: {
		backgroundColor: 'rgba(0, 0, 0, 0.6)',
	},
	container: {
		flex: 1,
	},
	containerAvoid: {
		flex: 1,
	},

	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '100%',
		padding: 20,
	},

	micActivated: {
		width: 180,
		height: 180,
		borderRadius: 90,
		marginBottom: 15,
		borderWidth: 10,
		borderColor: '#FFCC70',
		marginTop: 5,
	},
	micDeactivated: {
		width: 150,
		height: 150,
		borderRadius: 75,
		marginBottom: 30,
		marginTop: 20,
		borderWidth: 5,
		borderColor: 'rgba(0, 0, 0, 0.2)',
	},
	containerRecord: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	containerAudioText: {
		flexDirection: 'column',
	},
	header: {
		marginLeft: 80,
	},
	headerText: {
		fontSize: 23,
	},
});
