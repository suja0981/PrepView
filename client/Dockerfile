# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage (using Nginx)
FROM nginx:alpine
# Copy the built dist folder from the build stage to Nginx's default HTML folder
COPY --from=build /app/dist /usr/share/nginx/html
# Add a custom nginx.conf if you are using React Router, so deep links don't return 404
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
