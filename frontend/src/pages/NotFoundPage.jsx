import { Link } from "react-router-dom";

export const NotFoundPage = () => (
  <section className="page-section">
    <p className="eyebrow">404</p>
    <h2>Página no encontrada</h2>
    <p>La ruta solicitada no existe.</p>
    <Link className="button-link" to="/">
      Ir al dashboard
    </Link>
  </section>
);