/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useRef, useState, useEffect} from 'react';
import Socket from 'socket.io-client';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {
  RTCView,
  RTCPeerConnection,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';
const config = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302'],
    },
  ],
};
const App = () => {
  const peerConnections = useRef(new Map());
  const [stream, setStream] = useState(null);
  const [socket] = useState(Socket.connect('ws://localhost:8080'));

  useEffect(() => {
    socket.on('connect', () => {
      if (stream) socket.emit('broadcaster');

      socket.on('watcher', async (id) => {
        const connectionBuffer = new RTCPeerConnection(config);

        stream.getTracks.forEach((track) =>
          connectionBuffer.addTrack(track, stream),
        );

        connectionBuffer.onicecandidate = ({candidate}) => {
          if (candidate) socket.emit('candidate', id, candidate);
        };

        const localDescription = await connectionBuffer.createOffer();

        await connectionBuffer.setLocalDescription(localDescription);

        socket.emit('offer', id, connectionBuffer.localDescription);

        peerConnections.current.set(id, connectionBuffer);
      });

      socket.on('candidate', (id, candidate) => {
        const candidateBuffer = new RTCIceCandidate(candidate);
        const connectionBuffer = peerConnections.current.get(id);

        connectionBuffer.addIceCandidate(candidateBuffer);
      });

      socket.on('answer', (id, remoteOfferDescription) => {
        const connectionBuffer = peerConnections.current.get(id);

        connectionBuffer.setRemoteDescription(remoteOfferDescription);
      });

      socket.on('disconnectPeer', (id) => {
        peerConnections.current.get(id).close();
        peerConnections.current.delete(id);
      });
    });

    return () => {
      if (socket.connected) socket.close(); // close the socket if the view is unmounted
    };
  }, [socket, stream]);

  useEffect(() => {
    if (!stream) {
      (async () => {
        const availableDevices = await mediaDevices.enumerateDevices();
        const {deviceId: sourceId} = availableDevices.find(
          // once we get the stream we can just call .switchCamera() on the track to switch without re-negotiating
          // ref: https://github.com/react-native-webrtc/react-native-webrtc#mediastreamtrackprototype_switchcamera
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

        setStream(streamBuffer);
      })();
    }
  }, [stream]);
  const handleSwithCamera = () => {
    stream.getVideoTracks().forEach((track) => {
      console.log(track);
      track._switchCamera();
    });
  };
  return (
    <>
      <StatusBar hidden />
      <View style={styles.container}>
        <RTCView
          streamURL={stream?.toURL()}
          style={styles.myCameraView}
          objectFit="cover"
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSwithCamera}>
            <Text style={styles.buttonText}>Switch Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  myCameraView: {
    flex: 2,
  },
  buttonContainer: {
    flex: 1,
    marginVertical: 20,
  },
  button: {
    height: 40,
    justifyContent: 'center',
    backgroundColor: '#037ffc',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
export default App;
