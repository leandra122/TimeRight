import { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { api } from '../api/client';
import { Button, Card, SectionHeader, uiStyles } from './UI';
import LocationMap from './LocationMap';

const messages = { INCOMPLETE: 'Endereço incompleto. Confirme o endereço com o salão.', NOT_FOUND: 'Endereço não encontrado no mapa. Confirme com o salão.', UNAVAILABLE: 'Localização temporariamente indisponível.' };
export default function SalonLocation({ salon }) {
  const [result, setResult] = useState(null);
  const [revision, setRevision] = useState(0);
  const [linkError, setLinkError] = useState('');
  const address = JSON.stringify([salon.logradouro, salon.numero, salon.bairro, salon.cidade, salon.uf, salon.cep]);
  useEffect(() => {
    const controller = new AbortController();
    setResult(null);
    setLinkError('');
    api.get(`/saloes/${salon.id}/localizacao`, { signal: controller.signal, timeout: 15000 })
      .then(({ data }) => setResult(data))
      .catch(() => { if (!controller.signal.aborted) setResult({ status: 'UNAVAILABLE' }); });
    return () => controller.abort();
  }, [salon.id, address, revision]);
  const found = result?.status === 'FOUND';
  const lat = result?.latitude;
  const lon = result?.longitude;
  return <Card>
    <SectionHeader title="Localização" />
    <Text style={uiStyles.subtitle}>{salon.endereco || 'Endereço não cadastrado'}</Text>
    {!result ? <Text style={uiStyles.subtitle}>Localizando endereço...</Text> : found ? <>
      <Text style={uiStyles.subtitle}>Localização aproximada</Text>
      <Text style={uiStyles.subtitle}>Endereço encontrado: {result.enderecoEncontrado}</Text>
      <View style={{ height: 260, marginVertical: 12, overflow: 'hidden', borderRadius: 12 }}><LocationMap url={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - .005},${lat - .005},${lon + .005},${lat + .005}&layer=mapnik&marker=${lat},${lon}`} /></View>
      <Button title="Abrir no mapa" icon="map-outline" onPress={() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`).catch(() => setLinkError('Não foi possível abrir o mapa.'))} />
    </> : <><Text style={uiStyles.subtitle}>{messages[result.status] || messages.UNAVAILABLE}</Text><Button title="Tentar novamente" secondary onPress={() => setRevision(value => value + 1)} /></>}
    {!!linkError && <Text style={uiStyles.error}>{linkError}</Text>}
    <Text accessibilityRole="link" style={uiStyles.subtitle} onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => setLinkError('Não foi possível abrir o link.'))}>© OpenStreetMap contributors</Text>
  </Card>;
}
