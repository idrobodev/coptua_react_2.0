import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { dbService } from "../../services/database";
import useDebouncedSearch from "../../hooks/useDebouncedSearch";
import LoadingSpinner from "components/UI/LoadingSpinner";

const Finance = () => {
  const [mensualidades, setMensualidades] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({ month: 'all', sede: 'all', year: 'all' });
  const [debouncedSearch] = useDebouncedSearch(searchTerm);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ participant_id: '', mes: '', año: new Date().getFullYear(), valor: '', status: 'PAGADO' });

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

  const years = Array.from({ length: 11 }, (_, i) => 2020 + i);

  const getMonthLabel = useCallback((mes) => {
    const month = months.find(m => m.value === mes);
    return month ? month.label : mes.toString();
  }, [months]);

  const getToggleStatus = (status) => {
    return status === 'PAGADO' ? 'PENDIENTE' : 'PAGADO';
  };

  const getStatusClass = (status) => {
    if (status === 'PAGADO') {
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    } else if (status === 'VENCIDA') {
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    }
    return 'bg-red-100 text-red-800 hover:bg-red-200';
  };

  const getButtonTitle = (status) => {
    return status === 'PAGADO' ? 'Cambiar a Pendiente' : 'Cambiar a Pagado';
  };

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
    
    if (filtros.month !== 'all') {
      filtered = filtered.filter(m => m.mes === parseInt(filtros.month));
    }
    if (filtros.sede !== 'all') {
      filtered = filtered.filter(m => m.sede_id === parseInt(filtros.sede));
    }
    if (filtros.year !== 'all') {
      filtered = filtered.filter(m => m.año === parseInt(filtros.year));
    }
    if (debouncedSearch) {
      filtered = filtered.filter(m =>
        (m.participant_name || '').toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        getMonthLabel(m.mes).toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }
    return filtered;
  }, [mensualidades, filtros, debouncedSearch, getMonthLabel]);

  const paginatedMensualidades = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredMensualidades.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredMensualidades, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMensualidades.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (newFiltros) => {
    setFiltros(newFiltros);
    setCurrentPage(1);
  };

  const openModal = (type, id = null) => {
    if (id) {
      // Pre-fill form with existing data
      const mensualidad = mensualidades.find(m => m.id === id);
      if (mensualidad) {
        setFormData({
          participant_id: mensualidad.participante_id,
          mes: mensualidad.mes,
          año: mensualidad.año,
          valor: mensualidad.valor,
          status: mensualidad.estado // Use original estado
        });
      }
    } else {
      setFormData({ participant_id: '', mes: '', año: new Date().getFullYear(), valor: '', status: 'PAGADO' });
    }
    setEditingId(id);
    setShowModal(true);
  };

  const toggleStatus = async (id, newStatus) => {
    try {
      await dbService.updateMensualidad(id, { estado: newStatus });
      // Refresh data
      const { data } = await dbService.getMensualidades();
      setMensualidades(data);
    } catch (err) {
      console.error('Error updating status:', err);
      // Optionally show error toast
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = {
      participant_id: parseInt(formData.participant_id),
      mes: parseInt(formData.mes),
      año: parseInt(formData.año),
      valor: parseInt(formData.valor),
      status: formData.status
    };
    try {
      if (editingId) {
        await dbService.updateMensualidad(editingId, submitData);
      } else {
        await dbService.createMensualidad(submitData);
      }
      setShowModal(false);
      setEditingId(null);
      const { data } = await dbService.getMensualidades();
      setMensualidades(data);
    } catch (err) {
      console.error('Error saving payment:', err);
    }
  };

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
        <button onClick={() => openModal('add')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <i className="fas fa-plus mr-2"></i>Nueva Mensualidad
        </button>
      }
    >
      <section className="px-6 py-6">
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mes</label>
                  <select
                    value={filtros.month}
                    onChange={(e) => handleFilterChange({...filtros, month: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">Todos</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sede</label>
                  <select
                    value={filtros.sede}
                    onChange={(e) => handleFilterChange({...filtros, sede: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">Todas</option>
                    {sedes.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
                  <select
                    value={filtros.year}
                    onChange={(e) => handleFilterChange({...filtros, year: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="all">Todos</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o mes..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Mes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center">
                            <LoadingSpinner size="sm" text="Cargando..." />
                          </td>
                        </tr>
                      ) : paginatedMensualidades.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                            No hay mensualidades que mostrar
                          </td>
                        </tr>
                      ) : (
                        paginatedMensualidades.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {row.participant_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getMonthLabel(row.mes)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${row.valor?.toLocaleString() || '0'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleStatus(row.id, getToggleStatus(row.status))}
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${getStatusClass(row.status)}`}
                                title={getButtonTitle(row.status)}
                              >
                                {row.status}
                              </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(row.fecha_vencimiento).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => openModal('edit', row.id)} 
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {totalPages > 1 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredMensualidades.length)} de {filteredMensualidades.length} resultados
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 text-sm font-medium rounded-md ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Modal - Updated for consistency */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">{editingId ? 'Editar Mensualidad' : 'Nueva Mensualidad'}</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                      value={formData.participant_id}
                      onChange={(e) => setFormData({...formData, participant_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar Participante</option>
                      {participants.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nombres} {p.apellidos} - {p.documento}
                        </option>
                      ))}
                    </select>
                    <select
                      value={formData.mes}
                      onChange={(e) => setFormData({...formData, mes: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccionar Mes</option>
                      {months.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <select
                      value={formData.año}
                      onChange={(e) => setFormData({...formData, año: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Valor"
                      value={formData.valor}
                      onChange={(e) => setFormData({...formData, valor: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="PAGADO">Pagado</option>
                      <option value="PENDIENTE">Pendiente</option>
                    </select>
                    <div className="flex justify-end space-x-3">
                      <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancelar</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </DashboardLayout>
      );
    };

export default Finance;
