import React from 'react';
import NavigationRouter from './src/navigation';
import { Buffer } from 'buffer';

if (global.Buffer == null) {
  global.Buffer = Buffer;
}
function App(): React.JSX.Element {
  return <NavigationRouter />;
}

export default App;
