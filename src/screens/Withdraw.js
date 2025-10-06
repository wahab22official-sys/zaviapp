import React, { useEffect, useState } from 'react';
import {
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ToastAndroid,
    DeviceEventEmitter,
} from 'react-native';

import firestore, { addDoc, collection, doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { primary_color } from '../values/colors';
import { useNavigation } from '@react-navigation/native';
const db = getFirestore();
let name = '';
export default function Withdraw() {
    const navigation = useNavigation();
    const [amount, setAmount] = useState('');
    const [address, setAddress] = useState('');
    const [uploading, setUploading] = useState(false);
    const [balance, setBalance] = useState(0);
    
    useEffect(() => {
        getName();
    }, [])
    
    const getName = async () => {
        try {
            const auth = getAuth();
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const firestore = getFirestore();
            const userRef = doc(firestore, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                name = data.name;
                setBalance(data.balance || 0);
            } else {
                console.log('User document not found');
            }
        } catch (error) {
            console.log('Error fetching balance:', error);
        }

    }
    const handleSubmit = async () => {
        // Validate amount
        const withdrawAmount = parseFloat(amount);
        
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            ToastAndroid.show('Please enter a valid amount!', ToastAndroid.LONG);
            return;
        }
        
        if (withdrawAmount < 20) {
            ToastAndroid.show('Minimum withdrawal amount is $20 USDT!', ToastAndroid.LONG);
            return;
        }
        
        if (balance === 0) {
            ToastAndroid.show('You have no balance to withdraw!', ToastAndroid.LONG);
            return;
        }
        
        if (withdrawAmount > balance) {
            ToastAndroid.show(`Insufficient balance! Your current balance is $${balance.toFixed(2)}`, ToastAndroid.LONG);
            return;
        }
        
        setUploading(true);
        try {
            const auth = getAuth();
            const uid = auth.currentUser?.uid;
            await addDoc(collection(db, 'transactions'), {
                uid: uid,
                amount: amount,
                address: address,
                status: 'pending',
                type: 'Withdraw',
                createdAt: firestore.FieldValue.serverTimestamp(),
                name
            });

            ToastAndroid.show('Withdraw request submitted successfully!', ToastAndroid.LONG);
            setAmount('');
            setAddress('');
            DeviceEventEmitter.emit('refreshHome');
            navigation.goBack();
        } catch (error) {
            console.error('Upload error:', error);
            ToastAndroid.show('Upload failed Try again later.', ToastAndroid.LONG);
        }

        setUploading(false);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.balanceText}>Current Balance: ${balance.toFixed(2)} USDT</Text>
            
            <Text style={styles.heading}>Withdraw Instructions (Binance)</Text>
            <Text style={styles.step}>1. Open your Binance App</Text>
            <Text style={styles.step}>2. Go to Wallet &gt; Spot &gt; Withdraw</Text>
            <Text style={styles.step}>3. Select USDT</Text>
            <Text style={styles.step}>4. Choose TRC20 Network</Text>
            <Text style={styles.step}>5. Enter your Binance USDT address</Text>
            <Text style={styles.step}>6. Enter the amount for withdraw (minimum $20 USDT)</Text>
            <Text style={styles.step}>7. Submit your withdraw request</Text>



            <TextInput
                placeholder="Enter withdraw amount (in USD)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
            />

            <TextInput
                placeholder="Your binance USDT address (TRC20)"
                keyboardType="default"
                value={address}
                onChangeText={setAddress}
                style={styles.address}
            />

            <TouchableOpacity
                style={[
                    styles.submitButton, 
                    uploading && { backgroundColor: '#ccc' }, 
                    { opacity: (amount < 20 || !amount || !address || parseFloat(amount) > balance || balance === 0) ? 0.5 : 1 }
                ]}
                onPress={handleSubmit}
                disabled={uploading || !amount || !address || amount < 20 || parseFloat(amount) > balance || balance === 0}
            >
                <Text style={styles.submitText}>{uploading ? 'Uploading...' : 'Submit WithDraw Request'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1, },
    balanceText: { 
        fontSize: 20, 
        fontWeight: 'bold', 
        color: primary_color, 
        marginBottom: 20, 
        textAlign: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 10
    },
    heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    step: { fontSize: 14, color: '#333', marginBottom: 5 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginTop: 20,
        marginBottom: 10,
    },
    address: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 12,
        marginTop: 10,
        marginBottom: 10,
    },
    uploadButton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
    },
    uploadButtonText: { color: '#fff', fontWeight: 'bold' },
    preview: {
        height: 200,
        borderRadius: 10,
        marginVertical: 10,
        resizeMode: 'cover',
    },
    submitButton: {
        backgroundColor: primary_color,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 50
    },
    submitText: { color: '#fff', fontWeight: 'bold' },
});
