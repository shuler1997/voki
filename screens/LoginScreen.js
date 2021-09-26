import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
	StyleSheet,
	TextInput,
	View,
	KeyboardAvoidingView,
} from 'react-native';
import { Button, Image } from 'react-native-elements';
import { auth } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				navigation.replace('Home');
			}
		});
		return unsubscribe;
	}, []);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerShown: false,
		});
	}, [navigation]);

	function login() {
		auth
			.signInWithEmailAndPassword(email, password)
			.catch((error) => alert(error.message));
	}

	return (
		<KeyboardAvoidingView behavior='padding' style={styles.container}>
			<Image
				source={require('../assets/logo.png')}
				style={{ width: 200, height: 200, marginTop: 150 }}
			/>
			<View style={{ position: 'absolute', top: 250, left: 167 }}>
				<Image
					source={require('../assets/voki.png')}
					style={{
						width: 50,
						height: 21,
					}}
				/>
			</View>
			<View style={styles.inputContainer}>
				<View style={styles.inputView}>
					<TextInput
						placeholder='Email'
						underlineColorAndroid='transparent'
						autoFocus
						type='email'
						value={email}
						placeholderTextColor='white'
						color='white'
						onChangeText={(text) => setEmail(text)}
					/>
				</View>
				<View style={styles.inputView}>
					<TextInput
						placeholder='Password'
						secureTextEntry
						type='password'
						underlineColorAndroid='transparent'
						placeholderTextColor='white'
						color='white'
						value={password}
						onChangeText={(text) => setPassword(text)}
						onSubmitEditing={login}
					/>
				</View>
			</View>
			<Button
				ViewComponent={LinearGradient} // Don't forget this!
				linearGradientProps={{
					colors: ['#48c0ff', '#b219ec'],
					start: { x: 0, y: 0.5 },
					end: { x: 1, y: 0.5 },
				}}
				title='Login'
				containerStyle={styles.button}
				onPress={login}
			/>
			<Button
				title='Register'
				type='outline'
				containerStyle={styles.button}
				onPress={() => navigation.navigate('Register')}
			/>
		</KeyboardAvoidingView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	button: {
		width: 200,
		marginTop: 10,
		borderRadius: 5,
	},

	inputContainer: {
		width: 300,
	},
	container: {
		flex: 1,
		alignItems: 'center',
		padding: 10,
		position: 'relative',
	},
	inputView: {
		// width:"80%",
		backgroundColor: '#C8C8C8',
		color: '#ffffff',
		borderRadius: 25,
		height: 50,
		marginBottom: 20,
		justifyContent: 'center',
		padding: 10,
	},
});
