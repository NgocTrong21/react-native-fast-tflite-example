import React, {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import {useTensorflowModel} from 'react-native-fast-tflite';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useResizePlugin} from 'vision-camera-resize-plugin';
import {Svg, Circle, Line} from 'react-native-svg';

const MIN_SCORE = 0.2;
const widthPreview = 400;
const heightPreview = widthPreview / (3 / 4);
// const heightPreview = Dimensions.get('window').height;
// const heightPreview = 200;
// const widthPreview = heightPreview / (4 / 3);

const BODY_PARTS = {
  Head: 0,
  Neck: 1,
  'right shoulder': 2,
  'right elbow': 3,
  'right wrist': 4,
  'left shoulder': 5,
  'left elbow': 6,
  'left wrist': 7,
  'right hip': 8,
  'right knee': 9,
  'right ankle': 10,
  'left hip': 11,
  'left knee': 12,
  'left ankle': 13,
  Chest: 14,
};

const connection_angle_check = [
  [
    [1, 5],
    [5, 6],
  ],
  [
    [1, 2],
    [2, 3],
  ],
  [
    [1, 14],
    [14, 9],
  ],
  [
    [1, 14],
    [14, 12],
  ],
  [
    [14, 12],
    [12, 13],
  ],
  [
    [14, 9],
    [9, 10],
  ],
  [
    [5, 6],
    [6, 7],
  ],
  [
    [2, 3],
    [3, 4],
  ],
];

const thirtyThreeKPs = [
  {
    value: 0,
    name: 'nose',
  },
  {
    value: 1,
    name: 'left eye (inner)',
  },
  {
    value: 2,
    name: 'left eye',
  },
  {
    value: 3,
    name: 'left eye (outer)',
  },
  {
    value: 4,
    name: 'right eye (inner)',
  },
  {
    value: 5,
    name: 'right eye',
  },
  {
    value: 6,
    name: 'right eye (outer)',
  },
  {
    value: 7,
    name: 'left ear',
  },
  {
    value: 8,
    name: 'right ear',
  },
  {
    value: 9,
    name: 'mouth (left)',
  },
  {
    value: 10,
    name: 'mouth (right)',
  },
  {
    value: 11,
    name: 'left shoulder',
  },
  {
    value: 12,
    name: 'right shoulder',
  },
  {
    value: 13,
    name: 'left elbow',
  },
  {
    value: 14,
    name: 'right elbow',
  },
  {
    value: 15,
    name: 'left wrist',
  },
  {
    value: 16,
    name: 'right wrist',
  },
  {
    value: 17,
    name: 'left pinky',
  },
  {
    value: 18,
    name: 'right pinky',
  },
  {
    value: 19,
    name: 'left index',
  },
  {
    value: 20,
    name: 'right index',
  },
  {
    value: 21,
    name: 'left thumb',
  },
  {
    value: 22,
    name: 'right thumb',
  },
  {
    value: 23,
    name: 'left hip',
  },
  {
    value: 24,
    name: 'right hip',
  },
  {
    value: 25,
    name: 'left knee',
  },
  {
    value: 26,
    name: 'right knee',
  },
  {
    value: 27,
    name: 'left ankle',
  },
  {
    value: 28,
    name: 'right ankle',
  },
  {
    value: 29,
    name: 'left heel',
  },
  {
    value: 30,
    name: 'right heel',
  },
  {
    value: 31,
    name: 'left foot',
  },
  {
    value: 32,
    name: 'right foot',
  },
];
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

