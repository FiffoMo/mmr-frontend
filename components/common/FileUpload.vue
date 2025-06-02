<!-- components/common/FileUpload.vue -->
<template>
  <div class="file-upload">
    <div 
      class="relative border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:bg-gray-50 cursor-pointer"
      @click="selectFile"
    >
      <!-- Prévisualisation de l'image -->
      <div v-if="preview" class="relative">
        <img 
          :src="preview" 
          class="mx-auto h-32 object-contain mb-2" 
          alt="Prévisualisation"
        />
        
        <!-- Bouton de suppression -->
        <button 
          type="button"
          @click.stop="removeFile"
          class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none"
          title="Supprimer l'image"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>
      
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
  },
  previewUrl: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'update', 'delete']);

const fileInput = ref(null);
const preview = ref(null);
const fileName = ref('');

// Mettre à jour la prévisualisation si le modelValue ou previewUrl est modifié
watch([() => props.modelValue, () => props.previewUrl], ([newVal, newPreviewUrl]) => {
  console.log('modelValue:', newVal);
  console.log('previewUrl:', newPreviewUrl);
  
  // Si une URL de prévisualisation est fournie, l'utiliser en priorité
  if (newPreviewUrl) {
    preview.value = newPreviewUrl;
    fileName.value = 'Image existante';
  } else if (newVal && typeof newVal === 'object' && newVal.id) {
    // Si c'est un objet avec un ID (cas d'une image existante)
    fileName.value = 'Image existante';
    // Ne pas construire d'URL ici - on utilise previewUrl
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

// Fonction pour supprimer un fichier
const removeFile = (event) => {
  event.stopPropagation(); // Éviter la propagation pour ne pas déclencher selectFile
  
  // Réinitialiser les valeurs
  preview.value = null;
  fileName.value = '';
  
  // Effacer l'input de fichier
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  
  // Émettre l'événement pour supprimer le fichier
  emit('update:modelValue', null);
  emit('delete', { field: props.field });
};
</script>

<style scoped>
.file-upload {
  margin-bottom: 1rem;
}
</style>