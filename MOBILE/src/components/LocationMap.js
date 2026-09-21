import { WebView } from 'react-native-webview';
export default function LocationMap({ url }) {
  return <WebView source={{ uri: url }} style={{ height: 260, flex: 0 }} originWhitelist={['https://*']} />;
}
