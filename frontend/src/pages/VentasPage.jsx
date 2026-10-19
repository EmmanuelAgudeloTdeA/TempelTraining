import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../services/api';

export default function VentasPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [seller, setSeller] = useState('Sin usuario');
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    async function loadVendors() {
      try {
        const response = await api.get('/usuarios/recepcionistas');
        setVendors(response.data);
      } catch (error) {
        setVendors([]);
      }
    }

    async function loadProducts() {
      try {
        const response = await api.get('/productos');
        setProducts(response.data);
      } catch (error) {
        setProducts([]);
      }
    }

    loadVendors();
    loadProducts();
  }, []);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.precio) * Number(item.cantidad), 0),
    [cart]
  );

  const addProduct = (productId) => {
    const product = products.find((item) => item.id === Number(productId));
    if (!product) return;

    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }

      return [...current, { id: product.id, nombre: product.nombre, cantidad: 1, precio: product.precio }];
    });
  };

  const removeLine = (id) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Cobro</p>
            <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Registro de venta</h1>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => addProduct(product.id)}
              className="rounded-xl border border-tempel-border bg-tempel-bg/40 px-3 py-2 text-sm text-tempel-text hover:border-tempel-blue"
            >
              + {product.nombre}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl border border-tempel-border bg-tempel-bg/40 p-3">
              <div>
                <p className="font-medium text-tempel-text">{item.nombre}</p>
                <p className="text-sm text-tempel-muted">Cantidad: {item.cantidad}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-tempel-text">${new Intl.NumberFormat('es-CL').format(item.precio * item.cantidad)}</span>
                <button onClick={() => removeLine(item.id)} className="text-estado-rojo">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-tempel-border bg-tempel-card p-6">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-tempel-muted">Vendedor</label>
            <select
              value={seller}
              onChange={(event) => setSeller(event.target.value)}
              className="w-full rounded-xl border border-tempel-border bg-tempel-bg px-3 py-3 text-tempel-text focus:border-tempel-blue focus:outline-none"
            >
              <option value="Sin usuario">Sin usuario</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={`${vendor.id} - ${vendor.nombre}`}>
                  {String(vendor.id).padStart(4, '0')} - {vendor.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl bg-tempel-blue/15 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Total venta</p>
            <p className="mt-2 text-3xl font-semibold text-tempel-text">${new Intl.NumberFormat('es-CL').format(total)}</p>
          </div>

          <button className="w-full rounded-xl bg-tempel-blue px-4 py-3 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">
            Registrar venta
          </button>
        </div>
      </div>
    </div>
  );
}
