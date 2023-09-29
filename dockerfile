FROM node:14

 

# Set the working directory to /app
WORKDIR /app

 

# Copy both package.json and package-lock.json (if available)
COPY server/package*.json ./server/
COPY client/package*.json ./client/

 

# Install dependencies for the server and client
RUN cd ./server && npm install
RUN cd ./client && npm install

 

# Copy the client and server code into the container
COPY ./client ./client/
COPY ./server ./server/

 

# Build the React app
RUN cd ./server && npm run build:prod

COPY ./server ./server/

 

# Expose the port the app runs on
EXPOSE 3459

 

# Run the server
CMD ["cd ./server","npm", "start" ]