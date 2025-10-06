// components/HistoryWidget.js
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Divider } from 'react-native-paper';
import { RFPercentage } from 'react-native-responsive-fontsize';

const HistoryWidget = ({ history = [] }) => {
  const navigation = useNavigation();

  const dateFormat = (timestamp) => {
    const date = new Date(timestamp._seconds * 1000);
    const formattedDate = date.toLocaleDateString('en-US');
    return formattedDate;
  }
  const getStyle=(item)=>{
    if (item.status === 'pending') {
      return styles.statusPending
    }else if (item.status === 'denied') {
      return styles.rejected    
    }else{
      return styles.statusActive;
    }
  }
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.left}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.date}>{dateFormat(item.createdAt)}</Text>
      </View>
      <View style={styles.right}>
        <Text
          style={[
            styles.amount,
            item.type === 'Deposit' ? styles.deposit : styles.withdraw,
          ]}
        >
          {item.type === 'Deposit' ? '+' : '-'}${item.amount}
        </Text>
        <View
          style={[
            styles.statusBadge,getStyle(item)
          ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent History</Text>
      <FlatList
        data={history}
        renderItem={renderItem}
        ItemSeparatorComponent={<Divider />}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text>No data found</Text>}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.buttonText}>View More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    marginVertical: 10,
  },
  title: {
    fontSize: RFPercentage(2.5),
    fontWeight: '600',
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  left: {},
  right: {
    alignItems: 'flex-end',
  },
  type: {
    fontSize: RFPercentage(2.2),
    fontWeight: '500',
  },
  date: {
    fontSize: RFPercentage(1.8),
    color: '#777',
  },
  amount: {
    fontSize: RFPercentage(2.3),
    fontWeight: '600',
  },
  deposit: {
    color: 'green',
  },
  withdraw: {
    color: 'red',
  },
  statusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPending: {
    backgroundColor: '#fce7b2',
  },
  statusActive: {
    backgroundColor: '#c8f7c5',
  },
   rejected: {
    backgroundColor: '#FF7F7F',
  },
  statusText: {
    fontSize: RFPercentage(1.8),
    fontWeight: '500',
    color: '#333',
  },
  button: {
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#007bff',
    fontWeight: '500',
  },
});

export default HistoryWidget;
