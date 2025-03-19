
<template>
    <div class="p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Préférences de notifications</h2>
      
      <!-- Chargement -->
      <div v-if="loading" class="py-10 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
        <p class="mt-2 text-gray-500">Chargement des préférences...</p>
      </div>
      
      <div v-else>
        <!-- Notifications par email -->
        <div class="bg-gray-100 p-6 rounded-lg space-y-6">
          <div class="pb-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Notifications par email</h3>
            
            <div v-for="(pref, index) in emailPreferences" :key="index" class="flex items-center justify-between py-2">
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ pref.title }}</h4>
                <p class="text-sm text-gray-500">{{ pref.description }}</p>
              </div>
              <div class="ml-4">
                <label class="switch relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    v-model="pref.enabled"
                    class="opacity-0 w-0 h-0" 
                  />
                  <span class="slider absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all before:duration-300"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Notifications de l'application -->
          <div class="pb-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Notifications de l'application</h3>
            
            <div v-for="(pref, index) in appPreferences" :key="index" class="flex items-center justify-between py-2">
              <div>
                <h4 class="text-sm font-medium text-gray-900">{{ pref.title }}</h4>
                <p class="text-sm text-gray-500">{{ pref.description }}</p>
              </div>
              <div class="ml-4">
                <label class="switch relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    v-model="pref.enabled"
                    class="opacity-0 w-0 h-0" 
                  />
                  <span class="slider absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all before:duration-300"></span>
                </label>
              </div>
            </div>
          </div>
          
          <!-- Alertes SMS -->
          <div class="pb-4 border-b border-gray-200">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-medium text-gray-900">Alertes SMS</h3>
                <p class="text-sm text-gray-500 mt-1">Recevez des alertes par SMS pour les notifications importantes</p>
              </div>
              <div class="ml-4">
                <label class="switch relative inline-block w-12 h-6">
                  <input 
                    type="checkbox" 
                    v-model="smsEnabled"
                    class="opacity-0 w-0 h-0" 
                  />
                  <span class="slider absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all before:duration-300"></span>
                </label>
              </div>
            </div>
            
            <div v-if="smsEnabled" class="mt-4 space-y-4">
              <div v-if="!phoneVerified" class="p-4 bg-yellow-50 rounded-md">
                <div class="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-yellow-800">Vérification requise</h4>
                    <p class="mt-1 text-sm text-yellow-700">
                      Votre numéro de téléphone n'est pas vérifié. Veuillez le vérifier pour recevoir des alertes SMS.
                    </p>
                    <div class="mt-3">
                      <button 
                        @click="showVerificationForm = true"
                        class="px-3 py-1.5 bg-yellow-800 text-white text-sm rounded-md hover:bg-yellow-900"
                      >
                        Vérifier mon numéro
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-if="phoneVerified">
                <div v-for="(pref, index) in smsPreferences" :key="index" class="flex items-center justify-between py-2">
                  <div>
                    <h4 class="text-sm font-medium text-gray-900">{{ pref.title }}</h4>
                    <p class="text-sm text-gray-500">{{ pref.description }}</p>
                  </div>
                  <div class="ml-4">
                    <label class="switch relative inline-block w-12 h-6">
                      <input 
                        type="checkbox" 
                        v-model="pref.enabled"
                        class="opacity-0 w-0 h-0" 
                      />
                      <span class="slider absolute cursor-pointer inset-0 bg-gray-300 rounded-full transition-all duration-300 before:absolute before:h-4 before:w-4 before:left-1 before:bottom-1 before:bg-white before:rounded-full before:transition-all before:duration-300"></span>
                    </label>
                  </div>
                </div>
                
                <div class="mt-4">
                  <div class="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-cyan-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                    </svg>
                    <p class="ml-3 text-sm text-gray-500">
                      Votre numéro de téléphone vérifié : {{ maskedPhone }}
                      <button 
                        @click="showChangePhoneForm = true" 
                        class="ml-2 text-cyan-600 hover:text-cyan-900 hover:underline"
                      >
                        Modifier
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Newsletter -->
          <div class="mt-6 pb-4 border-b border-gray-200">
            <div class="flex items-start">
              <input 
                id="newsletter" 
                type="checkbox" 
                v-model="newsletterEnabled" 
                class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded mt-1"
              />
              <div class="ml-3">
                <label for="newsletter" class="text-sm font-medium text-gray-900">
                  Recevoir la newsletter mensuelle
                </label>
                <p class="text-sm text-gray-500">
                  Recevez nos conseils immobiliers, des études de marché et des offres exclusives
                </p>
              </div>
            </div>
            
            <div v-if="newsletterEnabled" class="mt-4 pl-7">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                  <div class="space-y-2">
                    <label class="flex items-center">
                      <input 
                        type="radio" 
                        v-model="newsletterFrequency" 
                        value="weekly" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">Hebdomadaire</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="radio" 
                        v-model="newsletterFrequency" 
                        value="monthly" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">Mensuelle</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="radio" 
                        v-model="newsletterFrequency" 
                        value="quarterly" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300"
                      />
                      <span class="ml-2 text-sm text-gray-700">Trimestrielle</span>
                    </label>
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Centres d'intérêt</label>
                  <div class="grid grid-cols-2 gap-2">
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="newsletterInterests.marketNews" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Actualités du marché</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="newsletterInterests.investments" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Conseils d'investissement</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="newsletterInterests.renovation" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Rénovation & Décoration</span>
                    </label>
                    <label class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="newsletterInterests.specialOffers" 
                        class="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 text-sm text-gray-700">Offres spéciales</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Bouton Enregistrer -->
          <div class="flex justify-end pt-6">
            <button 
              type="button" 
              @click="savePreferences"
              :disabled="saving"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg v-if="saving" class="animate-spin h-4 w-4 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ saving ? 'Enregistrement...' : 'Enregistrer les préférences' }}
            </button>
          </div>
        </div>
        
        <!-- Modal de vérification de téléphone -->
        <div 
          v-if="showVerificationForm" 
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Vérification du numéro de téléphone</h3>
              <button @click="showVerificationForm = false" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div v-if="!codeSent">
              <p class="text-sm text-gray-500 mb-4">
                Veuillez entrer votre numéro de téléphone pour recevoir un code de vérification par SMS.
              </p>
              
              <div class="space-y-4">
                <div>
                  <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
                  <div class="relative">
                    <input 
                      type="tel" 
                      id="phoneNumber" 
                      v-model="phoneNumber" 
                      placeholder="+33 6 XX XX XX XX" 
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                    />
                  </div>
                  <p v-if="phoneError" class="mt-1 text-sm text-red-600">{{ phoneError }}</p>
                </div>
                
                <button 
                  @click="sendVerificationCode" 
                  :disabled="!phoneNumber || sendingCode"
                  class="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="sendingCode" class="animate-spin h-4 w-4 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ sendingCode ? 'Envoi en cours...' : 'Envoyer le code' }}
                </button>
              </div>
            </div>
            
            <div v-else>
              <p class="text-sm text-gray-500 mb-4">
                Un code de vérification a été envoyé à <strong>{{ maskedPhone }}</strong>.
                Veuillez entrer ce code pour vérifier votre numéro.
              </p>
              
              <div class="space-y-4">
                <div>
                  <label for="verificationCode" class="block text-sm font-medium text-gray-700 mb-1">Code de vérification</label>
                  <div class="flex space-x-2">
                    <input 
                      v-for="(_, index) in 6" 
                      :key="index"
                      type="text" 
                      maxlength="1"
                      v-model="verificationCode[index]" 
                      @input="onCodeInput(index, $event)"
                      @keydown="onCodeKeydown(index, $event)"
                      class="block w-10 h-12 text-center text-lg rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                      ref="codeInputs"
                    />
                  </div>
                  <p v-if="codeError" class="mt-1 text-sm text-red-600">{{ codeError }}</p>
                </div>
                
                <div class="flex space-x-2">
                  <button 
                    @click="verifyPhoneNumber" 
                    :disabled="!isCodeComplete || verifyingCode"
                    class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="verifyingCode" class="animate-spin h-4 w-4 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ verifyingCode ? 'Vérification...' : 'Vérifier' }}
                  </button>
                  
                  <button 
                    @click="resendCode" 
                    :disabled="resendDisabled || resendingCode"
                    class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="resendingCode" class="animate-spin h-4 w-4 text-gray-700 inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {{ resendingCode ? 'Envoi...' : resendDisabled ? `Renvoyer (${resendCountdown}s)` : 'Renvoyer' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Modal de changement de téléphone -->
        <div 
          v-if="showChangePhoneForm" 
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-white rounded-lg max-w-md w-full p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-medium text-gray-900">Changer de numéro de téléphone</h3>
              <button @click="showChangePhoneForm = false" class="text-gray-400 hover:text-gray-500">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <p class="text-sm text-gray-500 mb-4">
              Votre numéro actuel : <strong>{{ maskedPhone }}</strong>
            </p>
            
            <div class="space-y-4">
              <div>
                <label for="newPhoneNumber" class="block text-sm font-medium text-gray-700 mb-1">Nouveau numéro de téléphone</label>
                <div class="relative">
                  <input 
                    type="tel" 
                    id="newPhoneNumber" 
                    v-model="newPhoneNumber" 
                    placeholder="+33 6 XX XX XX XX" 
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
                  />
                </div>
                <p v-if="newPhoneError" class="mt-1 text-sm text-red-600">{{ newPhoneError }}</p>
              </div>
              
              <div class="flex space-x-2">
                <button 
                  @click="changePhoneNumber" 
                  :disabled="!newPhoneNumber || changingPhone"
                  class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg v-if="changingPhone" class="animate-spin h-4 w-4 text-white inline mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ changingPhone ? 'Mise à jour...' : 'Changer de numéro' }}
                </button>
                
                <button 
                  @click="showChangePhoneForm = false" 
                  class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Notification de succès -->
        <div 
          v-if="showSuccessNotification" 
          class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 shadow-md rounded-md z-50"
        >
          <div class="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <div class="ml-3">
              <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
            </div>
            <button @click="showSuccessNotification = false" class="ml-auto text-green-500 hover:text-green-700">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

