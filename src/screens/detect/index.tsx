import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { useTensorflowModel } from 'react-native-fast-tflite';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useCameraPermission,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Svg, Circle, Line } from 'react-native-svg';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppRootParams } from '../../navigation/types';
import { styles } from './styles';
import RNFS from 'react-native-fs';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer';
import { log } from 'console';
global.Buffer = global.Buffer || Buffer;

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

const bodyAnglePoints = [12, 24, 26];
const neckAnglePoints = [11, 0, 12];
const legAnglePoints = [24, 26, 28];
const shoulderAnglePoints = [24, 12, 16];
const elbowAnglePoints = [12, 14, 16];
const handAnglePoints = [20, 16, 22];

const DetectScreen = () => {
  const { navigate, goBack } = useNavigation<NavigationProp<AppRootParams>>();
  const count = React.useRef(0);
  const { resize } = useResizePlugin();
  const [posesData, setPoseData] = useState<any[]>();
  const [widthPreview, setWidthPreview] = useState(0);
  const [heightPreview, setHeightPreview] = useState(0);
  const [scorePoint, setScorePoint] = useState();
  const [dataCanvas, setDataCanvas] = useState<string>([]);
  const [jsonData, setJsonData] = useState([]);
  const [listScore, setListScore] = useState([]);
  const [isVisibleBody, setIsVisibleBody] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [countFrameDetect, setCountFrameDetect] = useState<number[]>([]);
  const camRef = useRef<Camera>(null);
  const [downloadPath, setDownloadPath] = useState<string>();
  const REVERSE_BODY_PART = {};
  for (const key in BODY_PARTS) {
    const value = BODY_PARTS[key];
    REVERSE_BODY_PART[value] = key;
  }
  const androidVer = Platform.Version;

  const rebaA = (body_angle, neck_angle, leg_angle) => {
    let body_score = 0;
    let neck_score = 0;
    let leg_score = 0;

    const a_reba_a = [
      [
        [1, 2, 3, 4],
        [1, 2, 3, 4],
        [3, 3, 5, 6],
      ],
      [
        [2, 3, 4, 5],
        [3, 4, 5, 6],
        [4, 5, 6, 7],
      ],
      [
        [2, 4, 5, 6],
        [4, 5, 6, 7],
        [5, 6, 7, 8],
      ],
      [
        [3, 5, 6, 7],
        [5, 6, 7, 8],
        [6, 7, 8, 9],
      ],
      [
        [4, 6, 7, 8],
        [6, 7, 8, 9],
        [7, 8, 9, 9],
      ],
    ];

    if (body_angle > 195 && body_angle < 210) {
      body_score = 2;
    } else if (body_angle >= 180 && body_angle <= 195) {
      body_score = 1;
    } else if (body_angle < 180 && body_angle > 160) {
      body_score = 2;
    } else if (body_angle <= 160 && body_angle >= 120) {
      body_score = 3;
    } else if (body_angle > 210) {
      body_score = 3;
    } else if (body_angle < 120) {
      body_score = 4;
    }

    if (neck_angle < 215 && neck_angle > 95) {
      neck_score = 1;
    } else if (neck_angle >= 215) {
      neck_score = 2;
    } else if (neck_angle < 95) {
      neck_score = 3;
    }

    if (leg_angle >= 190 && leg_angle <= 220) {
      leg_score = 1;
    } else if (leg_angle > 220 && leg_angle <= 250) {
      leg_score = 2;
    } else {
      leg_score = 2;
    }

    return {
      scoreA: a_reba_a[body_score - 1][neck_score - 1][leg_score - 1],
      body_score,
      neck_score,
      leg_score,
    };
  };

  const rebaB = (shoulder_angle, elbow_angle, hand_angle) => {
    let shoulder_score = 0;
    let elbow_score = 0;
    let hand_score = 0;

    const a_reba_b = [
      [
        [1, 2, 2],
        [1, 2, 3],
      ],
      [
        [1, 2, 3],
        [2, 3, 4],
      ],
      [
        [3, 4, 5],
        [4, 5, 5],
      ],
      [
        [4, 5, 6],
        [5, 6, 7],
      ],
      [
        [6, 7, 8],
        [7, 8, 8],
      ],
      [
        [7, 8, 8],
        [8, 9, 0],
      ],
    ];

    if (shoulder_angle <= 360 && shoulder_angle >= 340) {
      shoulder_score = 1;
    } else if (shoulder_angle >= 340) {
      shoulder_score = 2;
    } else if (shoulder_angle > 20 && shoulder_angle < 45) {
      shoulder_score = 2;
    } else if (shoulder_angle >= 45 && shoulder_angle <= 90) {
      shoulder_score = 3;
    } else if (shoulder_angle > 90) {
      shoulder_score = 4;
    }

    if (elbow_angle >= 80 && elbow_angle <= 120) {
      elbow_score = 1;
    } else if (elbow_angle >= 0 && elbow_angle < 80) {
      elbow_score = 2;
    } else if (elbow_angle > 120) {
      elbow_score = 2;
    }

    if (hand_angle >= 0 && hand_angle <= 30) {
      hand_score = 1;
    } else if (hand_angle > 30) {
      hand_score = 2;
    }

    return {
      scoreB: a_reba_b[shoulder_score - 1][elbow_score - 1][hand_score - 1],
      shoulder_score,
      elbow_score,
      hand_score,
    };
  };

  const rebaC = (reba_a_score, reba_b_score) => {
    const a_reba_c = [
      [1, 1, 1, 2, 3, 3, 4, 5, 6, 7, 7, 7],
      [1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 7, 8],
      [2, 3, 3, 3, 4, 5, 6, 7, 7, 8, 8, 8],
      [3, 4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9],
      [4, 4, 4, 5, 6, 7, 8, 8, 9, 9, 9, 9],
      [6, 6, 6, 7, 8, 8, 9, 9, 10, 10, 10, 10],
      [7, 7, 7, 8, 9, 9, 9, 10, 10, 11, 11, 11],
      [8, 8, 8, 9, 10, 10, 10, 10, 10, 11, 11, 11],
      [9, 9, 9, 10, 10, 10, 11, 11, 11, 12, 12, 12],
      [10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 12],
      [11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12],
      [12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12],
    ];

    return a_reba_c[reba_a_score - 1][reba_b_score - 1];
  };

  const requestLibraryAccessAndroid = async () => {
    if (androidVer.toString() === '33') {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      ]);
      return permissions['android.permission.READ_MEDIA_IMAGES'] ===
        'granted' &&
        permissions['android.permission.READ_MEDIA_VIDEO'] === 'granted' &&
        permissions['android.permission.READ_MEDIA_AUDIO'] === 'granted' &&
        permissions['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ? true
        : false;
    } else {
      const permissions = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);
      return permissions['android.permission.READ_MEDIA_IMAGES'] ===
        'granted' &&
        permissions['android.permission.READ_MEDIA_VIDEO'] === 'granted' &&
        permissions['android.permission.READ_MEDIA_AUDIO'] === 'granted' &&
        permissions['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' &&
        permissions['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
        ? true
        : false;
    }
  };

  useEffect(() => {
    const checkPermissions = async () => {
      await requestPermission();
    };

    checkPermissions();

    startRecording();
  }, []);

  function convertPoseDataToCoordinates(poseData: any[]): [number, number][] {
    return poseData.map(point => [point.x, point.y]);
  }

  function new_calculate_angle(P1, P2, P3) {
    const result =
      Math.atan2(P3.y - P1.y, P3.x - P1.x) -
      Math.atan2(P2.y - P1.y, P2.x - P1.x);
    const resultDegree = result * (180 / Math.PI);
    return resultDegree < 0 ? 360 + resultDegree : resultDegree;
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

  const objectDetection = useTensorflowModel(
    require('../../../assets/pose_landmark_lite.tflite'),
  );
  const model =
    objectDetection.state === 'loaded' ? objectDetection.model : undefined;
  const isDarkMode = useColorScheme() === 'dark';
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice(isFrontCamera ? 'front' : 'back');

  const saveData = async (coordinates, count) => {
    const bodyAngle = new_calculate_angle(
      coordinates[bodyAnglePoints[0]],
      coordinates[bodyAnglePoints[1]],
      coordinates[bodyAnglePoints[2]],
    );
    const neckAngle = new_calculate_angle(
      coordinates[neckAnglePoints[0]],
      coordinates[neckAnglePoints[1]],
      coordinates[neckAnglePoints[2]],
    );
    const legAngle = new_calculate_angle(
      coordinates[legAnglePoints[0]],
      coordinates[legAnglePoints[1]],
      coordinates[legAnglePoints[2]],
    );

    const rebaAData = rebaA(bodyAngle, neckAngle, legAngle);
    const rebaAScore = rebaA(bodyAngle, neckAngle, legAngle).scoreA;

    const shoulderAngle = new_calculate_angle(
      coordinates[shoulderAnglePoints[0]],
      coordinates[shoulderAnglePoints[1]],
      coordinates[shoulderAnglePoints[2]],
    );
    const elbowAngle =
      180 -
      new_calculate_angle(
        coordinates[elbowAnglePoints[0]],
        coordinates[elbowAnglePoints[1]],
        coordinates[elbowAnglePoints[2]],
      );
    const handAngle = new_calculate_angle(
      coordinates[handAnglePoints[0]],
      coordinates[handAnglePoints[1]],
      coordinates[handAnglePoints[2]],
    );
    const rebaBData = rebaB(shoulderAngle, elbowAngle, handAngle);
    const rebaBScore = rebaB(shoulderAngle, elbowAngle, handAngle).scoreB;
    const finalScore = rebaC(rebaAScore, rebaBScore);

    const finalData = {
      mode: '',
      selected: 0,
      task: '',
      time: '',
      image: '' + '.jpg',
      body: rebaAData.body_score,
      neck: rebaAData.neck_score,
      leg: rebaAData.leg_score,
      weight: '',
      shoulder: rebaBData.shoulder_score,
      elbow: rebaBData.elbow_score,
      wrist: rebaBData.hand_score,
      handle: '',
    };

    setJsonData(prevJsonData => [...prevJsonData, finalData]);
    setListScore(prevListScore => [...prevListScore, finalScore]);
    setCountFrameDetect(prevCountFrame => [...prevCountFrame, count]);

    // try {
    //   const jsonFileName = `coordinates_${Date.now()}.json`;
    //   const jsonFilePath = `${RNFS.DownloadDirectoryPath}/${jsonFileName}`;
    //   await RNFS.writeFile(jsonFilePath, JSON.stringify(finalData), 'utf8');
    //   await RNFS.copyFile(
    //     jsonFilePath,
    //     `${RNFS.ExternalStorageDirectoryPath}/Download/${jsonFileName}`,
    //   );
    // } catch (error) {
    //   console.error('ERROR', error);
    // }
  };

  // const float32ToBase64Chunks = (float32Array, chunkSize) => {
  //   const base64Chunks = [];

  //   for (let i = 0; i < float32Array.length; i += chunkSize) {
  //     // Lấy phần mảng con
  //     const chunk = float32Array.slice(i, i + chunkSize);

  //     // Chuyển đổi chunk sang Uint8Array
  //     const uint8Array = new Uint8Array(chunk.buffer);

  //     // Chuyển đổi Uint8Array thành Base64
  //     const base64String = uint8ArrayToBase64(uint8Array);

  //     base64Chunks.push(base64String);
  //   }

  //   return base64Chunks;
  // };

  // // Hàm chuyển đổi Uint8Array sang Base64
  // const uint8ArrayToBase64 = uint8Array => {
  //   // Chuyển đổi Uint8Array thành Buffer
  //   const buffer = Buffer.from(uint8Array);
  //   // Chuyển đổi Buffer thành Base64
  //   return buffer.toString('base64');
  // };

  const saveFrameAsImage = async float32Array => {
    try {
      // Chuyển đổi base64 thành Buffer
      // console.log('Base 64', base64Data);
      // const buffer = Buffer.from(base64Data, 'base64');

      // // Bạn có thể xử lý buffer thành ảnh JPEG (ví dụ sử dụng jpeg-js)
      // const width = 1280; // Kích thước ảnh, có thể thay đổi theo frame thực tế
      // const height = 720;
      // const rawImageData = {
      //   data: frame.toArrayBuffer(),
      //   width: 256,
      //   height: 256,
      // };
      // const arrayBuffer = frame.toArrayBuffer(); // Chuyển đổi sang ArrayBuffer

      // const frameCopy = deepCopyFrame(frame);

      // const chunkSize = 10000; // Kích thước mảnh nhỏ
      // const base64Parts = [];
      // const numChunks = Math.ceil(float32Array.length / chunkSize);

      // for (let i = 0; i < numChunks; i++) {
      //   const chunk = float32Array.slice(i * chunkSize, (i + 1) * chunkSize);
      //   const imageData = new Uint8Array(chunk.buffer);
      //   const base64Data = Buffer.from(imageData).toString('base64');
      //   base64Parts.push(base64Data);
      // }

      // // Kết hợp các phần lại với nhau nếu cần thiết
      // const fullBase64Data = base64Parts.join('');
      const fullBase64Data = float32ToBase64Chunks(float32Array, 4);

      console.log('fullBase64Data', fullBase64Data);
      const filePath = `${RNFS.DownloadDirectoryPath}/frame_${Date.now()}.jpg`;
      await RNFS.writeFile(filePath, fullBase64Data, 'base64');

      // // Chuyển buffer thành định dạng JPEG
      // const jpegImageData = jpeg.encode(rawImageData, 90); // 90% chất lượng JPEG

      // // Tạo đường dẫn file
      // const fileName = `frame_${Date.now()}.jpg`;
      // const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // // Lưu file dưới dạng base64
      // await RNFS.writeFile(
      //   filePath,
      //   jpegImageData.data.toString('base64'),
      //   'base64',
      // );
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const saveImageFromFloat32 = async arrayBuffer => {
    try {
      // // console.log('data', arrayBuffer);
      // const float32Array = new Float32Array(arrayBuffer.buffer);
      // const chunkSize = 10000; // Kích thước mảnh nhỏ
      // const base64Parts = [];
      // const numChunks = Math.ceil(float32Array.length / chunkSize);

      // console.log('numChunks', numChunks);
      // console.log('length', float32Array);
      // for (let i = 0; i < numChunks; i++) {
      //   const chunk = float32Array.slice(i * chunkSize, (i + 1) * chunkSize);
      //   const imageData = new Uint8Array(chunk.buffer);
      //   const base64Data = Buffer.from(imageData).toString('base64');
      //   base64Parts.push(base64Data);
      // }

      // // Kết hợp các phần lại với nhau nếu cần thiết
      // const fullBase64Data = base64Parts.join('');
      // console.log('fullBase64Data', fullBase64Data);

      // const filePath = `${RNFS.DownloadDirectoryPath}/image_${Date.now()}.png`;
      // await RNFS.writeFile(filePath, fullBase64Data, 'base64');

      const base64Image = convertUint8ArrayToBase64(arrayBuffer);
      saveImage(base64Image);
    } catch (error) {
      console.error('Error saving image:', error);
    }
  };

  const convertUint8ArrayToBase64 = uint8Array => {
    // Chuyển đổi Uint8Array thành Base64
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return `data:image/png;base64,${btoa(binary)}`; // Giả sử đây là PNG
  };

  // Hàm để lưu hình ảnh
  const saveImage = async base64Data => {
    // Đường dẫn lưu file
    const path = `${RNFS.DownloadDirectoryPath}/image.png`;
    // Ghi file
    try {
      await RNFS.writeFile(path, base64Data, 'base64');
      console.log('Hình ảnh đã được lưu tại:', path);
    } catch (error) {
      console.error('Lỗi khi lưu hình ảnh:', error);
    }
  };

  const handleSetCoordinate = Worklets.createRunInJsFn(setCordinate);
  const handleCalcScoreDistance = Worklets.createRunInJsFn(setScoreDistance);
  const handleSaveFile = Worklets.createRunInJsFn(saveData);
  const handleSetIsVisibleBody = Worklets.createRunInJsFn(setIsVisibleBody);

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

    return { x, y };
  };
  const lastFrameTime = useRef(Date.now());

  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      const currentTime = Date.now();

      if (currentTime - lastFrameTime.current > 1000) {
        lastFrameTime.current = currentTime;
        count.current++;
        if (model) {
          const resized = resize(frame, {
            scale: {
              width: 256,
              height: 256,
            },
            pixelFormat: 'rgb',
            dataType: 'float32',
            rotation: isFrontCamera ? '270deg' : '90deg',
            mirror: isFrontCamera ? true : false,
          });

          // 2. Run model with given input buffer synchronously

          const outputs = model.runSync([resized]);
          const output = outputs[0];
          // handleCovertImage(outputs);
          // dataCanvas = [...dataCanvas, resized];
          // const buffer = frame.toArrayBuffer();
          // const dataTest = new Uint8Array(buffer);
          // dataArrayRef.current.push(dataTest);
          // handleSaveDataImage(dataTest);
          // dataTest = [...dataTest, dataTest];
          // dataImageTest.push(dataTest);

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
          });

          const bodyVisibleScore = data.filter(
            item => item.visibility > 3,
          ).length;
          handleSetCoordinate(data);
          handleCalcScoreDistance(data);
          if (bodyVisibleScore >= 15) {
            handleSetIsVisibleBody(true);
            handleSaveFile(data, count.current);
            // const base64Image = frame.toString(); // toBase64 là giả định cho dữ liệu ảnh
            // console.log('Frame data', resized.toString);
            // // const base64Data = frame.data.toString('base64');
            // let frameCopy = handleDeepCopy(frame);
            //handleSaveImage(frame);
            // const resizedGloat32 = resize(frame, {
            //   scale: {
            //     width: 50,
            //     height: 50,
            //   },
            //   pixelFormat: 'rgb',
            //   dataType: 'float32',
            //   rotation: isFrontCamera ? '270deg' : '90deg',
            //   mirror: isFrontCamera ? true : false,
            // });
            // const uint8Array = new Uint8Array(frame.toArrayBuffer());
            // handleSaveImage(uint8Array);
          } else {
            handleSetIsVisibleBody(false);
          }
        }
      }
    },
    [model, widthPreview, heightPreview, isFrontCamera],
  );

  const format = useCameraFormat(device, [
    { videoAspectRatio: 4 / 3 },
    { videoResolution: { width: 400, height: 400 / (3 / 4) } },
  ]);

  const [filePath, setFilePath] = useState('');

  useEffect(() => {
    if (filePath !== '') {
      navigate('StopDetectScreen', {
        jsonData: jsonData,
        scoreData: listScore,
        countFrameList: countFrameDetect,
        namePath: filePath,
      });
    }

    return () => {
      setFilePath('');
      console.log(`Cleaning up for count: ${filePath}`);
    };
  }, [filePath, jsonData, countFrameDetect, listScore]); // Only runs when 'count' changes

  const startRecording = () => {
    if (camRef.current) {
      camRef.current.startRecording({
        onRecordingFinished: video => {
          saveVideoToDownloads(video.path);
        },
        onRecordingError: error => console.error(error),
      });
    }
  };

  const saveVideoToDownloads = async uri => {
    const downloadPath = `${RNFS.DownloadDirectoryPath}/${Date.now()}.mp4`;
    setDownloadPath(downloadPath);
    try {
      await RNFS.moveFile(uri, downloadPath);
      setFilePath(downloadPath);
    } catch (error) {
      console.error('Error saving video to downloads:', error);
      Alert.alert('Error', 'Could not save video to downloads');
    }
  };

  const stopRecording = async () => {
    if (camRef.current) {
      try {
        await camRef.current.stopRecording();
      } catch (error) {
        console.error('Lỗi khi dừng ghi video:', error);
      }
    }
  };

  const onStopDetect = () => {
    stopRecording();
  };

  const onToggleCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  const style = styles(widthPreview, heightPreview);

  return (
    <View style={style.root}>
      <View style={style.header}>
        <TouchableOpacity style={style.backButton} onPress={goBack}>
          <Text style={style.text}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.switchButton} onPress={onToggleCamera}>
          <Text style={style.text}>Switch</Text>
        </TouchableOpacity>
        <TouchableOpacity style={style.button} onPress={onStopDetect}>
          <Text style={style.text}>Stop</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flex: 1,
          overflow: 'hidden',
          width: '100%',
        }}>
        <View
          style={{
            height: '75%',
          }}
          onLayout={event => {
            const { width, height } = event.nativeEvent.layout;
            setWidthPreview(width);
            setHeightPreview(height);
          }}>
          {device && hasPermission && (
            <Camera
              frameProcessor={frameProcessor}
              style={style.camera}
              device={device}
              isActive={true}
              format={format}
              ref={camRef}
              photo={true}
            />
          )}
          <Svg
            width={widthPreview}
            height={heightPreview}
            style={style.canvas}
          // viewBox={`-${widthPreview} 0 ${widthPreview} ${heightPreview}`}
          >
            {/* {posesData &&
             posesData.filter(item => item.score > MIN_SCORE).map((item, index) => (
               <Circle key={index} r={5} cx={item.x} cy={item.y} fill="red" />
             ))} */}
            {posesData &&
              isVisibleBody &&
              posesData.map((item, index) => (
                <Circle
                  key={index}
                  r={5}
                  // cx={heightPreview - (item.y || 0)}
                  // cy={item.x}
                  cx={item.x}
                  cy={item.y}
                  fill={'green'}
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
              isVisibleBody &&
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
      </View>
    </View>
  );
};

export default DetectScreen;
