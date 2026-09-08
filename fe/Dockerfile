FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json .

RUN npm install

COPY . .

ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start"]