FROM node:18-slim

# Install OpenSSL 1.1/3 packages natively supported in Debian slim images
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy dependency structures
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy application source files
COPY . .

# Generate Prisma client for your Aiven database
RUN npx prisma generate

# Hugging Face Spaces expose port 7860 by default
EXPOSE 7860
ENV PORT=7860

CMD ["node", "index.js"]