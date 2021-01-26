import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';
import Socket from 'socket.io-client';

const config = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};

export default function ChatScreen({route, navigation}) {
  const [myStream, setMyStream] = useState(null);

  async function getMyStream() {
    const availableDevices = await mediaDevices.enumerateDevices();
    const {
      deviceId: {sourceId},
    } = availableDevices.find(
      (device) =>
        device.kind === 'videoinput' && device.facing === 'environment',
    );

    const streamBuffer = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          // Provide your own width, height and frame rate here
          minWidth: 500,
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode: 'environment',
        optional: [{sourceId}],
      },
    });
    setMyStream(streamBuffer);
  }

  useEffect(() => {
    if (!myStream) {
      getMyStream();
    }
  }, [myStream]);
  return (
    <View style={styles.container}>
      <Text>chat Screen</Text>
      <RTCView
        streamURL={myStream?.toURL()}
        style={styles.myCameraView}
        objectFit="cover"
      />
      <RTCView
        streamURL={myStream?.toURL()}
        style={styles.myCameraView}
        objectFit="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  myCameraView: {
    flex: 1,
    marginVertical: 10,
  },
});
