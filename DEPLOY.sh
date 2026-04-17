#!/bin/bash

################################################################################
# Blood Donation Inventory Management System - Deployment Script
# This script handles the complete deployment process including:
# - Environment setup
# - Database migration
# - Build compilation
# - Server startup
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    print_success "Node.js v$(node --version) found"
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm v$(npm --version) found"
}

# Setup environment
setup_environment() {
    print_header "Setting Up Environment"
    
    if [ ! -f .env.local ]; then
        if [ -f .env.example ]; then
            cp .env.example .env.local
            print_success "Created .env.local from .env.example"
            print_warning "Please update .env.local with your actual environment variables"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_success ".env.local already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    if npm ci --prefer-offline --no-audit; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Generate Prisma Client
generate_prisma() {
    print_header "Generating Prisma Client"
    
    if npx prisma generate; then
        print_success "Prisma Client generated"
    else
        print_error "Failed to generate Prisma Client"
        exit 1
    fi
}

# Setup database
setup_database() {
    print_header "Setting Up Database"
    
    print_info "Running database migrations..."
    if npx prisma migrate deploy; then
        print_success "Database migrations completed"
    else
        print_warning "Database migration encountered an issue (this may be normal if migrations are already applied)"
    fi
    
    print_info "Pushing schema to database..."
    if npx prisma db push --skip-generate; then
        print_success "Database schema synchronized"
    else
        print_warning "Database schema push encountered an issue"
    fi
    
    print_info "Seeding database with initial data..."
    if npm run prisma:seed; then
        print_success "Database seeded successfully"
    else
        print_warning "Database seeding skipped or encountered an issue"
    fi
}

# Build the application
build_application() {
    print_header "Building Application"
    
    if npm run build; then
        print_success "Application built successfully"
    else
        print_error "Failed to build application"
        exit 1
    fi
}

# Start the application
start_application() {
    print_header "Starting Application"
    
    print_info "Starting Next.js server..."
    npm start
}

# Main deployment flow
main() {
    echo ""
    print_header "BLOOD DONATION INVENTORY MANAGEMENT SYSTEM"
    print_header "Deployment Process"
    echo ""
    
    check_prerequisites
    echo ""
    
    setup_environment
    echo ""
    
    install_dependencies
    echo ""
    
    generate_prisma
    echo ""
    
    setup_database
    echo ""
    
    build_application
    echo ""
    
    print_success "Deployment completed successfully!"
    echo ""
    print_info "Application is ready to start. Press Enter to start the server..."
    read -r
    
    start_application
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' SIGINT SIGTERM

# Run main function
main "$@"
