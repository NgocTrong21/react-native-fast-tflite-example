import {
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';
import { useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import { FFmpegKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { useEffect, useRef, useState } from 'react';

const StopDetectScreen = () => {
  const route = useRoute();
  const { jsonData, scoreData, countFrameList = [], namePath } = route.params;
  const [extractedFrames, setExtractedFrames] = useState([]);

  useEffect(() => {
    if (countFrameList.length > 0) {
      extractFramesFromVideo();
    }
  }, [countFrameList]);

  const extractFramesFromVideo = async () => {
    try {
      const frameIndices = countFrameList;
      await extractFrames(namePath, frameIndices);
    } catch (error) {
      console.error('Error extracting frames:', error);
    }
  };

  console.log('countFrameList', countFrameList);
  console.log('extractedFrames', extractedFrames);

  const extractFrames = async (videoPath, frameIndices) => {
    const outputDir = `${RNFS.DownloadDirectoryPath}`;
    const extractedFramePaths = [];

    for (const frameTime of frameIndices) {
      const outputFileName = `${outputDir}/frame_${frameTime}_${Date.now()}.png`;
      const command = `-ss ${frameTime} -i ${videoPath} -frames:v 1 ${outputFileName}`;

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
    try {
      for (const item of jsonData) {
        const jsonFileName = `coordinates_${Date.now()}.json`;
        const jsonFilePath = `${RNFS.DocumentDirectoryPath}/${jsonFileName}`;

        await RNFS.writeFile(jsonFilePath, JSON.stringify(item), 'utf8');

        await RNFS.copyFile(
          jsonFilePath,
          `${RNFS.ExternalStorageDirectoryPath}/Download/${jsonFileName}`,
        );
      }
      Alert.alert('Success', 'Data saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const combinedList = jsonData.map((pose, index) => ({
    pose: `Pose ${index + 1}`,
    score: scoreData[index] || 0,
    frame: extractedFrames[index] || null,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.button} onPress={onSaveData}>
          <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.titleStyle}>POSE LIST</Text>

      <FlatList
        data={combinedList}
        keyExtractor={(_, index) => '' + index}
        renderItem={({ item }) => (
          <View style={styles.detectItem}>
            <View style={styles.poseColumn}>
              {item.frame ? (
                <Image
                  source={{ uri: item.frame }}
                  style={{ width: 100, height: 100, marginRight: 10 }}
                />
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
