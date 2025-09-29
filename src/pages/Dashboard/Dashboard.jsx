import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/database";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load basic stats
        const { participantes, mensualidades } = await dbService.getDashboardData();
        
        // Calculate stats from real data
        const stats = {
          totalParticipantes: participantes || 0,
          participantesActivos: participantes || 0, // Assuming all are active for now
          totalMensualidades: mensualidades || 0,
          mensualidadesPagadas: Math.floor((mensualidades || 0) * 0.7), // Mock 70% paid
          mensualidadesPendientes: Math.ceil((mensualidades || 0) * 0.3) // Mock 30% pending
        };
        
        setDashboardData(stats);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values on error
        setDashboardData({
          totalParticipantes: 0,
          participantesActivos: 0,
          totalMensualidades: 0,
          mensualidadesPagadas: 0,
          mensualidadesPendientes: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout 
        title="Dashboard" 
        subtitle="Corporación Todo por un Alma" 
        loading={true} 
        loadingText="Cargando dashboard..." 
      />
    );
  }

  return (
    <DashboardLayout title="Dashboard" subtitle="Corporación Todo por un Alma">


          {/* Widgets de Resumen General */}
          <div className="px-6 py-6">
            <h2 className="text-2xl font-Lato font-bold text-gray-800 mb-6">Resumen General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Participantes Activos */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Participantes Activos</p>
                    <p className="text-3xl font-Lato font-bold text-blue-600 mt-2">{dashboardData?.totalParticipantes || 0}</p>
                    <p className="text-xs font-Poppins text-gray-500 mt-1">Total registrados</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-users text-blue-600 text-2xl"></i>
                  </div>
                </div>
              </div>

              {/* Estado Financiero */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300 group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-Poppins font-medium text-gray-600">Mensualidades</p>
                    <p className="text-3xl font-Lato font-bold text-green-600 mt-2">{dashboardData?.mensualidadesPagadas || 0}</p>
                    <p className="text-xs font-Poppins text-gray-500 mt-1">Pendientes: {dashboardData?.mensualidadesPendientes || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-dollar-sign text-green-600 text-2xl"></i>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-Poppins text-gray-500 mb-2">
                    <span>Pagadas</span>
                    <span>{dashboardData && (dashboardData.mensualidadesPagadas + dashboardData.mensualidadesPendientes) > 0 ? Math.round((dashboardData.mensualidadesPagadas / (dashboardData.mensualidadesPagadas + dashboardData.mensualidadesPendientes)) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500" 
                      style={{width: `${dashboardData && (dashboardData.mensualidadesPagadas + dashboardData.mensualidadesPendientes) > 0 ? Math.round((dashboardData.mensualidadesPagadas / (dashboardData.mensualidadesPagadas + dashboardData.mensualidadesPendientes)) * 100) : 0}%`}}
                    ></div>
                  </div>
                </div>
              </div>


            </div>
          </div>

         
          {/* Botones de Acceso Rápido */}
          <div className="px-6 py-6">
            <h3 className="text-xl font-Lato font-bold text-gray-800 mb-4">Acceso Rápido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button 
                onClick={() => history.push('/participantes')}
                className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-user-plus text-blue-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-Poppins font-medium text-gray-700">Gestionar Participantes</span>
                </div>
              </button>
              
              <button 
                onClick={() => history.push('/financiero')}
                className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-dollar-sign text-green-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-Poppins font-medium text-gray-700">Gestión Financiera</span>
                </div>
              </button>
              
              <button 
                onClick={() => history.push('/configuracion')}
                className="p-4 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-cog text-purple-600 text-xl"></i>
                  </div>
                  <span className="text-xs font-Poppins font-medium text-gray-700">Configuración</span>
                </div>
              </button>
            </div>
          </div>

    </DashboardLayout>
  );
};

export default Dashboard;
