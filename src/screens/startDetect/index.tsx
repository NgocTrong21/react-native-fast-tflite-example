import {
  Alert,
  PermissionsAndroid,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from './styles';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AppRootParams } from '../../navigation/types';
import { useCameraPermission } from 'react-native-vision-camera';
import { useEffect } from 'react';

const StartDetectScreen = () => {
  const navigator = useNavigation<NavigationProp<AppRootParams>>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const androidVer = Platform.Version;
  const onNavigateToDetect = () => {
    navigator.navigate('DetectScreen');
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
      const hasAccess = await requestLibraryAccessAndroid();
      if (!hasAccess) {
        Alert.alert(
          'Permission Denied',
          'Cannot access media library without permission.',
        );
      } else {
        console.log('Permission granted');
      }
    };

    checkPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onNavigateToDetect}>
        <Text style={styles.text}>Start</Text>
      </TouchableOpacity>
    </View>
  );
};
export default StartDetectScreen;
