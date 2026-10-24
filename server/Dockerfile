FROM node:20-alpine

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your server code
COPY . .

# Expose the port your Express app runs on
EXPOSE 5000

# Start the application
CMD ["node", "index.mjs"]