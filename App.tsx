import React, { useEffect, useState } from 'react'
import { PaperProvider } from 'react-native-paper';
import Routes from './src/navigation/Routes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { ActivityIndicator, View } from 'react-native';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await user.getIdToken(true);
          setUser(user);
          console.log('User is logged in', user);
        } catch (error) {
          console.log('User session is invalid, logging out');
          auth.signOut();
        }
      } else {
        console.log('User is logged out');
      }
      setLoading(false);
    });

    return unsubscribe;

  }, [])
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <PaperProvider>
        <Routes user={user} isAdmin={user?._user?.email === 'zavviapp@admin.com'} />
      </PaperProvider>
    </SafeAreaView>
  )
}
