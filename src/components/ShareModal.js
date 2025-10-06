import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Share,
    Clipboard,
    Alert,
    ToastAndroid,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export const ShareModal = ({ visible, onClose, referralCode }) => {
    const referralLink = `https://zavviapp.com/ref/${referralCode}`;

    const copyToClipboard = (text, label) => {
        Clipboard.setString(text);
        ToastAndroid.show(`${label} copied`, ToastAndroid.SHORT)

    };

    const shareReferral = async () => {
        try {
            await Share.share({
                message: `Use my referral code ${referralCode} to sign up!\n`,
            });
        } catch (error) {
            Alert.alert('Error', 'Could not share referral link.');
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Share Your Referral</Text>

                    {/* Referral Code */}
                    {/* <View style={styles.infoContainer}>
                        <Text style={styles.label}>Code:</Text>
                        <View style={styles.valueRow}>
                            <Text style={styles.value}>{referralCode}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(referralCode, 'Code')}>
                                <Ionicons name="copy-outline" size={22} color="#444" />
                            </TouchableOpacity>
                        </View>
                    </View> */}

                    {/* Referral Link */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.label}>Code:</Text>
                        <View style={styles.valueRow}>
                            <Text style={[styles.value, { flex: 1 }]} numberOfLines={2}>
                                {referralCode}
                            </Text>
                            <TouchableOpacity onPress={() => copyToClipboard(referralCode, 'Link')}>
                                <Ionicons name="copy-outline" size={22} color="#444" style={styles.iconSpacing} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={shareReferral}>
                                <Ionicons name="share-social-outline" size={22} color="#1e90ff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close-circle" size={30} color="#1e90ff" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        alignSelf: 'center',
        marginBottom: 20,
    },
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
    closeButton: {
        alignSelf: 'center',
        position:'absolute',
        right:0
    },
    closeText: {
        fontSize: 14,
        color: '#888',
    },
});


