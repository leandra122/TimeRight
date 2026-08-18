import { Text } from 'react-native';
import { Card, uiStyles } from './UI';

export default function SalonCard({ salon, onPress }) {
  return <Card onPress={onPress}><Text style={{ fontSize: 18, fontWeight: '800' }}>{salon.nome}</Text>{salon.endereco ? <Text style={uiStyles.subtitle}>{salon.endereco}</Text> : null}{salon.telefone ? <Text style={uiStyles.subtitle}>{salon.telefone}</Text> : null}</Card>;
}
