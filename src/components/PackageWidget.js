import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PackageWidget = ({ currentPackage }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('PackagesScreen')}
    >
      <View style={styles.header}>
        <View style={styles.row}>
          <FontAwesome5 name="box-open" size={20} color="#fff" />
          <Text style={styles.heading}>Active Package</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </View>

      {currentPackage ? (
        <>
          <Text style={styles.name}>{currentPackage.name}</Text>
          <Text style={styles.detail}>💵 Amount: ${currentPackage.amount}</Text>
          <Text style={styles.detail}>📈 Daily Profit: {currentPackage.profit}%</Text>
        </>
      ) : (
        <Text style={styles.noPackage}>No package subscribed. Tap to view packages.</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    color: '#fff',
  },
  detail: {
    fontSize: 14,
    marginTop: 2,
    color: '#e0e0e0',
  },
  noPackage: {
    fontSize: 14,
    color: '#f1f1f1',
    marginTop: 5,
  },
});

export default PackageWidget;
