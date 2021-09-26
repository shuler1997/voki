import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { StyleSheet, SafeAreaView } from 'react-native';
import { Avatar } from 'react-native-elements/dist/avatar/Avatar';
import CustomListItem from '../components/CustomListItem';
import { auth, db } from '../firebase';
import { SimpleLineIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
	const [chats, setChats] = useState([]);

	useEffect(() => {
		const unsubscribe = db.collection('chats').onSnapshot((snapshot) => {
			setChats(
				snapshot.docs.map((doc) => ({
					id: doc.id,
					data: doc.data(),
				}))
			);
		});

		return unsubscribe;
	}, []);

	function signOutUser() {
		auth.signOut().then(() => navigation.replace('Login'));
	}

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: 'voki',
			headerLeft: () => (
				<View style={{ marginRight: 115 }}>
					<TouchableOpacity activeOpacity={0.5} onPress={signOutUser}>
						<SimpleLineIcons name='logout' size={24} color='black' />
					</TouchableOpacity>
				</View>
			),
			headerRight: () => (
				<View style={styles.headerRight}>
					<TouchableOpacity
						activeOpacity={0.5}
						onPress={() => navigation.navigate('AddChat')}
					>
						<SimpleLineIcons name='plus' size={24} color='black' />
					</TouchableOpacity>
				</View>
			),
		});
	}, [navigation]);

	function enterChat(id, chatName) {
		navigation.navigate('Chat', { id: id, chatName: chatName });
	}

	return (
		<SafeAreaView>
			<ScrollView>
				{chats.map(({ id, data: { chatName } }) => (
					<CustomListItem
						key={id}
						id={id}
						chatName={chatName}
						enterChat={enterChat}
					/>
				))}
			</ScrollView>
		</SafeAreaView>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({
	headerRight: {
		marginRight: -40,
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: 80,
	},
	playImage: {
		width: 80,
		height: 80,
	},
});
