import { useEffect, useState } from "react";

const API_URL = "http://api-java-proyecto-final-git:8080/api/articulos";

export default function Productos() {
  const [articulos, setArticulos] = useState([]);
  const [form, setForm] = useState({ id: "", nombre: "", precio: "" });
  const [editando, setEditando] = useState(false);

  const fetchArticulos = async () => {
    const res = await fetch(API_URL);
    setArticulos(await res.json());
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const metodo = editando ? "PUT" : "POST";
    const url = editando ? `${API_URL}/${form.id}` : API_URL;
    const body = { nombre: form.nombre, precio: parseFloat(form.precio) };
    await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    setForm({ id: "", nombre: "", precio: "" });
    setEditando(false);
    fetchArticulos();
  };

  const handleEdit = articulo => {
    setForm({ id: articulo.id, nombre: articulo.nombre, precio: articulo.precio.toString() });
    setEditando(true);
  };

  const handleDelete = async id => {
    if (window.confirm("¿Eliminar artículo?")) {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      fetchArticulos();
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Gestión de Artículos</h1>
      <form className="mb-3" onSubmit={handleSubmit}>
        {editando && (
          <input type="hidden" name="id" value={form.id} />
        )}
        <div className="row g-2">
          <div className="col-md-5">
            <input name="nombre" value={form.nombre} onChange={handleChange} className="form-control" placeholder="Nombre del Artículo" required />
          </div>
          <div className="col-md-5">
            <input name="precio" value={form.precio} onChange={handleChange} className="form-control" placeholder="Precio" type="number" step="0.01" required />
          </div>
          <div className="col-md-2 d-grid">
            <button className="btn btn-primary" type="submit">{editando ? "Actualizar" : "Guardar"}</button>
          </div>
        </div>
      </form>
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articulos.map(a => (
            <tr key={a.id}>
              <td>{a.id}</td>
              <td>{a.nombre}</td>
              <td>{a.precio.toFixed(2)}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(a)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
