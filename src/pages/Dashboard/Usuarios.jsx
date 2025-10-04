import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "components/layout/DashboardLayout";
import { dbService, ROLES } from "shared/services";
import { FilterBar } from "components/UI/Filter";
import { StatsGrid } from "components/UI/Card";
import { DataTable, ActionDropdown } from "components/UI/Table";
import { ViewDetailsModal, EditFormModal, CreateFormModal } from "components/common/CRUDModals";
import { useFilters, useModal } from "shared/hooks";
import { validateEmail } from "shared/utils/validationUtils";

const UsuariosComponent = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canEdit, setCanEdit] = useState(false);
  
  // Use custom hooks
  const { filters: filtros, setFilter, clearFilters } = useFilters({
    rol: "Todos",
    busqueda: ""
  });
  
  const verModal = useModal();
  const editarModal = useModal();
  const crearModal = useModal();

  // Función para cargar usuarios
  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Cargando usuarios...');

      const result = await dbService.getUsuarios();
      console.log('📊 Resultado usuarios:', result);

      if (result.error) {
        throw new Error(result.error.message || 'Error al cargar usuarios');
      }

      const usuariosData = Array.isArray(result.data) ? result.data : [];
      setUsuarios(usuariosData);
      console.log('✅ Usuarios cargados:', usuariosData.length);
    } catch (err) {
      console.error('❌ Error cargando usuarios:', err);
      setError(err.message || 'Error desconocido al cargar usuarios');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuario actual y verificar permisos
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        // Verificar si tiene permisos de administrador
        const hasPermission = await dbService.hasPermission(ROLES.ADMINISTRADOR);
        setCanEdit(hasPermission);
      } catch (err) {
        console.error('Error cargando usuario actual:', err);
      }
    };

    loadCurrentUser();
    loadUsuarios();
  }, []);

  // Filtrar usuarios
  const filteredUsuarios = useMemo(() => {
    const safeUsuarios = Array.isArray(usuarios) ? usuarios : [];
    let filtered = safeUsuarios;

    if (filtros.rol !== "Todos") {
      filtered = filtered.filter(u => u.rol === filtros.rol);
    }
    if (filtros.busqueda) {
      filtered = filtered.filter(u =>
        (u.email || '').toLowerCase().includes(filtros.busqueda.toLowerCase())
      );
    }
    return filtered;
  }, [usuarios, filtros]);

  // Estadísticas
  const statsData = useMemo(() => [
    {
      title: "Total Usuarios",
      value: filteredUsuarios.length,
      icon: "fas fa-users",
      color: "blue"
    },
    {
      title: "Administradores",
      value: filteredUsuarios.filter(u => u.rol === ROLES.ADMINISTRADOR).length,
      icon: "fas fa-user-shield",
      color: "purple"
    },
    {
      title: "Consulta",
      value: filteredUsuarios.filter(u => u.rol === ROLES.CONSULTA).length,
      icon: "fas fa-user",
      color: "green"
    }
  ], [filteredUsuarios]);

  if (loading) {
    return (
      <DashboardLayout title="Usuarios" subtitle="Gestión de usuarios" loading={true} loadingText="Cargando usuarios..." />
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Usuarios" subtitle="Error al cargar datos" loading={false}>
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading usuarios: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Verificar permisos de acceso a la página
  if (!canEdit) {
    return (
      <DashboardLayout title="Usuarios" subtitle="Acceso denegado">
        <div className="flex items-center justify-center h-screen">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center max-w-md">
            <i className="fas fa-lock text-yellow-600 text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Acceso Denegado</h3>
            <p className="text-gray-600">No tienes permisos para acceder a esta página. Solo los administradores pueden gestionar usuarios.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filterConfig = [
    {
      type: 'select',
      name: 'rol',
      label: 'Rol',
      options: [
        { value: 'Todos', label: 'Todos los Roles' },
        { value: ROLES.ADMINISTRADOR, label: 'Administrador' },
        { value: ROLES.CONSULTA, label: 'Consulta' }
      ]
    },
    {
      type: 'search',
      name: 'busqueda',
      label: 'Búsqueda',
      placeholder: 'Buscar por email...'
    }
  ];

  return (
    <DashboardLayout 
      title="Gestión de Usuarios" 
      subtitle="Administra los usuarios del sistema"
      extraActions={
        canEdit && (
          <button
            onClick={() => crearModal.openModal()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Nuevo Usuario
          </button>
        )
      }
    >
      {/* Filtros */}
      <FilterBar
        filters={filterConfig}
        values={filtros}
        onChange={setFilter}
        onClear={clearFilters}
        showClearButton={true}
      />

      {/* Estadísticas Rápidas */}
      <div className="px-6 py-4">
        <StatsGrid stats={statsData} columns={3} />
      </div>

      {/* Tabla de Usuarios */}
      <div className="px-6 py-4">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Lista de Usuarios</h3>
          <p className="text-sm text-gray-600 mt-1">Gestiona los usuarios del sistema</p>
        </div>

        {filteredUsuarios.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <i className="fas fa-users text-gray-300 text-4xl mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">No hay usuarios que coincidan con los filtros aplicados.</p>
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'email',
                label: 'Email',
                render: (usuario) => (
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-user text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{usuario.email}</p>
                      <p className="text-sm text-gray-500">ID: {usuario.id_usuario || usuario.id}</p>
                    </div>
                  </div>
                )
              },
              {
                key: 'rol',
                label: 'Rol',
                render: (usuario) => (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    usuario.rol === ROLES.ADMINISTRADOR
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    <i className={`fas ${
                      usuario.rol === ROLES.ADMINISTRADOR ? 'fa-user-shield' : 'fa-user'
                    } mr-2`}></i>
                    {usuario.rol === ROLES.ADMINISTRADOR ? 'Administrador' : 'Consulta'}
                  </span>
                )
              },
              {
                key: 'acciones',
                label: 'Acciones',
                render: (usuario) => (
                  canEdit ? (
                    <ActionDropdown
                      actions={[
                        {
                          label: 'Ver detalles',
                          icon: 'fas fa-eye',
                          onClick: () => {
                            verModal.setData(usuario);
                            verModal.openModal();
                          }
                        },
                        {
                          label: 'Editar',
                          icon: 'fas fa-edit',
                          onClick: () => {
                            editarModal.setData(usuario);
                            editarModal.openModal();
                          }
                        }
                      ]}
                    />
                  ) : (
                    <button
                      onClick={() => {
                        verModal.setData(usuario);
                        verModal.open();
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <i className="fas fa-eye mr-1"></i>
                      Ver
                    </button>
                  )
                )
              }
            ]}
            data={filteredUsuarios}
          />
        )}
      </div>

      {/* Modales */}
      <ViewDetailsModal
        isOpen={verModal.isOpen}
        onClose={verModal.closeModal}
        title="Detalles del Usuario"
        data={verModal.data ? [
          { label: 'ID', value: verModal.data.id_usuario || verModal.data.id },
          { label: 'Email', value: verModal.data.email },
          { 
            label: 'Rol', 
            value: verModal.data.rol === ROLES.ADMINISTRADOR ? 'Administrador' : 'Consulta'
          }
        ] : []}
      />

      <EditFormModal
        isOpen={editarModal.isOpen}
        onClose={editarModal.closeModal}
        title="Editar Usuario"
        onSubmit={async (formData) => {
          // Validar email
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
          }

          // Validar rol
          if (!formData.rol || (formData.rol !== ROLES.ADMINISTRADOR && formData.rol !== ROLES.CONSULTA)) {
            throw new Error('Rol inválido');
          }

          // Si no se proporciona password, no lo incluimos en la actualización
          const updateData = {
            email: formData.email,
            rol: formData.rol
          };

          if (formData.password && formData.password.trim()) {
            if (formData.password.length < 8) {
              throw new Error('La contraseña debe tener al menos 8 caracteres');
            }
            updateData.password = formData.password;
          }

          const result = await dbService.updateUsuario(editarModal.data.id_usuario || editarModal.data.id, updateData);
          if (result.error) {
            throw new Error(result.error.message || 'Error al actualizar usuario');
          }
          await loadUsuarios();
        }}
        initialData={editarModal.data}
        fields={[
          { 
            name: 'email', 
            label: 'Email', 
            type: 'email', 
            required: true,
            placeholder: 'usuario@ejemplo.com'
          },
          { 
            name: 'password', 
            label: 'Nueva Contraseña (opcional)', 
            type: 'password',
            placeholder: 'Dejar en blanco para mantener la actual',
            helperText: 'Mínimo 8 caracteres'
          },
          { 
            name: 'rol', 
            label: 'Rol', 
            type: 'select',
            required: true,
            options: [
              { value: ROLES.ADMINISTRADOR, label: 'Administrador' },
              { value: ROLES.CONSULTA, label: 'Consulta' }
            ]
          }
        ]}
      />

      <CreateFormModal
        isOpen={crearModal.isOpen}
        onClose={crearModal.closeModal}
        title="Nuevo Usuario"
        onSubmit={async (formData) => {
          // Validar email
          const emailValidation = validateEmail(formData.email);
          if (!emailValidation.isValid) {
            throw new Error(emailValidation.error);
          }

          // Validar password
          if (!formData.password || formData.password.length < 8) {
            throw new Error('La contraseña debe tener al menos 8 caracteres');
          }

          // Validar rol
          if (!formData.rol || (formData.rol !== ROLES.ADMINISTRADOR && formData.rol !== ROLES.CONSULTA)) {
            throw new Error('Rol inválido');
          }

          const result = await dbService.createUsuario(formData);
          if (result.error) {
            throw new Error(result.error.message || 'Error al crear usuario');
          }
          await loadUsuarios();
        }}
        initialData={{
          email: '',
          password: '',
          rol: ROLES.CONSULTA
        }}
        fields={[
          { 
            name: 'email', 
            label: 'Email', 
            type: 'email', 
            required: true,
            placeholder: 'usuario@ejemplo.com'
          },
          { 
            name: 'password', 
            label: 'Contraseña', 
            type: 'password', 
            required: true,
            placeholder: 'Mínimo 8 caracteres',
            helperText: 'Mínimo 8 caracteres'
          },
          { 
            name: 'rol', 
            label: 'Rol', 
            type: 'select',
            required: true,
            options: [
              { value: ROLES.ADMINISTRADOR, label: 'Administrador' },
              { value: ROLES.CONSULTA, label: 'Consulta' }
            ]
          }
        ]}
      />
    </DashboardLayout>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
const Usuarios = React.memo(UsuariosComponent);

export default Usuarios;
