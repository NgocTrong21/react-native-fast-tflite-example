import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    paddingVertical: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  button: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0492c9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 20,
  },
  detectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  score: {
    padding: 4,
    backgroundColor: '#0aa854',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  poseText: {
    color: 'black',
    fontSize: 20,
  },
  separator: {
    height: 16,
  },
  poseColumn: {},
  scoreColumn: {
    padding: 8,
    backgroundColor: '#0aa854',
  },
  titleStyle: {
    fontSize: 24,
    alignSelf: 'center',
  },
  text: {
    color: '#ffffff',
    fontSize: 14,
  },
});
