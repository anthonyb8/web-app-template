#syntax=docker/dockerfile:1 

FROM node:23-slim

# Create/Set dir
WORKDIR /frontend 
 
# Copy only package files first
COPY package.json package-lock.json ./

# Install dependencies 
RUN npm install 

# Copy source
COPY . .

RUN npm run build

