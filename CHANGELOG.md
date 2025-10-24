# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Monitoring & Observability**
  - Prometheus metrics endpoint (`/metrics`)
  - HTTP request duration and count metrics
  - Active connections tracking
  - Database query duration metrics
  - Request tracing with unique request IDs
  - Response time tracking

- **Security Hardening**
  - Rate limiting for all endpoints
    - General API: 100 req/15 min
    - Auth endpoints: 5 req/15 min
    - Public read: 30 req/min
    - Write operations: 10 req/min
  - Swagger UI authentication in production
  - Basic auth for API documentation

- **Advanced Features**
  - Soft delete for students
  - Hard delete (admin only)
  - Restore deleted students
  - Audit logging system
    - Track all CREATE, UPDATE, DELETE operations
    - Record user, IP address, and user agent
    - Store changes as JSON
  - User tracking (created_by, updated_by fields)

- **Backup & Recovery**
  - Automated database backup script
  - Database restore script
  - Cron job support for scheduled backups
  - Automatic cleanup of old backups (30 days)

- **Testing**
  - Test coverage reporting
  - Coverage thresholds (60% lines, 50% branches)
  - HTML coverage reports

- **Documentation**
  - CHANGELOG.md
  - DEPLOYMENT.md - Production deployment guide
  - TROUBLESHOOTING.md - Common issues and solutions
  - API versioning strategy

### Changed
- Student model extended with audit fields
- All mutations now log to audit table
- List queries now exclude soft-deleted records by default
- Enhanced error handling with better error messages

### Security
- Added rate limiting to prevent abuse
- Swagger UI protected with basic auth in production
- Enhanced request logging for security auditing

## [1.0.0] - 2025-01-15

### Added
- Initial release
- CRUD operations for students
- JWT authentication
- CSV import/export
- Pagination, filtering, and sorting
- Input validation with Zod
- OpenAPI/Swagger documentation
- Health check endpoint
- Docker support
- CI/CD with GitHub Actions
- Jest tests

### Security
- Helmet.js for security headers
- CORS enabled
- JWT-based authentication
- Input validation

[Unreleased]: https://github.com/islombek4642/talabalar-royhati-api/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/islombek4642/talabalar-royhati-api/releases/tag/v1.0.0
