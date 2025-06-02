// composables/useRotationManager.js
import { ref, computed, readonly } from 'vue'

export function useRotationManager(key, fetchItems) {
  const currentItem = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const isBackupItem = ref(false)

  // Clés localStorage
  const STORAGE_KEYS = {
    rotation: `${key}_rotation_list`,
    position: `${key}_current_position`,
    hash: `${key}_items_hash`
  }

  /**
   * Mélange un tableau de manière aléatoire (algorithme Fisher-Yates)
   */
  const shuffleArray = (array) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  /**
   * Génère un hash simple pour détecter les changements dans la liste
   */
  const generateHash = (ids) => {
    return ids.sort().join(',')
  }

  /**
   * Récupère ou génère une nouvelle liste de rotation
   */
  const getRotationList = (itemIds) => {
    const currentHash = generateHash(itemIds)
    const storedHash = localStorage.getItem(STORAGE_KEYS.hash)
    const storedRotation = localStorage.getItem(STORAGE_KEYS.rotation)

    // Si la liste a changé ou n'existe pas, créer une nouvelle rotation
    if (!storedRotation || storedHash !== currentHash) {
      console.log(`[${key}] Génération d'une nouvelle liste de rotation`)
      const newRotation = shuffleArray(itemIds)
      
      localStorage.setItem(STORAGE_KEYS.rotation, JSON.stringify(newRotation))
      localStorage.setItem(STORAGE_KEYS.hash, currentHash)
      localStorage.setItem(STORAGE_KEYS.position, '0')
      
      return { rotation: newRotation, position: 0 }
    }

    // Utiliser la rotation existante
    const rotation = JSON.parse(storedRotation)
    const position = parseInt(localStorage.getItem(STORAGE_KEYS.position) || '0')
    
    return { rotation, position }
  }

  /**
   * Avance à l'élément suivant dans la rotation
   */
  const advancePosition = (rotationLength) => {
    const currentPosition = parseInt(localStorage.getItem(STORAGE_KEYS.position) || '0')
    const nextPosition = (currentPosition + 1) % rotationLength
    
    localStorage.setItem(STORAGE_KEYS.position, nextPosition.toString())
    console.log(`[${key}] Position avancée: ${currentPosition} -> ${nextPosition}`)
    
    return nextPosition
  }

  /**
   * Récupère l'élément courant de la rotation
   */
  const getCurrentRotationItem = async () => {
    try {
      loading.value = true
      console.log(`[${key}] Chargement des éléments...`)

      // Récupérer tous les éléments
      const items = await fetchItems()
      
      if (!items || items.length === 0) {
        console.log(`[${key}] Aucun élément trouvé`)
        return null
      }

      // Extraire les IDs
      const itemIds = items.map(item => item.id || item.annonce || item)
      console.log(`[${key}] ${itemIds.length} éléments trouvés:`, itemIds)

      // Gérer la rotation
      const { rotation, position } = getRotationList(itemIds)
      
      // Avancer à la position suivante
      const nextPosition = advancePosition(rotation.length)
      
      // Récupérer l'ID de l'élément à afficher
      const currentItemId = rotation[nextPosition]
      console.log(`[${key}] Affichage élément ${nextPosition + 1}/${rotation.length} (ID: ${currentItemId})`)

      return currentItemId
    } catch (err) {
      console.error(`[${key}] Erreur:`, err)
      throw err
    }
  }

  /**
   * Charge et retourne l'élément courant avec ses données complètes
   */
  const loadCurrentItem = async (fetchFullItem, fallbackFetch = null) => {
    try {
      loading.value = true
      error.value = null
      isBackupItem.value = false

      const itemId = await getCurrentRotationItem()
      
      if (itemId) {
        // Récupérer les données complètes de l'élément
        const itemData = await fetchFullItem(itemId)
        if (itemData) {
          currentItem.value = itemData
          console.log(`[${key}] Élément chargé avec succès:`, itemData.id || itemData.Titre)
          return
        }
      }

      // Solution de repli si aucun élément ou erreur
      if (fallbackFetch) {
        console.log(`[${key}] Utilisation de la solution de repli...`)
        const fallbackItem = await fallbackFetch()
        if (fallbackItem) {
          currentItem.value = fallbackItem
          isBackupItem.value = true
          return
        }
      }

      // Aucun élément disponible
      currentItem.value = null
      console.log(`[${key}] Aucun élément disponible`)

    } catch (err) {
      console.error(`[${key}] Erreur lors du chargement:`, err)
      error.value = 'Impossible de charger l\'élément'
      currentItem.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Réinitialise la rotation (utile pour les tests ou la maintenance)
   */
  const resetRotation = () => {
    localStorage.removeItem(STORAGE_KEYS.rotation)
    localStorage.removeItem(STORAGE_KEYS.position)
    localStorage.removeItem(STORAGE_KEYS.hash)
    console.log(`[${key}] Rotation réinitialisée`)
  }

  /**
   * Informations de débogage
   */
  const getDebugInfo = () => {
    return {
      rotation: JSON.parse(localStorage.getItem(STORAGE_KEYS.rotation) || '[]'),
      position: parseInt(localStorage.getItem(STORAGE_KEYS.position) || '0'),
      hash: localStorage.getItem(STORAGE_KEYS.hash)
    }
  }

  return {
    currentItem: readonly(currentItem),
    loading: readonly(loading),
    error: readonly(error),
    isBackupItem: readonly(isBackupItem),
    loadCurrentItem,
    resetRotation,
    getDebugInfo
  }
}