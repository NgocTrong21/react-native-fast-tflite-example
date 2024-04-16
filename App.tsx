/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import {useTensorflowModel} from 'react-native-fast-tflite';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Canvas, useCanvasRef, Circle, Line} from '@shopify/react-native-skia';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useResizePlugin} from 'vision-camera-resize-plugin';
const lines = [
  // left shoulder -> elbow
  [5, 7],
  // right shoulder -> elbow
  [6, 8],
  // left elbow -> wrist
  [7, 9],
  // right elbow -> wrist
  [8, 10],
  // left hip -> knee
  [11, 13],
  // right hip -> knee
  [12, 14],
  // left knee -> ankle
  [13, 15],
  // right knee -> ankle
  [14, 16],
  // left hip -> right hip
  [11, 12],
  // left shoulder -> right shoulder
  [5, 6],
  // left shoulder -> left hip
  [5, 11],
  // right shoulder -> right hip
  [6, 12],
];
function App(): React.JSX.Element {
  const count = React.useRef(0);
  const ref = useCanvasRef();
  const {resize} = useResizePlugin();
  const [posesData, setPoseData] = React.useState();
  const keypoints = [
    {
      name: 'nose',
      value: 0,
    },
    {
      name: 'left eye',
      value: 1,
    },
    {
      name: 'right eye',
      value: 2,
    },
    {
      name: 'left ear',
      value: 3,
    },
    {
      name: 'right ear',
      value: 4,
    },
    {
      name: 'left shoulder',
      value: 5,
    },
    {
      name: 'right shoulder',
      value: 6,
    },
    {
      name: 'left elbow',
      value: 7,
    },

    {
      name: 'right elbow',
      value: 8,
    },
    {
      name: 'left wrist',
      value: 9,
    },
    {
      name: 'right wrist',
      value: 10,
    },
    {
      name: 'left hip',
      value: 11,
    },
    {
      name: 'right hip',
      value: 12,
    },
    {
      name: 'left knee',
      value: 13,
    },
    {
      name: 'right knee',
      value: 14,
    },
    {
      name: 'left ankle',
      value: 15,
    },
    {
      name: 'right ankle',
      value: 16,
    },
  ];
  const objectDetection = useTensorflowModel(require('./assets/4.tflite'));
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const isDarkMode = useColorScheme() === 'dark';
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const handleSetData = Worklets.createRunInJsFn(setPoseData);
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (model) {
        count.current++;
        const resized = resize(frame, {
          scale: {
            width: 192,
            height: 192,
          },
          pixelFormat: 'rgb',
          dataType: 'uint8',
          rotation: '90deg',
        });
        // 2. Run model with given input buffer synchronously
        const outputs = model.runSync([resized]);

        const output = outputs[0];
        // 3. Interpret outputs accordingly
        const posesList = keypoints.map(item => {
          const keyIndex = item.value;
          const x = output[keyIndex * 3];
          const y = output[keyIndex * 3 + 1];
          const score = output[keyIndex * 3 + 2];
          const label = item.name;
          return {
            label,
            x,
            y,
            score,
          };
        });
        if (count.current % 1 === 0) {
          handleSetData(
            keypoints.map(item => {
              const keyIndex = item.value;
              const y = output[keyIndex * 3];
              const x = output[keyIndex * 3 + 1];
              const score = output[keyIndex * 3 + 2];
              const label = item.name;
              return {
                label,
                x,
                y,
                score,
              };
            }),
          );
        }
      }
    },
    [model],
  );
  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <TouchableOpacity onPress={requestPermission}>
            <Text>Request permission</Text>
          </TouchableOpacity>
          {device && hasPermission && (
            <Camera
              frameProcessor={frameProcessor}
              style={styles.camera}
              device={device}
              isActive={true}
            />
          )}
        </View>
        <Canvas style={styles.canvas}>
          {posesData &&
            posesData.map((item, index) => (
              <Circle
                key={index}
                r={4}
                cx={item.x * 300}
                cy={item.y * 300}
                color="red"
              />
            ))}
          {/* {lines.map((item, index) => (
              <Line
                key={index}
                color={'red'}
                p1={{
                  x: posesData[item[0]].x * 192,
                  y: posesData[item[0]].y * 192,
                }}
                p2={{
                  x: posesData[item[1]].x * 192,
                  y: posesData[item[1]].y * 192,
                }}
              />
            ))} */}
        </Canvas>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  camera: {
    width: '100%',
    height: 400,
  },
  canvas: {
    backgroundColor: 'green',
    borderWidth: 1,
    borderColor: 'black',
    width: '100%',
    height: 400,
  },
});

export default App;
