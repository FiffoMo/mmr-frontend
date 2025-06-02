// composables/annonceDeplacerForfait.js
import { ref, reactive } from 'vue';

export function useAnnonceDeplacerForfait() {
  // État de la modal
  const moveModal = reactive({
    show: false,
    annonceId: null,
    sourceForfaitId: null,
    targetForfaitId: null
  });

  // État de notification
  const notification = ref(null);

  // Sélectionner un forfait cible
  const selectTargetForfait = (forfaitId) => {
    moveModal.targetForfaitId = forfaitId;
  };

  // Obtenir forfaits disponibles (à l'exception du forfait actuel et des forfaits de type mise_en_avant)
  const getAvailableForfaits = (forfaits, currentForfaitId) => {
    return forfaits.filter(forfait => {
      // Exclure le forfait "sans forfait" comme cible
      if (forfait.id === 'sans_forfait') return false;
      
      // Exclure le forfait actuel
      if (forfait.id === currentForfaitId) return false;
      
      // Vérifier s'il s'agit d'un forfait valide
      if (!forfait.produit) return false;
      
      // Exclure les forfaits de type mise_en_avant
      if (forfait.type_produit === 'mise_en_avant' || 
          (forfait.produit && forfait.produit.type_produit === 'mise_en_avant')) {
        return false;
      }
      
      // Vérifier si le forfait est expiré
      const isExpired = forfaitExpire(forfait);
      if (isExpired) return false;
      
      // Vérifier s'il y a de la place disponible
      const limite = forfait.produit.nombre || Infinity;
      const utilisees = forfait.annonces ? forfait.annonces.length : 0;
      
      return utilisees < limite;
    });
  };

  // Vérifier si un forfait est expiré
  const forfaitExpire = (forfait) => {
    if (!forfait.date_fin) return false;
    
    const dateExpiration = new Date(forfait.date_fin);
    const today = new Date();
    
    return dateExpiration < today;
  };

  // Calculer le nombre de jours restants
  const getRemainingDays = (dateString) => {
    if (!dateString) return null;
    
    const expiration = new Date(dateString);
    const today = new Date();
    
    // Différence en millisecondes
    const diffTime = expiration - today;
    // Convertir en jours (arrondi supérieur)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  // Afficher la modal de déplacement d'annonce
  const showMoveModal = (annonceId, sourceForfaitId, forfaits, showNotification) => {
    // Vérifier s'il y a des forfaits disponibles
    const availableForfaits = getAvailableForfaits(forfaits, sourceForfaitId);
    
    if (availableForfaits.length === 0) {
      alert('Aucun forfait disponible pour déplacer cette annonce. Veuillez acheter un nouveau forfait ou renouveler un forfait existant.');
      return;
    }
    
    // Configurer la modal
    moveModal.show = true;
    moveModal.annonceId = annonceId;
    moveModal.sourceForfaitId = sourceForfaitId;
    moveModal.targetForfaitId = null;
    
    // Mémoriser la fonction de notification
    notification.value = showNotification;
  };

  // Confirmer le déplacement d'une annonce
  const confirmMove = async (forfaits, updateCallback) => {
    try {
      const { annonceId, sourceForfaitId, targetForfaitId } = moveModal;
      
      // Vérifications de sécurité
      if (!annonceId || !sourceForfaitId || !targetForfaitId) {
        console.error('Données incomplètes pour le déplacement:', { annonceId, sourceForfaitId, targetForfaitId });
        alert('Veuillez sélectionner un forfait de destination.');
        return;
      }
      
      console.log(`=== DÉBUT DÉPLACEMENT ANNONCE ===`);
      console.log(`Déplacement de l'annonce ${annonceId}`);
      console.log(`Forfait source: ${sourceForfaitId}`);
      console.log(`Forfait cible: ${targetForfaitId}`);
      
      // 1. Vérification initiale des forfaits source et cible
      const sourceForfait = forfaits.find(f => f.id === sourceForfaitId);
      const targetForfait = forfaits.find(f => f.id === targetForfaitId);
      
      if (!sourceForfait) {
        console.error(`Forfait source non trouvé: ${sourceForfaitId}`);
        throw new Error('Forfait source non trouvé');
      }
      
      if (!targetForfait) {
        console.error(`Forfait cible non trouvé: ${targetForfaitId}`);
        throw new Error('Forfait cible non trouvé');
      }
      
      console.log(`Forfait source trouvé: ${sourceForfait.produit?.nom || sourceForfait.nom || 'Sans nom'}`);
      console.log(`Forfait cible trouvé: ${targetForfait.produit?.nom || targetForfait.nom || 'Sans nom'}`);
      
      // 2. Vérification de l'annonce dans le forfait source
      if (!sourceForfait.annonces) {
        console.error('Le forfait source n\'a pas d\'annonces');
        throw new Error('Le forfait source n\'a pas d\'annonces');
      }
      
      const annonceIndex = sourceForfait.annonces.findIndex(a => a.id === annonceId);
      
      if (annonceIndex === -1) {
        console.error(`Annonce ${annonceId} non trouvée dans le forfait source`);
        throw new Error('Annonce non trouvée dans le forfait source');
      }
      
      // Récupérer une copie de l'annonce à déplacer
      const annonceToMove = JSON.parse(JSON.stringify(sourceForfait.annonces[annonceIndex]));
      console.log('Annonce à déplacer:', annonceToMove);
      
      // Vérifier si une réactivation est nécessaire
      let statusChange = false;
      if (annonceToMove.status === 'suspended' && annonceToMove.suspension_auto && !forfaitExpire(targetForfait)) {
        statusChange = true;
        console.log('L\'annonce sera réactivée car elle était suspendue automatiquement et le forfait cible est actif');
      }
      
      // 3. Préparation des données pour l'API
      const apiData = {
        commande_id: targetForfaitId
      };
      
      if (statusChange) {
        apiData.status = 'published';
        apiData.suspension_auto = false;
      }
      
      console.log('Données à envoyer à l\'API:', apiData);
      
      // 4. Appel à l'API pour mettre à jour l'annonce
      console.log(`Envoi de la requête PATCH pour l'annonce ${annonceId}...`);
      const response = await fetch(`/api/directus/items/Annonces/${annonceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(apiData)
      });
      
      const responseStatus = response.status;
      let responseData = null;
      
      try {
        responseData = await response.json();
      } catch (e) {
        console.error('Erreur lors de la lecture de la réponse JSON:', e);
      }
      
      console.log(`Réponse de l'API (${responseStatus}):`, responseData);
      
      if (!response.ok) {
        console.error(`Erreur API (${responseStatus}):`, responseData);
        throw new Error(`Erreur lors de la mise à jour de l'annonce: ${responseStatus}`);
      }
      
      // 5. Mise à jour locale des données
      console.log('Mise à jour locale des données...');
      
      // Initialiser les tableaux d'annonces si nécessaire
      if (!targetForfait.annonces) {
        targetForfait.annonces = [];
      }
      
      // Modifier la commande_id de l'annonce
      annonceToMove.commande_id = targetForfaitId;
      
      // Mettre à jour le statut si nécessaire
      if (statusChange) {
        annonceToMove.status = 'published';
        annonceToMove.suspension_auto = false;
      }
      
      // Supprimer l'annonce du forfait source
      console.log(`Suppression de l'annonce de l'index ${annonceIndex} du forfait source`);
      sourceForfait.annonces.splice(annonceIndex, 1);
      
      // Ajouter l'annonce au forfait cible
      console.log(`Ajout de l'annonce au forfait cible`);
      targetForfait.annonces.push(annonceToMove);
      
      console.log('Forfait source après modification:', sourceForfait.annonces.length, 'annonces');
      console.log('Forfait cible après modification:', targetForfait.annonces.length, 'annonces');
      
      // 6. Fermer la modal et afficher une notification
      moveModal.show = false;
      moveModal.annonceId = null;
      moveModal.sourceForfaitId = null;
      moveModal.targetForfaitId = null;
      
      console.log(`=== FIN DÉPLACEMENT ANNONCE ===`);
      
      // Afficher une notification si la fonction est disponible
      if (notification.value) {
        notification.value('Annonce déplacée avec succès');
      }
      
      // Appelez le callback de mise à jour si disponible
      if (updateCallback && typeof updateCallback === 'function') {
        updateCallback();
      }
      
    } catch (error) {
      console.error('Erreur lors du déplacement de l\'annonce:', error);
      alert(`Une erreur est survenue lors du déplacement: ${error.message}`);
    }
  };

  return {
    moveModal,
    getAvailableForfaits,
    selectTargetForfait,
    showMoveModal,
    confirmMove,
    getRemainingDays
  };
}