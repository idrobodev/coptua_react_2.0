// Utilidades para manejo de archivos

// Tipos de archivo y sus iconos
export const FILE_TYPES = {
  // Documentos
  pdf: { icon: 'fas fa-file-pdf', color: 'text-red-500', category: 'document' },
  doc: { icon: 'fas fa-file-word', color: 'text-blue-500', category: 'document' },
  docx: { icon: 'fas fa-file-word', color: 'text-blue-500', category: 'document' },
  xls: { icon: 'fas fa-file-excel', color: 'text-green-500', category: 'document' },
  xlsx: { icon: 'fas fa-file-excel', color: 'text-green-500', category: 'document' },
  ppt: { icon: 'fas fa-file-powerpoint', color: 'text-orange-500', category: 'document' },
  pptx: { icon: 'fas fa-file-powerpoint', color: 'text-orange-500', category: 'document' },
  txt: { icon: 'fas fa-file-alt', color: 'text-gray-500', category: 'document' },
  
  // Imágenes
  jpg: { icon: 'fas fa-file-image', color: 'text-purple-500', category: 'image' },
  jpeg: { icon: 'fas fa-file-image', color: 'text-purple-500', category: 'image' },
  png: { icon: 'fas fa-file-image', color: 'text-purple-500', category: 'image' },
  gif: { icon: 'fas fa-file-image', color: 'text-purple-500', category: 'image' },
  svg: { icon: 'fas fa-file-image', color: 'text-purple-500', category: 'image' },
  webp: { icon: 'fas fa-file-image', color: 'text-purple-500', category: 'image' },
  
  // Videos
  mp4: { icon: 'fas fa-file-video', color: 'text-red-600', category: 'video' },
  avi: { icon: 'fas fa-file-video', color: 'text-red-600', category: 'video' },
  mov: { icon: 'fas fa-file-video', color: 'text-red-600', category: 'video' },
  wmv: { icon: 'fas fa-file-video', color: 'text-red-600', category: 'video' },
  
  // Audio
  mp3: { icon: 'fas fa-file-audio', color: 'text-indigo-500', category: 'audio' },
  wav: { icon: 'fas fa-file-audio', color: 'text-indigo-500', category: 'audio' },
  flac: { icon: 'fas fa-file-audio', color: 'text-indigo-500', category: 'audio' },
  
  // Archivos comprimidos
  zip: { icon: 'fas fa-file-archive', color: 'text-yellow-600', category: 'archive' },
  rar: { icon: 'fas fa-file-archive', color: 'text-yellow-600', category: 'archive' },
  '7z': { icon: 'fas fa-file-archive', color: 'text-yellow-600', category: 'archive' },
  
  // Código
  js: { icon: 'fas fa-file-code', color: 'text-yellow-500', category: 'code' },
  html: { icon: 'fas fa-file-code', color: 'text-orange-600', category: 'code' },
  css: { icon: 'fas fa-file-code', color: 'text-blue-600', category: 'code' },
  json: { icon: 'fas fa-file-code', color: 'text-green-600', category: 'code' },
  
  // Default
  default: { icon: 'fas fa-file', color: 'text-gray-400', category: 'other' }
};

// Obtener información del tipo de archivo
export const getFileType = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return FILE_TYPES[extension] || FILE_TYPES.default;
};

// Formatear tamaño de archivo
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// Formatear fecha
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Validar archivo para upload
export const validateFile = (file, maxSize = 10 * 1024 * 1024) => {
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push(`El archivo es muy grande (máx. ${formatFileSize(maxSize)})`);
  }
  
  // Validar tipos peligrosos
  const dangerousTypes = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com'];
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  
  if (dangerousTypes.includes(extension)) {
    errors.push('Tipo de archivo no permitido por seguridad');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generar breadcrumbs
export const generateBreadcrumbs = (currentPath) => {
  if (!currentPath) return [{ name: 'Raíz', path: '' }];
  
  const parts = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [{ name: 'Raíz', path: '' }];
  
  let currentBreadcrumbPath = '';
  parts.forEach((part, index) => {
    currentBreadcrumbPath += (index === 0 ? '' : '/') + part;
    breadcrumbs.push({
      name: part,
      path: currentBreadcrumbPath
    });
  });
  
  return breadcrumbs;
};

// Filtrar archivos por categoría
export const filterFilesByCategory = (files, category) => {
  if (category === 'all') return files;
  
  return files.filter(file => {
    const fileType = getFileType(file.name);
    return fileType.category === category;
  });
};

// Obtener estadísticas de archivos
export const getFileStats = (files) => {
  const stats = {
    total: files.length,
    totalSize: 0,
    categories: {}
  };
  
  files.forEach(file => {
    const size = file.metadata?.size || 0;
    stats.totalSize += size;
    
    const fileType = getFileType(file.name);
    const category = fileType.category;
    
    if (!stats.categories[category]) {
      stats.categories[category] = { count: 0, size: 0 };
    }
    
    stats.categories[category].count++;
    stats.categories[category].size += size;
  });
  
  return stats;
};

// Buscar archivos
export const searchFiles = (files, searchTerm, searchIn = ['name']) => {
  if (!searchTerm.trim()) return files;
  
  const term = searchTerm.toLowerCase();
  
  return files.filter(file => {
    return searchIn.some(field => {
      switch (field) {
        case 'name':
          return file.name.toLowerCase().includes(term);
        case 'extension':
          const ext = file.name.split('.').pop()?.toLowerCase();
          return ext?.includes(term);
        case 'category':
          const fileType = getFileType(file.name);
          return fileType.category.includes(term);
        default:
          return false;
      }
    });
  });
};

// Ordenar archivos
export const sortFiles = (files, sortBy, sortOrder = 'asc') => {
  return [...files].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'size':
        aValue = a.metadata?.size || 0;
        bValue = b.metadata?.size || 0;
        break;
      case 'date':
        aValue = new Date(a.created_at || 0);
        bValue = new Date(b.created_at || 0);
        break;
      case 'type':
        aValue = getFileType(a.name).category;
        bValue = getFileType(b.name).category;
        break;
      default: // name
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }
    
    if (sortOrder === 'desc') {
      return aValue < bValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};
