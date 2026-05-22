# Plan Designer

This is a minimal Plan Designer feature that lets you create simple rectangular walls and view them extruded in 3D.

Requirements
- Node project in the `client` folder (Next.js)
- Install runtime dependencies:

```bash
cd client
npm install three @react-three/fiber @react-three/drei
```

Usage
- Start the dev server and open `/designer` route:

```bash
cd client
npm run dev
# then open http://localhost:3000/designer
```

Notes
- This is a minimal, extendable prototype. You can add tools for drawing by clicking on the plane, snapping, exporting to OBJ/GLTF, and adding textures.
- If you want, I can add click-to-draw, dimensioning, and an export/import workflow next.
