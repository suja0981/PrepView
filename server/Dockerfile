FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the API port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
