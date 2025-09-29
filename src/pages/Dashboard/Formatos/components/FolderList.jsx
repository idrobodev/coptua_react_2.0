import React from 'react';

const FolderList = ({
  folders,
  isAdmin,
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
  return (
    <div className="lg:col-span-1 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Carpetas</h3>

      {/* Create Folder */}
      {isAdmin && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Nombre de nueva carpeta"
            className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          />
          <button
            onClick={onCreateFolder}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Crear Carpeta
          </button>
        </div>
      )}

      {/* Folders List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {folders.map((folder) => (
          <div key={folder} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <button
              onClick={() => onNavigateToFolder(folder)}
              className="flex-1 text-left hover:bg-gray-100 p-2 rounded"
            >
              <i className="fas fa-folder mr-2 text-yellow-500"></i>
              {renamingFolder?.folderName === folder ? (
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
                  className="bg-transparent border-b border-blue-500 px-1"
                />
              ) : (
                folder
              )}
            </button>
            {isAdmin && (
              <div className="flex space-x-1">
                {renamingFolder?.folderName === folder ? (
                  <div className="flex space-x-1">
                    <button
                      onClick={() => onRenameFolder(folder)}
                      className="text-green-600 hover:text-green-800"
                      title="Guardar"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button
                      onClick={onCancelRename}
                      className="text-gray-600 hover:text-gray-800"
                      title="Cancelar"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onStartRename(folder)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Renombrar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => onDeleteFolder(folder)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        {folders.length === 0 && (
          <p className="text-gray-500 text-center py-4">No hay carpetas</p>
        )}
      </div>
    </div>
  );
};

export default FolderList;