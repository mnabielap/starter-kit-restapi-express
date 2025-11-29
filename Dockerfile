# Dockerfile

# Use Node.js 22 as the base image
FROM node:22

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies (including devDependencies like ts-node for migrations)
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript code to JavaScript (dist folder)
RUN npm run build

# Copy the entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

# Expose the application port (internal container port)
EXPOSE 5000

# Create a directory for SQLite persistence (optional, if switching to sqlite)
# and a directory for media uploads
RUN mkdir -p /app/database_storage /app/uploads

# Define Volumes for persistence
VOLUME ["/app/database_storage", "/app/uploads"]

# Set the entrypoint script
ENTRYPOINT ["./entrypoint.sh"]