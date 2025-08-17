# Use a Node.js base image with Alpine Linux, which is lightweight.
FROM node:24-alpine

# Set the working directory inside the container. All subsequent commands will run from here.
WORKDIR /app

# Install build-essential packages for C++, OpenJDK for Java, and Python3.
# 'apk update' updates the package lists.
# 'apk add --no-cache' installs packages without caching, saving space.
#   - 'g++': C++ compiler
#   - 'openjdk17': OpenJDK (Java Development Kit) version 17. You can change the version if needed.
#   - 'python3': Python interpreter
#   - 'build-base': Essential build tools (might include make, gcc, etc. useful for some npm packages)
RUN apk update && \
    apk add --no-cache g++ openjdk17 python3 build-base

# Copy all files from the current directory on your host machine into the /app directory in the container.
COPY . .

# Install Node.js dependencies listed in your package.json.
# This assumes your package.json and node_modules are in the root of your backend project.
RUN npm install

# Expose port 4000, as this is the port your Node.js application is listening on.
EXPOSE 4000

# Define the command to run when the container starts.
# This starts your Node.js application using index.js.
CMD ["node", "index.js"]
