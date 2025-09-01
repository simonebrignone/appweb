# Usa l'immagine ufficiale di Node.js
FROM node:18

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia package.json e package-lock.json per installare dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del progetto nel container
COPY . .

# Make sure Tailwind, postcss and config files are in place
RUN ls -la /app && ls -la /app/src && ls -la /app/postcss.config.js
# Costruisce la webapp React per produzione
RUN NODE_OPTIONS=--openssl-legacy-provider npm run build

# Installa 'serve' per servire l'app React buildata
RUN npm install -g serve

# Espone la porta 3000 (serve default)
EXPOSE 3000

# Comando per eseguire l'app
CMD ["serve", "-s", "build"]
