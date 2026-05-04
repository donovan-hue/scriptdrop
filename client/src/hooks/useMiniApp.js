// useMinaApp Hook - Manage mini-app operations
import { useState, useCallback, useRef } from 'react';

export const useMiniApp = () => {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Obtener todas las aplicaciones disponibles
  const getAllApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/miniapps`);
      const data = await response.json();
      setLoading(false);
      return data.data || [];
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [apiUrl]);

  // Obtener apps por categoría
  const getAppsByCategory = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/miniapps/category/${category}`);
      const data = await response.json();
      setLoading(false);
      return data.data || [];
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [apiUrl]);

  // Obtener marketplace
  const getMarketplace = useCallback(async (category = 'all', page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        ...(category !== 'all' && { category }),
        page,
        limit
      });
      const response = await fetch(`${apiUrl}/miniapps/marketplace?${params}`);
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [apiUrl]);

  // Obtener categorías
  const getCategories = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/miniapps/categories`);
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [apiUrl]);

  // Crear instancia de app
  const createInstance = useCallback(async (appId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appId })
      });

      if (!response.ok) {
        throw new Error('Failed to create instance');
      }

      const data = await response.json();
      setInstances(prev => [...prev, data.data]);
      setLoading(false);
      return data.data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, [apiUrl]);

  // Obtener instancias activas
  const getActiveInstances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instances`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setInstances(data.data || []);
      setLoading(false);
      return data.data || [];
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return [];
    }
  }, [apiUrl]);

  // Obtener historial
  const getHistory = useCallback(async (limit = 20) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/history?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [apiUrl]);

  // Obtener detalles de instancia
  const getInstance = useCallback(async (instanceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instance/${instanceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Actualizar estado de instancia
  const updateInstanceStatus = useCallback(async (instanceId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instance/${instanceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      setInstances(prev =>
        prev.map(inst => inst.instanceId === instanceId ? data.data : inst)
      );
      return data.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Ejecutar comando
  const executeCommand = useCallback(async (instanceId, command, params = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instance/${instanceId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ command, params })
      });

      if (!response.ok) {
        throw new Error('Failed to execute command');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Guardar datos de usuario
  const saveInstanceData = useCallback(async (instanceId, data) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instance/${instanceId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error('Failed to save data');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Cerrar instancia
  const closeInstance = useCallback(async (instanceId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/instance/${instanceId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to close instance');
      }

      setInstances(prev =>
        prev.filter(inst => inst.instanceId !== instanceId)
      );
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }, [apiUrl]);

  // Obtener estadísticas de app
  const getAppStats = useCallback(async (appId) => {
    try {
      const response = await fetch(`${apiUrl}/miniapps/stats/${appId}`);
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Obtener ratings/reviews de app
  const getAppRatings = useCallback(async (appId, limit = 10, page = 1) => {
    try {
      const params = new URLSearchParams({ limit, page });
      const response = await fetch(`${apiUrl}/miniapps/ratings/${appId}?${params}`);
      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Calificar app
  const rateApp = useCallback(async (appId, rating, review = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/miniapps/rate/${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, review })
      });

      if (!response.ok) {
        throw new Error('Failed to rate app');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  // Buscar apps
  const searchApps = useCallback(async (query, category = 'all', limit = 20) => {
    try {
      const params = new URLSearchParams({ query, category, limit });
      const response = await fetch(`${apiUrl}/miniapps/search?${params}`);
      const data = await response.json();
      return data.data || [];
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, [apiUrl]);

  return {
    instances,
    loading,
    error,
    getAllApps,
    getAppsByCategory,
    getMarketplace,
    getCategories,
    createInstance,
    getActiveInstances,
    getHistory,
    getInstance,
    updateInstanceStatus,
    executeCommand,
    saveInstanceData,
    closeInstance,
    getAppStats,
    getAppRatings,
    rateApp,
    searchApps
  };
};
