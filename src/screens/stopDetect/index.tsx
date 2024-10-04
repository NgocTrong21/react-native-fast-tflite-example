import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';
import { useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { useEffect, useRef, useState } from 'react';
import Svg, { Circle, Line } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

const connections =
  Platform.OS === 'ios'
    ? [
      [5, 7],
      [6, 8],
      [7, 9],
      [8, 10],
      [11, 13],
      [12, 14],
      [13, 15],
      [14, 16],
      [11, 12],
      [5, 6],
      [5, 11],
      [6, 12],
    ]
    : [
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

const StopDetectScreen = () => {
  const viewRefs = useRef<Array<View | null>>([]);
  const route = useRoute();
  const {
    jsonData,
    scoreData,
    countFrameList = [],
    namePath,
    keypoint,
    frameOption,
  } = route.params;
  const [extractedFrames, setExtractedFrames] = useState([]);
  const [drawPoseData, setDrawPoseData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  };

  const onSaveScreenshot = async (folderPath: string) => {
    if (Array.isArray(viewRefs.current)) {
      for (let index = 0; index < extractedFrames.length; index++) {
        const ref = viewRefs.current[index];
        if (ref) {
          try {
            const uri = await captureRef(ref, {
              format: 'png',
              quality: 1,
            });
            const fileName = `${index}_${getCurrentDateTime()}.png`;
            const path = `${folderPath}/${fileName}`;
            await RNFS.moveFile(uri, path);
          } catch (error) {
            console.error('Error saving screenshot:', error);
          }
        }
      }
    } else {
      console.error('viewRefs.current is not an array');
    }
  };

  useEffect(() => {
    if (countFrameList.length > 0 && keypoint.length > 0) {
      extractFramesFromVideo();
      keypoint.forEach(setCoordinateStandardPose);
    }
  }, [countFrameList, keypoint]);

  const extractFramesFromVideo = async () => {
    try {
      const frameIndices = countFrameList;
      const adjustedFrameOption = 1000 / frameOption;
      await extractFrames(namePath, frameIndices, adjustedFrameOption);
    } catch (error) {
      console.error('Error extracting frames:', error);
    }
  };

  function isValidNormalizedValue(value: number): boolean {
    return value >= 0 && value <= 1;
  }

  const normalizedToPixelCoordinates = (
    normalizedX: number,
    normalizedY: number,
    imageWidth: number,
    imageHeight: number,
  ) => {
    if (
      !isValidNormalizedValue(normalizedX) ||
      !isValidNormalizedValue(normalizedY)
    ) {
      return null;
    }

    const x = Math.min(Math.floor(normalizedX * imageWidth), imageWidth - 1);
    const y = Math.min(Math.floor(normalizedY * imageHeight), imageHeight - 1);
    return { x, y };
  };

  const setCoordinateStandardPose = poseData => {
    const result = poseData.map(pose => {
      const coordinate = normalizedToPixelCoordinates(pose.x, pose.y, 100, 100);
      return { ...pose, x: coordinate?.x || 0, y: coordinate?.y || 0 };
    });
    setDrawPoseData(prev => [...prev, result]);
  };

  const extractFrames = async (videoPath, frameIndices, frameTimePerSec) => {
    const outputDir = `${RNFS.DownloadDirectoryPath}`;
    const extractedFramePaths = [];

    for (const frameTime of frameIndices) {
      const exactTime = frameTime / frameTimePerSec + frameTimePerSec;
      console.log('EXACT TIME', exactTime);
      const outputFileName = `${outputDir}/frame_${frameTime}_${Date.now()}.png`;
      const command = `-ss ${exactTime} -i ${videoPath} -frames:v 1 ${outputFileName}`;
      const session = await FFmpegKit.execute(command);
      const returnCode = await session.getReturnCode();

      if (ReturnCode.isSuccess(returnCode)) {
        extractedFramePaths.push(`file://${outputFileName}`);
      } else {
        console.error(`Error extracting frame at time: ${frameTime}`);
      }
    }
    setExtractedFrames(extractedFramePaths);
  };

  const onSaveData = async () => {
    setIsLoading(true);
    try {
      const parentFolderPath = `${RNFS.DownloadDirectoryPath}/AI`;
      if (!(await RNFS.exists(parentFolderPath))) {
        await RNFS.mkdir(parentFolderPath);
      }

      const currentDateTime = getCurrentDateTime();

      const existingFolders = await RNFS.readDir(parentFolderPath);
      let maxSequence = 0;

      for (const folder of existingFolders) {
        if (folder.isDirectory() && /^\d+_/.test(folder.name)) {
          const sequence = parseInt(folder.name.split('_')[0], 10);
          if (sequence > maxSequence) {
            maxSequence = sequence;
          }
        }
      }

      const newSequence = maxSequence + 1;
      const childFolderPath = `${parentFolderPath}/${newSequence}_${currentDateTime}_REBA`;

      if (!(await RNFS.exists(childFolderPath))) {
        await RNFS.mkdir(childFolderPath);
      }

      for (const [index, item] of jsonData.entries()) {
        const jsonFileName = `${index}_${currentDateTime}.json`;
        const jsonFilePath = `${childFolderPath}/${jsonFileName}`;

        await RNFS.writeFile(jsonFilePath, JSON.stringify(item), 'utf8');
      }

      await onSaveScreenshot(childFolderPath);
      Alert.alert('Success', 'Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const combinedList = jsonData.map((pose, index) => ({
    pose: `Pose ${index + 1}`,
    score: scoreData[index] || 0,
    frame: extractedFrames[index] || null,
    keypoint: drawPoseData[index] || null,
  }));

  const headKPs =
    Platform.OS === 'ios'
      ? [0, 1, 2, 3, 4]
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator size="large" color="green" style={styles.loader} />
      )}
      <View style={styles.header}>
        <TouchableOpacity style={styles.button} onPress={onSaveData}>
          <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titleStyle}>POSE LIST</Text>

      <FlatList
        data={combinedList}
        keyExtractor={(_, index) => '' + index}
        renderItem={({ item, index }) => (
          <View style={styles.detectItem}>
            <View style={styles.poseColumn}>
              {item.frame ? (
                <View
                  ref={el => (viewRefs.current[index] = el)}
                  collapsable={false}
                  style={styles.poseColumn}>
                  <Image
                    source={{ uri: item.frame }}
                    style={{ width: 100, height: 100 }}
                  />
                  <Svg
                    width={100}
                    height={100}
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                    }}>
                    {headKPs.map((kpIndex, idx) => {
                      const kp = item.keypoint[kpIndex];
                      return (
                        <Circle
                          key={`circle-${idx}`}
                          cx={kp.x}
                          cy={kp.y}
                          r="2"
                          fill="green"
                        />
                      );
                    })}
                    {connections.map((conn, idx) => {
                      const kp0 = item.keypoint[conn[0]];
                      const kp1 = item.keypoint[conn[1]];
                      return (
                        <Line
                          key={`line-${idx}`}
                          x1={kp0.x}
                          y1={kp0.y}
                          x2={kp1.x}
                          y2={kp1.y}
                          stroke="green"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </Svg>
                </View>
              ) : (
                <Text style={styles.poseText}>No Frame</Text>
              )}
            </View>
            <View style={styles.poseColumn}>
              <Text style={styles.poseText}>{item.pose}:</Text>
            </View>
            <View style={styles.scoreColumn}>
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

export default StopDetectScreen;
