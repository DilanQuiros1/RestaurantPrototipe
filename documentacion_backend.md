# Backend SaaS - Documentación Inicial y Completa

## 1. Introducción

### Descripción general

Sistema SaaS multiusuario orientado a la gestión de restaurantes (menús, pedidos, cocina, caja, promociones, lealtad, mesas y analítica). El backend provee APIs para clientes web y móviles, con aislamiento por organización (negocio) y escalabilidad horizontal. Se diseña para ser extensible a otros dominios SaaS.

### Objetivo del backend

- Servir como API central para el SaaS multi-tenant.
- Gestionar autenticación/autorización, persistencia de datos, reglas de negocio y eventos.
- Proveer integraciones (pagos, mensajería, almacenamiento de imágenes) y observabilidad.
- Estandarizar prácticas de desarrollo, despliegue y monitoreo para equipos.

---

## 2. Arquitectura del Backend

### Framework sugerido

- Opción principal: FastAPI (Python)
  - Ventajas: tipado con Pydantic, alto rendimiento con Uvicorn/Starlette, OpenAPI automático, ecosistema maduro (SQLAlchemy, Alembic, pytest), fácil asíncronía.
- Alternativas:
  - Node.js (NestJS/Express): TypeScript, inyección de dependencias, ecosistema npm, curva de aprendizaje variable.
  - Django REST Framework: productividad alta y admin out-of-the-box, menos liviano para microservicios.
  - Spring Boot (Java): robusto/enterprise, mayor verbosidad y coste inicial.

Recomendación: FastAPI por productividad, performance y contrato OpenAPI integrado.

### Estándares de diseño

- Capas: Controller (routers) → Service (dominio) → Repository (DB) → Model (ORM).
- Principios SOLID, DRY, separación de preocupaciones, DTOs (Pydantic) para entrada/salida.
- Módulos por dominio (usuarios, organizaciones, menús, pedidos, caja, lealtad, promociones, mesas, analítica).
- Convenciones: nombres en snake_case en BD y rutas kebab-case si aplica; respuestas con envoltura estándar.

Formato de respuesta estándar:

```
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": { "page": 1, "pageSize": 20, "total": 134 }
}
```

### Versionado de la API

- Prefijo: `/api/v1/` (evolucionar a `/api/v2/` manteniendo compatibilidad temporal 3-6 meses).
- Guidelines: no romper contratos; deprecaciones documentadas en OpenAPI; usar encabezado `X-API-Version` opcional.

### Seguridad

- Autenticación: OAuth2 Password Flow con JWT (access 15m, refresh 7d); rotación de refresh.
- Autorización: RBAC (superadmin, admin, user) + verificación estricta de `id_organizacion` en cada query.
- Password hashing: Argon2 (preferido) o bcrypt con sal y work factor.
- Prevención: rate limiting, protección de fuerza bruta, bloqueo temporal por intentos fallidos, CORS por origen.
- Transporte: HTTPS obligatorio; HSTS; cookies `HttpOnly`/`Secure` cuando aplique.
- Secretos: variables de entorno, secretos en CI/CD, o servicio Vault/KMS.

### Logging y monitoreo

- Logging estructurado JSON (campos: timestamp, level, msg, trace_id, span_id, user_id, org_id, path, latency_ms).
- Trazabilidad distribuida (OpenTelemetry) y métricas (Prometheus). KPIs: latencia P95, tasa de errores, RPS, consumo DB.
- Dashboards y alertas (Grafana/Cloud): errores 5xx, latencias elevadas, pool DB saturado.

### Testing

- Pirámide: unit > integration > e2e. Cobertura objetivo >= 80% líneas/ramas.
- pytest + httpx/requests para API; factories/fixtures para datos; mocks de servicios externos.
- Semillas/DB de prueba aislada; pruebas idempotentes.

### Despliegue

- Contenerizado con Docker; orquestación opcional (Kubernetes) con readiness/liveness probes.
- CI/CD (GitHub Actions): lint → tests → build → push imagen → migraciones → deploy a staging/prod con gates.
- Migraciones automáticas (Alembic) con rollback ante fallo; health-check post-deploy.

Variables de entorno (parcial):

