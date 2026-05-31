import { useEffect, useRef } from 'react';
import { getLatestReport } from '../../utils/prediction';

function CatMarkers({
  map,
  cats,
  reports,
  onSelectCat
}) {
  const markersRef = useRef([]);

  useEffect(() => {
    if (!map) return;

    markersRef.current.forEach(marker =>
      marker.setMap(null)
    );

    markersRef.current = [];

    cats.forEach((cat) => {
      const latestReport =
        getLatestReport(cat.id, reports);

      const position =
        latestReport
          ? new window.kakao.maps.LatLng(
              latestReport.lat,
              latestReport.lng
            )
          : new window.kakao.maps.LatLng(
              cat.lat,
              cat.lng
            );

      const marker =
        new window.kakao.maps.Marker({
          map,
          position
        });

      window.kakao.maps.event.addListener(
        marker,
        'click',
        () => {
          onSelectCat(cat, position);
        }
      );

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker =>
        marker.setMap(null)
      );
    };
  }, [map, cats, reports, onSelectCat]);

  return null;
}

export default CatMarkers;