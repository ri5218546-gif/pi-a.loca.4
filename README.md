# Piña Loca

Sistema web completo para venta y distribución de frutas tropicales con tres tipos de cuenta:

- Administrador
- Chofer
- Usuario/Cliente

## Funciones incluidas

- Registro e inicio de sesión con JWT.
- Contraseñas encriptadas con `bcryptjs`.
- Protección de rutas por rol: `admin`, `driver`, `client`.
- Tienda con búsqueda, categorías, productos con promoción y productos sin promoción.
- Carrito con cantidades, eliminación, subtotal, descuentos y total final.
- Promociones automáticas: `2x1`, `5%`, `10%` y promociones por día específico.
- Facturas guardadas en MongoDB y descarga en PDF con `pdfkit`.
- Dashboard administrativo con métricas, ventas, usuarios, choferes, viajes y reportes.
- CRUD administrativo de productos, trabajadores/choferes, camiones y viajes.
- Tabla de trabajadores con teléfono, dirección, cuenta bancaria, usuario registrado, hash de contraseña, profesión y estado laboral.
- Tabla de camiones en viaje con destino, chofer, estado del camión, fruta, cantidad, fechas y estado del viaje.
- Sección de camiones disponibles con resumen por condición.
- Panel de chofer para ver viajes asignados, completar viajes y enviar reportes.
- Reportes de chofer que actualizan automáticamente el estado del camión.
- Modo oscuro y diseño responsive con temática tropical.

## Tecnologías

- Backend: Node.js, Express, MongoDB, Mongoose.
- Frontend: HTML, CSS y JavaScript.
- Autenticación: JWT.
- PDF: PDFKit.
- Seguridad: bcrypt, middleware por rol y validaciones de Mongoose.

## Estructura

```text
pina-loca/
├─ public/
│  ├─ assets/
│  ├─ css/styles.css
│  ├─ js/app.js
│  └─ index.html
├─ src/
│  ├─ config/db.js
│  ├─ middleware/auth.js
│  ├─ models/
│  ├─ routes/
│  └─ utils/
├─ server.js
├─ package.json
└─ .env.example
```

## Base de datos

Colecciones creadas:

- `users`
- `workers`
- `trucks`
- `trips`
- `reports`
- `products`
- `carts`
- `invoices`

Las promociones están embebidas en `products` para mantener el precio y la promoción junto al producto. El carrito y la factura guardan el descuento aplicado para conservar el historial.

## Cómo ejecutar

1. Instala Node.js con npm.
2. Instala MongoDB localmente o usa MongoDB Atlas.
3. Copia `.env.example` como `.env`.
4. Ajusta `MONGODB_URI` y `JWT_SECRET`.
5. Instala dependencias:

```bash
npm install
```

6. Inicia el servidor:

```bash
npm run dev
```

7. Abre:

```text
http://localhost:3000
```

## Usuarios iniciales

Al iniciar el servidor se crean datos de ejemplo si no existen.

Administrador:

```text
Correo: admin@pinaloca.com
Contraseña: Admin12345
```

Chofer:

```text
Correo: chofer@pinaloca.com
Contraseña: Chofer12345
```

## API REST

### Autenticación

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Productos

- `GET /api/products`
- `GET /api/products?promotion=with`
- `GET /api/products?promotion=without`
- `GET /api/products/categories`
- `GET /api/products/:id`
- `POST /api/products` administrador
- `PUT /api/products/:id` administrador
- `DELETE /api/products/:id` administrador

### Carrito

- `GET /api/cart`
- `POST /api/cart/items`
- `PUT /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`

### Facturas

- `POST /api/invoices/checkout`
- `GET /api/invoices/mine`
- `GET /api/invoices/:id/pdf`

### Administrador

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `GET /api/admin/invoices`
- `GET /api/admin/workers`
- `POST /api/admin/workers`
- `PUT /api/admin/workers/:id`
- `DELETE /api/admin/workers/:id`
- `GET /api/admin/trucks`
- `POST /api/admin/trucks`
- `PUT /api/admin/trucks/:id`
- `DELETE /api/admin/trucks/:id`
- `GET /api/admin/trips`
- `POST /api/admin/trips`
- `PUT /api/admin/trips/:id`
- `POST /api/admin/trips/:id/notify`
- `GET /api/admin/reports`
- `PATCH /api/admin/reports/:id/review`

### Chofer

- `GET /api/driver/trips`
- `PATCH /api/driver/trips/:id/complete`
- `POST /api/driver/reports`
