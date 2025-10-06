import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Dashboard from '../screens/Dashboard';
import Deposit from '../screens/Deposit';
import Withdraw from '../screens/Withdraw';
import History from '../screens/History';
import Profile from '../screens/Profile';
import PackagesScreen from '../screens/Packages';
import AdminRequest from '../screens/AdminRequest';
import DepositList from '../screens/AdminDeposit';
import WithdrawList from '../screens/AdminWithdraw';
import Preview from '../screens/Preview';
import ReferralsList from '../screens/ReferralsList'; 


const Stack = createNativeStackNavigator();
export default function Routes({ user,isAdmin }) {
  const getName=()=>{
    if (isAdmin) {
      return "Admin Dashboard"
    }else if(user){
     return  "Dashboard"  
    }else{
      return "Login"
    }
  }
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={getName()}>

        <Stack.Screen
          name="Login"
          component={Login}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={Dashboard}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Deposit"
          component={Deposit}
          options={{ headerShown: true ,headerTitle:'Deposit Amount'}}
        />
          <Stack.Screen
          name="Withdraw"
          component={Withdraw}
          options={{ headerShown: true ,headerTitle:'Withdraw Amount'}}
        />
           <Stack.Screen
          name="History"
          component={History}
          options={{ headerShown: true ,headerTitle:'History'}}
        />
          <Stack.Screen
          name="Profile"
          component={Profile}
          options={{ headerShown: true ,headerTitle:'Profile Settings'}}
        />
           <Stack.Screen
          name="PackagesScreen"
          component={PackagesScreen}
          options={{ headerShown: true ,headerTitle:'Packages List'}}
        />
          <Stack.Screen
          name="Admin Dashboard"
          component={AdminRequest}
          options={{ headerShown: false }}
        />
           <Stack.Screen
          name="Deposit List"
          component={DepositList}
          options={{ headerShown: true ,headerTitle:'Deposits Request'}}
        />
             <Stack.Screen
          name="Withdraw List"
          component={WithdrawList}
          options={{ headerShown: true ,headerTitle:'Withdraw List'}}
        />
             <Stack.Screen
          name="Preview"
          component={Preview}
          options={{ headerShown: true ,headerTitle:'Screenshot'}}
        />
<Stack.Screen
          name="ReferralsList" // Yeh naam 'Profile.js' mein use kiye gaye naam se match hona chahiye
          component={ReferralsList}
          options={{ headerShown: true, headerTitle: 'My Referrals' }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  )
}
