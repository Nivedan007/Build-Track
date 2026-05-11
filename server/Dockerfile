FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* tsconfig.json ./
COPY prisma ./prisma
RUN npm ci --production || npm install --production

# Copy source and build
COPY . .
RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]