const pose2 = [
  {
    label: 'nose',
    visibility: 7.838909149169922,
    x: 182,
    y: 105,
  },
  {
    label: 'left eye (inner)',
    visibility: 7.11323356628418,
    x: 184,
    y: 99,
  },
  {
    label: 'left eye',
    visibility: 6.9566802978515625,
    x: 186,
    y: 99,
  },
  {
    label: 'left eye (outer)',
    visibility: 7.017066955566406,
    x: 188,
    y: 99,
  },
  {
    label: 'right eye (inner)',
    visibility: 7.083850860595703,
    x: 178,
    y: 100,
  },
  {
    label: 'right eye',
    visibility: 6.821550369262695,
    x: 177,
    y: 100,
  },
  {
    label: 'right eye (outer)',
    visibility: 6.86175537109375,
    x: 174,
    y: 101,
  },
  {
    label: 'left ear',
    visibility: 6.382049560546875,
    x: 192,
    y: 104,
  },
  {
    label: 'right ear',
    visibility: 6.532876968383789,
    x: 172,
    y: 107,
  },
  {
    label: 'mouth (left)',
    visibility: 6.294857025146484,
    x: 186,
    y: 114,
  },
  {
    label: 'mouth (right)',
    visibility: 6.288278579711914,
    x: 179,
    y: 115,
  },
  {
    label: 'left shoulder',
    visibility: 6.017578125,
    x: 211,
    y: 148,
  },
  {
    label: 'right shoulder',
    visibility: 5.098365783691406,
    x: 156,
    y: 150,
  },
  {
    label: 'left elbow',
    visibility: 3.767559051513672,
    wrongPose: true,
    x: 255,
    y: 147,
  },
  {
    label: 'right elbow',
    visibility: 3.7668867111206055,
    wrongPose: true,
    x: 117,
    y: 154,
  },
  {
    label: 'left wrist',
    visibility: 2.630316734313965,
    wrongPose: true,
    x: 289,
    y: 149,
  },
  {
    label: 'right wrist',
    visibility: 2.915287971496582,
    x: 78,
    y: 153,
  },
  {
    label: 'left pinky',
    visibility: 1.6985080242156982,
    x: 300,
    y: 149,
  },
  {
    label: 'right pinky',
    visibility: 2.1021389961242676,
    x: 67,
    y: 152,
  },
  {
    label: 'left index',
    visibility: 1.7502710819244385,
    x: 298,
    y: 148,
  },
  {
    label: 'right index',
    visibility: 2.2081737518310547,
    x: 67,
    y: 152,
  },
  {
    label: 'left thumb',
    visibility: 1.8680357933044434,
    x: 293,
    y: 150,
  },
  {
    label: 'right thumb',
    visibility: 2.269287586212158,
    x: 72,
    y: 154,
  },
  {
    label: 'left hip',
    visibility: 6.595815658569336,
    x: 200,
    y: 266,
  },
  {
    label: 'right hip',
    visibility: 6.324785232543945,
    x: 171,
    y: 266,
  },
  {
    label: 'left knee',
    visibility: 3.022153854370117,
    wrongPose: true,
    x: 200,
    y: 343,
  },
  {
    label: 'right knee',
    visibility: 2.8008313179016113,
    wrongPose: true,
    x: 179,
    y: 344,
  },
  {
    label: 'left ankle',
    visibility: 2.88258695602417,
    wrongPose: true,
    x: 199,
    y: 407,
  },
  {
    label: 'right ankle',
    visibility: 2.5874342918395996,
    wrongPose: true,
    x: 187,
    y: 405,
  },
  {
    label: 'left heel',
    visibility: 1.2649025917053223,
    x: 196,
    y: 415,
  },
  {
    label: 'right heel',
    visibility: 1.006917953491211,
    x: 191,
    y: 413,
  },
  {
    label: 'left foot',
    visibility: 2.6677756309509277,
    x: 203,
    y: 434,
  },
  {
    label: 'right foot',
    visibility: 2.3985981941223145,
    x: 185,
    y: 433,
  },
];
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
  [30, 32],
];

