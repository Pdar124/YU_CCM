import { useEffect, useRef } from 'react';

function CatPath({
  mapRef,
  reports,
  currentSelectedCat
}) {
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;
    if (!currentSelectedCat) return;

    const catReports = reports
      .filter(
        report =>
          report.catId === currentSelectedCat.id
      )
      .sort(
        (a, b) =>
          a.createdAt?.toMillis() -
          b.createdAt?.toMillis()
      );

    if (catReports.length < 2) {
      polylineRef.current?.setMap(null);
      return;
    }

    const path = catReports.map(
      report =>
        new window.kakao.maps.LatLng(
          report.lat,
          report.lng
        )
    );

    polylineRef.current?.setMap(null);

    const polyline =
      new window.kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: '#7ED957',
        strokeOpacity: 0.8,
        strokeStyle: 'dashed'
      });

    polyline.setMap(mapRef.current);

    polylineRef.current = polyline;

    return () => {
      polylineRef.current?.setMap(null);
    };
  }, [mapRef, reports, currentSelectedCat]);

  return null;
}

export default CatPath;