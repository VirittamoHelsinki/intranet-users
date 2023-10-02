FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy both package.json and package-lock.json (if available)
COPY . .

# Install dependencies for the server and client
RUN npm run install

# Copy the client and server code into the container
COPY . .
 
# Build the React app
RUN npm run build:prod

COPY . .

# Expose the port the app runs on
EXPOSE 3459

# Run the server
CMD ["npm", "run", "start" ]
