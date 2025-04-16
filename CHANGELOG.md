# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.3] - 2024-04-16

### Added
- Added new `rollbar_get_item_by_occurrence_uuid` tool for retrieving items by occurrence UUID
- Added new `rollbar_get_item_by_counter` tool for retrieving items by project counter (visible ID in Rollbar UI)

### Changed
- Renamed and improved tool naming to better match Rollbar API documentation

## [1.1.2] - 2024-04-15

### Changed
- Internationalization: Translated all Japanese comments and error messages to English
- Build optimization: Excluded test files from TypeScript compilation
- Package optimization: Limited files included in npm package to only necessary modules

## [1.1.1] - 2024-04-15

### Fixed
- Minor bug fixes and improvements

## [1.1.0] - 2024-04-15

### Added
- Environment variable expansion: Added support for `ROLLBAR_PROJECT_TOKEN` and `ROLLBAR_ACCOUNT_TOKEN`
- Optimized token usage for different API endpoints
- Added `.env.example` file
- Added required tokens and API correspondence table to README

### Changed
- Removed support for the previous `ROLLBAR_ACCESS_TOKEN` environment variable
- Updated README to explain the usage of new environment variables
- Modified to work with only the necessary tokens depending on the API used (both tokens are no longer required)

## [1.0.0] - 2024-04-15

### Added
- Initial release with Rollbar API integration
- Core features:
  - Error items listing with filtering options
  - Detailed error information retrieval
  - Error occurrences tracking and viewing
  - Project and environment management
  - User listing and information retrieval
  - Deployment tracking and monitoring
- Integration support:
  - Cursor integration
  - Docker support
  - SSE transport capability
- Development environment setup:
  - Local development configuration
  - Docker development workflow
  - Environment variable management (ROLLBAR_ACCESS_TOKEN, ROLLBAR_PROJECT_ID, ROLLBAR_PROJECT_NAME)