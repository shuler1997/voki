import React, { useState } from 'react';
import { StatusBar } from 'react-native';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { auth } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';

const RegisterScreen = ({ navigation }) => {
	const [fullName, setFullName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [imgUrl, setImgUrl] = useState('');

	function register() {
		console.log('Register');
		auth
			.createUserWithEmailAndPassword(email, password)
			.then((authUser) => {
				authUser.user.updateProfile({
					displayName: fullName,
					photoURL:
						imgUrl ||
						'https://www.seekpng.com/png/full/110-1100707_person-avatar-placeholder.png',
				});
				navigation.replace('Login');
			})
			.catch((error) => alert(error.message));
	}

	return (
		<KeyboardAvoidingView behavior='padding' style={styles.container}>
			<StatusBar style='light' />
			<Text>
				<Text h3 style={{ marginBottom: 50 }}>
					Create a
				</Text>
				<Text h3 style={{ marginBottom: 50, color: '#48c0ff' }}>
					{' '}
					Voki{' '}
				</Text>
				<Text h3 style={{ marginBottom: 50 }}>
					account.
				</Text>
			</Text>
			<View style={styles.inputContainer}>
				<Input
					placeholder='Full Name'
					autoFocus
					type='text'
					value={fullName}
					onChangeText={(text) => setFullName(text)}
				/>
				<Input
					placeholder='Email'
					type='email'
					value={email}
					onChangeText={(text) => setEmail(text)}
				/>
				<Input
					placeholder='Password'
					type='password'
					secureTextEntry
					value={password}
					onChangeText={(text) => setPassword(text)}
				/>
				<Input
					placeholder='Profile Picture Url (optional)'
					type='text'
					value={imgUrl}
					onChangeText={(text) => setImgUrl(text)}
					onSubmitEditing={register}
				/>
			</View>

			<Button
				ViewComponent={LinearGradient} // Don't forget this!
				linearGradientProps={{
					colors: ['#48c0ff', '#b219ec'],
					start: { x: 0, y: 0.5 },
					end: { x: 1, y: 0.5 },
				}}
				title='Register'
				raised
				containerStyle={styles.button}
				onPress={register}
			/>
		</KeyboardAvoidingView>
	);
};

export default RegisterScreen;

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', paddingTop: 70 },
	button: {
		width: 200,
		marginTop: 10,
		borderRadius: 5,
	},
	inputContainer: { width: 300, paddingTop: 40 },
});
