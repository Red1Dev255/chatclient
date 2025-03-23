# Étape 1 : Utiliser l'image Node.js pour construire l'application
FROM node:22 AS build

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json pour installer les dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tous les fichiers du projet dans le conteneur
COPY . .

# Construire l'application Vue.js pour la production
RUN npm run build

# Étape 2 : Utiliser Nginx pour servir l'application construite
FROM nginx:alpine

# Copier les fichiers construits de l'étape précédente dans le répertoire de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exposer le port 80 pour permettre l'accès à l'application
EXPOSE 80

# Lancer Nginx en mode foreground
CMD ["nginx", "-g", "daemon off;"]

