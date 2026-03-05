# Etapa 1: Construcció de l'app de React amb Vite
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install react-is --legacy-peer-deps
COPY . .
RUN npx vite build

# Etapa 2: Servidor Nginx per servir els fitxers estàtics
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]