import {Text, TouchableOpacity, View} from 'react-native';
import {styles} from './styles';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AppRootParams} from '../../navigation/types';

const StartDetectScreen = () => {
  const navigator = useNavigation<NavigationProp<AppRootParams>>();
  const onNavigateToDetect = () => {
    navigator.navigate('DetectScreen');
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onNavigateToDetect}>
        <Text style={styles.text}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};
export default StartDetectScreen;
