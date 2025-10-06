import NetInfo from "@react-native-community/netinfo";
import { getAuth } from '@react-native-firebase/auth';
import firestore, { collection, doc, getDocs, getFirestore, limit, query, updateDoc, where } from '@react-native-firebase/firestore';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ToastAndroid,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const db = getFirestore();

const ClaimRewardCard = ({ refreshing, onClaimReward }) => {
  const [showModal, setShowModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [reward, setReward] = useState();

  useEffect(() => {
    fetchReward();
  }, [refreshing]);

  const fetchReward = async () => {
    // ... Yeh function bilkul theek hai ...
    try {
        const auth = getAuth();
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const q = query(collection(db, 'profits'), where('uid', '==', uid), where('status', '==', 'pending'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            setReward({ id: snapshot.docs[0].id, ...docData });
        } else {
            setReward(null);
        }
    } catch (error) {
        console.error("Error fetching reward details:", error);
    }
  };

  const generateQuestion = () => {
    // ... Yeh function bilkul theek hai ...
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setQuestion(`${a} + ${b}`);
    setAnswer(a + b);
    setUserInput('');
  };

  // FINAL LOGIC - NetInfo.fetch() ka istemal
  const onClaimButtonPress = async () => {
    const netState = await NetInfo.fetch(); // <-- Internet state ko direct fetch karein

    if (!netState.isConnected) {
        Alert.alert("No Internet Connection", "You need to be online to claim your reward.");
        return;
    }

    if (!reward?.amount) {
        Alert.alert('No Reward', 'No reward available to claim at the moment.');
        return;
    }
    
    generateQuestion();
    setShowModal(true);
  };
  
  const handleVerifyAnswer = async () => {
    // ... Yeh function bilkul theek hai ...
    if (parseInt(userInput) === answer) {
        setShowModal(false);
        const docRef = doc(db, 'profits', reward.id);
        await updateDoc(docRef, {
            status: 'claimed',
            claimedAt: firestore.FieldValue.serverTimestamp(),
        });

        const userQuery = query(collection(db, 'users'), where('uid', '==', reward.uid), limit(1));
        const snapshot = await getDocs(userQuery);
        if (!snapshot.empty) {
            const docData = snapshot.docs[0].data();
            const userRef = doc(db, 'users', reward.uid);
            await updateDoc(userRef, {
                balance: docData.balance + reward.amount,
            });
            ToastAndroid.show('Reward Claimed successfully', ToastAndroid.SHORT);
            fetchReward();
        }
        onClaimReward();
    } else {
        Alert.alert("Incorrect", "Please try again.");
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.left}>
            <FontAwesome5 name="gift" size={28} color="#facc15" style={styles.icon} />
            <View>
                <Text style={styles.title}>Daily Reward</Text>
                <Text style={styles.subtitle}>You have a reward to claim today.</Text>
            </View>
        </View>

        <View style={styles.right}>
          {reward?.amount && <Text style={styles.reward}>+ ${reward.amount}</Text>}
          <TouchableOpacity
            style={[styles.button, !reward?.amount && styles.buttonDisabled]}
            onPress={onClaimButtonPress}
            // disabled={!reward?.amount}
          >
            <Text style={styles.buttonText}>
              Claim Now
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Verify You're Human</Text>
                <Text style={styles.modalQuestion}>What is {question}?</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={userInput}
                    onChangeText={setUserInput}
                    placeholder="Enter answer"
                />
                <TouchableOpacity style={styles.modalButton} onPress={handleVerifyAnswer}>
                    <Text style={styles.modalButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </>
  );
};

export default ClaimRewardCard;

// ... Styles bilkul theek hain ...
const styles = StyleSheet.create({
    card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 16,
      marginVertical: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      marginRight: 12,
    },
    title: {
      fontSize: RFPercentage(2.3),
      fontWeight: '600',
      color: '#1f2937',
    },
    subtitle: {
      fontSize: RFPercentage(2),
      color: '#6b7280',
      marginTop: 2,
      width: '70%'
    },
    right: {
      alignItems: 'flex-end',
    },
    reward: {
      fontSize: RFPercentage(3),
      fontWeight: 'bold',
      color: '#10b981',
      marginBottom: 6,
    },
    button: {
      backgroundColor: '#3b82f6',
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
    },
    buttonDisabled: {
      backgroundColor: '#9ca3af',
    },
    buttonText: {
      color: '#fff',
      fontWeight: '600',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalContent: {
      width: '80%',
      backgroundColor: 'white',
      padding: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
    },
    modalQuestion: {
      fontSize: 16,
      marginBottom: 10,
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      width: '100%',
      padding: 10,
      textAlign: 'center',
      marginBottom: 15,
    },
    modalButton: {
      backgroundColor: '#3b82f6',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    modalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
  
  });