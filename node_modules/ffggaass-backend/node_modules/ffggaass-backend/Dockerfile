# Utilise Alpine comme base
FROM alpine:3.12

# Installe MongoDB et ses dépendances
RUN apk add --no-cache mongodb

# Création du répertoire de données MongoDB
RUN mkdir -p /data/db

# Définir le répertoire de travail à MongoDB
WORKDIR /data

# Exposer le port MongoDB
EXPOSE 27017

# Commande par défaut pour démarrer MongoDB
CMD ["mongod", "--bind_ip_all"]
