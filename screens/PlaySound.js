import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Audio } from 'expo-av';

const PlaySound = () => {
	const [sound, setSound] = React.useState();
	const [recording, setRecording] = React.useState();

	async function playSound() {
		console.log('Loading Sound');
		const { sound } = await Audio.Sound.createAsync(
			require('../assets/Hello.mp3')
		);
		setSound(sound);

		console.log('Playing Sound');
		await sound.playAsync();
	}

	React.useEffect(() => {
		return sound
			? () => {
					console.log('Unloading Sound');
					sound.unloadAsync();
			  }
			: undefined;
	}, [sound]);

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
			setRecording(recording);
			console.log('Recording started');
		} catch (err) {
			console.error('Failed to start recording', err);
		}
	}

	async function stopRecording() {
		console.log('Stopping recording..');
		setRecording(undefined);
		await recording.stopAndUnloadAsync();
		const uri = recording.getURI();
		console.log('Recording stopped and stored at', uri);
	}

	return (
		<View>
			<Text>Audio Player</Text>
			<Button title='Play Sound' onPress={playSound} />
			<Button
				title={recording ? 'Stop Recording' : 'Start Recording'}
				onPress={recording ? stopRecording : startRecording}
			/>
		</View>
	);
};

export default PlaySound;

const styles = StyleSheet.create({});
