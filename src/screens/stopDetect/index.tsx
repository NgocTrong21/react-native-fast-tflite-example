import {FlatList, Image, Text, TouchableOpacity, View} from 'react-native';
import {styles} from './styles';
import {IDetectItem} from '../model';

const StopDetectScreen = () => {
  const data: IDetectItem[] = [];
  const onSaveData = () => {};
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.button} onPress={onSaveData}>
          <Text style={styles.text}>Save</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(_, index) => '' + index}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.detectItem}>
            <Image source={{uri: item.image}} />
            <View style={styles.score}>
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
