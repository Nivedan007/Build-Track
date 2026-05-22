FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* tsconfig.json ./
RUN npm ci

# Generate Prisma client before build
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and compile
COPY . .
RUN npm run build && npm prune --omit=dev

EXPOSE 10000

CMD ["npm", "start"]
