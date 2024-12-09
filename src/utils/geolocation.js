export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada en este navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let message = 'Error al obtener la ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Usuario denegó la solicitud de geolocalización';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Información de ubicación no disponible';
            break;
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado al obtener la ubicación';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d; // Distancia en km
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

export const getNearbyUsers = async (userLocation, maxDistance = 10) => {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    const nearbyUsers = [];
    
    snapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.location && userData.location.latitude && userData.location.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          userData.location.latitude,
          userData.location.longitude
        );
        
        if (distance <= maxDistance) {
          nearbyUsers.push({
            id: doc.id,
            ...userData,
            distance: Math.round(distance * 10) / 10, // Redondear a 1 decimal
          });
        }
      }
    });
    
    // Ordenar por distancia
    return nearbyUsers.sort((a, b) => a.distance - b.distance);
  } catch (error) {
    console.error('Error al obtener usuarios cercanos:', error);
    throw error;
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      city: data.address.city || data.address.town || data.address.village,
      state: data.address.state,
      country: data.address.country,
      formatted: data.display_name,
    };
  } catch (error) {
    console.error('Error en geocodificación inversa:', error);
    throw error;
  }
};