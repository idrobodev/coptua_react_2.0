import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "components/layout/DashboardLayout";
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
  FormSelect,
  FormTextarea
} from "components/UI";
import { validateMensualidadRelations } from "shared/utils/validationUtils";

const Finance = React.memo(() => {
  const [mensualidades, setMensualidades] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [acudientes, setAcudientes] = useState([]);
  const [filteredAcudientes, setFilteredAcudientes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ 
    participant_id: '', 
    id_acudiente: '',
    mes: '', 
    año: new Date().getFullYear(), 
    valor: '', 
    status: 'PAGADA',
    metodo_pago: 'TRANSFERENCIA',
    fecha_pago: '',
    observaciones: ''
  });
  
  // Use custom hooks
  const { filters, setFilter, clearFilters } = useFilters({ 
    mes: 'all', 
    sede: 'all', 
    año: 'all',
    estado: 'all',
    acudiente: 'all',
    metodo_pago: 'all',
    busqueda: '' 
  });
  const { isOpen: showModal, openModal: openModalHook, closeModal, modalData, updateModalData } = useModal();

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
        
        const [mensRes, partsRes, sedesRes, acudRes] = await Promise.all([
          dbService.getMensualidades(),
          dbService.getParticipantes(),
          dbService.getSedes(),
          dbService.getAcudientes()
        ]);
        
        console.log('📊 Resultados:', { mensRes, partsRes, sedesRes, acudRes });
        
        // Asegurar que siempre sean arrays
        const mensualidadesData = Array.isArray(mensRes.data) ? mensRes.data : [];
        const participantesData = Array.isArray(partsRes.data) ? partsRes.data : [];
        const sedesData = Array.isArray(sedesRes.data) ? sedesRes.data : [];
        const acudientesData = Array.isArray(acudRes.data) ? acudRes.data : [];
        
        setMensualidades(mensualidadesData);
        setParticipants(participantesData);
        setSedes(sedesData);
        setAcudientes(acudientesData);
        setFilteredAcudientes(acudientesData);
        
        console.log('✅ Datos cargados:', {
          mensualidades: mensualidadesData.length,
          participantes: participantesData.length,
          sedes: sedesData.length,
          acudientes: acudientesData.length
        });
      } catch (err) {
        console.error('❌ Error cargando datos financieros:', err);
        setError(err.message || 'Error desconocido al cargar datos');
        // Asegurar arrays vacíos en caso de error
        setMensualidades([]);
        setParticipants([]);
        setSedes([]);
        setAcudientes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter acudientes when participant changes in form
  useEffect(() => {
    if (formData.participant_id) {
      const filtered = acudientes.filter(a => a.id_participante === parseInt(formData.participant_id));
      setFilteredAcudientes(filtered);
      // Reset acudiente selection if current selection is not valid for new participant
      if (formData.id_acudiente && !filtered.find(a => a.id_acudiente === parseInt(formData.id_acudiente))) {
        setFormData(prev => ({ ...prev, id_acudiente: '' }));
      }
    } else {
      setFilteredAcudientes(acudientes);
    }
  }, [formData.participant_id, acudientes, formData.id_acudiente]);

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
    if (filters.estado !== 'all') {
      filtered = filtered.filter(m => m.estado === filters.estado);
    }
    if (filters.acudiente !== 'all') {
      filtered = filtered.filter(m => m.id_acudiente === parseInt(filters.acudiente));
    }
    if (filters.metodo_pago !== 'all') {
      filtered = filtered.filter(m => m.metodo_pago === filters.metodo_pago);
    }
    if (filters.busqueda) {
      filtered = filtered.filter(m =>
        (m.participant_name || '').toLowerCase().includes(filters.busqueda.toLowerCase()) ||
        (m.acudiente_name || '').toLowerCase().includes(filters.busqueda.toLowerCase()) ||
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
        participant_id: mensualidad.participante_id || mensualidad.participant_id,
        id_acudiente: mensualidad.id_acudiente || '',
        mes: mensualidad.mes,
        año: mensualidad.año,
        valor: mensualidad.valor || mensualidad.monto,
        status: mensualidad.estado || mensualidad.status,
        metodo_pago: mensualidad.metodo_pago || 'TRANSFERENCIA',
        fecha_pago: mensualidad.fecha_pago || '',
        observaciones: mensualidad.observaciones || ''
      });
      updateModalData(mensualidad);
    } else {
      setFormData({ 
        participant_id: '', 
        id_acudiente: '',
        mes: '', 
        año: new Date().getFullYear(), 
        valor: '', 
        status: 'PAGADA',
        metodo_pago: 'TRANSFERENCIA',
        fecha_pago: '',
        observaciones: ''
      });
      updateModalData(null);
    }
    openModalHook();
  }, [openModalHook, updateModalData]);

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
    
    // Validate fecha_pago is required when status is PAGADA
    if (formData.status === 'PAGADA' && !formData.fecha_pago) {
      alert('La fecha de pago es requerida cuando el estado es PAGADA');
      return;
    }
    
    // Validate that participante and acudiente exist (if acudiente is provided)
    try {
      if (formData.id_acudiente) {
        const relationsValidation = await validateMensualidadRelations(
          parseInt(formData.participant_id),
          parseInt(formData.id_acudiente)
        );
        
        if (!relationsValidation.isValid) {
          alert(relationsValidation.error);
          return;
        }
      }
    } catch (err) {
      console.error('Error validating relations:', err);
      alert('Error al validar las relaciones: ' + (err.message || 'Error desconocido'));
      return;
    }
    
    const submitData = {
      participant_id: parseInt(formData.participant_id),
      id_acudiente: formData.id_acudiente ? parseInt(formData.id_acudiente) : null,
      mes: parseInt(formData.mes),
      año: parseInt(formData.año),
      monto: parseFloat(formData.valor),
      estado: formData.status,
      metodo_pago: formData.metodo_pago,
      fecha_pago: formData.status === 'PAGADA' ? formData.fecha_pago : null,
      observaciones: formData.observaciones || null
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
      alert('Error al guardar la mensualidad: ' + (err.message || 'Error desconocido'));
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
                  type: 'select',
                  name: 'estado',
                  label: 'Estado',
                  placeholder: 'Todos',
                  options: [
                    { value: 'all', label: 'Todos' },
                    { value: 'PAGADA', label: 'Pagada' },
                    { value: 'PENDIENTE', label: 'Pendiente' }
                  ]
                },
                {
                  type: 'select',
                  name: 'acudiente',
                  label: 'Acudiente',
                  placeholder: 'Todos',
                  options: [
                    { value: 'all', label: 'Todos' },
                    ...acudientes.map(a => ({ 
                      value: a.id_acudiente?.toString() || a.id?.toString(), 
                      label: `${a.nombres} ${a.apellidos}` 
                    }))
                  ]
                },
                {
                  type: 'select',
                  name: 'metodo_pago',
                  label: 'Método de Pago',
                  placeholder: 'Todos',
                  options: [
                    { value: 'all', label: 'Todos' },
                    { value: 'TRANSFERENCIA', label: 'Transferencia' },
                    { value: 'EFECTIVO', label: 'Efectivo' }
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
                    key: 'acudiente_name',
                    header: 'Acudiente',
                    render: (row) => (
                      <span className="text-gray-700">{row.acudiente_name || 'N/A'}</span>
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
                    render: (row) => `$${(row.valor || row.monto || 0).toLocaleString()}`
                  },
                  {
                    key: 'metodo_pago',
                    header: 'Método de Pago',
                    render: (row) => (
                      <span className="text-sm text-gray-600">
                        {row.metodo_pago === 'TRANSFERENCIA' ? 'Transferencia' : 
                         row.metodo_pago === 'EFECTIVO' ? 'Efectivo' : 'N/A'}
                      </span>
                    )
                  },
                  {
                    key: 'status',
                    header: 'Estado',
                    render: (row) => (
                      <StatusToggle
                        currentStatus={row.status || row.estado}
                        statuses={[
                          { value: 'PAGADA', label: 'PAGADA', variant: 'success' },
                          { value: 'PENDIENTE', label: 'PENDIENTE', variant: 'danger' }
                        ]}
                        onChange={(newStatus) => toggleStatus(row.id, newStatus)}
                      />
                    )
                  },
                  {
                    key: 'observaciones',
                    header: 'Observaciones',
                    render: (row) => (
                      <span className="text-sm text-gray-600 truncate max-w-xs block" title={row.observaciones || ''}>
                        {row.observaciones ? 
                          (row.observaciones.length > 30 ? 
                            row.observaciones.substring(0, 30) + '...' : 
                            row.observaciones) : 
                          '-'}
                      </span>
                    )
                  },
                  {
                    key: 'actions',
                    header: 'Acciones',
                    render: (row) => (
                      <ActionDropdown
                        actions={[
                          {
                            label: 'Ver',
                            icon: 'fas fa-eye',
                            onClick: () => openModal(row)
                          },
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
            title={modalData ? 'Ver/Editar Mensualidad' : 'Nueva Mensualidad'}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
            size="lg"
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
                label="Acudiente"
                name="id_acudiente"
                value={formData.id_acudiente}
                onChange={(value) => handleFormDataChange('id_acudiente', value)}
                options={filteredAcudientes.map(a => ({
                  value: a.id_acudiente || a.id,
                  label: `${a.nombres} ${a.apellidos} - ${a.parentesco}`
                }))}
                placeholder="Seleccionar Acudiente"
                disabled={!formData.participant_id}
              />
              
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              
              <FormInput
                label="Valor"
                name="valor"
                type="number"
                value={formData.valor}
                onChange={(value) => handleFormDataChange('valor', value)}
                placeholder="Valor"
                required
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  label="Estado"
                  name="status"
                  value={formData.status}
                  onChange={(value) => handleFormDataChange('status', value)}
                  options={[
                    { value: 'PAGADA', label: 'Pagada' },
                    { value: 'PENDIENTE', label: 'Pendiente' }
                  ]}
                  required
                />
                
                <FormSelect
                  label="Método de Pago"
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={(value) => handleFormDataChange('metodo_pago', value)}
                  options={[
                    { value: 'TRANSFERENCIA', label: 'Transferencia' },
                    { value: 'EFECTIVO', label: 'Efectivo' }
                  ]}
                  required
                />
              </div>
              
              {formData.status === 'PAGADA' && (
                <FormInput
                  label="Fecha de Pago"
                  name="fecha_pago"
                  type="date"
                  value={formData.fecha_pago}
                  onChange={(value) => handleFormDataChange('fecha_pago', value)}
                  required={formData.status === 'PAGADA'}
                />
              )}
              
              <FormTextarea
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={(value) => handleFormDataChange('observaciones', value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
              
              {modalData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-2">Información Completa</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Participante:</span>
                      <span className="ml-2 font-medium">{modalData.participant_name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Acudiente:</span>
                      <span className="ml-2 font-medium">{modalData.acudiente_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Método de Pago:</span>
                      <span className="ml-2 font-medium">
                        {modalData.metodo_pago === 'TRANSFERENCIA' ? 'Transferencia' : 
                         modalData.metodo_pago === 'EFECTIVO' ? 'Efectivo' : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fecha de Pago:</span>
                      <span className="ml-2 font-medium">
                        {modalData.fecha_pago ? new Date(modalData.fecha_pago).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    {modalData.observaciones && (
                      <div className="col-span-2">
                        <span className="text-gray-600">Observaciones:</span>
                        <p className="ml-2 mt-1 text-gray-700">{modalData.observaciones}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormModal>
        </DashboardLayout>
      );
    });

export default Finance;
