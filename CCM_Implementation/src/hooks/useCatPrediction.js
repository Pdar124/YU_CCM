import { getLatestReport, getPredictedLocation } from '../utils/prediction';
import { getNearestShelter } from '../utils/distance';

export default function useCatPrediction({
  cats,
  reports,
  shelters,
  selectedCatId,
  isRain
}) {
  const currentSelectedCat =
    cats.find(
      cat => cat.id === selectedCatId
    );

  const predictedLocation =
    currentSelectedCat
      ? getPredictedLocation({
          catId: currentSelectedCat.id,
          reports,
          shelters,
          isRain
        })
      : null;

  const reportCount =
    reports.filter(
      report =>
        report.catId === currentSelectedCat?.id
    ).length;

  const latestReport =
    currentSelectedCat
      ? getLatestReport(
          currentSelectedCat.id,
          reports
        )
      : null;

  const nearestShelter =
    predictedLocation
      ? getNearestShelter(
          predictedLocation.lat,
          predictedLocation.lng,
          shelters
        )
      : null;

  return {
    currentSelectedCat,
    predictedLocation,
    reportCount,
    latestReport,
    nearestShelter
  };
}