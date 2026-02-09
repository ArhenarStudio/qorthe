# Figma versions – metadata y migraciones

Esta carpeta centraliza el mapeo entre diseños Figma (V1, V2) y los módulos del código.

## Contenido

- **v1-mapping.json** – Mapeo de archivos Figma V1 a rutas del repo (módulo y backup).
- **v2-mapping.json** – Mapeo de archivos Figma V2 (cuando existan) a módulos y archivos de versión.
- **migration-logs/** – Logs o notas de migraciones (por fecha o por componente).

## Uso

1. Al migrar desde Figma, consultar el mapping correspondiente (v1 o v2).
2. El componente activo en producción está siempre en `src/modules/<nombre>/components/`.
3. Las versiones antiguas o en desarrollo viven en `src/modules/<nombre>/versions/`.
