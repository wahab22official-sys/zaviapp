import { getAuth } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native'
import React, { useEffect } from 'react'
import { View } from 'react-native'
import { Button } from 'react-native-paper'
import SplashScreen from 'react-native-splash-screen';

export default function AdminRequest() {
    const navigation = useNavigation();
    useEffect(() => {
        SplashScreen.hide();
    }, [])
    const signout = () => {
        const auth = getAuth();
        auth.signOut();
        navigation.navigate('Login');
    }
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button onPress={() => navigation.navigate('Deposit List')} mode='contained'>
                Deposit Request
            </Button>
            <Button onPress={() => navigation.navigate('Withdraw List')} style={{ marginTop: '5%' }} mode='outlined'>
                Withdraw Request
            </Button>
            <Button style={{ marginTop: '5%' }} onPress={signout} mode='contained'>
                Signout
            </Button>

        </View>
    )
}
