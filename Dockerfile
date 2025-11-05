FROM python:3.9-slim

WORKDIR /app

COPY . .

RUN chmod +x startup.sh

RUN ./startup.sh

