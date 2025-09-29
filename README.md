# Guía rápida para ejecutar el proyecto localmente

Este documento describe, paso a paso, lo que se hizo para dejar el proyecto funcionando de forma estable en tu máquina y cómo puedes repetirlo cuando lo necesites.

## Requisitos
- Node.js 18.x (probado con 18.18.2)
- npm 9/10

> Nota: En entornos con Node 17+ Webpack puede requerir la opción `--openssl-legacy-provider` para compilar. Ya quedó configurado en el script de build.

## 1) Instalar dependencias
En una terminal ubicada en la carpeta del proyecto:

```bash
npm install
```

Si tu instalación local se corrompe (p. ej., cambios bruscos de versiones), puedes forzar una reinstalación limpia:

```bash
rm -rf node_modules package-lock.json && npm install
```

## 2) Compilar en modo producción (recomendado)
El script de build ya incluye la compatibilidad necesaria para Node 18 usando `NODE_OPTIONS=--openssl-legacy-provider`.

```bash
npm run build
```

Al finalizar verás los archivos generados en la carpeta `build/`.

## 3) Servir el build estático
La forma más estable de ejecutar la app localmente es servir la carpeta `build` con un servidor estático:

```bash
npx serve -s build -l 3001
```

- Si el CLI pregunta si deseas instalar `serve`, responde `y` (sí) o ejecútalo con `yes | npx serve -s build -l 3001` para auto-confirmar.
- Luego abre en el navegador: http://localhost:3001/

## 4) (Opcional) Ejecutar el servidor de desarrollo
Si quieres hot reload y el entorno de desarrollo:

```bash
npm start
```

- Si encuentras problemas relacionados con OpenSSL o dependencias, te recomiendo usar por ahora el flujo estable de “build + serve” anterior. Si necesitas que dejemos `npm start` 100% operativo en tu entorno, avísame y lo ajustamos.

## Variables de entorno
- Revisa `.env.example` para ver variables disponibles.

## Problemas conocidos y soluciones
- Error `ERR_OSSL_EVP_UNSUPPORTED` durante `npm run build` en Node 18+:
  - Ya está resuelto en `package.json` usando `NODE_OPTIONS=--openssl-legacy-provider` en el script de build.
- Vulnerabilidades reportadas por `npm install`:
  - Son avisos de auditoría de dependencias transitorias. Puedes ejecutar `npm audit` para más detalles. No impiden compilar ni servir el build.

## Scripts útiles
- `npm start` — Inicia el servidor de desarrollo (hot reload).
- `npm run build` — Compila la app para producción (ya configurado para Node 18).

## Notas finales
- Si el puerto 3001 está ocupado, puedes cambiarlo: `npx serve -s build -l 3002`.
- Si no puedes acceder a `localhost`, verifica firewall/proxy o prueba `http://127.0.0.1:3001/`.
- Ante cualquier duda, comparte los logs de la terminal para ayudarte a diagnosticar.