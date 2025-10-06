import React, { useEffect, useState } from 'react'
import { Alert, Image, Keyboard, KeyboardAvoidingView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper'
import { STYLES } from '../values/style';
import { primary_color } from '../values/colors';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { getAuth } from '@react-native-firebase/auth';
import SplashScreen from 'react-native-splash-screen';

export default function Login() {
    useEffect(() => {
        SplashScreen.hide();
    }, [])
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const loginWithFirebase = async () => {
        setLoading(true);
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        try {
            await getAuth().signInWithEmailAndPassword(email, password);

            setLoading(false);
            if (email === 'zavviapp@admin.com' && password === 'os3lW5JX}N7-') {
                navigation.navigate('Admin Dashboard')
            }else{
            navigation.navigate('Dashboard');
            }
        } catch (error) {
            console.log(error.code);
            let message = 'Login failed';
            if (error.code === 'auth/invalid-credential') {
                message = 'Please enter a valid credentials!.';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password.';
            }
            ToastAndroid.show(message, ToastAndroid.LONG);
            setLoading(false);
        }
    }
    return (
        <View style={STYLES.container}>
            <KeyboardAvoidingView onPress={() => Keyboard.dismiss()} style={{ flex: 1 }}>
                <View style={{
                    width: '40%',
                    height: '20%',
                    alignSelf: 'center',
                    marginTop: '8%'
                }}>
                    <Image
                        style={{
                            flex: 1,
                            resizeMode: 'contain',
                            aspectRatio: '1'
                        }}
                        source={require('../assets/logo.png')}
                    />
                </View>
                <Text style={{ marginTop: '8%', fontSize: RFPercentage(2), fontWeight: '600' }}>
                    Login
                </Text>
                <Text style={{ color: 'grey', fontSize: RFPercentage(1.8) }}>
                    Welcome, please login to your account.
                </Text>
                <TextInput
                    label="Email Address"
                    mode='outlined'
                    style={{
                        backgroundColor: '#f8f8f8',
                        borderRadius: 10,
                        marginTop: '12%',
                        fontSize: RFPercentage(2)
                    }}
                    value={email}
                    onChangeText={text => setEmail(text)}
                    left={<TextInput.Icon icon={'email'} color='grey' size={20} />}
                    underlineColor='#f8f8f8'
                    outlineColor='#f8f8f8'
                    activeOutlineColor={primary_color}
                    underlineStyle={{
                        display: 'none'
                    }}

                />
                <TextInput
                    label="Password"
                    mode='outlined'
                    style={{
                        backgroundColor: '#f8f8f8',
                        borderRadius: 10,
                        marginTop: '2%',
                        fontSize: RFPercentage(2)

                    }}
                    left={<TextInput.Icon icon={'lock'} color='grey' size={20} />}
                    value={password}
                    onChangeText={text => setPassword(text)}
                    underlineColor='#f8f8f8'
                    outlineColor='#f8f8f8'
                    activeOutlineColor={primary_color}
                    secureTextEntry={!showPassword}
                    right={<TextInput.Icon color='grey' onPress={toggleShowPassword} icon={!setShowPassword ? "eye-off" : "eye"} />}
                    underlineStyle={{
                        display: 'none'
                    }}

                />

                <View style={{ marginTop: '10%' }}>
                    <Button
                        loading={loading}
                        disabled={!email || (!password || password.length < 6)}
                        onPress={loginWithFirebase} buttonColor={primary_color} style={{ width: '100%', alignSelf: 'center' }} mode='contained'>
                        Login
                    </Button>
                </View>
                <Text onPress={() => navigation.navigate('Register')} style={{ alignSelf: 'center', marginTop: '5%' }}>
                    Don't have an account? <Text style={{ color: primary_color }}>
                        Sign Up
                    </Text>
                </Text>
            </KeyboardAvoidingView>
        </View>
    )
}
const styles = StyleSheet.create({
    mainContainer: {
        marginTop: 70,
        margin: 40,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f3f3',
        borderRadius: 10,
        paddingHorizontal: 14,
        marginTop: '3%'
    },
    input: {
        flex: 1,
        color: '#333',
        paddingVertical: "4%",
        fontSize: 16,
    },
    icon: {
        marginLeft: 10,
    },
    heading: {
        alignItems: 'center',
        fontSize: 16,
    },
});