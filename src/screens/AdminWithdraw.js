import firestore, { collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
        ToastAndroid,
Clipboard
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons'; // <-- YEH ADD KAREIN (ICON KE LIYE)

const db = getFirestore();

const WithdrawList = () => {
    const [deposits, setDeposits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getDeposits()
    }, [])
    const getDeposits = async () => {
        try {
            setRefreshing(true)
            const firestore = getFirestore();
            const q = query(collection(firestore, 'transactions'), where('type', '==', 'Withdraw'), where('status', '==', 'pending')); // 👈 sort 
            const querySnapshot = await getDocs(q);
            const fetchedDeposits = [];
            querySnapshot.forEach(doc => {
                fetchedDeposits.push({ id: doc.id, ...doc.data() });
            });
            setDeposits(fetchedDeposits);
            setRefreshing(false);
        } catch (error) {
            console.log('Error fetching packages:', error);
            setRefreshing(false);

        }

    }
    const onAccept = async (item) => {
        try {
            const docRef = doc(db, 'transactions', item.id);
            await updateDoc(docRef, {
                status: 'approved'
            });
            const userSnap = await getDoc(doc(db, 'users', item.uid));
            const prevBalance = Number(userSnap.data().balance); // Ensure it's a number
            const amount = Number(item.amount); // Ensure item.amount is a number

            const userRef = doc(db, 'users', item.uid);
            await updateDoc(userRef, {
                balance: prevBalance - amount
            });
            getDeposits();
            console.log('Document updated successfully');
        } catch (error) {
            console.error('Error updating document:', error);
        }
    }
    const onDeny = async (item) => {
        try {
            const docRef = doc(db, 'transactions', item.id);
            await updateDoc(docRef, {
                status: 'denied'
            });
            getDeposits()
        } catch (error) {
            console.error('Error updating document:', error);
        }
    }

  const copyAddress = (address) => {
        Clipboard.setString(address); // Yeh line waisi hi kaam karegi
        ToastAndroid.show('Address copied to clipboard!', ToastAndroid.SHORT);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.amount}>${item.amount}</Text>
 <View style={styles.addressContainer}>
                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">{item.address}</Text>
                <TouchableOpacity onPress={() => copyAddress(item.address)}>
                    <Ionicons name="copy-outline" size={22} color="#555" />
                </TouchableOpacity>
            </View>

            <View style={styles.actionRow}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.acceptBtn]}
                    onPress={() => onAccept(item)}
                >
                    <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.denyBtn]}
                    onPress={() => onDeny(item)}
                >
                    <Text style={styles.btnText}>Deny</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={deposits}
            refreshing={refreshing}
            onRefresh={getDeposits}
            ListEmptyComponent={<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>No Request Found</Text></View>}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
        />
    );
};

export default WithdrawList;
const styles = StyleSheet.create({
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 6,
    },
    amount: {
        fontSize: 16,
        color: '#10b981',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        flex: 0.48,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    acceptBtn: {
        backgroundColor: '#4ade80',
    },
    denyBtn: {
        backgroundColor: '#f87171',
    },
    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
    subtitle: {
        fontSize: RFPercentage(2),
        color: '#6b7280',
        marginTop: 2,
        width: '70%',
        marginBottom: 12,
    }
    ,
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        color: '#555',
        marginRight: 8,
    },
});
