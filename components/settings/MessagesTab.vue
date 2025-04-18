<template>
    <div v-if="isActive" class="bg-white shadow sm:rounded-lg p-4 mb-4">
      <!-- En-tête -->
      <div class="pb-5 border-b border-gray-200">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Messagerie
        </h3>
        <p class="mt-2 max-w-4xl text-sm text-gray-500">
          Consultez et répondez aux messages des personnes intéressées par vos annonces.
        </p>
      </div>
  
      <!-- Affichage du loader pendant le chargement -->
      <div v-if="loading && !error" class="py-12 flex flex-col items-center justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        <p class="mt-4 text-sm text-gray-500">Chargement de vos conversations...</p>
      </div>
  
      <!-- Affichage en cas d'erreur -->
      <div v-else-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">
              {{ errorMessage || "Une erreur est survenue lors du chargement de vos conversations." }}
            </p>
            <p class="mt-2 text-sm text-red-700">
              <button @click="fetchConversations" class="font-medium underline text-red-700 hover:text-red-600">
                Réessayer
              </button>
            </p>
          </div>
        </div>
      </div>
  
      <!-- Aucune conversation -->
      <div v-else-if="!loading && conversations.length === 0" class="bg-gray-50 rounded-lg p-8 my-6 text-center">
        <div class="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
          <svg class="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Aucun message</h3>
        <p class="text-sm text-gray-500 mb-6 max-w-md mx-auto">
          Vous n'avez aucune conversation active pour le moment. Les messages des personnes intéressées par vos annonces apparaîtront ici.
        </p>
        <NuxtLink to="/annonces" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
          Consulter les annonces
        </NuxtLink>
      </div>
  
      <!-- Liste des conversations -->
      <div v-else-if="conversations.length > 0" class="mt-6">
        <ul class="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
          <li v-for="conversation in conversations" :key="conversation.id" class="px-4 py-4 hover:bg-gray-50">
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-cyan-600 flex items-center justify-center text-white font-medium">
                  {{ getInitials(conversation.nom_contact || 'Anonyme') }}
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ conversation.nom_contact || 'Anonyme' }}
                </p>
                <p class="text-sm text-gray-500 truncate">
                  {{ conversation.annonce ? 'Re: ' + conversation.annonce.titre : 'Sans titre' }}
                </p>
                <p class="text-xs text-gray-400">
                  {{ formatDate(conversation.dernier_message || conversation.date_created) }}
                </p>
              </div>
              <div>
                <button 
                  @click="openConversation(conversation)" 
                  class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-cyan-700 bg-cyan-100 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Voir
                </button>
              </div>
            </div>
          </li>
        </ul>
      </div>
  
      <!-- Modal de conversation -->
      <div v-if="activeConversation" class="fixed inset-0 z-10 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeConversation"></div>
  
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
  
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <!-- En-tête de la modal -->
            <div class="bg-cyan-700 px-4 py-3 sm:px-6 flex items-center justify-between">
              <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">
                Conversation avec {{ activeConversation.nom_contact || 'Anonyme' }}
              </h3>
              <button @click="closeConversation" class="text-white hover:text-gray-200">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div class="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <!-- Informations sur l'annonce si disponible -->
              <div v-if="activeConversation.annonce" class="bg-gray-50 rounded-md p-3 mb-4">
                <p class="text-sm font-medium text-gray-700">Concernant votre annonce</p>
                <p class="text-sm text-gray-900">
                  {{ activeConversation.annonce.titre }}
                </p>
              </div>
  
              <!-- Messages -->
              <div class="space-y-4 max-h-80 overflow-y-auto mb-4 p-2">
                <div v-for="message in conversationMessages" :key="message.id" 
                  :class="[
                    'p-3 rounded-lg max-w-3/4',
                    isMessageFromCurrentUser(message) ? 'ml-auto bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-800'
                  ]">
                  <div class="text-sm">{{ message.contenu }}</div>
                  <div class="text-xs mt-1 text-gray-500">{{ formatDate(message.date_created) }}</div>
                </div>
                
                <div v-if="conversationMessages.length === 0" class="text-center py-6 text-gray-500">
                  Aucun message dans cette conversation
                </div>
              </div>
  
              <!-- Formulaire de réponse -->
              <form @submit.prevent="sendMessage">
                <div>
                  <label for="message" class="block text-sm font-medium text-gray-700">Votre réponse</label>
                  <textarea
                    id="message"
                    v-model="newMessage"
                    rows="3"
                    class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    placeholder="Écrivez votre message ici..."
                  ></textarea>
                </div>
                <div class="mt-4 flex justify-end">
                  <button
                    type="button"
                    class="mr-2 inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    @click="closeConversation"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    :disabled="!newMessage.trim() || sendingMessage"
                    class="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                  >
                    <svg v-if="sendingMessage" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Envoyer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      isActive: {
        type: Boolean,
        default: false
      }
    },
  
    data() {
      return {
        loading: false,
        error: false,
        errorMessage: '',
        dataRequested: false,
        conversations: [],
        activeConversation: null,
        conversationMessages: [],
        newMessage: '',
        sendingMessage: false,
        currentUserId: null
      }
    },
  
    watch: {
      isActive(newVal) {
        if (newVal && !this.dataRequested) {
          this.fetchConversations();
          this.dataRequested = true;
        }
      }
    },
  
    mounted() {
      // Récupérer l'ID de l'utilisateur courant dès le montage du composant
      const authStore = useAuthStore();
      this.currentUserId = authStore.user?.id;
      
      if (this.isActive && !this.dataRequested) {
        this.fetchConversations();
        this.dataRequested = true;
      }
    },
  
    methods: {
      async fetchConversations() {
        this.loading = true;
        this.error = false;
        this.errorMessage = '';
        
        // Timeout pour éviter un chargement infini
        const timeout = setTimeout(() => {
          if (this.loading) {
            this.loading = false;
            this.conversations = [];
            console.log('Timeout atteint lors du chargement des conversations');
          }
        }, 5000);

        try {
          if (!this.currentUserId) {
            const authStore = useAuthStore();
            this.currentUserId = authStore.user?.id;
            
            if (!this.currentUserId) {
              throw new Error('Utilisateur non connecté');
            }
          }

          // Utilisation du SDK Directus avec les bonnes méthodes
          const directusSDK = useDirectusSDK();
          
          try {
            // Utiliser la méthode getUserConversations du SDK
            const conversations = await directusSDK.getUserConversations();
            
            console.log('Conversations récupérées:', conversations);
            this.conversations = conversations || [];
            
            // Si aucune conversation trouvée, essayer avec une requête personnalisée
            if (this.conversations.length === 0) {
              try {
                // Récupérer d'abord le profil utilisateur pour obtenir l'ID
                const user = await directusSDK.getUserProfile(['id']);
                
                if (!user || !user.id) {
                  throw new Error('Impossible de récupérer l\'ID utilisateur');
                }
                
                // Utiliser client_id au lieu de user_proprietaire
                const customConversations = await directusSDK.getItems('conversations', {
                  filter: { client_id: { _eq: user.id } },
                  fields: '*,annonce.*',
                  sort: '-date_updated'
                });
                
                console.log('Conversations récupérées via client_id:', customConversations);
                this.conversations = customConversations || [];
              } catch (secondError) {
                console.error('Erreur lors de la récupération avec client_id:', secondError);
                // Continuer avec un tableau vide si l'erreur persiste
              }
            }
          } catch (error) {
            console.error('Erreur lors de la récupération des conversations:', error);
            
            // Dernière tentative avec fetch direct
            try {
              // Utiliser client_id dans la requête directe
              const userId = this.currentUserId;
              const response = await fetch(`/api/directus/items/conversations?filter[client_id][_eq]=${userId}&fields=id,titre,nom_contact,email_contact,dernier_message,date_created,date_updated,annonce.id,annonce.titre`);
              
              if (response.ok) {
                const data = await response.json();
                console.log('Conversations récupérées via fetch direct:', data);
                this.conversations = data.data || [];
              } else {
                throw new Error('Impossible de récupérer vos conversations');
              }
            } catch (fetchError) {
              console.error('Erreur lors de la récupération directe des conversations:', fetchError);
              throw new Error('Impossible de récupérer vos conversations');
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des conversations:', error);
          this.error = true;
          this.errorMessage = error.message || 'Impossible de charger vos conversations';
          this.conversations = [];
        } finally {
          clearTimeout(timeout);
          this.loading = false;
        }
      }, 
  
      async openConversation(conversation) {
        this.activeConversation = conversation;
        this.conversationMessages = [];
        this.fetchConversationMessages(conversation.id);
      },
  
      closeConversation() {
        this.activeConversation = null;
        this.conversationMessages = [];
        this.newMessage = '';
      },
  
      async fetchConversationMessages(conversationId) {
        try {
          const directusSDK = useDirectusSDK();
          
          // Utiliser la méthode getItems pour récupérer les messages
          const messages = await directusSDK.getItems('messages', {
            filter: { conversation_id: { _eq: conversationId } },
            fields: 'id,contenu,date_created,expediteur,destinataire',
            sort: 'date_created'
          });
          
          console.log('Messages récupérés:', messages);
          this.conversationMessages = messages || [];
        } catch (error) {
          console.error('Erreur lors du chargement des messages:', error);
          
          // Méthode alternative en cas d'échec
          try {
            const response = await fetch(`/api/directus/items/messages?filter[conversation_id][_eq]=${conversationId}&fields=id,contenu,date_created,expediteur,destinataire&sort=date_created`);
            
            if (!response.ok) {
              throw new Error('Impossible de charger les messages');
            }
            
            const data = await response.json();
            console.log('Messages récupérés via fetch direct:', data);
            this.conversationMessages = data.data || [];
          } catch (fetchError) {
            console.error('Erreur lors de la récupération directe des messages:', fetchError);
            
            // Afficher un message d'erreur si vous avez un système de notification
            if (this.$toast) {
              this.$toast.error('Impossible de charger les messages');
            }
            
            this.conversationMessages = [];
          }
        }
      },
  
      async sendMessage() {
        if (!this.newMessage.trim() || !this.activeConversation) return;
        
        this.sendingMessage = true;
        
        try {
          if (!this.currentUserId) {
            const authStore = useAuthStore();
            this.currentUserId = authStore.user?.id;
            
            if (!this.currentUserId) {
              throw new Error('Utilisateur non connecté');
            }
          }
          
          const directusSDK = useDirectusSDK();
          
          // Déterminer le destinataire (contact externe)
          // Dans ce cas, le destinataire pourrait être null car on envoie à un contact externe
          // qui n'a pas de compte utilisateur
          const destinataire = null;
          
          const messageData = {
            conversation_id: this.activeConversation.id,  // Utiliser conversation_id
            contenu: this.newMessage.trim(),
            expediteur: this.currentUserId,  // L'utilisateur courant est l'expéditeur
            destinataire: destinataire,
            type: 'interne'  // Type de message interne
          };
          
          console.log('Envoi du message:', messageData);
          
          // Utiliser la méthode createItem du SDK
          const createdMessage = await directusSDK.createItem('messages', messageData);
          console.log('Message envoyé avec succès:', createdMessage);
          
          // Essayer de mettre à jour dernier_message dans la conversation
          try {
            await directusSDK.updateItem('conversations', this.activeConversation.id, {
              dernier_message: new Date().toISOString()
            });
            console.log('Date de dernier message mise à jour');
          } catch (updateError) {
            console.warn('Erreur lors de la mise à jour de dernier_message:', updateError);
            // Continuer même si cette mise à jour échoue
          }
          
          // Vider le champ du message
          this.newMessage = '';
          
          // Rafraîchir les messages
          this.fetchConversationMessages(this.activeConversation.id);
          
          // Rafraîchir la liste des conversations
          this.fetchConversations();
          
          // Afficher une notification de succès si disponible
          if (this.$toast) {
            this.$toast.success('Message envoyé avec succès');
          }
        } catch (error) {
          console.error('Erreur lors de l\'envoi du message:', error);
          
          // Méthode alternative en cas d'échec du SDK
          try {
            const response = await fetch('/api/directus/items/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                conversation_id: this.activeConversation.id,
                contenu: this.newMessage.trim(),
                expediteur: this.currentUserId,
                destinataire: null,
                type: 'interne'
              })
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Erreur API: ${errorData?.errors?.[0]?.message || response.statusText}`);
            }
            
            console.log('Message envoyé via fetch direct');
            
            // Mettre à jour la conversation via fetch également
            try {
              await fetch(`/api/directus/items/conversations/${this.activeConversation.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  dernier_message: new Date().toISOString()
                })
              });
            } catch (updateError) {
              // Ignorer cette erreur
            }
            
            // Vider le champ du message
            this.newMessage = '';
            
            // Rafraîchir les données
            this.fetchConversationMessages(this.activeConversation.id);
            this.fetchConversations();
            
            if (this.$toast) {
              this.$toast.success('Message envoyé avec succès');
            }
          } catch (fetchError) {
            console.error('Erreur lors de l\'envoi du message via fetch:', fetchError);
            
            // Afficher une notification d'erreur
            if (this.$toast) {
              this.$toast.error(fetchError.message || 'Impossible d\'envoyer le message');
            }
          }
        } finally {
          this.sendingMessage = false;
        }
      },
  
      isMessageFromCurrentUser(message) {
        return message.expediteur === this.currentUserId;
      },
  
      getInitials(name) {
        if (!name) return '?';
        return name
          .split(' ')
          .map(part => part.charAt(0).toUpperCase())
          .slice(0, 2)
          .join('');
      },
  
      formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        // Si moins de 24h
        if (diffDays < 1) {
          return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        }
        
        // Si aujourd'hui
        if (
          date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        ) {
          return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Si hier
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (
          date.getDate() === yesterday.getDate() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getFullYear() === yesterday.getFullYear()
        ) {
          return `Hier à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        }
        
        // Si moins d'une semaine
        if (diffDays < 7) {
          const options = { weekday: 'long', hour: '2-digit', minute: '2-digit' };
          return date.toLocaleDateString('fr-FR', options);
        }
        
        // Sinon format complet
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('fr-FR', options);
      }
    }
  }
  </script>