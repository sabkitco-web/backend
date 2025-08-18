# Use Node 18 official image
FROM node:18

# Set working directory inside container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose the app port (change if needed, e.g., 3000 or 4000)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
