#!/bin/bash

# Docker Setup and Management Script for WorkStack
# This script helps with common Docker operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        log_error ".env file not found!"
        log_info "Please create .env file from .env.example"
        log_info "cp .env.example .env"
        log_info "Then edit .env with your configuration"
        exit 1
    fi
    log_info ".env file found ✓"
}

# Build all services
build_all() {
    log_info "Building all Docker services..."
    docker-compose build
    log_info "Build complete! ✓"
}

# Start all services
start_all() {
    log_info "Starting all services..."
    docker-compose up -d
    log_info "Services started! ✓"
    log_info "Waiting for services to be healthy..."
    sleep 5
    docker-compose ps
}

# Stop all services
stop_all() {
    log_info "Stopping all services..."
    docker-compose stop
    log_info "Services stopped ✓"
}

# Restart all services
restart_all() {
    log_info "Restarting all services..."
    docker-compose restart
    log_info "Services restarted ✓"
}

# View logs
view_logs() {
    SERVICE=${1:-""}
    if [ -z "$SERVICE" ]; then
        log_info "Viewing logs for all services (Ctrl+C to exit)..."
        docker-compose logs -f
    else
        log_info "Viewing logs for $SERVICE (Ctrl+C to exit)..."
        docker-compose logs -f "$SERVICE"
    fi
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    docker-compose exec backend pnpm run db:migrate:deploy
    log_info "Migrations complete! ✓"
}

# Seed database
seed_database() {
    log_info "Seeding database..."
    docker-compose exec backend pnpm run db:seed
    log_info "Database seeded! ✓"
}

# Generate Prisma client
generate_prisma() {
    log_info "Generating Prisma client..."
    docker-compose exec backend pnpm run db:generate
    log_info "Prisma client generated! ✓"
}

# Setup database (migrations + seed)
setup_database() {
    log_info "Setting up database..."
    run_migrations
    read -p "Seed the database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        seed_database
    fi
    log_info "Database setup complete! ✓"
}

# Clean everything (containers, volumes, images)
clean_all() {
    log_warn "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Stopping and removing containers..."
        docker-compose down -v
        log_info "Removing images..."
        docker-compose rmi -f
        log_info "Clean complete! ✓"
    else
        log_info "Clean cancelled"
    fi
}

# Show status
show_status() {
    log_info "Service Status:"
    docker-compose ps
    echo
    log_info "Resource Usage:"
    docker stats --no-stream
}

# Full setup (build + start + migrate)
full_setup() {
    log_info "Starting full setup..."
    check_env_file
    build_all
    start_all
    log_info "Waiting for database to be ready..."
    sleep 10
    setup_database
    log_info ""
    log_info "=== Setup Complete! ==="
    log_info "Frontend: http://localhost:8080"
    log_info "Backend: http://localhost:3000"
    log_info "API Docs: http://localhost:3000/docs"
}

# Show help
show_help() {
    cat << EOF
WorkStack Docker Management Script

Usage: ./scripts/docker-setup.sh [command]

Commands:
    build           Build all Docker images
    start           Start all services
    stop            Stop all services
    restart         Restart all services
    logs [service]  View logs (all or specific service)
    migrate         Run database migrations
    seed            Seed the database
    prisma          Generate Prisma client
    setup-db        Run migrations and optionally seed
    status          Show service status and resource usage
    clean           Remove all containers, volumes, and images
    setup           Full setup (build + start + migrate)
    help            Show this help message

Examples:
    ./scripts/docker-setup.sh setup          # Full setup
    ./scripts/docker-setup.sh logs backend  # View backend logs
    ./scripts/docker-setup.sh restart        # Restart all services

EOF
}

# Main script logic
case "${1:-help}" in
    build)
        check_env_file
        build_all
        ;;
    start)
        check_env_file
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        restart_all
        ;;
    logs)
        view_logs "$2"
        ;;
    migrate)
        run_migrations
        ;;
    seed)
        seed_database
        ;;
    prisma)
        generate_prisma
        ;;
    setup-db)
        setup_database
        ;;
    status)
        show_status
        ;;
    clean)
        clean_all
        ;;
    setup)
        full_setup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac


