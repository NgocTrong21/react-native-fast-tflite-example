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

const StopDetectScreen = () => {
  const route = useRoute();
  const { jsonData, scoreData } = route.params;

  const onSaveData = async () => {
    for (const item of jsonData) {
      try {
        const jsonFileName = `coordinates_${Date.now()}.json`;
        const jsonFilePath = `${RNFS.DocumentDirectoryPath}/${jsonFileName}`;

        await RNFS.writeFile(jsonFilePath, JSON.stringify(item), 'utf8');

        await RNFS.copyFile(
          jsonFilePath,
          `${RNFS.ExternalStorageDirectoryPath}/Download/${jsonFileName}`,
        );
      } catch (error) {
        console.error('ERROR', error);
        Alert.alert('Error', 'Failed to save data');
        return;
      }
    }
    Alert.alert('Success', 'Data saved successfully!');
  };

  const combinedData = jsonData.map((pose, index) => ({
    pose: `Pose ${index + 1}`,
    score: scoreData[index] || 0,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.button} onPress={onSaveData}>
          <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.titleStyle}>POSE LIST</Text>
      <View>
        <View style={styles.detectItem}>
          <View style={styles.poseColumn}>
            <Text style={styles.poseText}>Pose Frame</Text>
          </View>
          <View style={styles.poseColumn}>
            <Text style={styles.poseText}>Pose Score</Text>
          </View>
        </View>
      </View>
      <FlatList
        keyExtractor={(_, index) => '' + index}
        data={combinedData}
        numColumns={1}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.detectItem}>
            <View style={styles.poseColumn}>
              <Text style={styles.poseText}>{item.pose}</Text>
            </View>
            <View style={styles.scoreColumn}>
              <Text style={styles.scoreText}>{item.score}</Text>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        extraData={combinedData.length}
      />
    </View>
  );
};

export default StopDetectScreen;
