import { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/database';
import useDebouncedSearch from './useDebouncedSearch';

// Hook personalizado para manejar datos financieros
export const useFinanceData = () => {
  const [state, setState] = useState({
    mensualidades: [],
    participants: [],
    sedes: [],
    error: null,
    loading: true
  });

  const [filters, setFilters] = useState({ 
    month: 'all', 
    sede: 'all', 
    year: 'all' 
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch] = useDebouncedSearch(searchTerm);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const [mensRes, partsRes, sedesRes] = await Promise.all([
          dbService.getMensualidades(),
          dbService.getParticipantes(),
          dbService.getSedes()
        ]);

        setState({
          mensualidades: mensRes.data || [],
          participants: partsRes.data || [],
          sedes: sedesRes.data || [],
          error: null,
          loading: false
        });
      } catch (err) {
        setState(prev => ({
          ...prev,
          error: err.message,
          loading: false
        }));
      }
    };

    loadData();
  }, []);

  // Datos filtrados
  const filteredData = useMemo(() => {
    let filtered = state.mensualidades;

    if (filters.month !== 'all') {
      filtered = filtered.filter(m => m.mes === parseInt(filters.month));
    }
    
    if (filters.sede !== 'all') {
      filtered = filtered.filter(m => m.sede_id === parseInt(filters.sede));
    }
    
    if (filters.year !== 'all') {
      filtered = filtered.filter(m => m.año === parseInt(filters.year));
    }
    
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(m =>
        (m.participant_name || '').toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [state.mensualidades, filters, debouncedSearch]);

  // Funciones de actualización
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const refreshData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const { data } = await dbService.getMensualidades();
      setState(prev => ({
        ...prev,
        mensualidades: data || [],
        loading: false
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.message,
        loading: false
      }));
    }
  };

  return {
    ...state,
    filters,
    searchTerm,
    filteredData,
    setSearchTerm,
    updateFilters,
    refreshData
  };
};

export default useFinanceData;
