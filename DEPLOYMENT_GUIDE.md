# Signed Collectibles - Sistema de Operaciones

App React para gestionar ventas, clientes e inventario conectada a Supabase.

## Archivos incluidos

src/App.jsx - Componente principal React
src/index.js - Entry point
public/index.html - HTML base
package.json - Dependencias
DEPLOYMENT_GUIDE.md - Este archivo

## Como desplegar a Vercel

1. Ve a https://vercel.com
2. Click "New Project"
3. Selecciona tu repositorio signed-collectibles-app
4. Vercel detectará que es React automáticamente
5. Click "Deploy"
6. Espera 2-3 minutos
7. Vercel te da la URL: signed-collectibles-app.vercel.app

## Funcionalidades

- Nueva Venta: registra cliente, pieza, precio, método pago
- Nuevo Cliente: crea clientes coleccionistas o revendedores
- Agregar Pieza: inventario con margen automático
- Resumen: vista de disponibilidad

## Credenciales Supabase (ya configuradas)

SUPABASE_URL: https://oaowyzrtpkainrhzibmx.supabase.co
SUPABASE_KEY: (ya está en el código)

## Soporte

Si algo falla:
1. Verifica que Supabase esté activo
2. Abre navegador F12 (Console) para ver errores
3. Recarga la página

Version: 1.0.0
