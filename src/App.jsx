import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuración Supabase
const SUPABASE_URL = 'https://oaowyzrtpkainrhzibmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hb3d5enJ0cGthaW5yaHppYm14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk2NzAwNDcsImV4cCI6MjA0NTI0NjA0N30.hWVAyCnOhXuwHaCANk_Xt3q9AoN5q9eNl6pPm3hb3qY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function SignedCollectiblesApp() {
  const [activeTab, setActiveTab] = useState('venta');
  const [inventario, setInventario] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  // Formularios
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
    ubicacion: 'CDMX',
    tipo_cliente: 'coleccionista'
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

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const [invRes, cliRes] = await Promise.all([
          supabase.from('inventario').select('id, nombre_pieza, jugador, precio_venta, estado').eq('estado', 'disponible'),
          supabase.from('clientes').select('id, nombre, email, tipo_cliente').eq('activo', true)
        ]);

        if (invRes.data) setInventario(invRes.data);
        if (cliRes.data) setClientes(cliRes.data);
      } catch (err) {
        console.error('Error cargando datos:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const mostrarMensaje = (texto, tipo = 'exito') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 3000);
  };

  // CREAR VENTA
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
        created_by: 'signed_collectibles@gmail.com'
      }]);

      if (error) throw error;

      mostrarMensaje('Venta registrada exitosamente', 'exito');
      setVenta({
        cliente_id: '',
        inventario_id: '',
        precio_final: '',
        metodo_pago: 'transferencia',
        estado_venta: 'pendiente',
        origen: 'whatsapp'
      });

      // Recargar datos
      const [invRes, cliRes] = await Promise.all([
        supabase.from('inventario').select('id, nombre_pieza, jugador, precio_venta, estado').eq('estado', 'disponible'),
        supabase.from('clientes').select('id, nombre, email, tipo_cliente').eq('activo', true)
      ]);
      if (invRes.data) setInventario(invRes.data);
      if (cliRes.data) setClientes(cliRes.data);
    } catch (err) {
      mostrarMensaje('Error al crear venta: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // CREAR CLIENTE
  const crearCliente = async (e) => {
    e.preventDefault();
    if (!cliente.nombre || !cliente.email) {
      mostrarMensaje('Nombre y email son requeridos', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('clientes').insert([{
        nombre: cliente.nombre,
        email: cliente.email,
        whatsapp: cliente.whatsapp,
        ubicacion: cliente.ubicacion,
        tipo_cliente: cliente.tipo_cliente,
        fecha_registro: new Date().toISOString(),
        created_by: 'signed_collectibles@gmail.com'
      }]);

      if (error) throw error;

      mostrarMensaje('Cliente creado exitosamente', 'exito');
      setCliente({
        nombre: '',
        email: '',
        whatsapp: '',
        ubicacion: 'CDMX',
        tipo_cliente: 'coleccionista'
      });

      // Recargar datos
      const [invRes, cliRes] = await Promise.all([
        supabase.from('inventario').select('id, nombre_pieza, jugador, precio_venta, estado').eq('estado', 'disponible'),
        supabase.from('clientes').select('id, nombre, email, tipo_cliente').eq('activo', true)
      ]);
      if (invRes.data) setInventario(invRes.data);
      if (cliRes.data) setClientes(cliRes.data);
    } catch (err) {
      mostrarMensaje('Error al crear cliente: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // CREAR INVENTARIO
  const crearInventario = async (e) => {
    e.preventDefault();
    if (!inventarioForm.nombre_pieza || !inventarioForm.jugador || !inventarioForm.precio_compra || !inventarioForm.precio_venta) {
      mostrarMensaje('Completa todos los campos requeridos', 'error');
      return;
    }

    if (parseFloat(inventarioForm.precio_venta) <= parseFloat(inventarioForm.precio_compra)) {
      mostrarMensaje('Precio venta debe ser mayor que compra', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('inventario').insert([{
        nombre_pieza: inventarioForm.nombre_pieza,
        jugador: inventarioForm.jugador,
        equipo: inventarioForm.equipo,
        certificador: inventarioForm.certificador,
        tipo_pieza: inventarioForm.tipo_pieza,
        precio_compra: parseFloat(inventarioForm.precio_compra),
        precio_venta: parseFloat(inventarioForm.precio_venta),
        stock_fisico: parseInt(inventarioForm.stock_fisico),
        estado: 'disponible',
        fecha_ingreso: new Date().toISOString(),
        created_by: 'signed_collectibles@gmail.com'
      }]);

      if (error) throw error;

      mostrarMensaje('Pieza agregada exitosamente', 'exito');
      setInventarioForm({
        nombre_pieza: '',
        jugador: '',
        equipo: '',
        certificador: 'JSA',
        tipo_pieza: 'Jersey',
        precio_compra: '',
        precio_venta: '',
        stock_fisico: 0
      });

      // Recargar datos
      const [invRes, cliRes] = await Promise.all([
        supabase.from('inventario').select('id, nombre_pieza, jugador, precio_venta, estado').eq('estado', 'disponible'),
        supabase.from('clientes').select('id, nombre, email, tipo_cliente').eq('activo', true)
      ]);
      if (invRes.data) setInventario(invRes.data);
      if (cliRes.data) setClientes(cliRes.data);
    } catch (err) {
      mostrarMensaje('Error al crear pieza: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const calcularMargen = () => {
    const compra = parseFloat(inventarioForm.precio_compra) || 0;
    const venta = parseFloat(inventarioForm.precio_venta) || 0;
    if (compra > 0) {
      return (((venta - compra) / compra) * 100).toFixed(1);
    }
    return 0;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f0f0f; color: #fff; }
        .container { background: #1a1a1a; min-height: 100vh; padding: 2rem 1rem; }
        .header { margin-bottom: 2rem; text-align: center; }
        .header h1 { font-size: 28px; margin-bottom: 0.5rem; }
        .header p { color: #999; font-size: 14px; }
        .tabs { display: flex; gap: 1rem; border-bottom: 1px solid #333; margin-bottom: 2rem; }
        .tab-btn { background: none; border: none; color: #999; padding: 12px 16px; cursor: pointer; font-size: 14px; border-bottom: 2px solid transparent; transition: all 0.2s; }
        .tab-btn.active { color: #fff; border-bottom-color: #0d9488; }
        .tab-btn:hover { color: #ccc; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; color: #ccc; font-size: 13px; margin-bottom: 6px; font-weight: 500; }
        input, select, textarea { width: 100%; padding: 10px 12px; background: #2a2a2a; border: 1px solid #444; border-radius: 6px; color: #fff; font-size: 14px; }
        input:focus, select:focus, textarea:focus { outline: none; border-color: #0d9488; box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-row.full { grid-template-columns: 1fr; }
        button { background: #0d9488; color: #fff; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
        button:hover { background: #0a7a70; }
        button:disabled { background: #555; cursor: not-allowed; }
        .mensaje { padding: 12px 16px; border-radius: 6px; margin-bottom: 1rem; font-size: 14px; }
        .mensaje.exito { background: #0f3931; color: #10b981; border: 1px solid #059669; }
        .mensaje.error { background: #3f1717; color: #f87171; border: 1px solid #dc2626; }
        .section { background: #222; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border: 1px solid #333; }
        .stat { background: #2a2a2a; padding: 1rem; border-radius: 6px; border-left: 3px solid #0d9488; }
        .stat-label { font-size: 12px; color: #999; margin-bottom: 4px; }
        .stat-value { font-size: 20px; font-weight: 600; color: #0d9488; }
        .inventario-list { max-height: 300px; overflow-y: auto; }
        .inventario-item { background: #2a2a2a; padding: 12px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; }
        .inventario-item span { color: #999; }
        .precio { color: #0d9488; font-weight: 600; }
      `}</style>

      <div className="header">
        <h1>⚽ Signed Collectibles</h1>
        <p>Sistema de operaciones - Ventas, clientes e inventario</p>
      </div>

      {mensaje && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'venta' ? 'active' : ''}`} onClick={() => setActiveTab('venta')}>
          Nueva Venta
        </button>
        <button className={`tab-btn ${activeTab === 'cliente' ? 'active' : ''}`} onClick={() => setActiveTab('cliente')}>
          Nuevo Cliente
        </button>
        <button className={`tab-btn ${activeTab === 'inventario' ? 'active' : ''}`} onClick={() => setActiveTab('inventario')}>
          Agregar Pieza
        </button>
        <button className={`tab-btn ${activeTab === 'resumen' ? 'active' : ''}`} onClick={() => setActiveTab('resumen')}>
          Resumen
        </button>
      </div>

      {activeTab === 'venta' && (
        <div className="section">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '18px' }}>Registrar Nueva Venta</h2>
          <form onSubmit={crearVenta}>
            <div className="form-row">
              <div className="form-group">
                <label>Cliente *</label>
                <select value={venta.cliente_id} onChange={(e) => setVenta({ ...venta, cliente_id: e.target.value })} required>
                  <option value="">Selecciona cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.tipo_cliente})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Pieza *</label>
                <select value={venta.inventario_id} onChange={(e) => setVenta({ ...venta, inventario_id: e.target.value })} required>
                  <option value="">Selecciona pieza...</option>
                  {inventario.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre_pieza} - {p.jugador} (${p.precio_venta})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Final *</label>
                <input type="number" step="0.01" value={venta.precio_final} onChange={(e) => setVenta({ ...venta, precio_final: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Método de Pago</label>
                <select value={venta.metodo_pago} onChange={(e) => setVenta({ ...venta, metodo_pago: e.target.value })}>
                  <option value="transferencia">Transferencia</option>
                  <option value="tarjeta_shopify">Tarjeta (Shopify)</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Estado de la Venta</label>
                <select value={venta.estado_venta} onChange={(e) => setVenta({ ...venta, estado_venta: e.target.value })}>
                  <option value="pendiente">Pendiente</option>
                  <option value="pagada">Pagada</option>
                  <option value="enviada">Enviada</option>
                  <option value="entregada">Entregada</option>
                </select>
              </div>
              <div className="form-group">
                <label>Origen</label>
                <select value={venta.origen} onChange={(e) => setVenta({ ...venta, origen: e.target.value })}>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="marketplace">Marketplace</option>
                  <option value="shopify">Shopify</option>
                  <option value="llamada">Llamada</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Registrar Venta'}</button>
          </form>
        </div>
      )}

      {activeTab === 'cliente' && (
        <div className="section">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '18px' }}>Crear Nuevo Cliente</h2>
          <form onSubmit={crearCliente}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre *</label>
                <input type="text" value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} placeholder="Juan García" required />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input type="email" value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} placeholder="juan@email.com" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>WhatsApp</label>
                <input type="tel" value={cliente.whatsapp} onChange={(e) => setCliente({ ...cliente, whatsapp: e.target.value })} placeholder="+55 1234567890" />
              </div>
              <div className="form-group">
                <label>Ubicación</label>
                <select value={cliente.ubicacion} onChange={(e) => setCliente({ ...cliente, ubicacion: e.target.value })}>
                  <option value="CDMX">CDMX</option>
                  <option value="Monterrey">Monterrey</option>
                  <option value="Guadalajara">Guadalajara</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Tipo de Cliente</label>
              <select value={cliente.tipo_cliente} onChange={(e) => setCliente({ ...cliente, tipo_cliente: e.target.value })}>
                <option value="coleccionista">Coleccionista</option>
                <option value="revendedor">Revendedor</option>
              </select>
            </div>

            <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Crear Cliente'}</button>
          </form>
        </div>
      )}

      {activeTab === 'inventario' && (
        <div className="section">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '18px' }}>Agregar Pieza al Inventario</h2>
          <form onSubmit={crearInventario}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Pieza *</label>
                <input type="text" value={inventarioForm.nombre_pieza} onChange={(e) => setInventarioForm({ ...inventarioForm, nombre_pieza: e.target.value })} placeholder="Jersey Messi 2022" required />
              </div>
              <div className="form-group">
                <label>Jugador *</label>
                <input type="text" value={inventarioForm.jugador} onChange={(e) => setInventarioForm({ ...inventarioForm, jugador: e.target.value })} placeholder="Lionel Messi" required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Equipo</label>
                <input type="text" value={inventarioForm.equipo} onChange={(e) => setInventarioForm({ ...inventarioForm, equipo: e.target.value })} placeholder="PSG / Argentina" />
              </div>
              <div className="form-group">
                <label>Tipo de Pieza</label>
                <select value={inventarioForm.tipo_pieza} onChange={(e) => setInventarioForm({ ...inventarioForm, tipo_pieza: e.target.value })}>
                  <option value="Jersey">Jersey</option>
                  <option value="Guante">Guante</option>
                  <option value="Pelota">Pelota</option>
                  <option value="Foto">Foto</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Certificador</label>
                <select value={inventarioForm.certificador} onChange={(e) => setInventarioForm({ ...inventarioForm, certificador: e.target.value })}>
                  <option value="JSA">JSA</option>
                  <option value="PSA">PSA</option>
                  <option value="Beckett">Beckett</option>
                  <option value="Fanatics">Fanatics</option>
                </select>
              </div>
              <div className="form-group">
                <label>Stock Físico</label>
                <input type="number" value={inventarioForm.stock_fisico} onChange={(e) => setInventarioForm({ ...inventarioForm, stock_fisico: e.target.value })} placeholder="0" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Compra *</label>
                <input type="number" step="0.01" value={inventarioForm.precio_compra} onChange={(e) => setInventarioForm({ ...inventarioForm, precio_compra: e.target.value })} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Precio Venta *</label>
                <input type="number" step="0.01" value={inventarioForm.precio_venta} onChange={(e) => setInventarioForm({ ...inventarioForm, precio_venta: e.target.value })} placeholder="0.00" required />
              </div>
            </div>

            {inventarioForm.precio_compra && inventarioForm.precio_venta && (
              <div className="stat" style={{ marginBottom: '1rem' }}>
                <div className="stat-label">Margen de Ganancia</div>
                <div className="stat-value">{calcularMargen()}%</div>
              </div>
            )}

            <button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Agregar Pieza'}</button>
          </form>
        </div>
      )}

      {activeTab === 'resumen' && (
        <div className="section">
          <h2 style={{ marginBottom: '1.5rem', fontSize: '18px' }}>Resumen del Inventario</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat">
              <div className="stat-label">Piezas Disponibles</div>
              <div className="stat-value">{inventario.length}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Clientes Registrados</div>
              <div className="stat-value">{clientes.length}</div>
            </div>
          </div>

          <h3 style={{ fontSize: '16px', marginBottom: '1rem', color: '#ccc' }}>Inventario Disponible</h3>
          <div className="inventario-list">
            {inventario.length === 0 ? (
              <p style={{ color: '#666' }}>No hay piezas disponibles</p>
            ) : (
              inventario.map(pieza => (
                <div key={pieza.id} className="inventario-item">
                  <div>
                    <div style={{ color: '#fff', marginBottom: '4px' }}>{pieza.nombre_pieza}</div>
                    <div><span>{pieza.jugador}</span></div>
                  </div>
                  <div className="precio">${pieza.precio_venta}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