| Variable           | Descripción                          |
| ------------------ | ------------------------------------ |
| DATABASE_URL       | URL conexión PostgreSQL              |
| JWT_SECRET         | Secreto para firmar JWT              |
| JWT_EXPIRES_IN     | Minutos expiración access token      |
| REFRESH_EXPIRES_IN | Días expiración refresh token        |
| LOG_LEVEL          | Nivel de logging (info, debug, warn) |
| ALLOWED_ORIGINS    | Lista de orígenes CORS               |

---

## 3. Base de Datos

### Motor sugerido

- PostgreSQL (preferido por tipos avanzados, rendimiento y extensiones como JSONB, PARTITION, RLS).
- Alternativas: MySQL/MariaDB (compatibilidad amplia), SQL Server (ecosistemas MS). Para analítica, considerar lago de datos.

### Escalabilidad y limitaciones

- Estrategia multi-tenant: base compartida con columna `id_organizacion` en todas las entidades (recomendada); evaluar schemas por tenant si aislamiento fuerte.
- Índices adecuados (compuestos por `id_organizacion` + claves de búsqueda); particionamiento por rango/tenant si crece mucho.
- Conexiones: pool (SQLAlchemy). Ajustar `max_overflow`/`pool_size` por entorno.
- Migraciones controladas y reversibles. Ventanas de mantenimiento para cambios disruptivos.

### Esquema inicial (resumen)

- Multi-tenant: `organizaciones` (negocios) y asociación via `id_organizacion` en entidades.
- Usuarios con roles y pertenencia a organización; auditoría transversal.
- Dominio restaurante: menús/productos, categorías, ingredientes, promociones, mesas (cuadrícula), pedidos, caja, lealtad.

### Migraciones

- Alembic para versionar cambios del esquema. Estrategia: una migración por PR que afecte el esquema, con upgrade/downgrade.
- Naming: `YYYYMMDDHHMM_<modulo>_<cambio>.py`. Mantener changelog.

### Buenas prácticas

- Normalización 3FN, FKs con ON DELETE CASCADE/SET NULL según caso.
- Índices en claves de búsqueda (email, id_organizacion, estado, fechas).
- Campos `created_at`, `updated_at` en todas las tablas; `deleted_at` si soft-delete.
- Consistencia de tipos (UUID vs INT); usar UUID para IDs si se requiere distribución.

---

## 4. Tablas y Estructura (resumen mínimo)

### Usuarios

- id, id_organizacion, email (único por organización), hash_password, rol, estado, created_at, updated_at.

### Organizaciones

- id_organizacion, nombre, tipo_negocio, estado, plan, created_at, updated_at.

### Módulos principales

- Proyectos (ejemplo genérico de SaaS): id, id_organizacion, nombre, estado, owner_id.
- Planes y suscripciones: id, nombre, límites, precio; suscripciones por organización.
- Pagos: id, id_organizacion, monto, método, fecha, status.
- Logs de auditoría: id, id_organizacion, actor_id, entidad, acción, payload, fecha.

### Dominio restaurante (resumen de tablas)

- Menú: productos, categorías (globales o por organización), imágenes, ingredientes, producto_ingrediente, opciones/valores, promociones, producto_promocion, platos_dia.
- Mesas: cuadricula_salon, mesas.
- Cocina/Pedidos: pedidos, pedido_producto, observaciones_comunes.
- Lealtad: clientes, movimientos_puntos, programas_lealtad, niveles_lealtad, premios_lealtad, canjes_lealtad.
- Caja: ventas, pagos, transacciones, arqueos_caja, movimientos_caja.

### Relaciones clave

- usuarios N:1 organizaciones; proyectos N:1 organizaciones; pagos N:1 organizaciones.
- Todas las tablas de dominio contienen `id_organizacion` para aislamiento.

### Diagrama ER (simplificado)

```
organizaciones (id) 1--N usuarios (id, id_organizacion)
organizaciones (id) 1--N proyectos (id, id_organizacion)
organizaciones (id) 1--N pagos (id, id_organizacion)
usuarios (id) 1--N logs_auditoria (actor_id)

 organizaciones (id) 1--N productos (id_organizacion)
 productos (id) N--1 categorias (id_categoria)
 productos (id) N--M ingredientes (producto_ingrediente)
 productos (id) N--M promociones (producto_promocion)
 organizaciones (id) 1--N cuadricula_salon (id_organizacion) 1--N mesas (id_cuadricula)
 mesas (id) 1--N pedidos (id_mesa) 1--N pedido_producto (id_pedido)
```

