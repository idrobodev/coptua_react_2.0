import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { DataTable, LoadingSpinner } from 'components/UI';
import { dbService } from 'shared/services';

const ParticipantsList = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const { data } = await dbService.getParticipantes();
      setParticipants(data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebarOpen = () => setSidebarOpen(!sidebarOpen);
  const toggleSidebarCollapsed = () => setSidebarCollapsed(!sidebarCollapsed);

  const columns = [
    {
      key: 'documento',
      label: 'Documento',
      render: (value) => (
        <span className="font-Poppins font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'nombreCompleto',
      label: 'Nombre Completo',
      render: (value) => (
        <span className="font-Poppins font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'sede',
      label: 'Sede',
      render: (value) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-Poppins font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'fechaNacimiento',
      label: 'Edad',
      render: (value) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return <span className="font-Poppins text-gray-700">{age} años</span>;
      }
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-Poppins font-medium ${
          value === 'ACTIVO' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (value) => (
        <span className="font-Poppins text-gray-700">{value}</span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (_, row) => (
        <div className="flex space-x-2">
          <Link
            to={`/dashboard/participants/${row.id}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <i className="fas fa-eye"></i>
          </Link>
          <Link
            to={`/dashboard/participants/${row.id}/edit`}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <i className="fas fa-edit"></i>
          </Link>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebarOpen} isCollapsed={sidebarCollapsed} onToggleCollapse={toggleSidebarCollapsed} />
          <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} pt-20`}>
            <div className="flex items-center justify-center h-screen">
              <LoadingSpinner size="xl" text="Cargando participantes..." />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={toggleSidebarOpen} 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={toggleSidebarCollapsed} 
        />
        
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} pt-20`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-16 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-Lato font-bold text-gray-800">
                    Gestión de Participantes
                  </h1>
                  <p className="text-sm font-Poppins text-gray-600 mt-1">
                    Administra los participantes de la fundación
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard/participants/new"
                    className="bg-primary text-white px-4 py-2 rounded-xl font-Poppins font-medium hover:bg-primary-dark transition-colors duration-200 flex items-center space-x-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Nuevo Participante</span>
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Total Participantes</p>
                    <p className="text-3xl font-Lato font-bold text-blue-600 mt-2">
                      {participants.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <i className="fas fa-users text-blue-600 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Activos</p>
                    <p className="text-3xl font-Lato font-bold text-green-600 mt-2">
                      {participants.filter(p => p.estado === 'ACTIVO').length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                    <i className="fas fa-user-check text-green-600 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Sede Bello</p>
                    <p className="text-3xl font-Lato font-bold text-purple-600 mt-2">
                      {participants.filter(p => p.sede === 'Bello').length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                    <i className="fas fa-building text-purple-600 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Sede Apartadó</p>
                    <p className="text-3xl font-Lato font-bold text-orange-600 mt-2">
                      {participants.filter(p => p.sede === 'Apartadó').length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                    <i className="fas fa-building text-orange-600 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants Table */}
            <DataTable
              data={participants}
              columns={columns}
              searchable={true}
              sortable={true}
              pagination={true}
              pageSize={15}
              onRowClick={(participant) => {
                // Navigate to participant detail
                window.location.href = `/dashboard/participants/${participant.id}`;
              }}
              className="mb-8"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ParticipantsList;
