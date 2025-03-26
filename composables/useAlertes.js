// composables/useAlertes.js
import { ref } from 'vue';

export function useAlertes() {
  const loading = ref(false);
  const error = ref(null);
  const success = ref(false);
  
  // Créer une nouvelle alerte email
  const createAlerte = async (alerteData) => {
    loading.value = true;
    error.value = null;
    success.value = false;
    
    try {
      const response = await fetch('/api/alertes-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(alerteData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création de l\'alerte');
      }
      
      success.value = true;
      return data;
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  };
  
  // Confirmer une alerte email par son token
  const confirmAlerte = async (token) => {
    if (!token) {
      error.value = 'Token de confirmation manquant';
      return { success: false, error: 'Token de confirmation manquant' };
    }
    
    loading.value = true;
    error.value = null;
    
    try {
      // Rechercher l'alerte avec ce token
      const searchResponse = await fetch(`/api/directus/items/alertes_email?filter[token_confirmation][_eq]=${token}`);
      const searchData = await searchResponse.json();
      
      if (!searchResponse.ok || !searchData.data || searchData.data.length === 0) {
        throw new Error('Token de confirmation invalide ou expiré');
      }
      
      const alerteId = searchData.data[0].id;
      
      // Mettre à jour l'alerte pour l'activer
      const updateResponse = await fetch(`/api/directus/items/alertes_email/${alerteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'active',
          date_confirmation: new Date().toISOString()
        })
      });
      
      const updateData = await updateResponse.json();
      
      if (!updateResponse.ok) {
        throw new Error('Erreur lors de la confirmation de l\'alerte');
      }
      
      success.value = true;
      return { success: true, data: updateData.data };
    } catch (err) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  };
  
  return {
    loading,
    error,
    success,
    createAlerte,
    confirmAlerte
  };
}