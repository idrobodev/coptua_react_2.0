import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DataTable from '../../components/UI/DataTable';
import { dbService } from '../../services/database';

const GuardiansList = () => {
  const [guardians, setGuardians] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuardians();
  }, []);

  const loadGuardians = async () => {
    try {
      setLoading(true);
      // TODO: Implementar carga de guardianes desde la base de datos
      // const { data } = await dbService.getGuardians();
      // setGuardians(data || []);
      setGuardians([]);
    } catch (error) {
      console.error('Error loading guardians:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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
      key: 'parentesco',
      label: 'Parentesco',
      render: (value) => {
        const parentescoColors = {
          'MADRE': 'bg-pink-100 text-pink-800',
          'PADRE': 'bg-blue-100 text-blue-800',
          'ABUELO': 'bg-purple-100 text-purple-800',
          'ABUELA': 'bg-purple-100 text-purple-800',
          'TIO': 'bg-green-100 text-green-800',
          'TIA': 'bg-green-100 text-green-800',
          'HERMANO': 'bg-yellow-100 text-yellow-800',
          'HERMANA': 'bg-yellow-100 text-yellow-800',
          'OTRO': 'bg-gray-100 text-gray-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-Poppins font-medium ${parentescoColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        );
      }
    },
    {
      key: 'participantes',
      label: 'Participantes a Cargo',
      render: (value) => (
        <div className="space-y-1">
          {value.map((participante, index) => (
            <span key={index} className="block text-xs font-Poppins text-gray-700 bg-gray-100 px-2 py-1 rounded">
              {participante}
            </span>
          ))}
        </div>
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
      key: 'email',
      label: 'Email',
      render: (value) => (
        <span className="font-Poppins text-gray-700 text-sm">{value}</span>
      )
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
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (_, row) => (
        <div className="flex space-x-2">
          <Link
            to={`/dashboard/guardians/${row.id}`}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            title="Ver perfil"
          >
            <i className="fas fa-eye"></i>
          </Link>
          <Link
            to={`/dashboard/guardians/${row.id}/edit`}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Editar"
          >
            <i className="fas fa-edit"></i>
          </Link>
          <button
            onClick={() => handleContactGuardian(row)}
            className="text-purple-600 hover:text-purple-800 transition-colors"
            title="Contactar"
          >
            <i className="fas fa-phone"></i>
          </button>
        </div>
      )
    }
  ];

  const handleContactGuardian = (guardian) => {
    // TODO: Implementation for contacting guardian (phone/email)
    if (guardian.telefono) {
      window.open(`tel:${guardian.telefono}`);
    }
  };

  const getStats = () => {
    const totalParticipants = guardians.reduce((sum, g) => sum + g.participantes.length, 0);
    
    return {
      total: guardians.length,
      activos: guardians.filter(g => g.estado === 'ACTIVO').length,
      totalParticipants,
      byParentesco: guardians.reduce((acc, g) => {
        acc[g.parentesco] = (acc[g.parentesco] || 0) + 1;
        return acc;
      }, {})
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <DashboardLayout 
        title="Gestión de Acudientes" 
        subtitle="Administra los acudientes responsables de los participantes" 
        loading={true} 
        loadingText="Cargando acudientes..." 
      />
    );
  }

  return (
    <DashboardLayout 
      title="Gestión de Acudientes" 
      subtitle="Administra los acudientes responsables de los participantes"
      extraActions={
        <Link
          to="/dashboard/guardians/new"
          className="bg-primary text-white px-4 py-2 rounded-xl font-Poppins font-medium hover:bg-primary-dark transition-colors duration-200 flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Nuevo Acudiente</span>
        </Link>
      }
    >
      {/* Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-Poppins font-medium text-gray-600">Total Acudientes</p>
                    <p className="text-3xl font-Lato font-bold text-blue-600 mt-2">
                      {stats.total}
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
                      {stats.activos}
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
                    <p className="text-sm font-Poppins font-medium text-gray-600">Participantes a Cargo</p>
                    <p className="text-3xl font-Lato font-bold text-purple-600 mt-2">
                      {stats.totalParticipants}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                    <i className="fas fa-child text-purple-600 text-2xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Promedio por Acudiente</p>
                    <p className="text-3xl font-Lato font-bold text-orange-600 mt-2">
                      {stats.total > 0 ? (stats.totalParticipants / stats.total).toFixed(1) : 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                    <i className="fas fa-chart-line text-orange-600 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Parentesco Distribution */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
              <h3 className="text-xl font-Lato font-bold text-gray-800 mb-6">Distribución por Parentesco</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Object.entries(stats.byParentesco).map(([parentesco, count]) => (
                  <div key={parentesco} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-Lato font-bold text-gray-800">
                      {count}
                    </p>
                    <p className="text-xs font-Poppins text-gray-600 mt-1">
                      {parentesco}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Guardians Table */}
            <DataTable
              data={guardians}
              columns={columns}
              searchable={true}
              sortable={true}
              pagination={true}
              pageSize={15}
              onRowClick={(guardian) => {
                window.location.href = `/dashboard/guardians/${guardian.id}`;
              }}
              className="mb-8"
            />
      </div>
    </DashboardLayout>
  );
};

export default GuardiansList;
