import {StyleSheet} from 'react-native';

export const styles = (widthPreview: number, heightPreview: number) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: 'white',
      justifyContent: 'center',
    },
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
      width: '100%',
      height: '100%',
    },
    canvas: {
      // width: Dimensions.get("window").width,
      // height: Dimensions.get("window").height,
      position: 'absolute',
      // backgroundColor: 'green',
      width: '100%',
      height: '100%',
    },
    button: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      backgroundColor: '#0492c9',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    switchButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      backgroundColor: '#29af54',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
    text: {
      color: '#ffffff',
      fontSize: 14,
      lineHeight: 20,
    },
    header: {
      paddingVertical: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      alignItems: 'center',
      height: 100,
      marginBottom: '20%',
      // position: 'absolute',
      // zIndex: 999,
      // left: 0,
      // right: 0,
    },
    backButton: {
      paddingVertical: 16,
      paddingHorizontal: 32,
      backgroundColor: '#d35656',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
    },
  });
