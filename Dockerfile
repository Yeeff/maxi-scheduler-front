FROM node:16-alpine AS root
WORKDIR /app
COPY . .
COPY .env.qa /app/.env
RUN npm install -g npm@8.0.0
RUN npm install --force
RUN npm run build
RUN npm prune --production

FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/nginx.conf
COPY --from=root /app/dist /usr/share/nginx/html
EXPOSE 9005