---

## 5. Manejo de Usuarios

- Registro: email + password + organización (o invitación). Verificación por email opcional.
- Login: OAuth2 Password -> JWT (access 15m, refresh 7d). Rotación de refresh tokens.
- Recuperación de contraseña: token de un solo uso + expiración.
- Roles: superadmin (plataforma), admin (organización), usuario (operativo).
- Multi-tenant: todo query filtrado por `id_organizacion` (ownership). Middlewares para inyectar tenant.
- Auditoría: tabla de logs con actor, acción, target, IP, UA, timestamp.

Tabla de roles (sugerencia):

| Rol        | Alcance      | Capacidades clave                                        |
| ---------- | ------------ | -------------------------------------------------------- |
| superadmin | plataforma   | gestionar planes, organizaciones, métricas globales      |
| admin      | organización | gestionar usuarios de su org, configuración, facturación |
| user       | organización | operar módulos asignados (pedidos, menú, caja)           |

---

## 6. Guías de Desarrollo

### Stack y versiones recomendadas

- Python: 3.11 (recomendado) — compatible con 3.12
- PostgreSQL: 16.x (recomendado) — compatible con 15.x
- FastAPI: >=0.111,<0.120 (compatible con Pydantic v2)
- Uvicorn: >=0.30,<0.31 (ASGI server)
- SQLAlchemy: >=2.0,<2.1 (ORM síncrono/asincrónico)
- Alembic: >=1.13,<2.0 (migraciones)
- Psycopg (v3): psycopg[binary] >=3.1,<3.2 (driver PostgreSQL síncrono)
  - Opción async: asyncpg >=0.29,<0.30 (si se usa SQLAlchemy async)
- Pydantic: >=2.6,<3.0 (modelado/validación)
- pydantic-settings: >=2.2,<3.0 (configuración por entorno)
- python-jose[cryptography]: >=3.3,<4.0 (JWT)
- passlib[bcrypt]: >=1.7,<2.0 (hash de contraseñas)
- httpx: >=0.27,<0.28 (cliente HTTP/testing)
- loguru: >=0.7,<0.8 (logging estructurado opcional)
- pytest: >=8,<9 y pytest-cov: >=5,<6 (testing y cobertura)
- black: >=24,<25 y ruff: >=0.4,<0.6 (formateo/lint)
- gunicorn: >=21,<22 (opcional; prefork con workers Uvicorn en Linux)

### Estructura de carpetas

```
/app
  /api        # routers FastAPI por módulo (/v1)
  /core       # config, seguridad, deps, middlewares
  /services   # lógica de negocio
  /repositories # acceso a datos (SQLAlchemy)
  /models     # modelos ORM
  /schemas    # Pydantic DTOs
  /db         # sesión, migraciones (alembic)
  /tests      # unit/integration
  main.py     # entrypoint FastAPI
```

### Dependencias iniciales (requirements.txt)

Recomendado pinnear versiones con rangos compatibles para estabilidad y actualizaciones menores seguras.

Contenido sugerido de `requirements.txt`:

```
fastapi>=0.111,<0.120
uvicorn[standard]>=0.30,<0.31
sqlalchemy>=2.0,<2.1
alembic>=1.13,<2.0
psycopg[binary]>=3.1,<3.2
# Si usas SQLAlchemy async, añade además:
# asyncpg>=0.29,<0.30
pydantic>=2.6,<3.0
pydantic-settings>=2.2,<3.0
python-jose[cryptography]>=3.3,<4.0
passlib[bcrypt]>=1.7,<2.0
httpx>=0.27,<0.28
loguru>=0.7,<0.8

# Dev/test
pytest>=8,<9
pytest-cov>=5,<6
black>=24,<25
ruff>=0.4,<0.6

# Producción opcional (Linux)
gunicorn>=21,<22
```

Notas:

- Preferir `psycopg[binary]` (psycopg v3) en lugar de `psycopg2-binary` para proyectos nuevos.
- En producción Linux, puedes ejecutar Uvicorn vía Gunicorn: `gunicorn -k uvicorn.workers.UvicornWorker app.main:app -w 2 -b 0.0.0.0:8000`.

Ejemplo de ejecución local (ASGI):

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Justificación del stack y dependencias

