import React, {useState} from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
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
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useResizePlugin} from 'vision-camera-resize-plugin';
import {Svg, Circle} from 'react-native-svg';

interface Tuple {
  x: number;
  y: number;
}

interface Coordinate {
  label: string;
  score: number;
  x: number;
  y: number;
}

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
  const {resize} = useResizePlugin();
  const [posesData, setPoseData] = useState<Coordinate[]>();

  const setCordinate = (poseData: Coordinate[]) => {
    const result = poseData.map(pose => {
      const coordinate = normalizedToPixelCoordinates(
        pose.x,
        pose.y,
        getWidth(),
        getHeight(),
      );
      return {
        ...pose,
        x: coordinate?.x,
        y: coordinate?.y,
      };
    });
    setPoseData(result);
  };

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

  function convertPoseDataToCoordinates(
    poseData: Coordinate[],
  ): [number, number][] {
    return poseData.map(point => [point.x, point.y]);
  }

  const pose1Coordinates: [number, number][] =
    convertPoseDataToCoordinates(posesData); //Dữ liệu của người dùng
  const pose2Coordinates: [number, number][] =
    convertPoseDataToCoordinates(posesData); //Dữ liệu để tham chiếu

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

  const scoreA = cosine_distance(p1, p2);

  console.log(scoreA);

  function isValidNormalizedValue(value: number): boolean {
    return value >= 0 && value <= 1;
  }

  function normalizedToPixelCoordinates(
    normalizedX: number,
    normalizedY: number,
    imageWidth: number,
    imageHeight: number,
  ): Tuple | null {
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
  }

  function getWidth() {
    return Dimensions.get('window').width;
  }

  function getHeight() {
    return Dimensions.get('window').height;
  }

  const objectDetection = useTensorflowModel(require('./assets/4.tflite'));
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const isDarkMode = useColorScheme() === 'dark';
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice('back');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };
  // const handleSetData = Worklets.createRunInJsFn(setPoseData);
  const handleSetCordinate = Worklets.createRunInJsFn(setCordinate);

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
          handleSetCordinate(data);
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
              posesData.map((item, index) => (
                <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
              ))}
          </Svg>
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
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  canvas: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
  },
});

export default App;
