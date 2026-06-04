export const getDistance = (lat1, lng1, lat2, lng2) => {
  const dx = lat1 - lat2;
  const dy = lng1 - lng2;

  return Math.sqrt(dx * dx + dy * dy);
};

export const getNearestShelter = (lat, lng, shelters) => {
  if (!shelters.length) return null;

  return shelters.reduce((nearest, shelter) => {
    const currentDistance = getDistance(
      lat,
      lng,
      shelter.lat,
      shelter.lng
    );

    const nearestDistance = getDistance(
      lat,
      lng,
      nearest.lat,
      nearest.lng
    );

    return currentDistance < nearestDistance
      ? shelter
      : nearest;
  });
};