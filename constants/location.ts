export const CHENNAI_BOUNDS = {
  minLat: 12.80,
  maxLat: 13.30,
  minLng: 80.05,
  maxLng: 80.35,
};

export const isWithinChennai = (
  latitude: number,
  longitude: number,
) => {
  return (
    latitude >= CHENNAI_BOUNDS.minLat &&
    latitude <= CHENNAI_BOUNDS.maxLat &&
    longitude >= CHENNAI_BOUNDS.minLng &&
    longitude <= CHENNAI_BOUNDS.maxLng
  );
};