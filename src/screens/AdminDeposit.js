import firestore, { collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-paper';
import { primary_color } from '../values/colors';
import { useNavigation } from '@react-navigation/native';

const db = getFirestore();

const DepositList = () => {
    const navigation = useNavigation();
    const [deposits, setDeposits] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [image, setImage] = useState('');
    useEffect(() => {
        getDeposits()
    }, [])
    const getDeposits = async () => {
        try {
            setRefreshing(true)
            const firestore = getFirestore();
            const q = query(collection(firestore, 'transactions'), where('type', '==', 'Deposit'), where('status', '==', 'pending')); // 👈 sort 
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
                balance: prevBalance + amount
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
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.amount}>${item.amount}</Text>
            <View style={{ alignItems: 'flex-start', marginBottom: '4%' }}>
                <Button onPress={() => navigation.navigate('Preview', { url: item.screenshotUrl })} mode='outlined' textColor={primary_color}>View Screenshot</Button>
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

export default DepositList;
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
        marginBottom: 12,
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
});
