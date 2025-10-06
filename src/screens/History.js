import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Divider } from 'react-native-paper';
import { getAuth } from '@react-native-firebase/auth';
import { collection, getDocs, getFirestore, limit, orderBy, query, where } from '@react-native-firebase/firestore';
import { RFPercentage } from 'react-native-responsive-fontsize';
const db = getFirestore();

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);


  const getUserRecentDeposits = async () => {
    try {
      setLoading(true);
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
      );

      const snapshot = await getDocs(q);
      const deposits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistory(deposits)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching recent deposits:", error);
      setLoading(false)
      return [];
    }
  };
  useEffect(() => {
    getUserRecentDeposits();
  }, [])
  const getStyle = (item) => {
    if (item.status === 'pending') {
      return styles.statusPending
    } else if (item.status === 'denied') {
      return styles.rejected
    } else {
      return styles.statusActive;
    }
  }
  const dateFormat = (timestamp) => {
    const date = new Date(timestamp._seconds * 1000);
    const formattedDate = date.toLocaleDateString('en-US');
    return formattedDate;
  }
  const renderItem = ({ item }) => (
    <View>
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
              styles.statusBadge, getStyle(item)
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </View>
  );
  return (
    <View style={[styles.container, history.length > 0 && {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 10,
      elevation: 2,
    }]}>
      <FlatList
        data={history}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={getUserRecentDeposits}
        ItemSeparatorComponent={<Divider />}
        ListEmptyComponent={<Text style={{ textAlign: 'center' }}>No history found</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    marginHorizontal: '4%'
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
  rejected: {
    backgroundColor: '#FF7F7F',
  },
});
