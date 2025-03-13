// server/api/geocode.js
export default defineEventHandler(async (event) => {
    const { address } = getQuery(event);
    
    if (!address) return { success: false, error: "Adresse manquante" };
    
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
        { headers: { 'User-Agent': 'MMR Portail Immobilier' } }
      );
      
      if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          success: true,
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon)
        };
      } else {
        return { success: false, error: "Localisation non trouvée" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  });