// Un composant réutilisable pour l'upload et la prévisualisation d'images, qui : Permet la sélection de fichiers - Affiche une prévisualisation de l'image sélectionnée - Émet les événements nécessaires pour le traitement des fichiers
<!-- components/common/FileUpload.vue -->
<template>
    <div class="file-upload">
      <div 
        class="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer"
        @click="selectFile"
      >
        <img 
          v-if="preview" 
          :src="preview" 
          class="mx-auto h-32 object-contain mb-2" 
          alt="Prévisualisation"
        />
        <div v-else class="text-gray-400 mb-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="mx-auto h-12 w-12" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <p v-if="fileName" class="text-sm text-gray-600">
          {{ fileName }}
        </p>
        <p v-else class="text-sm text-gray-500">
          Cliquez pour <span class="text-cyan-600 font-medium">sélectionner une image</span>
          <span v-if="required" class="text-red-500 ml-1">*</span>
        </p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, defineEmits, defineProps, watch } from 'vue';
  
  const props = defineProps({
    modelValue: {
      type: [String, Object, File],
      default: null
    },
    field: {
      type: String,
      required: true
    },
    required: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['update:modelValue', 'update']);
  
  const fileInput = ref(null);
  const preview = ref(null);
  const fileName = ref('');
  
  // Mettre à jour la prévisualisation si le modelValue est modifié
  watch(() => props.modelValue, (newVal) => {
    if (newVal && typeof newVal === 'string') {
      // Si c'est un ID ou une URL, on la montre directement
      preview.value = `/assets/${newVal}`;
      fileName.value = newVal.split('/').pop() || 'Image';
    } else if (newVal instanceof File) {
      fileName.value = newVal.name;
      
      // Créer une prévisualisation pour le fichier
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.value = e.target.result;
      };
      reader.readAsDataURL(newVal);
    } else {
      preview.value = null;
      fileName.value = '';
    }
  }, { immediate: true });
  
  const selectFile = () => {
    if (fileInput.value) fileInput.value.click();
  };
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    fileName.value = file.name;
    
    // Créer une prévisualisation pour l'image
    if (file.type.includes('image')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    }
    
    emit('update:modelValue', file);
    emit('update', { field: props.field, file });
  };
  </script>
  
  <style scoped>
  .file-upload {
    margin-bottom: 1rem;
  }
  </style>