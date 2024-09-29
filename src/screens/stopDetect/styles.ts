import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    paddingVertical: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  detectItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  score: {
    padding: 4,
    backgroundColor: '#0aa854',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 12,
    lineHeight: 18,
  },
  separator: {
    height: 16,
  },
});
