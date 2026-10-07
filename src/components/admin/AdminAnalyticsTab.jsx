import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrders } from '../../services/db';
import { TrendingUp, Filter, Award, DollarSign, Package, ChevronDown, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminAnalyticsTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month'); // today, week, month, all
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const categories = ['All', 'Hamburguesas', 'Salchipapas', 'Perros Calientes', 'Bebidas', 'Adicionales'];

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = null;

      if (timeFilter === 'today') {
        startDate = new Date(now.setHours(0, 0, 0, 0));
      } else if (timeFilter === 'week') {
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeFilter === 'month') {
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
      }

      const data = await getOrders(startDate, null);
      setOrders(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = orders.length;
    let itemSales = {};
    const chartDataMap = {};

    orders.forEach(order => {
      // Basic Stats
      totalRevenue += order.total || 0;
      
      // Categorías y top items
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (categoryFilter !== 'All' && item.category !== categoryFilter) return;

          if (!itemSales[item.id]) {
            itemSales[item.id] = {
              name: item.name,
              category: item.category,
              quantity: 0,
              revenue: 0
            };
          }
          itemSales[item.id].quantity += item.quantity;
          itemSales[item.id].revenue += item.price * item.quantity;
        });
      }

      // Gráfica de ingresos/pedidos por fecha
      const date = new Date(order.created_at);
      let dateStr = '';
      if (timeFilter === 'today') {
        dateStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      } else {
        dateStr = date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
      }

      if (!chartDataMap[dateStr]) {
        chartDataMap[dateStr] = { date: dateStr, Ingresos: 0, Pedidos: 0 };
      }
      chartDataMap[dateStr].Ingresos += order.total || 0;
      chartDataMap[dateStr].Pedidos += 1;
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Para que salgan cronológicamente correctos
    const chartData = Object.values(chartDataMap).reverse();
    const averageOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

    return { totalRevenue, totalOrders, averageOrderValue, topItems, chartData };
  }, [orders, categoryFilter, timeFilter]);

  // Componente de tooltip para la gráfica
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'white' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color, margin: 0, fontSize: '0.9rem' }}>
              {entry.name}: {entry.name === 'Ingresos' ? '$' + entry.value.toLocaleString('es-CO') : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: '1rem', color: 'white' }}>
      {/* HEADER Y FILTROS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', background: 'linear-gradient(90deg, rgba(229, 169, 0, 0.05) 0%, transparent 100%)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-yellow)', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(229, 169, 0, 0.1)', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-yellow)', boxShadow: '0 0 20px rgba(229, 169, 0, 0.15)' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <h2 className="admin-card-title" style={{ fontSize: '1.8rem', margin: '0 0 0.2rem 0', textShadow: '0 2px 10px rgba(229, 169, 0, 0.2)' }}>Panel de Rendimiento</h2>
            <p className="admin-card-subtitle" style={{ margin: 0, fontSize: '0.95rem', opacity: 0.8 }}>Análisis avanzado de ventas y tendencias</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { id: 'today', label: 'Hoy' },
            { id: 'week', label: '7 Días' },
            { id: 'month', label: '30 Días' },
            { id: 'all', label: 'Todo' }
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeFilter(tf.id)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                background: timeFilter === tf.id ? 'var(--accent-yellow)' : 'transparent',
                color: timeFilter === tf.id ? 'black' : 'var(--text-secondary)',
                fontWeight: timeFilter === tf.id ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '0.9rem'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* MÉTRICAS CLAVE (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ingresos Totales</span>
            <DollarSign size={18} color="var(--accent-yellow)" />
          </div>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>${stats.totalRevenue.toLocaleString('es-CO')}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pedidos Exitosos</span>
            <Package size={18} color="var(--accent-cyan)" />
          </div>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>{stats.totalOrders}</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Ticket Promedio</span>
            <Activity size={18} color="var(--accent-pink)" />
          </div>
          <h3 style={{ margin: 0, fontSize: '2rem' }}>${Math.round(stats.averageOrderValue).toLocaleString('es-CO')}</h3>
        </motion.div>
      </div>

      {/* SECCIÓN PRINCIPAL: DIAGRAMA DE BARRAS Y LISTAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        {/* GRÁFICA DE TENDENCIA */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', gridColumn: '1 / -1' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Tendencia de Ingresos</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {loading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando datos...</div>
            ) : stats.chartData.length === 0 ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No hay datos suficientes para graficar</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="Ingresos" fill="var(--accent-yellow)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* TOP PRODUCTOS */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Award color="var(--accent-pink)" size={20} /> Ranking de Productos
            </h3>
            
            {/* Filtro de Categoría Integrado */}
            <div style={{ position: 'relative' }}>
              <div 
                style={{ padding: '0.4rem 0.8rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Filter size={14} color="var(--accent-cyan)" />
                <span>{categoryFilter === 'All' ? 'Todas' : categoryFilter}</span>
                <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={{ position: 'absolute', top: '100%', right: 0, minWidth: '150px', background: 'var(--bg-secondary)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginTop: '4px', overflow: 'hidden', zIndex: 20 }}
                  >
                    {categories.map(c => (
                      <div
                        key={c}
                        onClick={() => { setCategoryFilter(c); setIsDropdownOpen(false); }}
                        style={{ padding: '0.6rem 1rem', cursor: 'pointer', background: categoryFilter === c ? 'rgba(255,255,255,0.05)' : 'transparent', color: categoryFilter === c ? 'var(--accent-yellow)' : 'white', fontSize: '0.85rem' }}
                      >
                        {c === 'All' ? 'Todas' : c}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando ranking...</div>
          ) : stats.topItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No hay datos.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {stats.topItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: index === 0 ? 'var(--accent-yellow)' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: index < 3 ? 'black' : 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.quantity} vendidos</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--accent-yellow)' }}>
                    ${item.revenue.toLocaleString('es-CO')}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
