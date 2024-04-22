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


const MIN_SCORE = 0.2;
const widthPreview = 400;
const heightPreview = widthPreview / (3 / 4)
// const heightPreview = 650;

const mockData = [{ "label": "nose", "x": 115.11781311035156, "y": 69.2735366821289, "visibility": 7.786510467529297 }, { "label": "left eye (inner)", "x": 117.11173248291016, "y": 66.149169921875, "visibility": 7.15110969543457 }, { "label": "left eye", "x": 118.49406433105469, "y": 66.09146118164062, "visibility": 7.19182014465332 }, { "label": "left eye (outer)", "x": 119.88842010498047, "y": 66.02476501464844, "visibility": 7.241447448730469 }, { "label": "right eye (inner)", "x": 112.9404067993164, "y": 66.32771301269531, "visibility": 7.040950775146484 }, { "label": "right eye", "x": 111.59474182128906, "y": 66.41612243652344, "visibility": 6.916189193725586 }, { "label": "right eye (outer)", "x": 110.17066955566406, "y": 66.50711822509766, "visibility": 6.885768890380859 }, { "label": "left ear", "x": 121.97823333740234, "y": 68.0833740234375, "visibility": 6.20179557800293 }, { "label": "right ear", "x": 108.23875427246094, "y": 68.78524780273438, "visibility": 5.862205505371094 }, { "label": "mouth (left)", "x": 117.78180694580078, "y": 73.22422790527344, "visibility": 6.619785308837891 }, { "label": "mouth (right)", "x": 112.69783020019531, "y": 73.46903991699219, "visibility": 6.581962585449219 }, { "label": "left shoulder", "x": 133.01141357421875, "y": 89.26144409179688, "visibility": 7.550946235656738 }, { "label": "right shoulder", "x": 98.84265899658203, "y": 90.84437561035156, "visibility": 6.287145614624023 }, { "label": "left elbow", "x": 139.37359619140625, "y": 114.43936157226562, "visibility": 2.3933184146881104 }, { "label": "right elbow", "x": 94.48929595947266, "y": 115.41105651855469, "visibility": 1.7618932723999023 }, { "label": "left wrist", "x": 145.25955200195312, "y": 119.6184310913086, "visibility": 1.6540398597717285 }, { "label": "right wrist", "x": 88.4402847290039, "y": 131.4965057373047, "visibility": 1.2095909118652344 }, { "label": "left pinky", "x": 147.65736389160156, "y": 121.41748046875, "visibility": 1.2456822395324707 }, { "label": "right pinky", "x": 85.57634735107422, "y": 136.2553253173828, "visibility": 0.8248107433319092 }, { "label": "left index", "x": 147.76097106933594, "y": 119.48204040527344, "visibility": 1.3115043640136719 }, { "label": "right index", "x": 85.78311157226562, "y": 135.89517211914062, "visibility": 0.9136450290679932 }, { "label": "left thumb", "x": 145.70196533203125, "y": 118.9479751586914, "visibility": 1.1950621604919434 }, { "label": "right thumb", "x": 88.06477355957031, "y": 134.07843017578125, "visibility": 0.8424391746520996 }, { "label": "left hip", "x": 128.9589080810547, "y": 140.26382446289062, "visibility": 7.022780418395996 }, { "label": "right hip", "x": 109.67875671386719, "y": 141.279541015625, "visibility": 7.076730728149414 }, { "label": "left knee", "x": 129.8560333251953, "y": 174.26626586914062, "visibility": 3.8763699531555176 }, { "label": "right knee", "x": 112.7680435180664, "y": 176.15322875976562, "visibility": 3.9896492958068848 }, { "label": "left ankle", "x": 127.99787902832031, "y": 201.25442504882812, "visibility": 3.251615524291992 }, { "label": "right ankle", "x": 116.05984497070312, "y": 208.302490234375, "visibility": 3.803788185119629 }, { "label": "left heel", "x": 126.39088439941406, "y": 204.08071899414062, "visibility": 1.134227991104126 }, { "label": "right heel", "x": 118.85880279541016, "y": 212.39181518554688, "visibility": 1.6516304016113281 }, { "label": "left foot", "x": 128.07989501953125, "y": 215.5888214111328, "visibility": 3.137971878051758 }, { "label": "right foot", "x": 113.0411376953125, "y": 222.00657653808594, "visibility": 3.596223831176758 }]
const connections = [
  [0, 4],
  [1, 2],
  [2, 3],
  [3, 7],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
  [11, 12],
  [11, 13],
  [11, 23],
  [12, 14],
  [12, 24],
  [13, 15],
  [14, 16],
  [15, 17],
  [15, 19],
  [15, 21],
  [16, 18],
  [16, 20],
  [16, 22],
  [17, 19],
  [18, 20],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [27, 31],
  [28, 30],
  [28, 32],
  [29, 31],
  [30, 32]
]
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
  const [posesData, setPoseData] = useState<any[]>();
  const setCordinate = (poseData: any[]) => {
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
  // console.log(posesData);

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
  const thirtyThreeKPs = [{
    value: 0,
    name: "nose"
  }, {
    value: 1,
    name: "left eye (inner)"
  }, {
    value: 2,
    name: "left eye"
  }, {
    value: 3,
    name: "left eye (outer)"
  }, {
    value: 4,
    name: "right eye (inner)"
  }, {
    value: 5,
    name: "right eye"
  }, {
    value: 6,
    name: "right eye (outer)"
  }, {
    value: 7,
    name: "left ear"
  }, {
    value: 8,
    name: "right ear"
  }, {
    value: 9,
    name: "mouth (left)"
  }, {
    value: 10,
    name: "mouth (right)"
  }, {
    value: 11,
    name: "left shoulder"
  }, {
    value: 12,
    name: "right shoulder"
  }, {
    value: 13,
    name: "left elbow"
  }, {
    value: 14,
    name: "right elbow"
  }, {
    value: 15,
    name: "left wrist"
  }, {
    value: 16,
    name: "right wrist"
  }, {
    value: 17,
    name: "left pinky"
  }, {
    value: 18,
    name: "right pinky"
  }, {
    value: 19,
    name: "left index"
  }, {
    value: 20,
    name: "right index"
  }, {
    value: 21,
    name: "left thumb"
  }, {
    value: 22,
    name: "right thumb"
  }, {
    value: 23,
    name: "left hip"
  }, {
    value: 24,
    name: "right hip"
  }, {
    value: 25,
    name: "left knee"
  }, {
    value: 26,
    name: "right knee"
  }, {
    value: 27,
    name: "left ankle"
  }, {
    value: 28,
    name: "right ankle"
  }, {
    value: 29,
    name: "left heel"
  }, {
    value: 30,
    name: "right heel"
  }, {
    value: 31,
    name: "left foot"
  }, {
    value: 32,
    name: "right foot"
  }]
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

  const objectDetection = useTensorflowModel(require('./assets/pose_landmark_lite.tflite'));
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const isDarkMode = useColorScheme() === 'dark';
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const handleSetCordinate = Worklets.createRunInJsFn(setCordinate);
  // const handleSetCordinate = Worklets.createRunInJsFn(setPoseData);
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
            width: 256,
            height: 256,
          },
          pixelFormat: 'rgb',
          dataType: 'float32',
          rotation: '90deg',
        });
        // 2. Run model with given input buffer synchronously

        if (count.current % 20 === 0) {
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
          console.log(outputs[1]);

          // console.log('checkoutputs', JSON.stringify(output.slice(0, 165)));
          const data = thirtyThreeKPs.map(item => {
            const keyIndex = item.value;
            const x = (output[keyIndex * 5] as number) / 256;
            const y = (output[keyIndex * 5 + 1] as number) / 256;
            const visibility = output[keyIndex * 5 + 3];
            const label = item.name;
            return {
              label,
              x: x,
              y: y,
              visibility,
            };
          })
          // console.log('check data', JSON.stringify(data));

          // const data = keypoints.map(item => {
          //   const keyIndex = item.value;
          //   const y = output[keyIndex * 3];
          //   const x = output[keyIndex * 3 + 1];
          //   const score = output[keyIndex * 3 + 2];
          //   const label = item.name;
          //   return {
          //     label,
          //     x: x,
          //     y: y,
          //     score,
          //   };
          // });
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
  // console.log(JSON.stringify(posesData));

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
            {/* {posesData &&
              posesData.filter(item => item.score > MIN_SCORE).map((item, index) => (
                <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
              ))} */}
            {posesData &&
              posesData.map((item, index) => (
                <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
              ))}
            {posesData && connections.map((item, index) => {
              // if (posesData[item[0]].score > MIN_SCORE && posesData[item[1]].score > MIN_SCORE) {
              if (true) {
                return <Line
                  key={`skeletonkp_${index}`}
                  x1={posesData[item[0]].x}
                  y1={posesData[item[0]].y}
                  x2={posesData[item[1]].x}
                  y2={posesData[item[1]].y}
                  stroke="red"
                  strokeWidth="2"
                />
              }
              // else {
              //   return <></>
              // }
            })}
            {/* {mockData &&
              mockData.map((item, index) => (
                <Circle key={index} r={3} cx={item.x} cy={item.y} fill="red" />
              ))}
            {mockData && connections.map((item, index) => {
              if (true) {
                return <Line
                  key={`skeletonkp_${index}`}
                  x1={mockData[item[0]].x}
                  y1={mockData[item[0]].y}
                  x2={mockData[item[1]].x}
                  y2={mockData[item[1]].y}
                  stroke="red"
                  strokeWidth="2"
                />
              } else {
                return <></>
              }
            })} */}
            {/* <Circle r={5} cx={0} cy={0} fill="red" /> */}
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
    // width: widthPreview,
    // height: 300,
    position: 'absolute',
    // backgroundColor: 'green',
  },
});

export default App;
