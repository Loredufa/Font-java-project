###############################################################################
# 1. ETAPA DE COMPILACIÓN – Node + Vite
###############################################################################
FROM node:20-alpine AS builder

WORKDIR /app

# Dependencias
COPY package*.json ./
RUN npm ci

# Copio resto del código fuente
COPY . .

# Si no existe vite.config.js, creo uno
# ────────────────────────────────────────────────────────────────────────────
RUN test -f vite.config.js || \
    echo "import { defineConfig } from 'vite';\
import react from '@vitejs/plugin-react';\
export default defineConfig({ plugins: [react({ jsxRuntime: 'automatic' })] });" \
    > vite.config.js

# Build de producción (los artefactos quedan en /app/dist)
RUN npm run build


###############################################################################
# 2. ETAPA DE RUNTIME – NGINX sin privilegios
###############################################################################
FROM nginxinc/nginx-unprivileged:1.25-alpine

# Copio los archivos estáticos generados
COPY --from=builder /app/dist /usr/share/nginx/html

# Copio la configuración de NGINX (escucha en 8080)
COPY nginx.conf /etc/nginx/nginx.conf

# Puerto interno que expondrá el contenedor
EXPOSE 8080

# La imagen ya corre como UID 101 (no-root) y es compatible con SCC restricted de openshift
USER 101
