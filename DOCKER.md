# Docker Setup for Hive Platform

This document provides instructions for running the Hive Platform using Docker.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

### Production Setup

1. **Build and run the production stack:**
   ```bash
   docker-compose up --build
   ```

2. **Access the application:**
   - Application: http://localhost:3000
   - Database: localhost:5432

### Development Setup

1. **Build and run the development stack:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Application: http://localhost:3000 (with hot reloading)
   - Database: localhost:5432

## Environment Variables

Before running, make sure to set up your environment variables. You can either:

1. **Create a `.env` file** in the root directory with your configuration
2. **Modify the environment variables** in the docker-compose files

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your application URL
- `NEXTAUTH_SECRET`: Secret key for NextAuth
- `JWT_SECRET`: Secret key for JWT tokens

## Database Setup

The PostgreSQL database will be automatically created when you first run the containers. To run database migrations:

```bash
# For production
docker-compose exec hive-app npx prisma migrate deploy

# For development
docker-compose -f docker-compose.dev.yml exec hive-app-dev npx prisma migrate deploy
```

## Useful Commands

### View logs
```bash
# Production
docker-compose logs -f hive-app

# Development
docker-compose -f docker-compose.dev.yml logs -f hive-app-dev
```

### Access database
```bash
# Production
docker-compose exec postgres psql -U hive_user -d hive_db

# Development
docker-compose -f docker-compose.dev.yml exec postgres psql -U hive_user -d hive_db
```

### Run Prisma commands
```bash
# Production
docker-compose exec hive-app npx prisma studio

# Development
docker-compose -f docker-compose.dev.yml exec hive-app-dev npx prisma studio
```

### Stop containers
```bash
# Production
docker-compose down

# Development
docker-compose -f docker-compose.dev.yml down
```

### Remove volumes (WARNING: This will delete all data)
```bash
# Production
docker-compose down -v

# Development
docker-compose -f docker-compose.dev.yml down -v
```

## Production Deployment

For production deployment, consider:

1. **Using environment-specific compose files**
2. **Setting up proper secrets management**
3. **Configuring reverse proxy (nginx)**
4. **Setting up SSL certificates**
5. **Configuring database backups**

### Example production environment file:
```bash
# .env.production
DATABASE_URL=postgresql://user:password@host:5432/db
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-production-secret
JWT_SECRET=your-production-jwt-secret
```

## Troubleshooting

### Common Issues

1. **Port already in use:**
   - Change the port mapping in docker-compose files
   - Example: `"3001:3000"` instead of `"3000:3000"`

2. **Database connection issues:**
   - Ensure the database container is healthy
   - Check the DATABASE_URL format
   - Verify network connectivity between containers

3. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

4. **Permission issues:**
   - Ensure proper file permissions
   - Check Docker user configuration

### Health Checks

The database container includes health checks. You can monitor the status with:

```bash
docker-compose ps
```

## Security Considerations

1. **Never commit sensitive environment variables**
2. **Use strong, unique secrets in production**
3. **Regularly update base images**
4. **Run containers as non-root users (already configured)**
5. **Use secrets management in production environments**

## Performance Optimization

1. **Use multi-stage builds** (already implemented)
2. **Leverage Docker layer caching**
3. **Optimize .dockerignore** (already configured)
4. **Use Alpine Linux base images** (already implemented)
5. **Configure proper resource limits in production** 