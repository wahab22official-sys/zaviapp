import { getAuth } from '@react-native-firebase/auth';
import firestore, { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc, updateDoc, where, writeBatch } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ToastAndroid, ActivityIndicator, DeviceEventEmitter } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { primary_color } from '../values/colors';


const db = getFirestore();
let result = {};
let amount = null;
const prevBalance = 0;
const PackagesScreen = () => {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [purchasing, setPurchasing] = useState(false);


    useEffect(() => {
        fetchPackageDetails();
        checkLevels()
        fetchBalance();
        // checkLevelQualification();
    }, [])
    const fetchBalance = async () => {


        try {
            const auth = getAuth();

            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data();
                amount = data.balance || 0;

            } else {

                console.log('User document not found');
            }
            fetchPackages()

        } catch (error) {
            fetchPackages()

            console.log('Error fetching balance:', error);
        }
    };
    const checkLevels = async () => {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        result = await checkUserLevels(uid);
        console.log("Level Qualifications:", result);

    }
    const fetchPackageDetails = async () => {
        setLoading(true);
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
                setCurrentPackage(packageDetail);
                // or setPackageDetail(packageDetail)
            } else {
                console.log("No active package found.");
                setCurrentPackage(null); // or setPackageDetail(null)
            }
            setLoading(false)
        } catch (error) {
            fetchPackages()
            console.error("Error fetching package details:", error);
        }
    };
    const fetchPackages = async () => {
        try {
            const firestore = getFirestore();
            const auth = getAuth();
            const uid = auth.currentUser?.uid;
            const q = query(collection(firestore, 'packages'), orderBy('amount', 'asc')); // 👈 sort 
            const querySnapshot = await getDocs(q);
            const fetchedPackages = [];
            querySnapshot.forEach(doc => {
                fetchedPackages.push({ id: doc.id, ...doc.data() });
            });
            setPackages(fetchedPackages);
            setLoading(false);
        } catch (error) {
            console.log('Error fetching packages:', error);
            setLoading(false);
        }
    };
    const subscribedPackage = async (item) => {

        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid || !item) return;
        const firestoreInstance = getFirestore();
        const currentDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(currentDate.getDate() + 30);

        // Step 1: Find existing active subscriptions and deactivate them
        const activeSubsQuery = query(
            collection(firestoreInstance, 'subscriptions'),
            where('uid', '==', uid),
            where('isActive', '==', true)
        );
        console.log("-------------",activeSubsQuery)
        const activeSubsSnapshot = await getDocs(activeSubsQuery);

        const batch = writeBatch(firestoreInstance);
        activeSubsSnapshot.forEach(docSnap => {
            const subRef = doc(firestoreInstance, 'subscriptions', docSnap.id);
            batch.update(subRef, { isActive: false });
        });

        // Step 2: Add the new subscription
        const newSubRef = doc(collection(firestoreInstance, 'subscriptions'));
        batch.set(newSubRef, {
            uid: uid,
            packageId: item.id,
            name: item.name,
            isActive: true,
            subscribedAt: firestore.FieldValue.serverTimestamp(),
            expiredAt: expiryDate,
            amount: item.amount,
            profit: item.profit
        });

        // Step 3: Commit the batch
        await batch.commit();
        const packageAmount = item.amount; // Ensure item.amount is a number
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            balance: amount - packageAmount
        });
        fetchPackageDetails();
        setPurchasing(false)
        setLoading(false)
        DeviceEventEmitter.emit('refreshHome');
        ToastAndroid.show('Successfully subscribed package!', ToastAndroid.SHORT);

    }
    const handleSubscribe = async (item) => {
        setPurchasing(true);
        try {
            if (amount && amount >= item?.amount) {
                if (item?.details?.includes("Basic Package")) {
                    subscribedPackage(item)
                } else {
                    const key = item.name.replace(/\s+/g, '').toLowerCase();
                    if (result == null || !result[key]) {
                        setPurchasing(false)
                        ToastAndroid.show("You are not meet the package reuqirements!", ToastAndroid.SHORT);
                    } else {
                        subscribedPackage(item)
                    }
                }
            } else {
                ToastAndroid.show('Please enter a deposit to subscribe this package!', ToastAndroid.SHORT);
                setPurchasing(false)

                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setPurchasing(false)
            ToastAndroid.show(error.message || "Subscription failed", ToastAndroid.SHORT);
        }
    };
    const hasActivePackage = async (uid) => {
        const q = query(collection(db, 'subscriptions'), where('uid', '==', uid));
        const snapshot = await getDocs(q);

        const now = new Date();
        return snapshot.docs.some(doc => {
            const data = doc.data();
            return data.isActive && data.expiredAt?.toDate() > now;
        });
    };

    /**
     * Get direct referrals at a specific tier
     */
    const getReferrals = async (referrerUid, tier = 1) => {
        try {
            const q = query(
                collection(db, 'referrals'),
                where('reffererId', '==', referrerUid),
                where('tier', '==', tier)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data().refreeId);
        } catch (error) {
            console.log(error)
            return []
        }
    };

    /**
     * Main function to check levels
     */
    const checkUserLevels = async (userUid) => {
        let qualifiedForLevel1 = false;
        let qualifiedForLevel2 = false;
        let qualifiedForLevel3 = false;
        //LEVEL 1
        const level1Refs = await getReferrals(userUid, 1);

        const level1Active = [];

        for (const uid of level1Refs) {
            if (await hasActivePackage(uid)) {
                level1Active.push(uid);
            }
        }


        if (level1Active.length >= 3) {
            qualifiedForLevel1 = true;
        }

        // LEVEL 2
        const level2Refs = [];

        for (const level1Uid of level1Active) {
            const ref = await getReferrals(level1Uid, 1);
            for (const u of ref) {
                if (await hasActivePackage(u)) {
                    level2Refs.push(u);
                }
            }
        }

        if (level2Refs.length >= 3) {
            qualifiedForLevel2 = true;
        }

        // LEVEL 3
        const level3Refs = [];

        for (const level2Uid of level2Refs) {
            const ref = await getReferrals(level2Uid, 1);
            for (const u of ref) {
                if (await hasActivePackage(u)) {
                    level3Refs.push(u);
                }
            }
        }

        if (level3Refs.length >= 3) {
            qualifiedForLevel3 = true;
        }

        return {
            level1: qualifiedForLevel1,
            level2: qualifiedForLevel2,
            level3: qualifiedForLevel3,
        };
    };
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <Text style={styles.name}>{item.name}</Text>
                <Ionicons name={item.type === 'Level' ? 'medal-outline' : 'diamond-outline'} size={20} color="#007AFF" />
            </View>
            <Text style={styles.detail}>💵 Amount: ${item.amount}</Text>
            <Text style={styles.detail}>📈 Daily Profit: {item.profit}% {item?.name?.includes('Level') ? '+ 8% of Tier 1 Member' : ''}</Text>
            <Text style={styles.description}>{item.details}</Text>

            <TouchableOpacity disabled={currentPackage && item?.id == currentPackage.packageId} style={[styles.subscribeButton, currentPackage && item?.id == currentPackage.packageId && { opacity: 0.5 }]} onPress={() => handleSubscribe(item)}>
                <Text style={styles.subscribeText}>{currentPackage && item?.id == currentPackage.packageId ? "Subscribed" : "Subscribe"} </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Available Packages & Levels</Text>
            <FlatList
                refreshing={loading}
                onRefresh={fetchPackageDetails}
                data={packages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
            {purchasing && <View style={styles.loader}>
                <ActivityIndicator style={{ zIndex: 1111 }} size={30} color={primary_color} />
            </View>}
        </View>
    );
};

export default PackagesScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F6FA',
        padding: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 14,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    detail: {
        fontSize: 14,
        color: '#666',
        marginVertical: 2,
    },
    description: {
        fontSize: 13,
        marginTop: 8,
        color: '#999',
    },
    subscribeButton: {
        marginTop: 12,
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    subscribeText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    loader: {
        position: 'absolute',
        opacity: 0.5,
        backgroundColor: '#f8f8f8',
        top: 0, bottom: 0, left: 0, right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 11
    }
});
