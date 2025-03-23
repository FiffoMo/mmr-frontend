<template>
  <div class="p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-4">Messagerie</h2>
    
    <!-- Chargement initial -->
    <div v-if="loading" class="py-10 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <p class="mt-2 text-gray-500">Chargement des conversations...</p>
    </div>
    
    <!-- Interface de messagerie -->
    <div v-else class="flex h-[600px] bg-gray-100 rounded-lg overflow-hidden">
      <!-- Liste des conversations -->
      <div class="w-1/3 border-r border-gray-200 bg-white">
        <div class="p-4 border-b border-gray-200">
          <input 
            type="text" 
            placeholder="Rechercher une conversation..." 
            class="w-full p-2 border border-gray-300 rounded-md"
            v-model="messageSearch"
          />
        </div>
        
        <div class="overflow-y-auto h-[calc(100%-60px)]">
          <div 
            v-for="conversation in filteredConversations" 
            :key="conversation.id"
            :class="[
              'p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50',
              activeConversation?.id === conversation.id ? 'bg-cyan-50' : ''
            ]"
            @click="selectConversation(conversation)"
          >
            <div class="flex justify-between items-center">
              <h3 class="font-medium">{{ conversation.otherParty }}</h3>
              <span class="text-xs text-gray-500">{{ formatTime(conversation.lastMessageDate) }}</span>
            </div>
            <p class="text-sm text-gray-600 truncate">
              {{ conversation.lastMessage }}
            </p>
            <div class="mt-1 text-xs flex justify-between items-center">
              <span class="text-gray-500">
                {{ conversation.relatedTo }}
              </span>
              <span v-if="conversation.unread" class="bg-cyan-500 rounded-full w-2 h-2"></span>
            </div>
          </div>
          
          <!-- Aucune conversation -->
          <div v-if="conversations.length === 0" class="p-4 text-center text-gray-500">
            Vous n'avez pas de conversations actives
          </div>
        </div>
      </div>
      
      <!-- Zone de message -->
      <div class="w-2/3 flex flex-col">
        <div v-if="!activeConversation" class="flex-grow flex items-center justify-center">
          <p class="text-gray-500">Sélectionnez une conversation pour commencer</p>
        </div>
        
        <template v-else>
          <!-- En-tête de la conversation -->
          <div class="p-4 border-b border-gray-200 bg-white">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="font-medium">{{ activeConversation.otherParty }}</h3>
                <p class="text-sm text-gray-500">
                  {{ activeConversation.relatedTo }}
                  <a 
                    v-if="activeConversation.relatedToId" 
                    :href="`/annonces/detail-${activeConversation.relatedToId}`"
                    class="ml-1 text-cyan-600 hover:text-cyan-900 hover:underline"
                  >
                    (voir l'annonce)
                  </a>
                </p>
              </div>
              <button 
                @click="showActionsMenu = !showActionsMenu" 
                class="text-gray-500 hover:text-gray-700 relative"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
                
                <!-- Menu déroulant -->
                <div 
                  v-if="showActionsMenu" 
                  class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                >
                  <div class="py-1">
                    <a 
                      href="#" 
                      class="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      @click.prevent="archiveConversation"
                    >
                      Archiver la conversation
                    </a>
                    <a 
                      href="#" 
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click.prevent="reportConversation"
                    >
                      Signaler un problème
                    </a>
                  </div>
                </div>
              </button>
            </div>
          </div>
          
          <!-- Messages -->
          <div ref="messagesContainer" class="flex-grow p-4 overflow-y-auto bg-gray-50">
            <!-- Indicateur de chargement des messages -->
            <div v-if="loadingMessages" class="flex justify-center py-4">
              <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
            </div>
            
            <div v-else>
              <!-- Date des messages -->
              <div v-for="(group, date) in groupedMessages" :key="date">
                <div class="text-center my-4">
                  <span class="inline-block px-2 py-1 text-xs bg-gray-200 rounded-full text-gray-600">
                    {{ formatMessageDate(date) }}
                  </span>
                </div>
                
                <div 
                  v-for="(message, index) in group" 
                  :key="index"
                  :class="[
                    'mb-4 max-w-xs rounded-lg p-3',
                    message.sender === 'me' 
                      ? 'ml-auto bg-cyan-500 text-white' 
                      : 'mr-auto bg-white border border-gray-200'
                  ]"
                >
                  <p>{{ message.content }}</p>
                  <p class="text-xs mt-1" :class="message.sender === 'me' ? 'text-cyan-100' : 'text-gray-500'">
                    {{ formatMessageTime(message.timestamp) }}
                  </p>
                </div>
              </div>
              
              <!-- Indicateur de lecture -->
              <div v-if="activeConversation.lastReadByOther" class="text-xs text-right text-gray-500 mt-2">
                Vu {{ formatTime(activeConversation.lastReadByOther) }}
              </div>
            </div>
          </div>
          
          <!-- Zone de saisie -->
          <div class="p-3 border-t border-gray-200 bg-white">
            <form @submit.prevent="sendMessage" class="flex space-x-2">
              <input 
                type="text" 
                v-model="newMessage" 
                placeholder="Tapez votre message..." 
                class="flex-grow p-2 border border-gray-300 rounded-md"
              />
              <button 
                type="submit" 
                class="px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-700"
                :disabled="!newMessage.trim() || sendingMessage"
              >
                <span v-if="sendingMessage">
                  <svg class="animate-spin h-4 w-4 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessagesTab',
  
  data() {
    return {
      // États de chargement
      loading: false,
      loadingMessages: false,
      sendingMessage: false,
      
      // Données de messagerie
      conversations: [],
      activeConversation: null,
      
      // Filtrage
      messageSearch: '',
      
      // UI
      showActionsMenu: false,
      
      // Nouveau message
      newMessage: ''
    };
  },
  
  computed: {
    // Filtre les conversations pour la recherche
    filteredConversations() {
      if (!this.messageSearch) return this.conversations;
      
      const search = this.messageSearch.toLowerCase();
      return this.conversations.filter(conv => 
        conv.otherParty.toLowerCase().includes(search) || 
        conv.relatedTo.toLowerCase().includes(search) ||
        (conv.messages && conv.messages.some(msg => 
          msg.content.toLowerCase().includes(search)
        ))
      );
    },
    
    // Regroupe les messages par date
    groupedMessages() {
      if (!this.activeConversation || !this.activeConversation.messages) {
        return {};
      }
      
      return this.activeConversation.messages.reduce((groups, message) => {
        const date = new Date(message.timestamp).toLocaleDateString('fr-FR');
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(message);
        return groups;
      }, {});
    }
  },
  
  created() {
    // Charger les conversations au montage du composant
    this.fetchConversations();
    
    // Vérifier si une conversation spécifique est demandée dans l'URL
    const params = new URLSearchParams(window.location.search);
    const conversationId = params.get('conversation');
    if (conversationId) {
      this.loadSpecificConversation(conversationId);
    }
    
    // Simuler la réception de nouveaux messages
    // Dans un cas réel, cela serait géré par WebSockets ou une requête de polling
    this.setupMessagePolling();
  },
  
  beforeUnmount() {
    // Nettoyer l'intervalle de polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  },
  
  methods: {
    // Récupération des conversations
    async fetchConversations() {
      this.loading = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.getConversations();
        // this.conversations = response;
        
        // Pour l'exemple, nous utilisons des données fictives
        this.conversations = [
          {
            id: 601,
            otherParty: 'Jean Dupont',
            lastMessage: 'Bonjour, est-ce que cette propriété est toujours disponible ?',
            lastMessageDate: new Date('2025-03-12T14:35:00'),
            lastReadByOther: new Date('2025-03-12T14:36:00'),
            unread: true,
            relatedTo: 'Appartement lumineux 4 pièces',
            relatedToId: 201,
            messages: []
          },
          {
            id: 602,
            otherParty: 'Marie Martin',
            lastMessage: 'Parfait, je vous confirme la visite pour samedi à 14h.',
            lastMessageDate: new Date('2025-03-10T10:15:00'),
            lastReadByOther: new Date('2025-03-10T10:20:00'),
            unread: false,
            relatedTo: 'Maison de campagne rénovée',
            relatedToId: 202,
            messages: []
          }
        ];
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Charger une conversation spécifique
    async loadSpecificConversation(id) {
      try {
        // Attendre que les conversations soient chargées
        if (this.loading) {
          await new Promise(resolve => {
            const checkLoading = setInterval(() => {
              if (!this.loading) {
                clearInterval(checkLoading);
                resolve();
              }
            }, 100);
          });
        }
        
        // Trouver la conversation
        const conversation = this.conversations.find(c => c.id === parseInt(id));
        if (conversation) {
          this.selectConversation(conversation);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la conversation spécifique:', error);
      }
    },
    
    // Sélectionner une conversation
    async selectConversation(conversation) {
      // Ne rien faire si c'est déjà la conversation active
      if (this.activeConversation && this.activeConversation.id === conversation.id) {
        return;
      }
      
      this.activeConversation = conversation;
      this.showActionsMenu = false;
      
      // Charger les messages
      await this.fetchMessages(conversation.id);
      
      // Marquer comme lu
      if (conversation.unread) {
        conversation.unread = false;
        
        // Dans un cas réel, on enverrait également cette info au serveur
        // await api.markConversationAsRead(conversation.id);
      }
      
      // Faire défiler vers le bas pour voir les derniers messages
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    
    // Récupération des messages d'une conversation
    async fetchMessages(conversationId) {
      this.loadingMessages = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.getConversationMessages(conversationId);
        // this.activeConversation.messages = response;
        
        // Pour l'exemple, nous utilisons des données fictives
        if (conversationId === 601) {
          this.activeConversation.messages = [
            {
              sender: 'other',
              content: 'Bonjour, je suis intéressé par votre appartement à Lyon. Est-il toujours disponible ?',
              timestamp: new Date('2025-03-12T14:30:00')
            },
            {
              sender: 'me',
              content: 'Bonjour, oui l\'appartement est toujours disponible. Souhaitez-vous organiser une visite ?',
              timestamp: new Date('2025-03-12T14:32:00')
            },
            {
              sender: 'other',
              content: 'Bonjour, est-ce que cette propriété est toujours disponible ?',
              timestamp: new Date('2025-03-12T14:35:00')
            }
          ];
        } else if (conversationId === 602) {
          this.activeConversation.messages = [
            {
              sender: 'other',
              content: 'Bonjour, je souhaiterais visiter votre maison ce weekend. Est-ce possible ?',
              timestamp: new Date('2025-03-09T16:45:00')
            },
            {
              sender: 'me',
              content: 'Bien sûr, je suis disponible samedi à 14h ou dimanche à 11h. Quelle option vous conviendrait ?',
              timestamp: new Date('2025-03-09T17:20:00')
            },
            {
              sender: 'other',
              content: 'Parfait, je vous confirme la visite pour samedi à 14h.',
              timestamp: new Date('2025-03-10T10:15:00')
            }
          ];
        } else {
          this.activeConversation.messages = [];
        }
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      } finally {
        this.loadingMessages = false;
      }
    },
    
    // Envoyer un message
    async sendMessage() {
      if (!this.newMessage.trim() || !this.activeConversation || this.sendingMessage) {
        return;
      }
      
      this.sendingMessage = true;
      
      try {
        const message = {
          sender: 'me',
          content: this.newMessage,
          timestamp: new Date()
        };
        
        // Dans un cas réel, ce serait un appel API
        // await api.sendMessage({
        //   conversationId: this.activeConversation.id,
        //   content: this.newMessage
        // });
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ajouter le message à la conversation active
        this.activeConversation.messages.push(message);
        
        // Mise à jour du dernier message
        this.activeConversation.lastMessage = this.newMessage;
        this.activeConversation.lastMessageDate = new Date();
        
        // Réinitialiser le champ de saisie
        this.newMessage = '';
        
        // Faire défiler vers le bas pour voir le nouveau message
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        alert('Une erreur est survenue lors de l\'envoi du message');
      } finally {
        this.sendingMessage = false;
      }
    },
    
    // Archiver une conversation
    async archiveConversation() {
      if (!this.activeConversation) return;
      
      if (!confirm('Êtes-vous sûr de vouloir archiver cette conversation ?')) {
        this.showActionsMenu = false;
        return;
      }
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.archiveConversation(this.activeConversation.id);
        
        // Simuler l'archivage en retirant la conversation de la liste
        this.conversations = this.conversations.filter(c => c.id !== this.activeConversation.id);
        this.activeConversation = null;
        this.showActionsMenu = false;
        
        alert('Conversation archivée avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'archivage de la conversation:', error);
        alert('Une erreur est survenue lors de l\'archivage de la conversation');
      }
    },
    
    // Signaler un problème avec une conversation
    reportConversation() {
      if (!this.activeConversation) return;
      
      // Dans un cas réel, on ouvrirait un modal ou redirigerait vers un formulaire
      alert('Fonctionnalité de signalement à implémenter');
      this.showActionsMenu = false;
    },
    
    // Configurer la simulation de réception de messages
    setupMessagePolling() {
      // Dans un cas réel, cela serait géré par WebSockets
      this.pollingInterval = setInterval(() => {
        this.simulateIncomingMessage();
      }, 45000); // Toutes les 45 secondes
    },
    
    // Simuler la réception d'un message
    async simulateIncomingMessage() {
      // 10% de chance de recevoir un message
      if (Math.random() > 0.1 || this.conversations.length === 0) return;
      
      const randomConversationIndex = Math.floor(Math.random() * this.conversations.length);
      const conversation = this.conversations[randomConversationIndex];
      
      const newMessage = {
        sender: 'other',
        content: 'Merci pour votre réponse. Puis-je avoir plus d\'informations sur cette propriété ?',
        timestamp: new Date()
      };
      
      // Mettre à jour la conversation
      conversation.lastMessage = newMessage.content;
      conversation.lastMessageDate = new Date();
      conversation.unread = true;
      
      // Si c'est la conversation active, ajouter le message et marquer comme lu
      if (this.activeConversation && this.activeConversation.id === conversation.id) {
        this.activeConversation.messages.push(newMessage);
        conversation.unread = false;
        
        // Faire défiler vers le bas
        this.$nextTick(() => {
          if (this.$refs.messagesContainer) {
            this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
          }
        });
      }
    },
    
    // Formater l'heure d'un message
    formatMessageTime(date) {
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    },
    
    // Formater la date d'un groupe de messages
    formatMessageDate(dateStr) {
      const date = new Date(dateStr);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Aujourd\'hui';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hier';
      } else {
        return new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }).format(date);
      }
    },
    
    // Formater l'heure pour l'affichage dans la liste des conversations
    formatTime(date) {
      const now = new Date();
      const messageDate = new Date(date);
      const diff = now - messageDate;
      
      // Si c'est aujourd'hui, montrer l'heure
      if (messageDate.toDateString() === now.toDateString()) {
        return new Intl.DateTimeFormat('fr-FR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }).format(messageDate);
      }
      
      // Si c'est cette semaine, montrer le jour
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return new Intl.DateTimeFormat('fr-FR', { 
          weekday: 'short' 
        }).format(messageDate);
      }
      
      // Sinon montrer la date complète
      return new Intl.DateTimeFormat('fr-FR', { 
        day: '2-digit', 
        month: '2-digit'
      }).format(messageDate);
    }
  }
};
</script>

<style scoped>
/* Style pour l'indicateur activé/désactivé */
.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #0ea5e9;
}

input:checked + .slider:before {
  transform: translateX(18px);
}
</style>