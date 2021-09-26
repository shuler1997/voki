import React, { useLayoutEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';

const AddChatScreen = ({ navigation }) => {
	const [input, setInput] = useState('');

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: 'Add a new chat',
		});
	}, [navigation]);

	async function createChat() {
		await db
			.collection('chats')
			.add({
				chatName: input,
			})
			.then(() => {
				navigation.goBack();
			})
			.catch((error) => alert(error.message));
	}

	return (
		<View style={styles.container}>
			<Input
				placeholder='Enter a chat name'
				value={input}
				onChangeText={(text) => setInput(text)}
				onSubmitEditing={createChat}
			/>
			<Button
				ViewComponent={LinearGradient} // Don't forget this!
				linearGradientProps={{
					colors: ['#48c0ff', '#b219ec'],
					start: { x: 0, y: 0.5 },
					end: { x: 1, y: 0.5 },
				}}
				title='Create new chat'
				disabled={!input}
				containerStyle={styles.button}
				onPress={createChat}
			/>
		</View>
	);
};

export default AddChatScreen;

const styles = StyleSheet.create({
	container: { alignItems: 'center', justifyContent: 'center' },
	button: {
		width: 200,
		marginTop: 10,
		borderRadius: 5,
	},
});
