import { getNearestShelter } from './distance';

export const getRecencyWeight = (timestamp) => {
  if (!timestamp) return 0;

  const reportTime = timestamp.toDate().getTime();

  const hoursAgo =
    (Date.now() - reportTime) / (1000 * 60 * 60);

  let weight = Math.exp(-0.1 * hoursAgo);

  if (hoursAgo <= 1) {
    weight *= 2;
  }

  return weight;
};

export const getLatestReport = (catId, reports) => {
  const catReports = reports
    .filter((report) => report.catId === catId)
    .sort(
      (a, b) =>
        b.createdAt?.toMillis() -
        a.createdAt?.toMillis()
    );

  return catReports[0];
};

export const getPredictedLocation = ({
  catId,
  reports,
  shelters,
  isRain
}) => {
  const catReports = reports.filter(
    (report) => report.catId === catId
  );

  if (catReports.length === 0) return null;

  let weightedLat = 0;
  let weightedLng = 0;
  let totalWeight = 0;

  catReports.forEach((report) => {
    const weight = getRecencyWeight(report.createdAt);

    weightedLat += report.lat * weight;
    weightedLng += report.lng * weight;
    totalWeight += weight;
  });

  const predictedLat = weightedLat / totalWeight;
  const predictedLng = weightedLng / totalWeight;

  const nearestShelter = getNearestShelter(
    predictedLat,
    predictedLng,
    shelters
  );

  if (isRain && nearestShelter) {
    return {
      lat: predictedLat * 0.7 + nearestShelter.lat * 0.3,
      lng: predictedLng * 0.7 + nearestShelter.lng * 0.3
    };
  }

  return {
    lat: predictedLat,
    lng: predictedLng
  };
};