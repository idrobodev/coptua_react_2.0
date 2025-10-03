import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dbService } from "shared/services";
import { useFilters, usePagination, useModal } from "shared/hooks";
import { 
  LoadingSpinner, 
  FilterBar, 
  DataTable, 
  Pagination,
  StatusToggle,
  ActionDropdown,
  FormModal,
  FormInput,
  FormSelect
} from "components/ui";

const Finance = React.memo(() => {
  const [mensualidades, setMensualidades] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ participant_id: '', mes: '', año: new Date().getFullYear(), valor: '', status: 'PAGADO' });
  
  // Use custom hooks
  const { filters, setFilter, clearFilters } = useFilters({ 
    mes: 'all', 
    sede: 'all', 
    año: 'all',
    busqueda: '' 
  });
  const { isOpen: showModal, open: openModalHook, close: closeModal, data: modalData, setData: setModalData } = useModal();

  // Memoized form handlers to prevent unnecessary re-renders
  const handleFormDataChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const months = useMemo(() => [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ], []);

  const years = useMemo(() => Array.from({ length: 11 }, (_, i) => 2020 + i), []);

  const getMonthLabel = useCallback((mes) => {
    const month = months.find(m => m.value === mes);
    return month ? month.label : mes.toString();
  }, [months]);



  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Cargando datos financieros...');
        
        const [mensRes, partsRes, sedesRes] = await Promise.all([
          dbService.getMensualidades(),
          dbService.getParticipantes(),
          dbService.getSedes()
        ]);
        
        console.log('📊 Resultados:', { mensRes, partsRes, sedesRes });
        
        // Asegurar que siempre sean arrays
        const mensualidadesData = Array.isArray(mensRes.data) ? mensRes.data : [];
        const participantesData = Array.isArray(partsRes.data) ? partsRes.data : [];
        const sedesData = Array.isArray(sedesRes.data) ? sedesRes.data : [];
        
        setMensualidades(mensualidadesData);
        setParticipants(participantesData);
        setSedes(sedesData);
        
        console.log('✅ Datos cargados:', {
          mensualidades: mensualidadesData.length,
          participantes: participantesData.length,
          sedes: sedesData.length
        });
      } catch (err) {
        console.error('❌ Error cargando datos financieros:', err);
        setError(err.message || 'Error desconocido al cargar datos');
        // Asegurar arrays vacíos en caso de error
        setMensualidades([]);
        setParticipants([]);
        setSedes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredMensualidades = useMemo(() => {
    // Asegurar que mensualidades siempre sea un array
    const safeMensualidades = Array.isArray(mensualidades) ? mensualidades : [];
    let filtered = safeMensualidades;
    
    if (filters.mes !== 'all') {
      filtered = filtered.filter(m => m.mes === parseInt(filters.mes));
    }
    if (filters.sede !== 'all') {
      filtered = filtered.filter(m => m.sede_id === parseInt(filters.sede));
    }
    if (filters.año !== 'all') {
      filtered = filtered.filter(m => m.año === parseInt(filters.año));
    }
    if (filters.busqueda) {
      filtered = filtered.filter(m =>
        (m.participant_name || '').toLowerCase().includes(filters.busqueda.toLowerCase()) ||
        getMonthLabel(m.mes).toLowerCase().includes(filters.busqueda.toLowerCase())
      );
    }
    return filtered;
  }, [mensualidades, filters, getMonthLabel]);

  // Use pagination hook
  const {
    currentPage,
    totalPages,
    paginatedData: paginatedMensualidades,
    setPage
  } = usePagination(filteredMensualidades, 10);

  const openModal = useCallback((mensualidad = null) => {
    if (mensualidad) {
      // Pre-fill form with existing data
      setFormData({
        participant_id: mensualidad.participante_id,
        mes: mensualidad.mes,
        año: mensualidad.año,
        valor: mensualidad.valor,
        status: mensualidad.estado // Use original estado
      });
      setModalData(mensualidad);
    } else {
      setFormData({ participant_id: '', mes: '', año: new Date().getFullYear(), valor: '', status: 'PAGADO' });
      setModalData(null);
    }
    openModalHook();
  }, [openModalHook, setModalData]);

  const toggleStatus = useCallback(async (id, newStatus) => {
    try {
      await dbService.updateMensualidad(id, { estado: newStatus });
      // Refresh data
      const { data } = await dbService.getMensualidades();
      setMensualidades(data);
    } catch (err) {
      console.error('Error updating status:', err);
      // Optionally show error toast
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const submitData = {
      participant_id: parseInt(formData.participant_id),
      mes: parseInt(formData.mes),
      año: parseInt(formData.año),
      valor: parseInt(formData.valor),
      status: formData.status
    };
    try {
      if (modalData?.id) {
        await dbService.updateMensualidad(modalData.id, submitData);
      } else {
        await dbService.createMensualidad(submitData);
      }
      closeModal();
      const { data } = await dbService.getMensualidades();
      setMensualidades(data);
    } catch (err) {
      console.error('Error saving payment:', err);
    }
  }, [formData, modalData, closeModal]);

  if (loading) {
    return (
      <DashboardLayout
        title="Mensualidades"
        subtitle="Cargando mensualidades..."
        loading={true}
      >
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout
        title="Mensualidades"
        subtitle="Error al cargar datos"
        loading={false}
      >
        <div className="flex items-center justify-center h-screen">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error loading payments: {error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Mensualidades"
      subtitle="Pagadas, pendientes y vencidas"
      extraActions={
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <i className="fas fa-plus mr-2"></i>Nueva Mensualidad
        </button>
      }
    >
      <section className="px-6 py-6">
            <FilterBar
              filters={[
                {
                  type: 'select',
                  name: 'mes',
                  label: 'Mes',
                  placeholder: 'Todos',
                  options: [
                    { value: 'all', label: 'Todos' },
                    ...months.map(m => ({ value: m.value.toString(), label: m.label }))
                  ]
                },
                {
                  type: 'select',
                  name: 'sede',
                  label: 'Sede',
                  placeholder: 'Todas',
                  options: [
                    { value: 'all', label: 'Todas' },
                    ...sedes.map(s => ({ value: s.id.toString(), label: s.nombre }))
                  ]
                },
                {
                  type: 'select',
                  name: 'año',
                  label: 'Año',
                  placeholder: 'Todos',
                  options: [
                    { value: 'all', label: 'Todos' },
                    ...years.map(y => ({ value: y.toString(), label: y.toString() }))
                  ]
                },
                {
                  type: 'search',
                  name: 'busqueda',
                  label: 'Búsqueda',
                  placeholder: 'Buscar por nombre o mes...'
                }
              ]}
              values={filters}
              onChange={setFilter}
              onClear={clearFilters}
              showClearButton={true}
            />
            <div className="mt-6">
              <DataTable
                data={paginatedMensualidades}
                columns={[
                  {
                    key: 'participant_name',
                    header: 'Participante',
                    render: (row) => (
                      <span className="font-medium text-gray-900">{row.participant_name}</span>
                    )
                  },
                  {
                    key: 'mes',
                    header: 'Mes',
                    render: (row) => getMonthLabel(row.mes)
                  },
                  {
                    key: 'valor',
                    header: 'Cantidad',
                    render: (row) => `$${row.valor?.toLocaleString() || '0'}`
                  },
                  {
                    key: 'status',
                    header: 'Estado',
                    render: (row) => (
                      <StatusToggle
                        currentStatus={row.status}
                        statuses={[
                          { value: 'PAGADO', label: 'PAGADO', variant: 'success' },
                          { value: 'PENDIENTE', label: 'PENDIENTE', variant: 'danger' }
                        ]}
                        onChange={(newStatus) => toggleStatus(row.id, newStatus)}
                      />
                    )
                  },
                  {
                    key: 'fecha_vencimiento',
                    header: 'Fecha',
                    render: (row) => new Date(row.fecha_vencimiento).toLocaleDateString()
                  },
                  {
                    key: 'actions',
                    header: 'Acciones',
                    render: (row) => (
                      <ActionDropdown
                        actions={[
                          {
                            label: 'Editar',
                            icon: 'fas fa-edit',
                            onClick: () => openModal(row)
                          }
                        ]}
                      />
                    )
                  }
                ]}
                keyExtractor={(row) => row.id}
                loading={loading}
                emptyState={
                  <div className="text-center py-8 text-gray-500">
                    No hay mensualidades que mostrar
                  </div>
                }
              />
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  itemsPerPage={10}
                  totalItems={filteredMensualidades.length}
                  showInfo={true}
                  className="mt-4"
                />
              )}
            </div>
          </section>

          {/* Modal */}
          <FormModal
            isOpen={showModal}
            onClose={closeModal}
            title={modalData ? 'Editar Mensualidad' : 'Nueva Mensualidad'}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
            size="md"
          >
            <div className="space-y-4">
              <FormSelect
                label="Participante"
                name="participant_id"
                value={formData.participant_id}
                onChange={(value) => handleFormDataChange('participant_id', value)}
                options={participants.map(p => ({
                  value: p.id,
                  label: `${p.nombres} ${p.apellidos} - ${p.documento}`
                }))}
                placeholder="Seleccionar Participante"
                required
              />
              
              <FormSelect
                label="Mes"
                name="mes"
                value={formData.mes}
                onChange={(value) => handleFormDataChange('mes', value)}
                options={months.map(m => ({
                  value: m.value,
                  label: m.label
                }))}
                placeholder="Seleccionar Mes"
                required
              />
              
              <FormSelect
                label="Año"
                name="año"
                value={formData.año}
                onChange={(value) => handleFormDataChange('año', value)}
                options={years.map(y => ({
                  value: y,
                  label: y.toString()
                }))}
                required
              />
              
              <FormInput
                label="Valor"
                name="valor"
                type="number"
                value={formData.valor}
                onChange={(value) => handleFormDataChange('valor', value)}
                placeholder="Valor"
                required
              />
              
              <FormSelect
                label="Estado"
                name="status"
                value={formData.status}
                onChange={(value) => handleFormDataChange('status', value)}
                options={[
                  { value: 'PAGADO', label: 'Pagado' },
                  { value: 'PENDIENTE', label: 'Pendiente' }
                ]}
                required
              />
            </div>
          </FormModal>
        </DashboardLayout>
      );
    });

export default Finance;
