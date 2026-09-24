import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, SectionHeader, uiStyles } from './UI';
import LocationMap from './LocationMap';
import { googleMapsUrl, locationCoordinates, salonAddress } from '../utils/salonLocation';

const messages = { INCOMPLETE: 'Endereço incompleto. Confirme o endereço com o salão.', NOT_FOUND: 'Endereço não encontrado no mapa. Confirme com o salão.', UNAVAILABLE: 'Localização temporariamente indisponível.' };
export default function SalonLocation({ salon }) {
  const [response, setResponse] = useState(null);
  const [revision, setRevision] = useState(0);
  const [linkError, setLinkError] = useState('');
  const context = JSON.stringify([salon.id, salon.endereco, salon.logradouro, salon.numero, salon.bairro, salon.cidade, salon.uf, salon.cep]);
  const result = response?.context === context ? response.data : null;
  useEffect(() => {
    const controller = new AbortController();
    setResponse(null);
    setLinkError('');
    api.get('/saloes/' + salon.id + '/localizacao', { signal: controller.signal, timeout: 15000 })
      .then(({ data }) => { if (!controller.signal.aborted) setResponse({ context, data }); })
      .catch(() => { if (!controller.signal.aborted) setResponse({ context, data: { status: 'UNAVAILABLE' } }); });
    return () => controller.abort();
  }, [context, revision]);
  const coordinates = locationCoordinates(result);
  const mapsUrl = googleMapsUrl(salon, result);
  async function openGoogleMaps() {
    setLinkError('');
    if (!mapsUrl) return;
    try {
      await Linking.openURL(mapsUrl);
    } catch {
      setLinkError('Não foi possível abrir o Google Maps. Tente novamente ou consulte o endereço acima.');
    }
  }
  return <Card>
    <SectionHeader title="Localização" />
    <Text style={uiStyles.subtitle}>{salonAddress(salon) || 'Endereço não cadastrado ou incompleto'}</Text>
    {!result ? <Text style={uiStyles.subtitle}>Localizando endereço...</Text> : coordinates ? <>
      <Text style={uiStyles.subtitle}>Localização aproximada</Text>
      {!!result.enderecoEncontrado && <Text style={uiStyles.subtitle}>Endereço encontrado: {result.enderecoEncontrado}</Text>}
      <View style={{ height: 260, marginVertical: 12, overflow: 'hidden', borderRadius: 12 }}><LocationMap url={
        'https://www.openstreetmap.org/export/embed.html?bbox=' +
        [coordinates.longitude - .005, coordinates.latitude - .005, coordinates.longitude + .005, coordinates.latitude + .005].join(',') +
        '&layer=mapnik&marker=' + coordinates.latitude + ',' + coordinates.longitude
      } /></View>
    </> : <><Text style={uiStyles.subtitle}>{messages[result.status] || messages.UNAVAILABLE}</Text><Button title="Tentar novamente" secondary onPress={() => setRevision(value => value + 1)} /></>}
    {mapsUrl ? <>
      {!coordinates && <Text style={uiStyles.subtitle}>O Google Maps buscará pelo endereço cadastrado. Confira o resultado antes de sair.</Text>}
      <Button title="Abrir no Google Maps" icon="map-outline" onPress={openGoogleMaps} />
    </> : <Text style={uiStyles.subtitle}>Não há localização suficiente para abrir no Google Maps. Confirme o endereço com o salão.</Text>}
    {!!linkError && <Text accessibilityRole="alert" style={uiStyles.error}>{linkError}</Text>}
    <Text accessibilityRole="link" style={uiStyles.subtitle} onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => setLinkError('Não foi possível abrir o link.'))}>© OpenStreetMap contributors</Text>
  </Card>;
}
