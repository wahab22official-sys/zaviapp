import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, RefreshControl, DeviceEventEmitter } from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, doc, getDoc, getDocs, query, where, limit, orderBy, collection } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { Button } from 'react-native-paper';
import { primary_color } from '../values/colors';
import { useNavigation } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import HistoryWidget from '../components/HistoryWidget';
import Header from '../components/Header';
import PackageWidget from '../components/PackageWidget';
import ClaimRewardCard from '../components/Reward';
const db = getFirestore();
export default function Dashboard() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [name, setName] = useState('');
  const [data, setData] = useState(null);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);




  const fetchBalance = async () => {
    setRefreshing(true)
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setBalance(data.balance || 0);
        setName(data.name || '');
        setData(data || null)
      } else {
        console.log('User document not found');
      }
    } catch (error) {
      console.log('Error fetching balance:', error);
    }
  };
  const fetchPackageDetails = async () => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const q = query(
        collection(db, 'subscriptions'),
        where('uid', '==', uid),
        where('isActive', '==', true),
        limit(1) // Only get the first match
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docData = snapshot.docs[0].data();
        const packageDetail = {
          id: snapshot.docs[0].id,
          ...docData
        };

        setCurrentPackage(packageDetail); // or setPackageDetail(packageDetail)
      } else {
        console.log("No active package found.");
        setCurrentPackage(null); // or setPackageDetail(null)
      }
    } catch (error) {
      console.error("Error fetching package details:", error);
    }
  };

  const getUserRecentDeposits = async () => {
    try {
      const auth = getAuth();
      const uid = auth.currentUser?.uid;

      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const deposits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setHistory(deposits)
      setRefreshing(false)

    } catch (error) {
      console.error("Error fetching recent deposits:", error);
      return [];
    }
  };


  useEffect(() => {
    SplashScreen.hide();
    const subscription = DeviceEventEmitter.addListener('refreshHome', () => {
      console.log('🔁 Refresh triggered from ScreenB');
      onRefresh();

    });
    onRefresh();
  }, []);
  const onRefresh = () => {
    fetchBalance();
    fetchPackageDetails();
    getUserRecentDeposits()
  }
  return (
    <SafeAreaView style={styles.container}>
      <Header data={data} username={name} />

      <ScrollView showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>My Balance</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Icon name="refresh" size={22} color="#555" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceText}>$ {balance.toFixed(2)}</Text>
        </View>
        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button style={{
            backgroundColor: primary_color,
            marginTop: '3%',
            width: '48%'
          }} icon={'send'} mode="contained" onPress={() => navigation.navigate('Deposit')}>
            Deposit
          </Button>
          <Button style={{
            backgroundColor: primary_color,
            marginTop: '3%',
            width: '48%'

          }} icon={'widgets-outline'} mode="contained" onPress={() => navigation.navigate('Withdraw')}>
            Withdraw

          </Button>
        </View>
        <PackageWidget
          currentPackage={currentPackage}
        />
        <ClaimRewardCard
          onClaim={() => console.log('Reward claimed!')}
          isClaimed={false}
          refreshing={refreshing}
          onClaimReward={onRefresh}
        />
        <HistoryWidget history={history} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    padding: '4.7%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: '4.9%',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: RFPercentage(2),
    color: '#777',
  },
  balanceText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',

  },
});