<script>
export default {
  name: 'NotificationsTab',
  
  emits: ['update-success'],
  
  data() {
    return {
      // États de chargement
      loading: false,
      saving: false,
      sendingCode: false,
      verifyingCode: false,
      resendingCode: false,
      changingPhone: false,
      
      // Préférences d'email
      emailPreferences: [
        {
          title: 'Nouvelles annonces',
          description: 'Recevez des notifications pour les nouvelles annonces correspondant à vos recherches',
          enabled: true
        },
        {
          title: 'Messages',
          description: 'Recevez des notifications quand vous recevez un nouveau message',
          enabled: true
        },
        {
          title: 'Annonces expirées',
          description: 'Recevez un rappel quand vos annonces sont sur le point d\'expirer',
          enabled: true
        },
        {
          title: 'Mises à jour du portail',
          description: 'Recevez des notifications concernant les nouvelles fonctionnalités et mises à jour',
          enabled: false
        }
      ],
      
      // Préférences d'application
      appPreferences: [
        {
          title: 'Notifications push',
          description: 'Activez les notifications push pour être informé en temps réel',
          enabled: true
        },
        {
          title: 'Nouveaux messages',
          description: 'Recevez des notifications pour les nouveaux messages',
          enabled: true
        },
        {
          title: 'Alertes de prix',
          description: 'Soyez alerté quand le prix d\'une annonce favorite change',
          enabled: true
        }
      ],
      
      // SMS
      smsEnabled: false,
      phoneVerified: false,
      phoneNumber: '',
      newPhoneNumber: '',
      maskedPhone: '+33 6** ** ** 89',
      showVerificationForm: false,
      showChangePhoneForm: false,
      phoneError: '',
      newPhoneError: '',
      
      // Préférences SMS
      smsPreferences: [
        {
          title: 'Messages urgents',
          description: 'Recevez des SMS pour les messages urgents concernant vos annonces',
          enabled: true
        },
        {
          title: 'Visites confirmées',
          description: 'Recevez des SMS de confirmation pour les visites programmées',
          enabled: true
        },
        {
          title: 'Offres d\'achat',
          description: 'Soyez alerté par SMS lors de la réception d\'une offre',
          enabled: true
        }
      ],
      
      // Vérification
      codeSent: false,
      verificationCode: ['', '', '', '', '', ''],
      codeError: '',
      resendDisabled: false,
      resendCountdown: 60,
      resendInterval: null,
      
      // Newsletter
      newsletterEnabled: false,
      newsletterFrequency: 'monthly',
      newsletterInterests: {
        marketNews: true,
        investments: false,
        renovation: true,
        specialOffers: true
      },
      
      // Notification de succès
      showSuccessNotification: false,
      successMessage: '',
    };
  },
  
  computed: {
    // Vérifier si le code est complet
    isCodeComplete() {
      return this.verificationCode.every(digit => digit !== '');
    },
    
    // Obtenir le code complet
    fullVerificationCode() {
      return this.verificationCode.join('');
    }
  },
  
  created() {
    // Charger les préférences de notifications
    this.fetchPreferences();
  },
  
  beforeUnmount() {
    // Nettoyer les intervalles
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
    }
  },
  
  methods: {
    // Récupération des préférences de notifications
    async fetchPreferences() {
      this.loading = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.getNotificationPreferences();
        // this.emailPreferences = response.emailPreferences;
        // this.appPreferences = response.appPreferences;
        // this.smsEnabled = response.smsEnabled;
        // this.phoneVerified = response.phoneVerified;
        // this.newsletterEnabled = response.newsletterEnabled;
        // this.newsletterFrequency = response.newsletterFrequency;
        // this.newsletterInterests = response.newsletterInterests;
        
        // Pour l'exemple, utiliser des données fictives définies dans data()
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 800));
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // Enregistrer les préférences
    async savePreferences() {
      this.saving = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.updateNotificationPreferences({
        //   emailPreferences: this.emailPreferences,
        //   appPreferences: this.appPreferences,
        //   smsEnabled: this.smsEnabled,
        //   smsPreferences: this.smsPreferences,
        //   newsletterEnabled: this.newsletterEnabled,
        //   newsletterFrequency: this.newsletterFrequency,
        //   newsletterInterests: this.newsletterInterests
        // });
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Afficher la notification de succès
        this.successMessage = 'Vos préférences ont été enregistrées avec succès';
        this.showSuccessNotification = true;
        
        // Masquer la notification après 5 secondes
        setTimeout(() => {
          this.showSuccessNotification = false;
        }, 5000);
        
        // Émettre l'événement de mise à jour réussie
        this.$emit('update-success', 'Préférences de notifications mises à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement des préférences:', error);
        alert('Une erreur est survenue lors de l\'enregistrement des préférences');
      } finally {
        this.saving = false;
      }
    },
    
    // Envoyer le code de vérification
    async sendVerificationCode() {
      // Valider le numéro de téléphone
      if (!this.phoneNumber) {
        this.phoneError = 'Veuillez entrer un numéro de téléphone';
        return;
      }
      
      // Expression régulière pour valider un numéro français
      const phoneRegex = /^\+33[67]\d{8}$/;
      if (!phoneRegex.test(this.phoneNumber.replace(/\s/g, ''))) {
        this.phoneError = 'Veuillez entrer un numéro de téléphone français valide';
        return;
      }
      
      this.phoneError = '';
      this.sendingCode = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.sendVerificationCode(this.phoneNumber);
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Masquer le numéro de téléphone
        this.maskedPhone = this.maskPhoneNumber(this.phoneNumber);
        
        // Activer le formulaire de saisie du code
        this.codeSent = true;
        
        // Démarrer le compte à rebours pour le renvoi
        this.startResendCountdown();
        
        // Focus sur le premier champ du code
        this.$nextTick(() => {
          if (this.$refs.codeInputs && this.$refs.codeInputs[0]) {
            this.$refs.codeInputs[0].focus();
          }
        });
      } catch (error) {
        console.error('Erreur lors de l\'envoi du code de vérification:', error);
        this.phoneError = 'Une erreur est survenue lors de l\'envoi du code';
      } finally {
        this.sendingCode = false;
      }
    },
    
    // Démarrer le compte à rebours pour le renvoi de code
    startResendCountdown() {
      this.resendDisabled = true;
      this.resendCountdown = 60;
      
      if (this.resendInterval) {
        clearInterval(this.resendInterval);
      }
      
      this.resendInterval = setInterval(() => {
        this.resendCountdown--;
        
        if (this.resendCountdown <= 0) {
          this.resendDisabled = false;
          clearInterval(this.resendInterval);
        }
      }, 1000);
    },
    
    // Renvoyer le code
    async resendCode() {
      if (this.resendDisabled || this.resendingCode) return;
      
      this.resendingCode = true;
      this.codeError = '';
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.resendVerificationCode(this.phoneNumber);
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Réinitialiser le code
        this.verificationCode = ['', '', '', '', '', ''];
        
        // Redémarrer le compte à rebours
        this.startResendCountdown();
        
        // Focus sur le premier champ du code
        this.$nextTick(() => {
          if (this.$refs.codeInputs && this.$refs.codeInputs[0]) {
            this.$refs.codeInputs[0].focus();
          }
        });
      } catch (error) {
        console.error('Erreur lors du renvoi du code:', error);
        this.codeError = 'Une erreur est survenue lors du renvoi du code';
      } finally {
        this.resendingCode = false;
      }
    },
    
    // Vérifier le numéro de téléphone avec le code
    async verifyPhoneNumber() {
      if (!this.isCodeComplete) return;
      
      this.verifyingCode = true;
      this.codeError = '';
      
      try {
        // Dans un cas réel, ce serait un appel API
        // const response = await api.verifyPhoneNumber(this.phoneNumber, this.fullVerificationCode);
        
        // Simuler une vérification (code 123456 valide, autres codes invalides)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (this.fullVerificationCode === '123456') {
          // Succès
          this.phoneVerified = true;
          this.showVerificationForm = false;
          
          // Arrêter le compte à rebours
          if (this.resendInterval) {
            clearInterval(this.resendInterval);
          }
          
          // Afficher la notification de succès
          this.successMessage = 'Votre numéro de téléphone a été vérifié avec succès';
          this.showSuccessNotification = true;
          
          // Masquer la notification après 5 secondes
          setTimeout(() => {
            this.showSuccessNotification = false;
          }, 5000);
        } else {
          // Code invalide
          this.codeError = 'Code de vérification invalide. Veuillez réessayer.';
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du numéro:', error);
        this.codeError = 'Une erreur est survenue lors de la vérification';
      } finally {
        this.verifyingCode = false;
      }
    },
    
    // Changer de numéro de téléphone
    async changePhoneNumber() {
      // Valider le nouveau numéro
      if (!this.newPhoneNumber) {
        this.newPhoneError = 'Veuillez entrer un numéro de téléphone';
        return;
      }
      
      // Expression régulière pour valider un numéro français
      const phoneRegex = /^\+33[67]\d{8}$/;
      if (!phoneRegex.test(this.newPhoneNumber.replace(/\s/g, ''))) {
        this.newPhoneError = 'Veuillez entrer un numéro de téléphone français valide';
        return;
      }
      
      this.newPhoneError = '';
      this.changingPhone = true;
      
      try {
        // Dans un cas réel, ce serait un appel API
        // await api.updatePhoneNumber(this.newPhoneNumber);
        
        // Simuler une latence
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mettre à jour le numéro masqué
        this.maskedPhone = this.maskPhoneNumber(this.newPhoneNumber);
        
        // Réinitialiser et fermer le formulaire
        this.newPhoneNumber = '';
        this.showChangePhoneForm = false;
        
        // Afficher la notification de succès
        this.successMessage = 'Votre numéro de téléphone a été mis à jour avec succès';
        this.showSuccessNotification = true;
        
        // Masquer la notification après 5 secondes
        setTimeout(() => {
          this.showSuccessNotification = false;
        }, 5000);
      } catch (error) {
        console.error('Erreur lors du changement de numéro:', error);
        this.newPhoneError = 'Une erreur est survenue lors de la mise à jour du numéro';
      } finally {
        this.changingPhone = false;
      }
    },
    
    // Masquer une partie du numéro de téléphone
    maskPhoneNumber(number) {
      // Retirer les espaces
      const cleanNumber = number.replace(/\s/g, '');
      
      // Format: +33 6XX XX XX 89 (garder les 2 premiers et 2 derniers chiffres visibles)
      if (cleanNumber.startsWith('+33') && cleanNumber.length >= 12) {
        const prefix = cleanNumber.substring(0, 3); // +33
        const firstDigit = cleanNumber.substring(3, 4); // 6 ou 7
        const lastTwoDigits = cleanNumber.substring(10, 12); // Deux derniers chiffres
        
        return `${prefix} ${firstDigit}** ** ** ${lastTwoDigits}`;
      }
      
      // Fallback
      return number;
    },
    
    // Gérer la saisie du code
    onCodeInput(index, event) {
      // Nettoyer la valeur pour ne garder que les chiffres
      const value = event.target.value.replace(/\D/g, '');
      
      // Mettre à jour le tableau du code avec le chiffre
      if (value.length > 0) {
        this.verificationCode[index] = value.charAt(0);
        
        // Passer au champ suivant si disponible
        if (index < 5) {
          this.$nextTick(() => {
            if (this.$refs.codeInputs && this.$refs.codeInputs[index + 1]) {
              this.$refs.codeInputs[index + 1].focus();
            }
          });
        }
      } else {
        this.verificationCode[index] = '';
      }
    },
    
    // Gérer les touches de suppression dans les champs du code
    onCodeKeydown(index, event) {
      // Si la touche Backspace est pressée avec un champ vide, revenir au champ précédent
      if (event.key === 'Backspace' && !this.verificationCode[index] && index > 0) {
        this.$refs.codeInputs[index - 1].focus();
      }
    }
  }
};
</script>

<style scoped>
/* Style pour l'indicateur activé/désactivé */
.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
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
  transform: translateX(22px);
}

/* Animation de chargement */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}
</style>