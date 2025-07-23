# Use official Node image to build the React app
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies (copy both package.json and package-lock.json if present)
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Copy app source
COPY . ./

# Build the React app
RUN npm run build

# Production environment: Serve build with nginx
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom nginx config for single-page app
COPY nginx.conf /etc/nginx/conf.d

# Copy React build from previous stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
