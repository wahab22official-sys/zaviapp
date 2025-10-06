import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ScrollView,
    ToastAndroid,
    Clipboard,
    DeviceEventEmitter,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore, { addDoc, collection, doc, getDoc, getFirestore } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getAuth } from '@react-native-firebase/auth';

const db = getFirestore();
let name = '';
export default function Deposit() {
    const navigation = useNavigation();
    const [amount, setAmount] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [uploading, setUploading] = useState(false);

    const pickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo' });
        if (result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
        }
    };
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
            } else {
                console.log('User document not found');
            }
        } catch (error) {
            console.log('Error fetching balance:', error);
        }

    }
    const handleSubmit = async () => {
        if (!amount || !imageUri) {
            Alert.alert('Missing Info', 'Please enter amount and upload a screenshot.');
            return;
        }

        setUploading(true);

        try {
            const auth = getAuth();
            const uid = auth.currentUser?.uid;
            const timestamp = Date.now();
            const filename = `deposits/${uid}_${timestamp}.jpg`;
            const ref = storage().ref(filename);
            const uploadTask = await ref.putFile(imageUri);
            // After successful upload, get URL
            const imageUrl = await ref.getDownloadURL();


            await addDoc(collection(db, 'transactions'), {
                uid: uid,
                amount: amount,
                status: 'pending',
                type: 'Deposit',
                screenshotUrl: imageUrl,
                createdAt: firestore.FieldValue.serverTimestamp(),
                name: name
            });

            ToastAndroid.show('Deposit request submitted successfully!', ToastAndroid.LONG);
            setAmount('');
            setImageUri(null);
            DeviceEventEmitter.emit('refreshHome');
            navigation.goBack();
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload failed', error.message || 'Try again later.');
        }

        setUploading(false);
    };
    const copyToClipboard = (text, label) => {
        Clipboard.setString(text);
        ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT)

    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>Deposit Instructions (Binance)</Text>
            <Text style={styles.step}>1. Open your Binance App</Text>
            <Text style={styles.step}>2. Go to Wallet &gt; Spot &gt; Deposit</Text>
            <Text style={styles.step}>3. Select USDT</Text>
            <Text style={styles.step}>4. Choose TRC20 Network</Text>
            <Text style={styles.step}>5. Copy the deposit address below</Text>
            <View style={styles.infoContainer}>
                <Text style={styles.label}>Address:</Text>
                <View style={styles.valueRow}>
                    <Text style={[styles.value, { flex: 1 }]} numberOfLines={2}>
                        TM8uwhjtgbMUYQVJg73XxyEHQLQWe3ndGg
                    </Text>
                    <TouchableOpacity onPress={() => copyToClipboard("TM8uwhjtgbMUYQVJg73XxyEHQLQWe3ndGg", 'Address')}>
                        <Ionicons name="copy-outline" size={22} color="#444" style={styles.iconSpacing} />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.step}>6. Send your USDT to address</Text>
            <Text style={styles.step}>7. Enter the amount and transaction details below</Text>



            <TextInput
                placeholder="Enter deposit amount (in USD)"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                style={styles.input}
            />

            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ padding: 0, margin: 0, paddingHorizontal: 5 }}>
                        <Icon name="upload-cloud" size={20} color="#ffffff" />
                    </View>
                    <Text style={styles.uploadButtonText}>
                        {imageUri ? 'Change Screenshot' : 'Upload Screenshot'}
                    </Text>
                </View>
            </TouchableOpacity>

            {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

            <TouchableOpacity
                style={[styles.submitButton, uploading && { backgroundColor: '#ccc' }]}
                onPress={handleSubmit}
                disabled={uploading}
            >
                <Text style={styles.submitText}>{uploading ? 'Uploading...' : 'Submit Deposit Request'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: '#fff', flex: 1 },
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
        backgroundColor: '#28A745',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30
    },
    submitText: { color: '#fff', fontWeight: 'bold' },
    infoContainer: {
        marginBottom: 20,
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        color: '#333',
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    value: {
        fontSize: 16,
        color: '#444',
        marginRight: 8,
    },
    iconSpacing: {
        marginHorizontal: 10,
    },
});
