import {
  Alert,
  Button,
  Image,
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
import { useEffect, useState } from 'react';
import Modal from 'react-native-modal';

const StartDetectScreen = () => {
  const navigator = useNavigation<NavigationProp<AppRootParams>>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isModalVisible, setModalVisible] = useState(false);
  const [frameOptionSelected, setFrameOptionSelected] = useState<number>(1000);

  const androidVer = Platform.Version;

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const onNavigateToDetect = () => {
    toggleModal();
    navigator.navigate('DetectScreen', { frameOption: frameOptionSelected });
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
      <Image
        style={{ width: 250, resizeMode: 'contain' }}
        source={require('../../../assets/unnamed.png')}
      />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={toggleModal}>
          <Text style={styles.text}>Start</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={isModalVisible}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 20 }}>
          <Text style={{ marginBottom: 10, fontSize: 20, color: 'black' }}>
            Select Frame Option:
          </Text>
          {[2000, 1000, 500, 200].map(frameOption => (
            <TouchableOpacity
              key={frameOption}
              onPress={() => setFrameOptionSelected(frameOption)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginVertical: 5,
              }}>
              <View
                style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor:
                    frameOptionSelected === frameOption ? 'blue' : 'gray',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                {frameOptionSelected === frameOption && (
                  <View
                    style={{
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: 'blue',
                    }}
                  />
                )}
              </View>
              <Text style={{ marginLeft: 10 }}>{frameOption}ms</Text>
            </TouchableOpacity>
          ))}

          <View
            style={{
              flexDirection: 'row',
              gap: 20,
              marginTop: 20,
              alignSelf: 'center',
            }}>
            <TouchableOpacity
              onPress={toggleModal}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: 'red',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#f3f3f3',
                }}>
                Hide modal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onNavigateToDetect}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                backgroundColor: 'green',
              }}>
              <Text
                style={{
                  fontSize: 16,
                  color: '#f3f3f3',
                }}>
                Start Detection
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StartDetectScreen;
