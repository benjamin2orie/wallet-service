FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install all deps (including dev)
RUN npm install

COPY . .

# Build using Nest CLI
RUN npm run build

# Remove dev deps to slim image
RUN npm prune --production

EXPOSE ${APP_PORT}

CMD ["node", "dist/main.js"]
