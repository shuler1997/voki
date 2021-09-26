import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Avatar } from 'react-native-elements';
import { db } from '../firebase';

const CustomListItem = ({ id, chatName, enterChat }) => {
	const [chatMessages, setChatMessages] = useState([]);

	useEffect(() => {
		const unsubscribe = db
			.collection('chats')
			.doc(id)
			.collection('messages')
			.orderBy('timestamp', 'desc')
			.onSnapshot((snapshot) => {
				setChatMessages(snapshot.docs.map((doc) => doc.data()));
			});

		return unsubscribe;
	}, []);

	return (
		<ListItem key={id} bottomDivider onPress={() => enterChat(id, chatName)}>
			<Avatar
				rounded
				source={
					chatMessages?.[0]
						? {
								uri: chatMessages?.[0]?.photoURL,
						  }
						: require('../assets/logo.png')
				}
			/>
			<ListItem.Content>
				<ListItem.Title>{chatName}</ListItem.Title>
			</ListItem.Content>
		</ListItem>
	);
};

export default CustomListItem;

const styles = StyleSheet.create({});
