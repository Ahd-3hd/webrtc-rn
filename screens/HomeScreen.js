import * as React from 'react';
import {Button, View, Text} from 'react-native';
import {v1 as uuid} from 'uuid';

export default function HomeScreen({navigation}) {
  function create() {
    const id = uuid();
    navigation.navigate('Chat', {
      roomId: id,
    });
  }
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>Home Screen</Text>
      <Button title="Call" onPress={create} />
    </View>
  );
}
