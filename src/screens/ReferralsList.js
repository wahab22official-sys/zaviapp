import { getAuth } from '@react-native-firebase/auth';
import { collection, getDocs, getFirestore, query, where } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const db = getFirestore();

const ReferralsList = () => {
    const [referrals, setReferrals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReferrals = async () => {
            try {
                const auth = getAuth();
                const currentUser = auth.currentUser;

                if (!currentUser) {
                    setLoading(false);
                    return;
                }
                
                // Yeh query un sab users ko layegi jinko current user ne refer kiya hai
                // NOTE: Aapko Firebase mein 'referredBy' field ka naam confirm karna hoga
                const q = query(
                    collection(db, 'users'), 
                    where('referredBy', '==', currentUser.uid)
                );

                const snapshot = await getDocs(q);
                const referralsList = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setReferrals(referralsList);
            } catch (error) {
                console.error("Error fetching referrals:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReferrals();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemEmail}>{item.email}</Text>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" style={{ flex: 1 }} />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={referrals}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<Text style={styles.emptyText}>You have not referred anyone yet.</Text>}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    );
};

export default ReferralsList;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    itemContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 10,
        borderRadius: 8,
        elevation: 1,
    },
    itemName: {
        fontSize: RFPercentage(2.2),
        fontWeight: '600',
    },
    itemEmail: {
        fontSize: RFPercentage(1.8),
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: RFPercentage(2),
    },
});