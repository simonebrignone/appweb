# Usa l'immagine base di Node.js
FROM node:18

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice sorgente
COPY . .

# Espone la porta usata dal server
EXPOSE 5000

# Comando per eseguire l'app backend
CMD ["node", "server.js"]
