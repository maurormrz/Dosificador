# Dosificador

Aplicación web del dosificador de scoop, hecha en **TypeScript**. Funciona en el navegador, guarda los datos en `localStorage` y se publica gratis en **GitHub Pages**.

## ¿Qué hace?

Cuatro pantallas:

| Pantalla | Descripción |
|---|---|
| **Inicio** | Anillo de progreso con los scoops del día, botón para registrar una toma (+5 g) y "Deshacer" durante 6 segundos con animación. |
| **Historial** | Lista de tomas agrupadas por día, con total de scoops y gramos. |
| **Reserva** | Gramos restantes del pote, barra de progreso y formulario para cargar un pote nuevo (reinicia el conteo). |
| **Registro** | Forma parte de Inicio (botón + toast de "Deshacer"). |

## Requisitos

- **Node.js** 18 o superior (solo para compilar con `tsc`).
- **VS Code** con la extensión **Live Server** (para ver la app).
- **Git** para publicar en GitHub Pages.

## Estructura del proyecto

```
Dosificador/
├── index.html
├── styles.css
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
├── src/
│   ├── types.ts       ← tipos e interfaces
│   ├── store.ts       ← lógica y persistencia en localStorage
│   └── main.ts        ← render de pantallas y eventos
└── dist/              ← lo genera tsc (sí se sube a GitHub)
```

## Instalación

1. Clonar el repositorio y entrar a la carpeta:

   ```bash
   git clone https://github.com/maurormrz/Dosificador.git
   cd Dosificador
   ```

2. Instalar dependencias (TypeScript):

   ```bash
   npm install
   ```

   Si TypeScript no está en el `package.json`:

   ```bash
   npm install -D typescript
   ```

## Scripts disponibles

```bash
npm run build    # compila src/ → dist/ (una sola vez)
npm run dev      # compila en modo watch (recompila al guardar)
```

## Cómo correrlo localmente

1. Compilar el proyecto:

   ```bash
   npm run build
   ```

   Esto genera `dist/main.js`, `dist/store.js` y `dist/types.js`.

2. Abrir `index.html` con **Live Server**:
   - Click derecho sobre `index.html` → **Open with Live Server**.
   - O usar el botón **Go Live** de la barra inferior de VS Code.

3. Mientras editás, dejá corriendo en otra terminal:

   ```bash
   npm run dev
   ```

   Los cambios se recompilan solos y Live Server recarga la página.

## Publicar en GitHub Pages

1. Compilar y subir los cambios:

   ```bash
   npm run build
   git add .
   git commit -m "Demo Dosis en TypeScript"
   git push
   ```

2. En GitHub, ir a **Settings → Pages → Build and deployment**:
   - **Source:** *Deploy from a branch*
   - **Branch:** `main` / `(root)`
   - Guardar.

3. Esperar ~1 minuto. El demo queda en:

   ```
   https://maurormrz.github.io/Dosificador/
   ```

   Ese es el enlace para el foro y el informe.

## Personalización

Los colores están como variables CSS en `:root` dentro de `styles.css`. Cambiarlos por los de la paleta del producto:

```css
:root {
  --fondo: #f6f4ef;
  --acento: #2f6f6a;
  --acento-texto: #ffffff;
  /* ... */
}
```

Los valores por defecto del dosificador están en `src/store.ts`:

```ts
const porDefecto: Estado = { tomas: [], reservaInicial: 500, metaDiaria: 2 };
```

- `reservaInicial`: gramos del pote al empezar.
- `metaDiaria`: scoops por día.
- `GRAMOS_POR_SCOOP`: gramos que suma cada registro (5 g).
