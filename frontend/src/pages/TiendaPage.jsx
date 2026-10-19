import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';

const categories = ['Todo', 'ropa', 'suplementos', 'accesorios', 'equipos'];

export default function TiendaPage() {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Todo');

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await api.get('/productos');
        setProducts(response.data);
      } catch (error) {
        setProducts([]);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = activeCategory === 'Todo' ? products : products.filter((product) => product.categoria === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-tempel-blue">Catálogo</p>
          <h1 className="mt-2 text-3xl font-semibold text-tempel-text">Tienda</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-tempel-blue px-4 py-2.5 font-medium text-white shadow-[0_0_18px_rgba(41,182,246,0.35)]">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              activeCategory === category
                ? 'border-tempel-blue bg-tempel-blue/15 text-tempel-blue'
                : 'border-tempel-border bg-tempel-card text-tempel-muted hover:text-tempel-text'
            }`}
          >
            {category === 'Todo' ? 'Todo' : category}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-3xl border border-tempel-border bg-tempel-card">
            <div className="h-38 bg-gradient-to-br from-tempel-blue/15 via-tempel-card to-tempel-bg p-4">
              <div className="flex h-full items-center justify-center rounded-2xl border border-tempel-border bg-tempel-bg/50 text-4xl text-tempel-blue">
                {product.nombre?.charAt(0) || 'P'}
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm uppercase tracking-[0.18em] text-tempel-muted">{product.categoria}</p>
                <span className="rounded-full bg-tempel-blue/10 px-2 py-1 text-xs text-tempel-blue">{product.stock} uds</span>
              </div>
              <h3 className="text-lg font-semibold text-tempel-text">{product.nombre}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xl font-semibold text-tempel-blue">${new Intl.NumberFormat('es-CL').format(product.precio || 0)}</span>
                <button className="rounded-lg bg-tempel-card px-3 py-2 text-sm text-tempel-text border border-tempel-border">Editar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
