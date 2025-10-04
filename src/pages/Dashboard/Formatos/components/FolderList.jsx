import React from 'react';

const FolderList = ({
  folders,
  isAdmin,
  currentPath,
  newFolderName,
  setNewFolderName,
  onCreateFolder,
  renamingFolder,
  onUpdateRenameName,
  onStartRename,
  onCancelRename,
  onRenameFolder,
  onDeleteFolder,
  onNavigateToFolder
}) => {
  // Get current folder name from path
  const getCurrentFolderName = () => {
    if (!currentPath) return null;
    const parts = currentPath.split('/').filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : null;
  };

  const currentFolderName = getCurrentFolderName();

  return (
    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fas fa-folder-tree mr-2 text-blue-600"></i>
        Carpetas
      </h3>

      {/* Create Folder */}
      {isAdmin && (
        <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 animate-fadeIn">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nombre de nueva carpeta"
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={onCreateFolder}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus mr-2"></i>
            Crear Carpeta
          </button>
        </div>
      )}

      {/* Folders List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {folders.map((folder, index) => {
          const isActive = folder === currentFolderName;
          const isRenaming = renamingFolder?.folderName === folder;

          return (
            <div
              key={folder}
              className={`group relative rounded-xl border transition-all duration-300 hover:shadow-md ${
                isActive
                  ? 'bg-blue-50 border-blue-300 shadow-md'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              } ${isRenaming ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
              style={{
                animationDelay: `${index * 50}ms`,
                animation: 'slideInLeft 0.3s ease-out forwards'
              }}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl"></div>
              )}

              <div className="flex items-center justify-between p-3">
                <button
                  onClick={() => onNavigateToFolder(folder)}
                  className={`flex-1 text-left p-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 hover:bg-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <i className={`fas mr-3 text-lg transition-all duration-200 ${
                      isActive
                        ? 'fa-folder-open text-blue-600'
                        : 'fa-folder text-yellow-500 group-hover:text-yellow-600'
                    }`}></i>

                    {isRenaming ? (
                      <input
                        type="text"
                        value={renamingFolder.newName}
                        onChange={(e) => onUpdateRenameName(e.target.value)}
                        onBlur={() => {
                          if (renamingFolder.newName.trim()) {
                            onRenameFolder(folder);
                          } else {
                            onCancelRename();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onRenameFolder(folder);
                          } else if (e.key === 'Escape') {
                            onCancelRename();
                          }
                        }}
                        autoFocus
                        className="bg-transparent border-b-2 border-blue-500 px-1 py-0.5 focus:outline-none text-gray-800 font-medium animate-pulse"
                      />
                    ) : (
                      <span className={`font-medium transition-colors duration-200 ${
                        isActive ? 'text-blue-800' : 'text-gray-700'
                      }`}>
                        {folder}
                      </span>
                    )}
                  </div>
                </button>

                {isAdmin && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {isRenaming ? (
                      <div className="flex space-x-1 animate-fadeIn">
                        <button
                          onClick={() => onRenameFolder(folder)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Guardar"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button
                          onClick={onCancelRename}
                          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Cancelar"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onStartRename(folder)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Renombrar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => onDeleteFolder(folder)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 transform hover:scale-110"
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {folders.length === 0 && (
          <div className="text-center py-8">
            <i className="fas fa-folder-open text-4xl text-gray-300 mb-3"></i>
            <p className="text-gray-500">No hay carpetas</p>
            <p className="text-sm text-gray-400 mt-1">Crea tu primera carpeta para organizar tus archivos</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderList;