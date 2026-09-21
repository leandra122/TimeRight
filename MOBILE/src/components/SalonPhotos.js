import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { api } from '../api/client';
import { API_URL } from '../config/apiConfig';
import { Button, uiStyles } from './UI';
import { colors } from '../styles/theme';

export default function SalonPhotos({ salonId, thumbnail = false }) {
  const focused = useIsFocused();
  const [photos, setPhotos] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    if (!focused) return;
    let active = true;
    setLoading(true); setError(''); setImageError(false);
    api.get('/saloes/' + salonId + '/fotos').then(({ data }) => {
      if (active) {
        setPhotos(data);
        setIndex(Math.max(0, data.findIndex(p => p.principal)));
      }
    }).catch(e => {
      if (active) { setPhotos([]); setError(e.response?.status === 503 ? 'Fotos ainda não disponíveis.' : 'Não foi possível carregar as fotos.'); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [salonId, focused, revision]);
  const photo = photos[index];
  if (thumbnail) return photo && !imageError ? <Image
    source={{ uri: API_URL + photo.url + '?v=' + revision }} accessibilityLabel="Foto principal do salão"
    style={{ width: 46, height: 46, borderRadius: 16 }} onError={() => setImageError(true)} />
    : <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: colors.primarySoft, justifyContent: 'center' }}>
      <Text style={{ color: colors.muted, fontSize: 10, textAlign: 'center' }}>Sem foto</Text></View>;
  if (loading) return <Text style={uiStyles.subtitle}>Carregando fotos...</Text>;
  if (!photo) return <View><Text style={uiStyles.subtitle}>{error || 'Este salão ainda não cadastrou fotos.'}</Text>
    {error && <Button title="Atualizar fotos" secondary onPress={() => setRevision(v => v + 1)} />}</View>;
  function move(delta) { setImageError(false); setIndex(current => (current + delta + photos.length) % photos.length); }
  return <View style={{ marginBottom: 20 }}>
    {imageError ? <Text style={uiStyles.subtitle}>Não foi possível exibir esta foto.</Text> :
      <Image source={{ uri: API_URL + photo.url + '?v=' + revision }} accessibilityLabel={'Foto ' + (index + 1) + ' do salão'}
        resizeMode="cover" style={{ width: '100%', height: 240, borderRadius: 16 }} onError={() => setImageError(true)} />}
    <Text style={uiStyles.subtitle}>{index + 1} de {photos.length}{photo.principal ? ' · Principal' : ''}</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Button title="Anterior" secondary disabled={photos.length < 2} onPress={() => move(-1)} />
      <Button title="Próxima" secondary disabled={photos.length < 2} onPress={() => move(1)} />
    </View>
    <Button title="Atualizar fotos" secondary onPress={() => setRevision(v => v + 1)} />
  </View>;
}
