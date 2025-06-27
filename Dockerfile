###############################################################################
# 1. Build de Vite
###############################################################################
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

RUN test -f vite.config.js || \
    echo "import {defineConfig} from 'vite';\
import react from '@vitejs/plugin-react';\
export default defineConfig({plugins:[react({jsxRuntime:'automatic'})]});" \
    > vite.config.js
RUN npm run build        # genera /app/dist

###############################################################################
# 2. Imagen de runtime
###############################################################################
FROM nginxinc/nginx-unprivileged:1.25-alpine
# estáticos
COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080


