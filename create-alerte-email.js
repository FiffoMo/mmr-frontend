// mmr-frontend/create-alerte-email.js
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Données à envoyer
const data = {
  email: "test3@example.com",
  types: ["appartement", "maison"],
  prix_max: 300000,
  surface_min: 50,
  localisation: "Paris",
  rentabilite_min: 4.5,
  frequence_quotidienne: false,
  accept_confidentialite: true,
  status: "inactive",
  token_confirmation: uuidv4()
};

// Configuration Directus
const directusUrl = 'http://localhost:8055';
const directusToken = 'vb_N7Ta-SBiSHbXYNL3TXnYMyKABZU_U';

async function createAlert() {
  try {
    console.log('Envoi des données à Directus:', data);
    
    const response = await fetch(`${directusUrl}/items/alertes_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${directusToken}`
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Directus:', response.status, errorText);
      throw new Error(`Erreur lors de la création: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('Succès! Alerte créée:', result);
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

// Exécuter la fonction
createAlert();