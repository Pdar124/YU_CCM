import { useEffect, useRef } from 'react';

function PredictedMarker({
  mapRef,
  predictedLocation
}) {
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!predictedLocation) return;

    markerRef.current?.setMap(null);
    circleRef.current?.setMap(null);

    const position = new window.kakao.maps.LatLng(
      predictedLocation.lat,
      predictedLocation.lng
    );

    const marker = new window.kakao.maps.Marker({
      map: mapRef.current,
      position
    });

    const circle = new window.kakao.maps.Circle({
      center: position,
      radius: 50,
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillOpacity: 0.2,
      map: mapRef.current
    });

    markerRef.current = marker;
    circleRef.current = circle;
  }, [mapRef, predictedLocation]);

  return null;
}

export default PredictedMarker;