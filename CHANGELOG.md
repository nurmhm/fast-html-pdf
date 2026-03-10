# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-09

### Added
- Initial stable release
- Core `htmlToPdfBuffer()` function for in-memory PDF generation
- Core `htmlToPdfFile()` function for saving PDFs to disk
- New `htmlToPdfBatch()` function for batch processing multiple documents
- Custom error class `HtmlToPdfError` with original error tracking
- Support for custom CSS injection via `additionalStyles` option
- Viewport configuration support
- Comprehensive JSDoc documentation for all public APIs
- Full TypeScript type definitions with exported types
- Improved error handling and validation
- Better browser lifecycle management
- Complete README with examples and API reference
- Contributing guidelines
- MIT License

### Changed
- Enhanced package.json with metadata, keywords, and repository links
- Improved TypeScript configuration for stricter type checking
- Upgraded to latest Playwright version
- Updated Node.js minimum version requirement to 18.0.0

### Fixed
- Proper browser close handling in error scenarios
- Better resource cleanup even on exceptions
- Input validation for HTML and output path parameters

### Documentation
- Comprehensive README with quick start guide
- Advanced usage examples (invoices, Express.js integration)
- Full API reference documentation
- Performance tips and troubleshooting guide
- Contributing guidelines
- Code examples for error handling

## [0.1.0] - 2026-03-10

### Added
- Initial alpha release
- Basic `htmlToPdfBuffer()` functionality
- Basic `htmlToPdfFile()` functionality
- Playwright integration
- TypeScript support
- Basic type definitions