function App(): React.JSX.Element {
  const count = React.useRef(0);
  const {resize} = useResizePlugin();
  const [posesData, setPoseData] = useState<any[]>();
  const [scorePoint, setScorePoint] = useState();

  const REVERSE_BODY_PART = {};
  for (const key in BODY_PARTS) {
    const value = BODY_PARTS[key];
    REVERSE_BODY_PART[value] = key;
  }

  function convertPoseDataToCoordinates(poseData: any[]): [number, number][] {
    return poseData.map(point => [point.x, point.y]);
  }

  function calculate_angle(P1, P2, P3) {
    const result =
      Math.atan2(P3[1] - P1[1], P3[0] - P1[0]) -
      Math.atan2(P2[1] - P1[1], P2[0] - P1[0]);
    return result * (180 / Math.PI);
  }

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

    const pose1Coordinates: [number, number][] =
      convertPoseDataToCoordinates(result);
    const pose2Coordinates: [number, number][] =
      convertPoseDataToCoordinates(pose2);

    const wrongPoseArray = find_error(pose1Coordinates, pose2Coordinates, 10);
    const newPoseData = result.map(item => {
      if (wrongPoseArray.includes(item.label)) {
        return {
          ...item,
          wrongPose: true,
        };
      }
      return item;
    });

    setPoseData(newPoseData);
  };

  const find_error = (pose1, pose2, threshold) => {
    const lst_error = [];
    for (let i = 0; i < connection_angle_check.length; i++) {
      const angle1 = calculate_angle(
        pose1[connection_angle_check[i][0][1]],
        pose1[connection_angle_check[i][0][0]],
        pose1[connection_angle_check[i][1][1]],
      );
      const angle2 = calculate_angle(
        pose2[connection_angle_check[i][0][1]],
        pose2[connection_angle_check[i][0][0]],
        pose2[connection_angle_check[i][1][1]],
      );

      if (Math.abs(angle1 - angle2) > threshold) {
        lst_error.push(REVERSE_BODY_PART[connection_angle_check[i][1][1]]);
      }
    }
    return lst_error;
  };

  const setScoreDistance = (pose1: any[]) => {
    const pose1Coordinates: [number, number][] =
      convertPoseDataToCoordinates(pose1);
    const pose2Coordinates: [number, number][] =
      convertPoseDataToCoordinates(pose2);

    const maxPose1X = Math.max(...pose1Coordinates.map(([x, y]) => x));
    const maxPose1Y = Math.max(...pose1Coordinates.map(([x, y]) => y));
    const maxPose2X = Math.max(...pose2Coordinates.map(([x, y]) => x));
    const maxPose2Y = Math.max(...pose2Coordinates.map(([x, y]) => y));

    const normalizedPose1 = pose1Coordinates.map(([x, y]) => ({
      x: x / maxPose1X,
      y: y / maxPose1Y,
    }));
    const normalizedPose2 = pose2Coordinates.map(([x, y]) => ({
      x: x / maxPose2X,
      y: y / maxPose2Y,
    }));

    let p1 = [];
    let p2 = [];

    for (let joint = 0; joint < pose1Coordinates.length; joint++) {
      const x1 = normalizedPose1[joint].x;
      const y1 = normalizedPose1[joint].y;
      const x2 = normalizedPose2[joint].x;
      const y2 = normalizedPose2[joint].y;

      p1.push(x1, y1);
      p2.push(x2, y2);
    }

    const dotProduct = (pose1, pose2) => {
      let sum = 0;
      for (let i = 0; i < pose1.length; i++) {
        sum += pose1[i] * pose2[i];
      }
      return sum;
    };

    const norm = poseNorm => {
      let sumOfSquares = 0;
      for (let i = 0; i < poseNorm.length; i++) {
        sumOfSquares += poseNorm[i] * poseNorm[i];
      }
      return Math.sqrt(sumOfSquares);
    };

    const cosine_distance = (poseCor1, poseCor2) => {
      const dotProd = dotProduct(poseCor1, poseCor2);

      const lengthPose1 = norm(poseCor1);
      const lengthPose2 = norm(poseCor2);

      const cossim = dotProd / (lengthPose1 * lengthPose2);

      const cosdist = 1 - cossim;

      return cosdist;
    };

    setScorePoint(cosine_distance(p1, p2));
  };

  function getWidth() {
    return Dimensions.get('window').width;
  }

  function getHeight() {
    return Dimensions.get('window').height;
  }

  const objectDetection = useTensorflowModel(
    require('./assets/pose_landmark_lite.tflite'),
  );
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const isDarkMode = useColorScheme() === 'dark';
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('front');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  const handleSetCoordinate = Worklets.createRunInJsFn(setCordinate);
  const handleCalcScoreDistance = Worklets.createRunInJsFn(setScoreDistance);

  function isValidNormalizedValue(value: number): boolean {
    return value >= 0 && value <= 1;
  }

  const normalizedToPixelCoordinates = (
    normalizedX: number,
    normalizedY: number,
    imageWidth: number,
    imageHeight: number,
  ): Tuple | null => {
    if (
      !isValidNormalizedValue(normalizedX) ||
      !isValidNormalizedValue(normalizedY)
    ) {
      return null;
    }
    const x: number = Math.min(
      Math.floor(normalizedX * imageWidth),
      imageWidth - 1,
    );
    const y: number = Math.min(
      Math.floor(normalizedY * imageHeight),
      imageHeight - 1,
    );

    return {x, y};
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
          rotation: '270deg',
          mirror: true,
        });
        // 2. Run model with given input buffer synchronously

        if (count.current % 5 === 0) {
          const outputs = model.runSync([resized]);

          const output = outputs[0];
          // 3. Interpret outputs accordingly
          // const posesList = keypoints.map(item => {
          //   const keyIndex = item.value;
          //   const x = output[keyIndex * 3];
          //   const y = output[keyIndex * 3 + 1];
          //   const score = output[keyIndex * 3 + 2];
          //   const label = item.name;
          //   return {
          //     label,
          //     x,
          //     y,
          //     score,
          //   };
          // });
          // console.log(outputs[1]);

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
              // x: y,
              // y: x,
              visibility,
            };
          });
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
          handleSetCoordinate(data);
          handleCalcScoreDistance(data);
          // handleDetectWrongPose(data);
        }
      }
    },
    [model],
  );

  const format = useCameraFormat(device, [
    {videoAspectRatio: 4 / 3},
    {videoResolution: {width: getWidth(), height: getHeight()}},
  ]);

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
          {device && hasPermission && (
            <Camera
              frameProcessor={frameProcessor}
              style={styles.camera}
              device={device}
              isActive={true}
              format={format}
            />
          )}
          <Svg
            // width={widthPreview}
            // height={heightPreview}
            style={styles.canvas}
            // viewBox={`-${widthPreview} 0 ${widthPreview} ${heightPreview}`}
          >
            {/* {posesData &&
             posesData.filter(item => item.score > MIN_SCORE).map((item, index) => (
               <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
             ))} */}
            {posesData &&
              posesData.map((item, index) => (
                <Circle
                  key={index}
                  r={5}
                  // cx={heightPreview - (item.y || 0)}
                  // cy={item.x}
                  cx={item.x}
                  cy={item.y}
                  fill={item.wrongPose ? 'red' : 'green'}
                />
                // <Circle
                //   key={index}
                //   r={5}
                //   cx={item.x}
                //   cy={item.y}
                //   fill={item.wrongPose ? 'red' : 'green'}
                // />
              ))}
            {posesData &&
              connections.map((item, index) => {
                // if (posesData[item[0]].score > MIN_SCORE && posesData[item[1]].score > MIN_SCORE) {
                if (true) {
                  return (
                    <Line
                      key={`skeletonkp_${index}`}
                      // x1={heightPreview - (posesData[item[0]].y || 0)}
                      x1={posesData[item[0]].x}
                      y1={posesData[item[0]].y}
                      x2={posesData[item[1]].x}
                      // x2={heightPreview - (posesData[item[1]].y || 0)}
                      y2={posesData[item[1]].y}
                      stroke="green"
                      strokeWidth="2"
                    />
                    // <Line
                    //   key={`skeletonkp_${index}`}
                    //   x1={posesData[item[0]].x}
                    //   y1={posesData[item[0]].y}
                    //   x2={posesData[item[1]].x}
                    //   y2={posesData[item[1]].y}
                    //   stroke="green"
                    //   strokeWidth="2"
                    // />
                  );
                }
                // else {
                //   return <></>
                // }
              })}
          </Svg>
        </View>
        {/* <Text style={{alignSelf: 'center'}}>{scorePoint}</Text>
        <View style={{backgroundColor: 'green'}}>
          <Svg style={{height: 200, width: 200}}>
            {pose2 &&
              pose2.map((item, index) => (
                <Circle
                  key={index}
                  r={2}
                  cx={(item.x / 256) * 100}
                  cy={(item.y / 256) * 100}
                  fill={'red'}
                />
              ))}
            {pose2 &&
              connections.map((item, index) => {
                if (true) {
                  return (
                    <Line
                      key={`skeletonkp_${index}`}
                      x1={(pose2[item[0]].x / 256) * 100}
                      y1={(pose2[item[0]].y / 256) * 100}
                      x2={(pose2[item[1]].x / 256) * 100}
                      y2={(pose2[item[1]].y / 256) * 100}
                      stroke="red"
                      strokeWidth="2"
                    />
                  );
                }
              })}
          </Svg>
        </View> */}
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
    position: 'absolute',
    // backgroundColor: 'green',
    width: widthPreview,
    height: heightPreview,
  },
});

export default App;
