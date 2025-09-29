import React from 'react';

const FileControls = ({
  searchTerm,
  setSearchTerm,
  selectedFileType,
  setSelectedFileType,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  filteredAndSortedFiles,
  files
}) => {
  // File type options for filter
  const fileTypeOptions = [
    { value: 'all', label: 'Todos los tipos', icon: 'fas fa-file' },
    { value: 'document', label: 'Documentos', icon: 'fas fa-file-alt' },
    { value: 'image', label: 'Imágenes', icon: 'fas fa-image' },
    { value: 'video', label: 'Videos', icon: 'fas fa-video' },
    { value: 'audio', label: 'Audio', icon: 'fas fa-music' },
    { value: 'archive', label: 'Archivos', icon: 'fas fa-archive' },
    { value: 'code', label: 'Código', icon: 'fas fa-code' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar archivos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* File Type Filter */}
          <div className="relative">
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {fileTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Fecha</option>
              <option value="name">Nombre</option>
              <option value="size">Tamaño</option>
              <option value="type">Tipo</option>
            </select>
            <i className="fas fa-chevron-down absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
          >
            <i className={`fas fa-sort-amount-${sortOrder === 'asc' ? 'up' : 'down'} text-gray-600`}></i>
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              title="Vista de lista"
            >
              <i className="fas fa-list"></i>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
              title="Vista de cuadrícula"
            >
              <i className="fas fa-th"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mt-4 text-sm text-gray-600">
        {filteredAndSortedFiles.length} archivo{filteredAndSortedFiles.length !== 1 ? 's' : ''} encontrado{filteredAndSortedFiles.length !== 1 ? 's' : ''}
        {searchTerm && ` para "${searchTerm}"`}
        {selectedFileType !== 'all' && ` de tipo ${fileTypeOptions.find(opt => opt.value === selectedFileType)?.label.toLowerCase()}`}
      </div>
    </div>
  );
};

export default FileControls;