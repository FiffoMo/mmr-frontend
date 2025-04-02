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
  
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  
  emits: ['messages-read'],
  
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
        (conv.otherParty || '').toLowerCase().includes(search) || 
        (conv.relatedTo || '').toLowerCase().includes(search) ||
        (conv.lastMessage || '').toLowerCase().includes(search)
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
  },
  
  methods: {
    // Récupération des conversations
    async fetchConversations() {
      this.loading = true;
      
      try {
        // Appel à l'API Directus via notre proxy pour récupérer les conversations
        // où l'utilisateur est soit l'expéditeur soit le destinataire
        const response = await fetch(`/api/directus/items/conversations?filter[user_created][_eq]=${this.userId}&fields=*,annonce.*&sort=-date_updated`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          // Transformer les données pour correspondre à notre modèle
          const conversationsPromises = data.data.map(async (conv) => {
            // Récupérer les derniers messages de cette conversation
            const messagesResponse = await fetch(`/api/directus/items/messages?filter[conversation_id][_eq]=${conv.id}&sort=-date_created&limit=1&fields=*,expediteur.*,destinataire.*`);
            
            if (!messagesResponse.ok) {
              throw new Error(`Erreur API: ${messagesResponse.status}`);
            }
            
            const messagesData = await messagesResponse.json();
            const lastMessage = messagesData.data && messagesData.data.length > 0 ? messagesData.data[0] : null;
            
            // Déterminer l'autre partie (expéditeur ou destinataire)
            let otherParty = "Utilisateur inconnu";
            let unread = false;
            
            if (lastMessage) {
              if (lastMessage.expediteur && lastMessage.expediteur.id !== this.userId) {
                otherParty = `${lastMessage.expediteur.first_name || ''} ${lastMessage.expediteur.last_name || ''}`.trim();
                unread = !lastMessage.lu;
              } else if (lastMessage.destinataire && lastMessage.destinataire.id !== this.userId) {
                otherParty = `${lastMessage.destinataire.first_name || ''} ${lastMessage.destinataire.last_name || ''}`.trim();
              }
            }
            
            return {
              id: conv.id,
              otherParty: otherParty,
              lastMessage: lastMessage ? lastMessage.contenu : 'Nouvelle conversation',
              lastMessageDate: lastMessage ? new Date(lastMessage.date_created) : new Date(conv.date_created),
              lastReadByOther: lastMessage && lastMessage.date_lecture ? new Date(lastMessage.date_lecture) : null,
              unread: unread,
              relatedTo: conv.titre || (conv.annonce ? conv.annonce.titre : 'Discussion générale'),
              relatedToId: conv.annonce ? conv.annonce.id : null,
              messages: []
            };
          });
          
          this.conversations = await Promise.all(conversationsPromises);
          
          // Mettre à jour le nombre de messages non lus
          const unreadCount = this.conversations.filter(conv => conv.unread).length;
          this.$emit('messages-read', unreadCount);
        } else {
          this.conversations = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des conversations:', error);
        this.conversations = [];
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
        const conversation = this.conversations.find(c => c.id === parseInt(id) || c.id === id);
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
      
      // Marquer comme lu si nécessaire
      if (conversation.unread) {
        await this.markConversationAsRead(conversation.id);
        conversation.unread = false;
        
        // Mettre à jour le nombre de messages non lus
        const unreadCount = this.conversations.filter(conv => conv.unread).length;
        this.$emit('messages-read', unreadCount);
      }
      
      // Faire défiler vers le bas pour voir les derniers messages
      this.$nextTick(() => {
        if (this.$refs.messagesContainer) {
          this.$refs.messagesContainer.scrollTop = this.$refs.messagesContainer.scrollHeight;
        }
      });
    },
    
    // Marquer une conversation comme lue
    async markConversationAsRead(conversationId) {
      try {
        // Récupérer tous les messages non lus adressés à l'utilisateur
        const response = await fetch(`/api/directus/items/messages?filter[conversation_id][_eq]=${conversationId}&filter[destinataire][_eq]=${this.userId}&filter[lu][_eq]=false&fields=id`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data && data.data.length > 0) {
          // Marquer chaque message comme lu
          const updatePromises = data.data.map(message => 
            fetch(`/api/directus/items/messages/${message.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                lu: true,
                date_lecture: new Date().toISOString()
              })
            })
          );
          
          await Promise.all(updatePromises);
        }
      } catch (error) {
        console.error('Erreur lors du marquage des messages comme lus:', error);
      }
    },
    
    // Récupération des messages d'une conversation
    async fetchMessages(conversationId) {
      this.loadingMessages = true;
      
      try {
        const response = await fetch(`/api/directus/items/messages?filter[conversation_id][_eq]=${conversationId}&fields=*,expediteur.*,destinataire.*&sort=date_created`);
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.data) {
          // Transformer les messages au format attendu
          this.activeConversation.messages = data.data.map(msg => ({
            sender: msg.expediteur.id === this.userId ? 'me' : 'other',
            content: msg.contenu,
            timestamp: new Date(msg.date_created)
          }));
        } else {
          this.activeConversation.messages = [];
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
        this.activeConversation.messages = [];
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
        // Déterminer le destinataire (celui qui n'est pas l'utilisateur actuel)
        // Pour cela, nous devons d'abord récupérer un message existant
        let destinataireId = null;
        
        if (this.activeConversation.messages.length > 0) {
          // Récupérer le premier message pour déterminer expéditeur/destinataire
          const firstMessageResponse = await fetch(`/api/directus/items/messages?filter[conversation_id][_eq]=${this.activeConversation.id}&limit=1&fields=expediteur.*,destinataire.*`);
          
          if (firstMessageResponse.ok) {
            const firstMessageData = await firstMessageResponse.json();
            if (firstMessageData.data && firstMessageData.data.length > 0) {
              const firstMessage = firstMessageData.data[0];
              if (firstMessage.expediteur.id === this.userId) {
                destinataireId = firstMessage.destinataire.id;
              } else {
                destinataireId = firstMessage.expediteur.id;
              }
            }
          }
        } else {
          // Si c'est une nouvelle conversation, nous devons trouver l'autre utilisateur
          // Dans un cas réel, vous auriez besoin de l'ID du destinataire
          destinataireId = "USER_ID_TO_REPLACE"; // À remplacer par l'ID réel
        }
        
        if (!destinataireId) {
          throw new Error("Impossible de déterminer le destinataire");
        }
        
        // Créer le message dans Directus
        const messageData = {
          conversation_id: this.activeConversation.id,
          expediteur: this.userId,
          destinataire: destinataireId,
          contenu: this.newMessage,
          lu: false,
        };
        
        const response = await fetch('/api/directus/items/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        });
        
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Mettre à jour la conversation
        await fetch(`/api/directus/items/conversations/${this.activeConversation.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dernier_message: new Date().toISOString()
          })
        });
        
        // Ajouter le message à la conversation active
        this.activeConversation.messages.push({
          sender: 'me',
          content: this.newMessage,
          timestamp: new Date()
        });
        
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
        await fetch(`/api/directus/items/conversations/${this.activeConversation.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'archived'
          })
        });
        
        // Mettre à jour l'affichage local
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