import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oaowyzrtpkainrhzibmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb3d5enJ0cGthaW5yaHppYm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NzAwNDcsImV4cCI6MjA0NTI0NjA0N30.hWVAyCnOhXuwHaCANk_Xt3q9AoN5q9eNl6pPm3hb3qY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function SignedCollectiblesApp() {
  const [activeTab, setActiveTab] = useState('venta');
  const [inventario, setInventario] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const [venta, setVenta] = useState({
    cliente_id: '',
    inventario_id: '',
    precio_final: '',
    metodo_pago: 'transferencia',
    estado_venta: 'pendiente',
    origen: 'whatsapp'
  });

  const [cliente, setCliente] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    ubicacion: 'CDMX',
    tipo_cliente: 'coleccionista',
    fuente_descubrimiento: 'instagram'
  });

  const [inventarioForm, setInventarioForm] = useState({
    nombre_pieza: '',
    jugador: '',
    equipo: '',
    certificador: 'JSA',
    tipo_pieza: 'Jersey',
    precio_compra: '',
    precio_venta: '',
    stock_fisico: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data: inv } = await supabase.from('inventario').select('*').eq('estado', 'disponible');
      const { data: cli } = await supabase.from('clientes').select('*').eq('activo', true);
      if (inv) setInventario(inv);
      if (cli) setClientes(cli);
    } catch (err) {
      console.error(err);
    }
  };

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  const crearVenta = async (e) => {
    e.preventDefault();
    if (!venta.cliente_id || !venta.inventario_id || !venta.precio_final) {
      mostrarMensaje('Completa todos los campos', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('ventas').insert([{
        cliente_id: parseInt(venta.cliente_id),
        inventario_id: parseInt(venta.inventario_id),
        precio_final: parseFloat(venta.precio_final),
        metodo_pago: venta.metodo_pago,
        estado_venta: venta.estado_venta,
        origen: venta.origen,
        fecha_venta: new Date().toISOString(),
        created_by: 'app'
      }]);
      if (error) throw error;
      mostrarMensaje('Venta registrada', 'exito');
      setVenta({ cliente_id: '', inventario_id: '', precio_final: '', metodo_pago: 'transferencia', estado_venta: 'pendiente', origen: 'whatsapp' });
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const crearCliente = async (e) => {
    e.preventDefault();
    if (!cliente.nombre || !cliente.email) {
      mostrarMensaje('Nombre y email requeridos', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('clientes').insert([{
        nombre: cliente.nombre,
        email: cliente.email,
        whatsapp: cliente.whatsapp || '',
        ubicacion: cliente.ubicacion,
        tipo_cliente: cliente.tipo_cliente,
        fecha_registro: new Date().toISOString(),
        activo: true,
        created_by: 'app'
      }]);
      if (error) throw error;
      mostrarMensaje('Cliente creado', 'exito');
      setCliente({ nombre: '', email: '', whatsapp: '', instagram: '', facebook: '', ubicacion: 'CDMX', tipo_cliente: 'coleccionista', fuente_descubrimiento: 'instagram' });
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const crearInventario = async (e) => {
    e.preventDefault();
    if (!inventarioForm.nombre_pieza || !inventarioForm.jugador || !inventarioForm.precio_compra || !inventarioForm.precio_venta) {
      mostrarMensaje('Completa campos requeridos', 'error');
      return;
    }
    const pc = parseFloat(inventarioForm.precio_compra);
    const pv = parseFloat(inventarioForm.precio_venta);
    if (pv <= pc) {
      mostrarMensaje('Precio venta debe ser mayor', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from('inventario').insert([{
        nombre_pieza: inventarioForm.nombre_pieza,
        jugador: inventarioForm.jugador,
        equipo: inventarioForm.equipo || '',
        certificador: inventarioForm.certificador,
        tipo_pieza: inventarioForm.tipo_pieza,
        precio_compra: pc,
        precio_venta: pv,
        stock_fisico: parseInt(inventarioForm.stock_fisico) || 0,
        estado: 'disponible',
        fecha_ingreso: new Date().toISOString(),
        created_by: 'app'
      }]);
      if (error) throw error;
      mostrarMensaje('Pieza agregada', 'exito');
      setInventarioForm({ nombre_pieza: '', jugador: '', equipo: '', certificador: 'JSA', tipo_pieza: 'Jersey', precio_compra: '', precio_venta: '', stock_fisico: 0 });
      cargarDatos();
    } catch (err) {
      mostrarMensaje('Error: ' + err.message, 'error');
    }
    setLoading(false);
  };

  const calcularMargen = () => {
    const c = parseFloat(inventarioForm.precio_compra) || 0;
    const v = parseFloat(inventarioForm.precio_venta) || 0;
    return c > 0 ? (((v - c) / c) * 100).toFixed(1) : 0;
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif', background: '#0f0f0f', color: '#fff', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '600', marginBottom: '0.5rem', color: '#D4AF37', letterSpacing: '1px' }}>SIGNED COLLECTIBLES</h1>
        <p style={{ color: '#aaa', fontSize: '15px' }}>Sistema de operaciones</p>
      </div>

      {mensaje && <div style={{ padding: '14px 16px', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '14px', fontWeight: '500', background: mensaje.tipo === 'exito' ? '#0d3a2a' : '#3d1a1a', color: mensaje.tipo === 'exito' ? '#4ade80' : '#f87171', border: `1px solid ${mensaje.tipo === 'exito' ? '#059669' : '#dc2626'}` }}>{mensaje.texto}</div>}

      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #333', marginBottom: '2.5rem', paddingBottom: '0' }}>
        {['venta', 'cliente', 'inventario', 'resumen'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', color: activeTab === tab ? '#D4AF37' : '#888', padding: '14px 0', cursor: 'pointer', fontSize: '15px', fontWeight: '500', borderBottom: activeTab === tab ? '2px solid #D4AF37' : '2px solid transparent', transition: 'all 0.3s' }}>
            {tab === 'venta' && 'Nueva Venta'}
            {tab === 'cliente' && 'Nuevo Cliente'}
            {tab === 'inventario' && 'Agregar Pieza'}
            {tab === 'resumen' && 'Resumen'}
          </button>
        ))}
      </div>

      {activeTab === 'venta' && (
        <div style={{ background: '#151515', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #2a2a2a' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem', color: '#D4AF37' }}>Registrar Nueva Venta</h2>
          <form onSubmit={crearVenta}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliente</label>
                <select value={venta.cliente_id} onChange={(e) => setVenta({ ...venta, cliente_id: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required>
                  <option value="">Selecciona cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pieza</label>
                <select value={venta.inventario_id} onChange={(e) => setVenta({ ...venta, inventario_id: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required>
                  <option value="">Selecciona pieza...</option>
                  {inventario.map(p => <option key={p.id} value={p.id}>{p.nombre_pieza}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio Final</label>
                <input type="number" step="0.01" value={venta.precio_final} onChange={(e) => setVenta({ ...venta, precio_final: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Método Pago</label>
                <select value={venta.metodo_pago} onChange={(e) => setVenta({ ...venta, metodo_pago: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }}>
                  <option>transferencia</option>
                  <option>tarjeta</option>
                  <option>efectivo</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '13px 28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{loading ? 'Guardando...' : 'Registrar Venta'}</button>
          </form>
        </div>
      )}

      {activeTab === 'cliente' && (
        <div style={{ background: '#151515', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #2a2a2a' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem', color: '#D4AF37' }}>Crear Nuevo Cliente</h2>
          <form onSubmit={crearCliente}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre</label>
                <input type="text" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</label>
                <input type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WhatsApp</label>
                <input type="tel" value={cliente.whatsapp} onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Instagram</label>
                <input type="text" value={cliente.instagram} onChange={(e) => setCliente({ ...cliente, instagram: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Facebook</label>
                <input type="text" value={cliente.facebook} onChange={(e) => setCliente({ ...cliente, facebook: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipo Cliente</label>
                <select value={cliente.tipo_cliente} onChange={(e) => setCliente({ ...cliente, tipo_cliente: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }}>
                  <option>coleccionista</option>
                  <option>revendedor</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '13px 28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{loading ? 'Guardando...' : 'Crear Cliente'}</button>
          </form>
        </div>
      )}

      {activeTab === 'inventario' && (
        <div style={{ background: '#151515', padding: '2rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #2a2a2a' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem', color: '#D4AF37' }}>Agregar Pieza</h2>
          <form onSubmit={crearInventario}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nombre Pieza</label>
                <input type="text" value={inventarioForm.nombre_pieza} onChange={(e) => setInventarioForm({ ...inventarioForm, nombre_pieza: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Jugador</label>
                <input type="text" value={inventarioForm.jugador} onChange={(e) => setInventarioForm({ ...inventarioForm, jugador: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio Compra</label>
                <input type="number" step="0.01" value={inventarioForm.precio_compra} onChange={(e) => setInventarioForm({ ...inventarioForm, precio_compra: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
              <div>
                <label style={{ display: 'block', color: '#bbb', fontSize: '13px', marginBottom: '8px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Precio Venta</label>
                <input type="number" step="0.01" value={inventarioForm.precio_venta} onChange={(e) => setInventarioForm({ ...inventarioForm, precio_venta: e.target.value })} style={{ width: '100%', padding: '12px 14px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', color: '#fff', fontSize: '15px' }} required />
              </div>
            </div>
            {inventarioForm.precio_compra && inventarioForm.precio_venta && <div style={{ background: '#1a1a1a', padding: '1.25rem', borderRadius: '6px', marginBottom: '1.5rem', borderLeft: '3px solid #D4AF37' }}><div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margen</div><div style={{ fontSize: '24px', fontWeight: '600', color: '#D4AF37' }}>{calcularMargen()}%</div></div>}
            <button type="submit" disabled={loading} style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '13px 28px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>{loading ? 'Guardando...' : 'Agregar Pieza'}</button>
          </form>
        </div>
      )}

      {activeTab === 'resumen' && (
        <div style={{ background: '#151515', padding: '2rem', borderRadius: '8px', border: '1px solid #2a2a2a' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '1.5rem', color: '#D4AF37' }}>Resumen</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#1a1a1a', padding: '1.25rem', borderRadius: '6px', borderLeft: '3px solid #D4AF37' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Piezas Disponibles</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#D4AF37' }}>{inventario.length}</div>
            </div>
            <div style={{ background: '#1a1a1a', padding: '1.25rem', borderRadius: '6px', borderLeft: '3px solid #D4AF37' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clientes</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: '#D4AF37' }}>{clientes.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
