import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AddChatScreen from './screens/AddChatScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createNativeStackNavigator();

function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName='Login'>
				<Stack.Screen
					options={{ title: 'voki' }}
					name='Login'
					component={LoginScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Register',
					}}
					name='Register'
					component={RegisterScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Chats',
						headerTitleAlign: 'center',
					}}
					name='Home'
					component={HomeScreen}
				/>
				<Stack.Screen
					options={{
						title: 'Add Chat',
					}}
					name='AddChat'
					component={AddChatScreen}
				/>
				<Stack.Screen
					options={{
						title: '',
					}}
					name='Chat'
					component={ChatScreen}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default App;
