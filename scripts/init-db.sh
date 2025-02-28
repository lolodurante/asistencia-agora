#!/bin/bash

# Create the database
createdb agora_asistencia

# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate 