export default function LocationMap({ url }) {
  return <iframe title="Localização aproximada do salão" src={url} loading="lazy" style={{ width: '100%', height: 260, border: 0, borderRadius: 12 }} />;
}
