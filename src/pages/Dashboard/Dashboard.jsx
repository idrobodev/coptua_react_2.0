import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import DashboardLayout from "components/layout/DashboardLayout";
import { dbService } from "shared/services";
import { StatsGrid, ActionCard, LoadingState } from "components/UI";

const DashboardComponent = () => {
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
        
        // Load acudientes count
        const acudientesResult = await dbService.getAcudientes();
        const totalAcudientes = acudientesResult?.data?.length || 0;
        
        // Calculate stats from real data
        const stats = {
          totalParticipantes: participantes || 0,
          participantesActivos: participantes || 0, // Assuming all are active for now
          totalMensualidades: mensualidades || 0,
          mensualidadesPagadas: Math.floor((mensualidades || 0) * 0.7), // Mock 70% paid
          mensualidadesPendientes: Math.ceil((mensualidades || 0) * 0.3), // Mock 30% pending
          totalAcudientes: totalAcudientes
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
          mensualidadesPendientes: 0,
          totalAcudientes: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Dashboard" subtitle="Corporación Todo por un Alma">
        <LoadingState message="Cargando dashboard..." />
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: "Participantes Activos",
      value: dashboardData?.totalParticipantes || 0,
      icon: "fas fa-users",
      color: "blue",
      subtitle: "Total registrados",
      onClick: () => history.push('/participantes')
    },
    {
      title: "Acudientes",
      value: dashboardData?.totalAcudientes || 0,
      icon: "fas fa-user-friends",
      color: "purple",
      subtitle: "Total registrados",
      onClick: () => history.push('/acudientes')
    },
    {
      title: "Mensualidades",
      value: dashboardData?.mensualidadesPagadas || 0,
      icon: "fas fa-dollar-sign",
      color: "green",
      subtitle: `Pendientes: ${dashboardData?.mensualidadesPendientes || 0}`,
      onClick: () => history.push('/financiero')
    }
  ];

  const quickActions = [
    {
      label: "Gestionar Participantes",
      icon: "fas fa-user-plus",
      color: "blue",
      onClick: () => history.push('/participantes')
    },
    {
      label: "Gestionar Acudientes",
      icon: "fas fa-user-friends",
      color: "purple",
      onClick: () => history.push('/acudientes')
    },
    {
      label: "Gestión Financiera",
      icon: "fas fa-dollar-sign",
      color: "green",
      onClick: () => history.push('/financiero')
    },
    {
      label: "Gestionar Usuarios",
      icon: "fas fa-users-cog",
      color: "indigo",
      onClick: () => history.push('/usuarios')
    },
    {
      label: "Configuración",
      icon: "fas fa-cog",
      color: "gray",
      onClick: () => history.push('/configuracion')
    }
  ];

  return (
    <DashboardLayout title="Dashboard" subtitle="Corporación Todo por un Alma">
      {/* Widgets de Resumen General */}
      <div className="px-6 py-6">
        <h2 className="text-2xl font-Lato font-bold text-gray-800 mb-6">Resumen General</h2>
        <StatsGrid stats={stats} columns={4} gap="md" />
      </div>

      {/* Botones de Acceso Rápido */}
      <div className="px-6 py-6">
        <h3 className="text-xl font-Lato font-bold text-gray-800 mb-4">Acceso Rápido</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <ActionCard
              key={index}
              label={action.label}
              icon={action.icon}
              color={action.color}
              onClick={action.onClick}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Wrap with React.memo to prevent unnecessary re-renders
// Component will only re-render when props change
const Dashboard = React.memo(DashboardComponent);

export default Dashboard;
