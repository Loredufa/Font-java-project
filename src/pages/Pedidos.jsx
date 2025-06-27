import { useEffect, useState } from "react";


const API_PEDIDOS_URL = "https://api-route-java-application.apps.focus-ocp-sno.datco.net/api/pedidos";
const API_ARTICULOS_URL = "https://api-route-java-application.apps.focus-ocp-sno.datco.net/api/articulos";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [busquedaId, setBusquedaId] = useState("");
  const [form, setForm] = useState({
    id: "",
    nombre_cliente: "",
    direccion_envio: "",
    total: "",
    estado: "",
    detalles: []
  });
  const [editando, setEditando] = useState(false);

  const fetchPedidos = async () => {
    const res = await fetch(API_PEDIDOS_URL);
    setPedidos(await res.json());
  };

  const fetchArticulos = async () => {
    const res = await fetch(API_ARTICULOS_URL);
    setArticulos(await res.json());
  };

  useEffect(() => {
    fetchPedidos();
    fetchArticulos();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetalleChange = (idx, field, value) => {
    const nuevosDetalles = form.detalles.map((d, i) =>
      i === idx ? { ...d, [field]: value } : d
    );
    setForm({ ...form, detalles: nuevosDetalles });
  };

  const handleDetalleArticuloChange = (idx, articuloId) => {
    const articulo = articulos.find(a => a.id === Number(articuloId));
    const nuevosDetalles = form.detalles.map((d, i) =>
      i === idx
        ? {
            ...d,
            articulo: articulo ? { id: articulo.id, nombre: articulo.nombre, precio: articulo.precio } : { id: "", nombre: "" },
            precioUnitario: articulo ? articulo.precio : 0
          }
        : d
    );
    setForm({ ...form, detalles: nuevosDetalles });
  };

  const handleAgregarDetalle = () => {
    setForm({
      ...form,
      detalles: [
        ...form.detalles,
        { articulo: { id: "", nombre: "" }, cantidad: 1, precioUnitario: 0, subtotal: 0 }
      ]
    });
  };

  const handleEliminarDetalle = idx => {
    const nuevosDetalles = form.detalles.filter((_, i) => i !== idx);
    setForm({ ...form, detalles: nuevosDetalles });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // Validaciones
    if (!form.nombre_cliente.trim()) {
      alert("Debe ingresar el nombre del cliente.");
      return;
    }
    if (!form.direccion_envio.trim()) {
      alert("Debe ingresar la dirección de envío.");
      return;
    }
    if (!form.estado.trim()) {
      alert("Debe ingresar el estado del pedido.");
      return;
    }
    if (!form.detalles.length) {
      alert("Debe agregar al menos un producto al pedido.");
      return;
    }
    for (const d of form.detalles) {
      if (!d.articulo.id || !d.cantidad || !d.precioUnitario) {
        alert("Todos los detalles deben tener producto, cantidad y precio unitario.");
        return;
      }
      if (Number(d.cantidad) <= 0 || Number(d.precioUnitario) < 0) {
        alert("Cantidad y precio unitario deben ser mayores a cero.");
        return;
      }
    }
    const metodo = editando ? "PATCH" : "POST";
    const url = editando ? `${API_PEDIDOS_URL}/${form.id}` : API_PEDIDOS_URL;
    // Calcular subtotales y total
    const detalles = form.detalles.map(d => ({
      ...d,
      cantidad: Number(d.cantidad),
      precioUnitario: Number(d.precioUnitario),
      subtotal: Number(d.cantidad) * Number(d.precioUnitario)
    }));
    const total = detalles.reduce((acc, d) => acc + d.subtotal, 0);
    const body = { ...form, total, detalles };
    await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setForm({ id: "", nombre_cliente: "", direccion_envio: "", total: "", estado: "", detalles: [] });
    setEditando(false);
    fetchPedidos();
  };

  const handleEdit = pedido => {
    setForm({
      ...pedido,
      total: pedido.total.toString(),
      detalles: pedido.detalles.map(d => ({
        ...d,
        cantidad: d.cantidad.toString(),
        precioUnitario: d.precioUnitario.toString(),
        subtotal: d.subtotal
      }))
    });
    setEditando(true);
  };

  const handleDelete = async id => {
    if (window.confirm("¿Eliminar pedido?")) {
      await fetch(`${API_PEDIDOS_URL}/${id}`, { method: "DELETE" });
      fetchPedidos();
    }
  };

  const handleBuscar = async e => {
    e.preventDefault();
    if (!busquedaId) return;
    const res = await fetch(`${API_PEDIDOS_URL}/${busquedaId}`);
    if (res.ok) {
      const pedido = await res.json();
      setPedidos([pedido]);
    } else {
      alert("Pedido no encontrado");
    }
  };

  const handleResetBusqueda = () => {
    setBusquedaId("");
    fetchPedidos();
  };

  // Calcular el total en tiempo real
  const totalCalculado = form.detalles.reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.precioUnitario)), 0);

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Pedidos</h1>
      <form className="mb-3" onSubmit={handleSubmit}>
        {editando && (
          <input type="hidden" name="id" value={form.id} />
        )}
        <div className="row g-2">
          <div className="col-md-3">
            <input name="nombre_cliente" value={form.nombre_cliente} onChange={handleChange} className="form-control" placeholder="Nombre Cliente" required />
          </div>
          <div className="col-md-3">
            <input name="direccion_envio" value={form.direccion_envio} onChange={handleChange} className="form-control" placeholder="Dirección Envío" required />
          </div>
          <div className="col-md-2">
            <input name="estado" value={form.estado} onChange={handleChange} className="form-control" placeholder="Estado" required />
          </div>
          <div className="col-md-2">
            <input type="number" className="form-control" value={totalCalculado.toFixed(2)} readOnly tabIndex={-1} style={{ background: '#e9ecef' }} title="Total del pedido" />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-primary" type="submit">{editando ? "Actualizar" : "Crear"}</button>
          </div>
        </div>
        {/* Detalles del pedido */}
        <div className="mt-3">
          <h5>Detalles</h5>
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Cantidad</th>
                <th>Precio Unitario</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {form.detalles.map((d, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      className="form-select"
                      value={d.articulo.id}
                      onChange={e => handleDetalleArticuloChange(idx, e.target.value)}
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {articulos.map(a => (
                        <option key={a.id} value={a.id}>{a.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={d.cantidad}
                      min={1}
                      onChange={e => handleDetalleChange(idx, "cantidad", e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={d.precioUnitario}
                      min={0}
                      step={0.01}
                      onChange={e => handleDetalleChange(idx, "precioUnitario", e.target.value)}
                      required
                    />
                  </td>
                  <td>{(d.cantidad * d.precioUnitario).toFixed(2)}</td>
                  <td>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleEliminarDetalle(idx)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn btn-success btn-sm" onClick={handleAgregarDetalle}>
            Agregar Detalle
          </button>
        </div>
      </form>
      <form className="mb-3 d-flex" onSubmit={handleBuscar}>
        <input className="form-control w-auto me-2" type="number" placeholder="Buscar por ID" value={busquedaId} onChange={e => setBusquedaId(e.target.value)} />
        <button className="btn btn-outline-secondary me-2" type="submit">Buscar</button>
        <button className="btn btn-outline-dark" type="button" onClick={handleResetBusqueda}>Ver Todos</button>
      </form>
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Dirección</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Detalles</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre_cliente}</td>
              <td>{p.direccion_envio}</td>
              <td>{p.total.toFixed(2)}</td>
              <td>{p.estado}</td>
              <td>
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th>Precio Unitario</th>
                      <th>Cantidad</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.detalles.map(det => (
                      <tr key={det.id}>
                        <td>{det.articulo.nombre}</td>
                        <td>{det.precioUnitario.toFixed(2)}</td>
                        <td>{det.cantidad}</td>
                        <td>{det.subtotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(p)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
