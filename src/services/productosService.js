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
  // Estado de visibilidad (A = Activo/Visible, I = Inactivo/Oculto)
  const estadoRaw = p.estado ?? p.estado_producto ?? p.status ?? "A";
  const isVisible = estadoRaw === "A";
  // Disponibilidad (diversos posibles campos y formatos: boolean, 'S'/'N', 'A'/'I', 1/0)
  const disponibilidadRaw =
    p.disponibilidad ?? p.disponible ?? p.is_available ?? p.available ?? true;
  const isAvailable =
    disponibilidadRaw === true ||
    disponibilidadRaw === "S" ||
    disponibilidadRaw === "A" ||
    disponibilidadRaw === 1 ||
    disponibilidadRaw === "1";

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
    isVisible,
    isAvailable,
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
  async actualizarProducto(data) {
    // data debe incluir: id_producto, id_negocio, id_categoria, nombre_producto, descripcion?, precio, es_plato_del_dia, es_promo, estado, adicionales[]
    if (!data || !data.id_producto || !data.id_negocio) {
      throw new Error(
        "id_producto e id_negocio son requeridos para actualizar"
      );
    }
    const payload = { ...data };
    // Asegurar booleanos explícitos false por defecto
    payload.es_plato_del_dia = false;
    payload.es_promo = false;
    // Normalizar adicionales al formato [{id_adicional, costo_extra}]
    if (Array.isArray(payload.adicionales)) {
      payload.adicionales = payload.adicionales.map((a) => ({
        id_adicional: a.id_adicional || a.id || a,
        costo_extra: a.costo_extra || a.precio || a.costo || 0,
      }));
    } else {
      payload.adicionales = [];
    }
    const body = JSON.stringify(payload);
    const variants = [
      { method: "PUT", url: `/productos/`, body },
      { method: "PATCH", url: `/productos/`, body },
    ];
    let lastError;
    for (const v of variants) {
      try {
        const res = await fetchJsonWithFallback(v.url, {
          method: v.method,
          headers: { "Content-Type": "application/json" },
          body: v.body,
        });
        return { success: true, data: res };
      } catch (e) {
        lastError = e;
        if (!String(e.message || "").includes("405")) break;
      }
    }
    throw lastError || new Error("No se pudo actualizar el producto");
  },
  async actualizarEstadoProducto(idNegocio, idProducto, nuevoEstado) {
    if (!idNegocio || !idProducto)
      throw new Error("id_negocio e id_producto son requeridos");
    // Estrategias conocidas que podríamos necesitar probar en caso de 405:
    // 1. PUT con JSON { estado }
    // 2. PATCH con JSON { estado }
    // 3. POST con JSON { estado }
    // 4. POST sin body y estado como query (&estado=I)
    // 5. PUT sin body con estado en query
    const base = `/productos/estado?id_negocio=${encodeURIComponent(
      idNegocio
    )}&id_producto=${encodeURIComponent(idProducto)}`;
    const variants = [
      {
        method: "PUT",
        url: base,
        body: JSON.stringify({ estado: nuevoEstado }),
        headers: { "Content-Type": "application/json" },
      },
      {
        method: "PATCH",
        url: base,
        body: JSON.stringify({ estado: nuevoEstado }),
        headers: { "Content-Type": "application/json" },
      },
      {
        method: "POST",
        url: base,
        body: JSON.stringify({ estado: nuevoEstado }),
        headers: { "Content-Type": "application/json" },
      },
      {
        method: "POST",
        url: `${base}&estado=${encodeURIComponent(nuevoEstado)}`,
        body: undefined,
      },
      {
        method: "PUT",
        url: `${base}&estado=${encodeURIComponent(nuevoEstado)}`,
        body: undefined,
      },
    ];
    let lastError;
    for (const attempt of variants) {
      try {
        const res = await fetchJsonWithFallback(attempt.url, {
          method: attempt.method,
          body: attempt.body,
          headers: attempt.headers,
        });
        return { success: true, data: res };
      } catch (e) {
        lastError = e;
        if (!String(e.message || "").includes("405")) {
          // Si es otro error, abortar temprano
          break;
        }
      }
    }
    throw lastError || new Error("No se pudo actualizar el estado");
  },
  async eliminarProducto(idNegocio, idProducto) {
    if (!idNegocio || !idProducto) {
      throw new Error("id_negocio e id_producto son requeridos para eliminar");
    }
    // Variantes conocidas de endpoints posibles
    const variants = [
      {
        method: "DELETE",
        url: `/productos/${encodeURIComponent(
          idProducto
        )}?id_negocio=${encodeURIComponent(idNegocio)}`,
      },
      {
        method: "DELETE",
        url: `/productos/${encodeURIComponent(
          idProducto
        )}/?id_negocio=${encodeURIComponent(idNegocio)}`,
      },
      {
        method: "DELETE",
        url: `/productos/?id_negocio=${encodeURIComponent(
          idNegocio
        )}&id_producto=${encodeURIComponent(idProducto)}`,
      },
      {
        method: "DELETE",
        url: `/productos?id_negocio=${encodeURIComponent(
          idNegocio
        )}&id_producto=${encodeURIComponent(idProducto)}`,
      },
      // Override por si el backend solo acepta POST
      {
        method: "POST",
        url: `/productos/${encodeURIComponent(
          idProducto
        )}?id_negocio=${encodeURIComponent(idNegocio)}`,
        override: true,
      },
    ];
    let lastError;
    for (const attempt of variants) {
      try {
        const res = await fetch(
          attempt.url.startsWith("http")
            ? attempt.url
            : `http://127.0.0.1:8000${attempt.url.startsWith("/") ? "" : "/"}${
                attempt.url
              }`,
          {
            method: attempt.method,
            headers: attempt.override
              ? {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                }
              : { Accept: "application/json" },
            body: attempt.override
              ? JSON.stringify({ _method: "DELETE" })
              : undefined,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        // Manejar 204 / cuerpo vacío
        let data = null;
        const ct = (res.headers.get("content-type") || "").toLowerCase();
        if (ct.includes("application/json")) {
          const text = await res.text();
          if (text.trim()) {
            try {
              data = JSON.parse(text);
            } catch (_) {
              /* ignorar parse */
            }
          }
        }
        return { success: true, data };
      } catch (e) {
        lastError = e;
        // Continuar probando si es 404/405, abortar para otros errores
        const msg = String(e.message || "");
        if (!msg.includes("404") && !msg.includes("405")) break;
      }
    }
    throw lastError || new Error("No se pudo eliminar el producto");
  },
};

export default productosService;
