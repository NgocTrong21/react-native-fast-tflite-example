/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Svg, Circle, Line } from 'react-native-svg';

interface Coordinate {
  label: string;
  score: number;
  x: number;
  y: number;
}

const MIN_SCORE = 0.3;
const widthPreview = 400;
const heightPreview = widthPreview / (3 / 4)
// const heightPreview = 650;


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
  const { resize } = useResizePlugin();
  const [posesData, setPoseData] = useState<Coordinate[]>();
  const setCordinate = (poseData: Coordinate[]) => {
    const result = poseData.map(pose => {
      const coordinate = normalizedToPixelCoordinates(
        pose.x,
        pose.y,
        widthPreview,
        heightPreview,
      );
      return {
        ...pose,
        x: coordinate?.x,
        y: coordinate?.y,
      };
    });
    setPoseData(result);
  };

  //   "check normile",
  // const mockData = { "0": { "label": "nose", "score": 0.5694627165794373, "x": 0.4875256419181824, "y": 0.24990808963775635 }, "1": { "label": "left eye", "score": 0.4998161792755127, "x": 0.4998161792755127, "y": 0.24581123888492584 }, "10": { "label": "right wrist", "score": 0.4998161792755127, "x": 0.27039235830307007, "y": 0.4137822687625885 }, "11": { "label": "left hip", "score": 0.6350123882293701, "x": 0.5121067762374878, "y": 0.5325910449028015 }, "12": { "label": "right hip", "score": 0.6350123882293701, "x": 0.44655707478523254, "y": 0.5325910449028015 }, "13": { "label": "left knee", "score": 0.843951940536499, "x": 0.5448815822601318, "y": 0.700562059879303 }, "14": { "label": "right knee", "score": 0.4301696717739105, "x": 0.4178791046142578, "y": 0.6923683285713196 }, "15": { "label": "left ankle", "score": 0.4998161792755127, "x": 0.5448815822601318, "y": 0.8357582092285156 }, "16": { "label": "right ankle", "score": 0.7538211345672607, "x": 0.3892011344432831, "y": 0.8398550748825073 }, "2": { "label": "right eye", "score": 0.4301696717739105, "x": 0.47523507475852966, "y": 0.24171438813209534 }, "3": { "label": "left ear", "score": 0.6350123882293701, "x": 0.5203004479408264, "y": 0.24990808963775635 }, "4": { "label": "right ear", "score": 0.6350123882293701, "x": 0.45884764194488525, "y": 0.24581123888492584 }, "5": { "label": "left shoulder", "score": 0.5694627165794373, "x": 0.5653658509254456, "y": 0.33184516429901123 }, "6": { "label": "right shoulder", "score": 0.700562059879303, "x": 0.4301696717739105, "y": 0.34003889560699463 }, "7": { "label": "left elbow", "score": 0.4301696717739105, "x": 0.6309155225753784, "y": 0.3932979702949524 }, "8": { "label": "right elbow", "score": 0.36462000012397766, "x": 0.33594202995300293, "y": 0.37691056728363037 }, "9": { "label": "left wrist", "score": 0.4998161792755127, "x": 0.7087557315826416, "y": 0.45884764194488525 } }
  // console.log(
  //   "check normile",
  //   Object.values(mockData)?.map((item) => {
  //     const coordinate = normalizedToPixelCoordinates(item.x, item.y, 192, 192);
  //     return {
  //       ...item,
  //       x: coordinate?.x,
  //       y: coordinate?.y,
  //     };
  //   })
  // );
  // console.log('check mockdata', Object.values(mockData));

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

  function getWidth() {
    return Dimensions.get('window').width;
  }
  // console.log(getHeight(), getWidth());

  function getHeight() {
    return Dimensions.get('window').height;
  }

  const objectDetection = useTensorflowModel(require('./assets/light-single-unit8.tflite'));
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const isDarkMode = useColorScheme() === 'dark';
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const handleSetCordinate = Worklets.createRunInJsFn(setCordinate);
  function isValidNormalizedValue(value: number): boolean {
    return value >= 0 && value <= 1;
  }

  const normalizedToPixelCoordinates = (
    normalizedX: number,
    normalizedY: number,
    imageWidth: number,
    imageHeight: number
  ): Tuple | null => {
    if (
      !isValidNormalizedValue(normalizedX) ||
      !isValidNormalizedValue(normalizedY)
    ) {
      return null;
    }
    const x: number = Math.min(
      Math.floor(normalizedX * imageWidth),
      imageWidth - 1
    );
    const y: number = Math.min(
      Math.floor(normalizedY * imageHeight),
      imageHeight - 1
    );

    return { x, y };
  };
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

        // console.log(posesList);

        if (count.current % 1 === 0) {

          const data = keypoints.map(item => {
            const keyIndex = item.value;
            const y = output[keyIndex * 3];
            const x = output[keyIndex * 3 + 1];
            const score = output[keyIndex * 3 + 2];
            const label = item.name;
            return {
              label,
              x: x,
              y: y,
              score,
            };
          });
          // console.log("check pose", data);
          handleSetCordinate(data);
        }
      }
    },
    [model],
  );
  // const dataDraw = Object.values(mockData).map(pose => {
  //   const coordinate = normalizedToPixelCoordinates(
  //     pose.x,
  //     pose.y,
  //     widthPreview,
  //     heightPreview,
  //   );
  //   return {
  //     ...pose,
  //     x: coordinate?.x,
  //     y: coordinate?.y,
  //   };
  // })
  // console.log(dataDraw);

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
            // borderWidth: 1,
            // borderColor: 'blue',
            // height: 300
          }}>
          {device && hasPermission && (
            <Camera
              frameProcessor={frameProcessor}
              style={styles.camera}
              device={device}
              isActive={true}
            />
          )}
          <Svg style={styles.canvas}>
            {posesData &&
              posesData.filter(item => item.score > MIN_SCORE).map((item, index) => (
                <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
              ))}
            {posesData && lines.map((item, index) => {
              if (posesData[item[0]].score > MIN_SCORE && posesData[item[1]].score > MIN_SCORE) {
                return <Line
                  key={`skeletonkp_${index}`}
                  x1={posesData[item[0]].x}
                  y1={posesData[item[0]].y}
                  x2={posesData[item[1]].x}
                  y2={posesData[item[1]].y}
                  stroke="red"
                  strokeWidth="2"
                />
              } else {
                return <></>
              }
            })}
            {/* {dataDraw &&
              dataDraw.map((item, index) => (
                <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
              ))} */}
            {/* <Circle r={5} cx={192} cy={96} fill="red" /> */}
          </Svg>

        </View>
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
    // width: Dimensions.get("window").width,
    // height: Dimensions.get("window").height,
    width: widthPreview,
    height: heightPreview,
  },
  canvas: {
    // width: Dimensions.get("window").width,
    // height: Dimensions.get("window").height,
    width: widthPreview,
    height: heightPreview,
    position: 'absolute',
    // backgroundColor: 'green',
  },
});

export default App;
