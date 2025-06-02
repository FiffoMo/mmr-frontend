<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h3 class="text-xl font-semibold mb-4">Contacter le propriétaire</h3>
    
    <!-- Message de succès -->
    <div v-if="messageSent" class="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      <p class="font-medium">Votre message a bien été envoyé !</p>
      <p class="text-sm">Le propriétaire vous répondra directement par email. Une copie de votre message a été envoyée à votre adresse email.</p>
    </div>
    
    <!-- Formulaire de contact -->
    <form v-else @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Votre nom *</label>
        <input 
          type="text" 
          v-model="form.name" 
          required 
          class="w-full border rounded p-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Votre email *</label>
        <input 
          type="email" 
          v-model="form.email" 
          required 
          class="w-full border rounded p-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Votre téléphone (optionnel)</label>
        <input 
          type="tel" 
          v-model="form.phone" 
          class="w-full border rounded p-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
        >
      </div>
      
      <div class="mb-4">
        <label class="block text-gray-700 mb-1">Votre message *</label>
        <textarea 
          v-model="form.message" 
          rows="4" 
          required 
          class="w-full border rounded p-2 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          placeholder="Je suis intéressé(e) par ce bien, pouvez-vous me donner plus d'informations ?"
        ></textarea>
      </div>
      
      <div class="mb-4">
        <label class="flex items-center">
          <input 
            type="checkbox" 
            v-model="form.consent" 
            required 
            class="mr-2 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
          >
          <span class="text-sm text-gray-700">
            J'accepte que mes données soient utilisées pour traiter ma demande *
          </span>
        </label>
      </div>
      
      <!-- Bouton de soumission -->
      <button 
        type="submit" 
        class="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-md font-medium"
        :disabled="loading"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Envoi en cours...
        </span>
        <span v-else>Envoyer ma demande</span>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDirectusSDK } from '~/composables/useDirectusSDK';

const props = defineProps({
  annonceId: {
    type: String,
    required: true
  },
  annonceTitle: {
    type: String,
    required: true
  },
  proprietaireId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'message-sent']);

// Initialiser le SDK Directus
const directusSDK = useDirectusSDK();

// États du formulaire
const form = ref({
  name: '',
  email: '',
  phone: '',
  message: '',
  consent: false
});

const loading = ref(false);
const messageSent = ref(false);
const error = ref(null);

// Soumettre le formulaire
const submitForm = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // 1. Créer ou récupérer une conversation existante
    let conversationId;
    
    // Vérifier si une conversation existe déjà
    const conversations = await directusSDK.getItems('conversations', {
      filter: {
        annonce: { _eq: props.annonceId },
        email_contact: { _eq: form.value.email }
      },
      limit: 1
    });
    
    if (conversations && conversations.length > 0) {
      // Conversation existante
      conversationId = conversations[0].id;
    } else {
      // Créer une nouvelle conversation
      const newConversation = await directusSDK.createItem('conversations', {
        annonce: props.annonceId,
        user_proprietaire: props.proprietaireId,
        titre: `Demande pour: ${props.annonceTitle}`,
        email_contact: form.value.email,
        nom_contact: form.value.name,
        phone_contact: form.value.phone || null,
        status: 'active'
      });
      
      conversationId = newConversation.id;
    }
    
    // 2. Ajouter le message à la conversation
    await directusSDK.createItem('messages', {
      conversation_id: conversationId,
      destinataire: props.proprietaireId,
      contenu: form.value.message,
      email_expediteur: form.value.email,
      nom_expediteur: form.value.name,
      type: 'externe',
      expediteur: 'visiteur' // AJOUTER CETTE LIGNE
    });
    
    // 3. Envoyer une requête pour l'envoi des emails
    await $fetch('/api/email-contact', {
      method: 'POST',
      body: {
        emailVisiteur: form.value.email,
        nomVisiteur: form.value.name,
        telephone: form.value.phone || 'Non renseigné',
        annonceId: props.annonceId,
        message: form.value.message,
        annonceTitle: props.annonceTitle
      }
    });
    
    // Afficher le message de succès
    messageSent.value = true;
    
    // Émettre l'événement de succès
    emit('message-sent', true);
    
    // Réinitialiser le formulaire après 5 secondes
    setTimeout(() => {
      form.value = {
        name: '',
        email: '',
        phone: '',
        message: '',
        consent: false
      };
      
      // Fermer le formulaire après un délai
      setTimeout(() => {
        emit('close');
      }, 2000);
      
    }, 5000);
    
  } catch (err) {
    console.error('Erreur lors de l\'envoi du message:', err);
    error.value = "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer.";
    emit('message-sent', false);
  } finally {
    loading.value = false;
  }
};
</script>