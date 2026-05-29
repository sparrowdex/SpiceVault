FROM node:18-bullseye

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and generate Prisma Client
COPY . .
RUN npx prisma generate

# Hugging Face Spaces expose port 7860 by default
ENV PORT=7860
EXPOSE 7860

# Start the application
# Ensure your package.json has a "start": "node index.js" script!
CMD ["npm", "start"]