type TLocation = {
  id: string;
  title: string;
  text: string;
  lat: number;
  lng: number;
};

export type Cluster = {
  id: number;
  lat: number;
  lng: number;
  locations: TLocation[];
};

const globeData: TLocation[] = [
  { id: "a", title: "Fortescue Centre", text: "", lat: -31.9616328, lng: 115.8713145 },
  { id: "b", title: "Christmas Creek", text: "", lat: -27.1039763, lng: 123.9278938 },
  { id: "c", title: "Herb Elliot Port", text: "", lat: -20.366525, lng: 118.558611 },
  // Add more locations...
];

// Haversine formula to calculate the distance between two coordinates (lat, lng)
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRadians = (degree: number) => degree * (Math.PI / 180);

  const R = 6371; // Earth's radius in km
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Function to create clusters based on proximity
export function createClusters(locations: TLocation[], thresholdKm: number): Cluster[] {
  const clusters: Cluster[] = [];

  // Loop through each location
  locations.forEach((location) => {
    let foundCluster = false;

    // Check each existing cluster
    clusters.forEach((cluster) => {
      const distance = haversine(location.lat, location.lng, cluster.lat, cluster.lng);

      // If the location is within the threshold distance of the cluster's center
      if (distance <= thresholdKm) {
        cluster.locations.push(location);
        foundCluster = true;
      }
    });

    // If no existing cluster was found, create a new cluster
    if (!foundCluster) {
      clusters.push({
        id: clusters.length + 1, // Set the id to be the index (starting from 1)
        lat: location.lat,
        lng: location.lng, // New cluster center
        locations: [location], // Initial location in the cluster
      });
    }
  });

  return clusters;
}
