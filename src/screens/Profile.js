import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {getAuth} from '@react-native-firebase/auth';
import  {useState, useEffect} from 'react';
import {doc, getDoc, getFirestore} from '@react-native-firebase/firestore';


const Profile = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const username = route.params?.data?.name;
  const email = route.params?.data?.email;
  const db = getFirestore(); // Firestore instance

  const [referrals, setReferrals] = useState(0);
  const [packageName, setPackageName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

useEffect(() => {
        const fetchUserData = async () => {
            const auth = getAuth();
            const user = auth.currentUser;
            if (user) {
                // User ka active package aur expiry date laane ke liye
                try {
                    // Hum un subscriptions ko dhoondh rahe hain jo is user ki hain AUR active hain
                    const subsQuery = query(
                        collection(db, 'subscriptions'),
                        where('uid', '==', user.uid),
                        where('isActive', '==', true), // Sirf active subscription layein
                        limit(1) // Aam taur par ek hi active subscription hogi
                    );

                    const subsSnapshot = await getDocs(subsQuery);
                    
                    if (!subsSnapshot.empty) {
                        const subData = subsSnapshot.docs[0].data();
                        
                        // SAHI FIELD NAMES ISTAMAL KAREIN
                        setPackageName(subData.name); // 'packageName' ke bajaye 'name'
                        
                        // Expiry date ko format karein
                        const expiry = subData.expiredAt.toDate().toLocaleDateString(); // 'packageExpiry' ke bajaye 'expiredAt'
                        setExpiryDate(expiry);
                    }
                } catch (e) { 
                    console.log("Error fetching subscription:", e); 
                }

                // Referrals ki ginti calculate karein (yeh code theek hai)
                const referralsQuery = query(
                    collection(db, 'users'),
                    where('referredBy', '==', user.uid)
                );
                const referralsSnapshot = await getDocs(referralsQuery);
                setReferralsCount(referralsSnapshot.size);
            }
        };

        fetchUserData();
    }, []);

  const socialLinks = [
    {
      name: 'logo-whatsapp',
      url: '+447475769084',
      link: 'whatsapp://send?phone=+447475769084',
      icon: <FontAwesome name="whatsapp" size={24} color="green" />,
    },
    {
      name: 'telegram',
      url: 'http://t.me/zavviapp',
      url: 'http://t.me/zavviapp',
      icon: <FontAwesome name="telegram" size={24} color="yellow" />,
    },
  ];
  const onPress = link => {
    if (link.name === 'logo-whatsapp') {
      Linking.canOpenURL(link.link).then(supported => {
        if (supported) {
          Linking.openURL(link.link);
        } else {
          alert('WhatsApp is not installed');
        }
      });
    } else {
      openTelegram();
    }
  };
  const openTelegram = async () => {
    const telegramURL = 'tg://resolve?domain=zavviapp';
    const fallbackURL = 'https://t.me/zavviapp';

    const supported = await Linking.canOpenURL(telegramURL);
    if (supported) {
      Linking.openURL(telegramURL);
    } else {
      Linking.openURL(fallbackURL);
    }
  };
  const signout = () => {
    const auth = getAuth();
    auth.signOut();
    navigation.navigate('Login');
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Personal Information</Text>

      <View style={styles.item}>
        <Ionicons name="person-circle-outline" size={24} color="gray" />
        <Text style={styles.text}>{username}</Text>
      </View>

      <View style={styles.item}>
        <MaterialCommunityIcons name="email-outline" size={24} color="gray" />
        <Text style={styles.text}>{email}</Text>
      </View>

      <Text style={styles.subheading}>Account Details</Text>
      <View style={styles.item}>
        <Ionicons name="people-outline" size={24} color="gray" />
        <Text style={styles.text}>Total Referrals: {referrals}</Text>
      </View>

       <TouchableOpacity 
                style={styles.viewAllButton} 
                onPress={() => navigation.navigate('ReferralsList')} // ReferralsList screen par jayein
            >
                <Text style={styles.viewAllButtonText}>View All Referrals</Text>
            </TouchableOpacity>


      <View style={styles.item}>
        <Ionicons name="star-outline" size={24} color="gray" />
        <Text style={styles.text}>Package: {packageName}</Text>
      </View>
      <View style={styles.item}>
        <Ionicons name="calendar-outline" size={24} color="gray" />
        <Text style={styles.text}>Expires on: {expiryDate}</Text>
      </View>

      <Text style={styles.subheading}>Contact Us</Text>
      {socialLinks.map((link, index) => (
        <TouchableOpacity
          onPress={() => onPress(link)}
          key={index}
          style={styles.item}>
          {link.icon}
          <Text style={[styles.text, styles.link]}>{link.url}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.signOutButton} onPress={signout}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  text: {
    fontSize: 16,
  },
  link: {
    color: '#1e90ff',
    textDecorationLine: 'underline',
  },
  signOutButton: {
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    alignSelf: 'center',
  },
  signOutText: {
    color: '#555',
    fontSize: 16,
  },
  viewAllButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#eef2ff',
        borderRadius: 8,
        alignItems: 'center',
    },
    viewAllButtonText: {
        color: '#4f46e5',
        fontWeight: '600',
    },
});

export default Profile;
