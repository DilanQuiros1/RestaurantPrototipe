// Servicio para consumir productos desde el backend y construir estructura de menú dinámica

// Intento de fetch con proxy relativo y fallback a URL absoluta cuando sea necesario
async function fetchJsonWithFallback(pathOrUrl, options = {}) {
  const headers = { Accept: "application/json", ...(options.headers || {}) };
  // Primer intento: ruta relativa (CRA proxy)
  try {
    const res = await fetch(pathOrUrl, { ...options, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (!ct.includes("application/json")) {
      const text = await res.text();
      throw new Error(
        `Respuesta no JSON (${res.status}). ${text?.slice(0, 120)}`
      );
    }
    return await res.json();
  } catch (err) {
    // Fallback: usar URL absoluta al backend local
    try {
      const url = pathOrUrl.startsWith("http")
        ? pathOrUrl
        : `http://127.0.0.1:8000${
            pathOrUrl.startsWith("/") ? "" : "/"
          }${pathOrUrl}`;
      const res2 = await fetch(url, { ...options, headers });
      if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
      const ct2 = (res2.headers.get("content-type") || "").toLowerCase();
      if (!ct2.includes("application/json")) {
        const text = await res2.text();
        throw new Error(
          `Respuesta no JSON (${res2.status}). ${text?.slice(0, 120)}`
        );
      }
      return await res2.json();
    } catch (err2) {
      console.error("productosService fetch error:", err, err2);
      throw err2;
    }
  }
}

// Mapeo de IDs de categoría del backend a slugs conocidos y nombres de UI
const CATEGORY_ID_TO_SLUG = {
  1: "comidas-rapidas",
  2: "platos-fuertes",
  3: "bebidas",
  4: "postres",
  5: "entradas",
};

const CATEGORY_SLUG_TO_LABEL = {
  "comidas-rapidas": "Comidas Rápidas",
  "platos-fuertes": "Platos Fuertes",
  bebidas: "Bebidas",
  postres: "Postres",
  entradas: "Entradas",
};

// Slugify genérico para nombres de categoría dinámicos
function slugifyCategoria(nombre) {
  if (!nombre) return "otros";
  return nombre
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function labelFromSlug(slug) {
  if (CATEGORY_SLUG_TO_LABEL[slug]) return CATEGORY_SLUG_TO_LABEL[slug];
  // Capitalizar usando espacios
  const txt = slug.replace(/-/g, " ");
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

// Normalizar producto del backend al shape usado en UI
function normalizeProducto(p) {
  const id = p.id_producto ?? p.id ?? p.producto_id ?? null;
  const nombre = p.nombre_producto ?? p.nombre ?? p.name ?? "Producto";
  const descripcion = p.descripcion ?? p.description ?? "";
  const precio = parseFloat(p.precio ?? p.price ?? 0) || 0;
  const urlImg = p.url_img ?? p.imagen_url ?? p.image ?? null;
  const idCategoria = p.id_categoria ?? p.categoria_id ?? null;
  const nombreCategoria =
    p.categoria_nombre ?? p.nombre_categoria ?? p.categoria ?? null;
  const esPlatoDelDia = Boolean(p.es_plato_del_dia ?? p.esPlatoDelDia ?? false);
  const esPromo = Boolean(p.es_promo ?? p.esPromo ?? false);

  // Adicionales: aceptar array de strings o de objetos { id_adicional, nombre_adicional, precio }
  let adicionales = [];
  if (Array.isArray(p.adicionales)) {
    adicionales = p.adicionales.map((a) => {
      if (a && typeof a === "object") {
        return {
          id: a.id_adicional ?? a.id ?? null,
          nombre: a.nombre_adicional ?? a.nombre ?? String(a.id ?? ""),
          precio: a.precio ?? 0,
        };
      }
      return { id: null, nombre: String(a), precio: 0 };
    });
  }

  // Determinar slug de categoría
  let categoriaSlug = null;
  if (idCategoria && CATEGORY_ID_TO_SLUG[idCategoria]) {
    categoriaSlug = CATEGORY_ID_TO_SLUG[idCategoria];
  } else if (nombreCategoria) {
    categoriaSlug = slugifyCategoria(nombreCategoria);
  }

  return {
    id: id ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: nombre,
    description: descripcion,
    price: precio,
    image: urlImg, // Puede ser null; la UI resolverá un fallback
    categorySlug: categoriaSlug ?? "otros",
    categoryName: nombreCategoria ?? labelFromSlug(categoriaSlug ?? "otros"),
    esPlatoDelDia,
    esPromo,
    adicionales, // [{id,nombre,precio}]
  };
}

// Construir estructura { categoriesList, menuData } desde lista de productos normalizados
function buildMenuStructureFromProducts(items) {
  const menuData = {};
  const categoriesSet = new Map(); // slug -> label

  const daily = items.filter((p) => p.esPlatoDelDia);
  const promos = items.filter((p) => p.esPromo);
  const normal = items.filter((p) => !p.esPlatoDelDia && !p.esPromo);

  if (daily.length) menuData["platos-del-dia"] = daily;
  if (promos.length) menuData["promociones"] = promos;

  // Agregar categorías dinámicas
  for (const p of normal) {
    const slug = p.categorySlug || "otros";
    const label = p.categoryName || labelFromSlug(slug);
    if (!menuData[slug]) menuData[slug] = [];
    menuData[slug].push(p);
    if (!categoriesSet.has(slug)) categoriesSet.set(slug, label);
  }

  // Orden sugerido
  const preferredOrder = [
    "platos-del-dia",
    "promociones",
    "comidas-rapidas",
    "platos-fuertes",
    "entradas",
    "bebidas",
    "postres",
  ];
  const categoriesList = [];

  for (const key of preferredOrder) {
    if (menuData[key]) {
      const name =
        key === "platos-del-dia"
          ? "🌟 Platos del Día"
          : key === "promociones"
          ? "🎉 Promociones"
          : CATEGORY_SLUG_TO_LABEL[key] || labelFromSlug(key);
      categoriesList.push({ id: key, name });
    }
  }
  // Agregar otras categorías no listadas ya
  for (const [slug, label] of categoriesSet.entries()) {
    if (!preferredOrder.includes(slug)) {
      categoriesList.push({ id: slug, name: labelFromSlug(slug) || label });
    }
  }

  return { categoriesList, menuData };
}

async function fetchProductosPorNegocio(idNegocio) {
  if (!idNegocio) throw new Error("id_negocio es requerido");
  const data = await fetchJsonWithFallback(
    `/productos/por-negocio?id_negocio=${encodeURIComponent(idNegocio)}`
  );
  const items = Array.isArray(data) ? data.map(normalizeProducto) : [];
  return buildMenuStructureFromProducts(items);
}

const productosService = {
  fetchProductosPorNegocio,
  normalizeProducto,
  buildMenuStructureFromProducts,
  slugifyCategoria,
};

export default productosService;
