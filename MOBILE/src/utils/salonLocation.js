const text = value => typeof value === 'string' ? value.trim() : '';

export function salonAddress(salon) {
  const street = text(salon.logradouro);
  const city = text(salon.cidade);
  const state = text(salon.uf);
  // Endereço estruturado quando há contexto suficiente; preserva o endereço legado.
  if (street && city && state) {
    return [street, text(salon.numero), text(salon.bairro), city, state, text(salon.cep)]
      .filter(Boolean).join(', ');
  }
  return text(salon.endereco);
}

export function locationCoordinates(result) {
  if (result?.status !== 'FOUND') return null;
  const { latitude, longitude } = result;
  if (typeof latitude !== 'number' || typeof longitude !== 'number'
      || !Number.isFinite(latitude) || !Number.isFinite(longitude)
      || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

export function googleMapsUrl(salon, result) {
  const coordinates = locationCoordinates(result);
  const query = salonAddress(salon) || (coordinates
    ? coordinates.latitude + ',' + coordinates.longitude
    : '');
  return query ? 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(query) : null;
}
