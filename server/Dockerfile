# Base Image
FROM node:alpine

# Setup working directory
WORKDIR '/app'

# copying Json file
COPY ./package.json ./
# Command
RUN npm install

#copying everthing else
COPY . .

#Commands
CMD ["npm","run", "start"]