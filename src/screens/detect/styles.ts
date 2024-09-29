import {StyleSheet} from 'react-native';

export const styles = (widthPreview: number, heightPreview: number) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#ffffff',
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
      width: widthPreview,
      height: heightPreview,
    },
    canvas: {
      // width: Dimensions.get("window").width,
      // height: Dimensions.get("window").height,
      position: 'absolute',
      // backgroundColor: 'green',
      width: widthPreview,
      height: heightPreview,
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#0492c9',
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
      position: 'absolute',
      zIndex: 999,
    },
    backButton: {
      padding: 10,
    },
  });
