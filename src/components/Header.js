import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'; // Or use your preferred icon library
import { RFPercentage } from 'react-native-responsive-fontsize';
import Feather from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/Ionicons';
import { ShareModal } from './ShareModal';


const Header = ({ username = "John Doe", data }) => {

    const [sharePopup, setSharePopup] = useState(false);
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            {/* Top Row */}
            <View style={styles.topRow}>
                <View>
                    <Text style={styles.welcome}>Welcome</Text>
                    <Text style={styles.username}>{username}</Text>
                </View>
                <View style={styles.icons}>
                    <TouchableOpacity onPress={() => setSharePopup(true)} style={styles.iconButton}>
                        <Feather name="share-2" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile', { data })} style={styles.iconButton}>
                        <Icon name="person-circle-outline" size={28} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
            <ShareModal visible={sharePopup} referralCode={data?.referralCode} onClose={() => setSharePopup(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 0,
        paddingBottom: 15,
        backgroundColor: '#f8f8f8',
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcome: {
        fontSize: RFPercentage(3),
        fontWeight: 'bold',
    },
    icons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
    },
    username: {
        marginTop: 0,
        textAlign: 'left',
        fontSize: RFPercentage(2.3),
        // color: '#555',
    },
});

export default Header;
