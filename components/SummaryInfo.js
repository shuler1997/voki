import React, { useState } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	SafeAreaView,
} from 'react-native';
import uuid from 'react-native-uuid';

const SummaryInfo = ({ data, origin, move }) => {
	const [showTranscript, setShowTranscript] = useState(false);

	function onPress() {
		setShowTranscript((prev) => !prev);
	}

	function onPressKeyword(item) {
		const dataApi = JSON.parse(data.dataApi);
		const items = item.split(' ');
		dataApi.token_times.forEach((token, index) => {
			let cond = true;
			items.forEach((i, idx) => {
				if (
					i !==
					dataApi.token_times[
						Math.min(index + idx, dataApi.token_times.length - 1)
					].word
				) {
					cond = false;
				}
			});
			if (cond) {
				const moveTime = Math.max(token.offset / 10000 - 1000, 0);
				move(moveTime);
				return;
			}
		});
	}

	if (data.dataApi) {
		const dataApi = JSON.parse(data.dataApi);
		const keywords = dataApi.keywords;
		const transcript = dataApi.transcript;

		return (
			<View>
				<View
					style={
						origin === 'receiver'
							? styles.apiSummaryContainerReceiver
							: styles.apiSummaryContainerSender
					}
				>
					<TouchableOpacity activeOpacity={0.5} onLongPress={onPress}>
						<SafeAreaView style={styles.flatlist}>
							{keywords.slice(0, 5).map((item, id) => {
								return (
									<TouchableOpacity
										activeOpacity={0.5}
										onPress={() => onPressKeyword(item)}
										key={uuid.v4()}
									>
										<View
											style={{ flex: 1, flexDirection: 'column', margin: 1 }}
										>
											<Text style={styles.keyword}> {item}</Text>
										</View>
									</TouchableOpacity>
								);
							})}
						</SafeAreaView>
					</TouchableOpacity>
				</View>
				{showTranscript && (
					<View
						style={
							origin === 'receiver'
								? styles.apiSummaryContainerReceiver
								: styles.apiSummaryContainerSender
						}
					>
						<Text style={styles.apiTranscript}> {transcript} </Text>
					</View>
				)}
			</View>
		);
	} else {
		return (
			<View
				style={
					origin === 'receiver'
						? styles.apiSummaryContainerReceiver
						: styles.apiSummaryContainerSender
				}
			>
				<Text style={styles.apiSummaryLoading}> Loading... </Text>
			</View>
		);
	}
};

export default SummaryInfo;

const styles = StyleSheet.create({
	apiSummary: {
		color: 'white',
	},

	apiTranscript: {
		color: '#383838',
		textAlign: 'center',
	},

	apiSummaryLoading: {
		color: '#484848',
		fontWeight: 'bold',
	},

	keyword: {
		color: '#484848',
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		textAlign: 'center',
		borderRadius: 10,
		padding: 2,
		fontWeight: 'bold',
	},
	flatlist: {
		width: 200,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	apiSummaryContainerReceiver: {
		flexDirection: 'row-reverse',
		width: '80%',
		padding: '2%',
		margin: '5%',
		marginTop: '0%',
		marginBottom: '2%',
		alignSelf: 'flex-start',
		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 30,
		alignItems: 'center',
		justifyContent: 'center',

		shadowColor: 'black',
		shadowOpacity: 1,
		position: 'relative',
	},
	apiSummaryContainerSender: {
		flexDirection: 'row-reverse',
		width: '80%',
		padding: '2%',
		margin: '5%',
		marginTop: '0%',
		marginBottom: '2%',
		alignSelf: 'flex-end',
		alignItems: 'center',
		justifyContent: 'center',

		backgroundColor: 'rgba(0, 0, 0, 0.1)',
		borderRadius: 30,

		shadowColor: 'black',
		shadowOpacity: 1,
	},
});
