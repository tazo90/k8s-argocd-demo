FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm i
COPY . . 
EXPOSE 9000
CMD ["npm", "run", "dev"]