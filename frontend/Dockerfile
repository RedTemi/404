# Use the official Node.js image
FROM node:latest

# Set the working directory to the frontend folder
WORKDIR /app/frontend

# Copy the content of the local frontend directory to the container
COPY ./frontend .

# Install dependencies
RUN npm install

# Build the frontend application
RUN npm run dev

# Expose the port the frontend will run on
EXPOSE 3000

# Command to run the frontend application
CMD ["npm", "start"]
