FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN yarn install 
COPY . .
#EXPOSE 5000
CMD ["npm", "start"]
