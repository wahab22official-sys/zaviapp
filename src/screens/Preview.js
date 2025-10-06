import { useRoute } from '@react-navigation/native'
import React from 'react'
import { Image, View } from 'react-native'

export default function Preview() {
    const route = useRoute();
    const { url } = route.params;
    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            <Image
                source={{ uri: url }}
                style={{
                    width: '100%', height: '100%', resizeMode:
                        'contain',
                }}
            />
        </View>
    )
}
