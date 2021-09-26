import React, { useState, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Text } from 'react-native';
import { Audio } from 'expo-av';
import * as firebase from 'firebase';
import SummaryInfo from '../components/SummaryInfo';
import { Avatar } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';

const PROGRESS_INTERVAL = 100;

const AudioPlayer = ({ id, data, origin, colors }) => {
	const soundObject = useRef(new Audio.Sound());
	const downloaded = useRef(false);
	const soundDuration = useRef(null);
	const [barPosition, setBarPosition] = useState(200);
	const [playing, setPlaying] = useState(false);

	async function moveToTimestamp(timestamp) {
		if (!downloaded.current) {
			await startPlaying();
		}
		soundObject.current.setPositionAsync(timestamp);
		if (soundDuration.current) {
			setBarPosition(
				200 - Math.floor((timestamp / soundDuration.current) * 200)
			);
		}
	}

	function playbackStatusUpdate(playbackStatus) {
		if (playbackStatus.didJustFinish) {
			soundObject.current.setPositionAsync(0);
			setPlaying(false);
			soundObject.current.pauseAsync().catch((e) => console.log('error:', e));
		}
		if (soundDuration.current) {
			setBarPosition(
				200 -
					Math.floor(
						(playbackStatus.positionMillis / soundDuration.current) * 200
					)
			);
		}
	}

	async function startPlaying() {
		const downloadAudio = async (id) => {
			console.log(id);
			const uri = await firebase.storage().ref(`${id}.m4a`).getDownloadURL();

			// The rest of this plays the audio
			try {
				await soundObject.current.loadAsync({ uri });
				soundObject.current.setProgressUpdateIntervalAsync(PROGRESS_INTERVAL);
				soundObject.current.setOnPlaybackStatusUpdate(playbackStatusUpdate);
			} catch (error) {
				console.log('error:', error);
			}
		};

		const result = await soundObject.current
			.getStatusAsync()
			.catch((e) => console.log('error:', e));
		try {
			if (result.isLoaded) {
				if (result.isPlaying === false) {
					soundObject.current
						.playAsync()
						.catch((e) => console.log('error:', e));
					setPlaying(true);
				}
			} else {
				await downloadAudio(id);
				downloaded.current = true;
				const result = await soundObject.current
					.getStatusAsync()
					.catch((e) => console.log('error:', e));
				console.log(result.durationMillis);
				soundDuration.current = result.durationMillis;
				if (result.isPlaying === false) {
					soundObject.current
						.playAsync()
						.catch((e) => console.log('error:', e));
					setPlaying(true);
				}
			}
		} catch (error) {}
	}

	async function stopPlaying() {
		try {
			const result = await soundObject.current.getStatusAsync();
			if (result.isLoaded) {
				if (result.isPlaying === true) {
					soundObject.current
						.pauseAsync()
						.catch((e) => console.log('error:', e));
					setPlaying(false);
				}
			}
		} catch (error) {}
	}

	function waveformStyle(options) {
		return {
			width: options.playing ? 200 : 200,
			height: options.playing ? 50 : 50,

			opacity: options.playing ? 1 : 0.5,
		};
	}

	return (
		<View style={styles.container}>
			<View>
				<LinearGradient
					colors={colors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={origin === 'receiver' ? styles.receiver : styles.sender}
				>
					<Avatar rounded source={{ uri: data.photoURL }} size='medium' />

					{!playing ? (
						<TouchableOpacity
							activeOpacity={0.5}
							onPress={startPlaying}
							style={styles.audioPlayer}
						>
							{/* <Image style={styles.playButton} source={require('../assets/play.png')} /> */}
							<Image
								style={waveformStyle({ playing: false })}
								source={require('../assets/waveform.png')}
							/>
							<View
								style={{
									position: 'absolute',
									width: 5,
									height: 30,
									backgroundColor: 'grey',
									right: barPosition,
								}}
							></View>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							activeOpacity={0.5}
							onPress={stopPlaying}
							style={styles.audioPlayer}
						>
							<Image
								style={waveformStyle({ playing: true })}
								source={require('../assets/waveform.png')}
							/>
							<View
								style={{
									position: 'absolute',
									width: 5,
									height: 30,
									backgroundColor: '#505050',
									right: barPosition,
								}}
							></View>
						</TouchableOpacity>
					)}
					<Text style={styles.senderTimestamp}>
						{data.timestamp
							?.toDate()
							.toLocaleString('en-GB', { timeZone: 'UTC' })}
					</Text>
					{origin === 'receiver' && (
						<Text style={styles.receiverName}>{data.displayName}</Text>
					)}
				</LinearGradient>
			</View>
			<View>
				<SummaryInfo data={data} origin={origin} move={moveToTimestamp} />
			</View>
		</View>
	);
};

export default AudioPlayer;

const styles = StyleSheet.create({
	audioPlayer: {
		alignSelf: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},

	playButton: {
		width: 40,
		height: 40,
	},

	receiverName: {
		position: 'absolute',
		bottom: 3,
		left: 25,
		color: 'white',
		fontWeight: 'bold',
	},
	senderTimestamp: {
		position: 'absolute',
		bottom: 4,
		right: 20,
		color: 'white',
		fontSize: 10,
	},
	horContainer: {
		flexDirection: 'row',
	},

	receiver: {
		flexDirection: 'row-reverse',
		width: '80%',
		padding: '5%',
		margin: '5%',
		marginBottom: '2%',
		alignSelf: 'flex-start',
		backgroundColor: 'rgba(0, 0, 0, 0.35)',
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',

		shadowColor: 'black',
		shadowOpacity: 1,
		position: 'relative',
	},

	sender: {
		flexDirection: 'row-reverse',
		width: '80%',
		padding: '5%',
		margin: '5%',
		marginBottom: '2%',
		alignSelf: 'flex-end',
		alignItems: 'center',
		justifyContent: 'center',

		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		borderRadius: 30,

		shadowColor: 'black',
		shadowOpacity: 1,
	},
});
