import React, { useState } from 'react'
import { Alert, Image, Keyboard, KeyboardAvoidingView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper'
import { STYLES } from '../values/style';
import { primary_color } from '../values/colors';
import { useNavigation } from '@react-navigation/native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
import { collection, query, where, getDocs, getFirestore, doc, setDoc, FieldValue } from '@react-native-firebase/firestore';
import firestore from '@react-native-firebase/firestore';
const db = getFirestore();



export default function Register() {
    const navigation = useNavigation();

    const [name, setName] = useState("");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const generateReferralCode = (length = 6) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charsLength = chars.length;
        let code = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charsLength);
            code += chars[randomIndex];
        }

        return code;
    };
    const assignUniqueReferralCode = async (uid) => {
        const usersRef = db.collection('users');

        let code;
        let exists = true;

        // Keep generating until we find a unique one
        while (exists) {
            code = generateReferralCode();

            const snapshot = await usersRef.where('referralCode', '==', code).get();
            exists = !snapshot.empty;
        }

        // Save it to the user's Firestore doc
        await usersRef.doc(uid).set(
            {
                referralCode: code,
            },
            { merge: true }
        );

        return code;
    };
    const getUidByReferralCode = async () => {
        try {
            const q = query(
                collection(db, 'users'),
                where('referralCode', '==', code)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log('Referral code not found');
                return null;
            }

            const userDoc = snapshot.docs[0];
            return userDoc.data().uid;
        } catch (error) {
            console.error('Error getting UID by referral code:', error);
            return null;
        }
    };
    const createAccount = async () => {
        setLoading(true);
        try {
            let reffrerId = null;
            if (code?.trim()) {
                reffrerId = await getUidByReferralCode();
                if (!reffrerId) {
                    setLoading(false);
                    Alert.alert("Error", "You entered an invalid referral code!");
                    return; 
                }
            }
            createUserWithEmailAndPassword(getAuth(), email, password)
                .then(async (userCredential) => {
                    const user = userCredential.user;
                    const uniqueCode = await assignUniqueReferralCode(user?._user?.uid);
                    await setDoc(doc(collection(db, 'users'), user.uid), {
                        uid: user.uid,
                        name: name,
                        email: user.email,
                        referralCode: uniqueCode,
                        balance: 0,
                        created_at: firestore.FieldValue.serverTimestamp()
                    });
                    if (reffrerId) {
                        await setDoc(doc(collection(db, 'referrals')), {
                            reffererId: reffrerId,
                            refreeId: user.uid,
                            tier: 1,
                            createdAt: firestore.FieldValue.serverTimestamp()
                        });
                    }
                    setLoading(false);
                    navigation.navigate('Dashboard');
                    console.log('User account created & signed in!');

                })
                .catch(error => {
                    if (error?.code === 'auth/email-already-in-use') {

                        ToastAndroid.show('That email address is already in use!', ToastAndroid.SHORT);

                    } else if (error?.code === 'auth/invalid-email') {

                        ToastAndroid.show('That email address is invalid!', ToastAndroid.SHORT);

                    } else {
                        ToastAndroid.show(error.message, ToastAndroid.SHORT);
                    }
                    setLoading(false);

                });
        } catch (error) {
            setLoading(false)
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
                <TextInput
                    label="Full Name"
                    mode='outlined'
                    style={{
                        backgroundColor: '#f8f8f8',
                        borderRadius: 10,
                        marginTop: '8%',
                        fontSize: RFPercentage(2)


                    }}
                    value={name}
                    onChangeText={text => setName(text)}
                    underlineColor='#f8f8f8'
                    outlineColor='#f8f8f8'
                    activeOutlineColor={primary_color}
                    underlineStyle={{
                        display: 'none'
                    }}


                />
                <TextInput
                    label="Email Address"
                    mode='outlined'
                    style={{
                        backgroundColor: '#f8f8f8',
                        borderRadius: 10,
                        marginTop: '2%',
                        fontSize: RFPercentage(2)

                    }}
                    value={email}
                    onChangeText={text => setEmail(text)}
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
                    value={password}
                    onChangeText={text => setPassword(text)}
                    underlineColor='#f8f8f8'
                    outlineColor='#f8f8f8'
                    activeOutlineColor={primary_color}
                    secureTextEntry={!showPassword}
                    right={<TextInput.Icon onPress={toggleShowPassword} icon={!setShowPassword ? "eye-off" : "eye"} />}
                    underlineStyle={{
                        display: 'none'
                    }}

                />
                <TextInput
                    label="Refferal Code (Optional)"
                    mode='outlined'
                    style={{
                        backgroundColor: '#f8f8f8',
                        borderRadius: 10,
                        marginTop: '2%',
                        fontSize: RFPercentage(2)


                    }}
                    value={code}
                    onChangeText={text => setCode(text)}
                    underlineColor='#f8f8f8'
                    outlineColor='#f8f8f8'
                    activeOutlineColor={primary_color}
                    underlineStyle={{
                        display: 'none'
                    }}

                />
                <View style={{ marginTop: '5%' }}>
                    <Button onPress={createAccount}
                        disabled={!email || (!password || password.length < 6) || !name}
                        loading={loading} buttonColor={primary_color} style={{ width: '100%', alignSelf: 'center' }} mode='contained'>
                        Signup
                    </Button>
                </View>
                <Text onPress={() => navigation.navigate('Login')} style={{ alignSelf: 'center', marginTop: '5%' }}>
                    Already have an account? <Text style={{ color: primary_color }}>
                        Login
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