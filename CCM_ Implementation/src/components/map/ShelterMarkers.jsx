import { useEffect, useRef } from 'react';

function ShelterMarkers({
  mapRef,
  shelters,
  isRain
}) {
  const shelterMarkersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    shelterMarkersRef.current.forEach(marker =>
      marker.setMap(null)
    );

    shelterMarkersRef.current = [];

    if (!isRain) return;

    const imageSrc =
      'https://cdn-icons-png.flaticon.com/512/3313/3313888.png';

    const imageSize =
      new window.kakao.maps.Size(36, 36);

    const markerImage =
      new window.kakao.maps.MarkerImage(
        imageSrc,
        imageSize
      );

    shelters.forEach((shelter) => {
      const marker = new window.kakao.maps.Marker({
        map: mapRef.current,
        position: new window.kakao.maps.LatLng(
          shelter.lat,
          shelter.lng
        ),
        image: markerImage
      });

      const infowindow =
        new window.kakao.maps.InfoWindow({
          content: `
            <div style="padding:8px;">
              ☔ ${shelter.name}
            </div>
          `
        });

      window.kakao.maps.event.addListener(
        marker,
        'click',
        () => {
          infowindow.open(
            mapRef.current,
            marker
          );
        }
      );

      shelterMarkersRef.current.push(marker);
    });

  }, [mapRef, shelters, isRain]);

  return null;
}

export default ShelterMarkers;