- Python 3.11: mejoras de rendimiento en CPython, tipado más rico, Exception Groups; estable y ampliamente soportado por el ecosistema.
- PostgreSQL 16.x: funcionalidades modernas (JSONB, particiones, RLS), rendimiento y replicación madura; versión estable y de larga vida.
- FastAPI (>=0.111,<0.120): alto rendimiento (ASGI), modelos tipados (Pydantic v2), documentación OpenAPI automática, muy productivo para equipos.
- Uvicorn (>=0.30,<0.31): servidor ASGI rápido con soporte WebSocket; hot-reload en desarrollo; estándar de facto con FastAPI.
- SQLAlchemy 2.x (>=2.0,<2.1): API 2.0 unificada, mejor tipado, soporte síncrono/asincrónico; ORM + Core en un solo stack.
- Alembic (>=1.13,<2.0): migraciones versionadas con upgrade/downgrade y autogeneración; integra nativamente con SQLAlchemy.
- Psycopg v3 (`psycopg[binary]` >=3.1,<3.2): driver moderno de PostgreSQL, binarios precompilados (instalación sencilla en Windows/Linux), mejor rendimiento y API limpia.
- asyncpg (>=0.29,<0.30, opcional): driver asíncrono de bajo overhead; útil si se adopta el stack async de SQLAlchemy.
- Pydantic (>=2.6,<3.0): validación y serialización rápida mediante pydantic-core; esquemas claros para I/O de la API.
- pydantic-settings (>=2.2,<3.0): gestión de configuración por variables de entorno y `.env` con validación tipada.
- python-jose[cryptography] (>=3.3,<4.0): emisión y verificación de JWT (HS256/RS256) con primitives criptográficas robustas.
- passlib[bcrypt] (>=1.7,<2.0): hashing seguro de contraseñas (bcrypt); opción de migrar a Argon2 si se requiere mayores garantías.
- httpx (>=0.27,<0.28): cliente HTTP sync/async ideal para pruebas de integración de endpoints.
- loguru (>=0.7,<0.8): logging sencillo y potente; fácil enrutar a JSON u otros sinks; alternativa ligera a configurar `logging` estándar.
- pytest (>=8,<9) y pytest-cov (>=5,<6): framework de testing y medición de cobertura; base del pipeline de calidad.
- black (>=24,<25) y ruff (>=0.4,<0.6): formato y lint rápidos y consistentes; reducen diffs y discusiones de estilo.
- gunicorn (>=21,<22, opcional): pre-fork server en Linux; combinación recomendada `gunicorn -k uvicorn.workers.UvicornWorker` para multiproceso.

Notas de versionado:

- Se usan rangos acotados (>=, <) para permitir actualizaciones menores/patch sin romper compatibilidad.
- `psycopg2-binary` se reemplaza por `psycopg[binary]` (v3) en proyectos nuevos por soporte y rendimiento.
- Si se opta por Argon2: `argon2-cffi` puede añadirse y configurarse en Passlib.

Ejemplo de router (esqueleto):

```python
from fastapi import APIRouter, Depends
from app.schemas.user import UserCreate, UserOut
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.post("/", response_model=UserOut)
async def create_user(payload: UserCreate, svc: UserService = Depends()):
  return await svc.create_user(payload)
```

### Versionado semántico

- Empezar en v1.0.0 tras estabilizar endpoints core (auth + usuarios + organizaciones).

Convenciones de API:

- Paginación: `?page=1&page_size=20`
- Ordenación: `?sort=created_at:desc`
- Filtros: `?status=active&search=term`
- Errores: `{"success":false,"error":{"code":"E_VALIDATION","message":"..."}}`

---

## 7. Roadmap Inicial

- Sprint 1: Bootstrap FastAPI, configuración, salud, auth (registro/login), modelos Usuario/Organización, JWT.
- Sprint 2: Configurar PostgreSQL, SQLAlchemy, Alembic; migraciones base; pruebas de integración.
- Sprint 3: CRUD inicial (organizaciones, usuarios), paginación y filtros; RBAC básico.
- Sprint 4: Pruebas automatizadas, cobertura, Dockerfile, pipeline CI/CD y despliegue a staging.

Extras (opcionales siguientes sprints):

- Observabilidad (tracing + métricas), rate limiting, caching selectivo.
- Integraciones de pagos, colas (RabbitMQ/SQS) para procesos asíncronos.
- Feature flags y AB testing.
