# CRUD Builder CLI

[![npm version](https://badge.fury.io/js/crud-builder.svg)](https://badge.fury.io/js/crud-builder)
[![codecov](https://codecov.io/gh/wat6714522/CRUD-Builder/branch/main/graph/badge.svg)](https://codecov.io/gh/wat6714522/CRUD-Builder)
[![Downloads](https://img.shields.io/npm/dm/crud-builder.svg)](https://www.npmjs.com/package/crud-builder)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/node/v/crud-builder.svg)](https://nodejs.org/)
[![Package Size](https://img.shields.io/bundlephobia/min/crud-builder.svg)](https://bundlephobia.com/package/crud-builder)

A powerful CLI tool that automatically generates complete CRUD operations for modern web frameworks. Supports **ExpressJS**, **NestJS**, and **NextJS** with TypeORM/Prisma integration.

## ✨ Features

- 🚀 **Supported Framework**: NestJS, NextJS, ExpressJS
- 📊 **CSV Schema Import**: Generate CRUD operations from CSV files
- 🗄️ **Database Integration**: TypeORM with MySQL support
- 🏗️ **Project Scaffolding**: Create complete projects with a single command
- 📝 **TypeScript Ready**: Full TypeScript support with proper type definitions
- 🛡️ **Data Validation**: Auto-generated validation based on schema
- 🔧 **Environment Configuration**: Automatic .env setup for database connections
- 🧪 **Test Generation**: Auto-generated service unit tests and controller integration tests
- 📦 **Fully Runnable Output**: Generated projects include `package.json`, `tsconfig.json`, and test scripts

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- Basic knowledge of one of the supported frameworks (ExpressJS, NestJS, NextJS)
- Database server (MySQL, PostgreSQL, or SQLite)

### Quick Start

Install globally via npm:

```bash
npm install -g crud-builder
```

Or use with npx (no installation required):

```bash
npx crud-builder --help
```

### Alternative Installation

Clone and install from source:

```bash
git clone https://github.com/wat6714522/CRUD-Builder.git
cd CRUD-Builder
npm install
npm link
```

## 🚀 Quick Usage

```bash
# Create a new project
crud <framework> create <project-path>

# Set up database connection
crud <framework> connect

# Generate CRUD components from CSV
crud <framework> generate <csv-path> [component]
```

## 🗄️ Database Support

### Currently Supported

- **MySQL** - Full support including connection configuration, entity generation, and integration testing
  - Driver: `mysql2`
  - ORM: TypeORM
  - Features: Auto-generated entities with proper column types, decimal transformer for string-to-number conversion, `@CreateDateColumn`/`@UpdateDateColumn` with `snake_case` naming

### Database Connection

The `connect` command generates a `database.config.ts` file that reads connection details from environment variables:

```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=your_database
```

```bash
# Generate database config file
crud NestJS connect

# With custom output directory
crud NestJS connect --directory ./src/configs

# With custom .env file path
crud NestJS connect --envPath ./config/.env
```

### Column Type Mapping

The CLI automatically infers TypeScript and database column types from your CSV data:

- `string` values → `@Column({ type: 'varchar' })` / `string`
- `integer` values (e.g. `1`, `42`) → `@Column({ type: 'int' })` / `number`
- `float` values (e.g. `3.14`) → `@Column({ type: 'decimal', precision: 10, scale: 2 })` / `number`
- `decimal` values (e.g. `50000.500`) → `@Column({ type: 'decimal', precision: 10, scale: 2 })` / `number`
- `boolean` values (`true`/`false`) → `@Column({ type: 'boolean' })` / `boolean`
- `date` values (e.g. `2023-01-01`) → `@Column({ type: 'timestamp' })` / `Date`
- First column → `@PrimaryGeneratedColumn()` / `number`
- `created_at`/`updated_at` → Auto-generated `@CreateDateColumn`/`@UpdateDateColumn`

### Running Tests Against Your Database

The generated controller integration tests connect to your real database. Pass connection details as environment variables:

```bash
DB_TYPE=mysql \
DB_HOST=localhost \
DB_PORT=3306 \
DB_USERNAME=root \
DB_PASSWORD=secret \
DB_NAME=mydb \
npm test
```
## 📚 Supported Frameworks

### 🕺 ExpressJS + TypeORM

Generate a complete ExpressJS REST API with TypeORM integration.

#### Commands:

```bash
# Create new ExpressJS project
crud ExpressJS create ./my-express-app

# Set up database connection (creates TypeORM config)
crud ExpressJS connect

# Generate CRUD components from CSV
crud ExpressJS generate ./products.csv
```

**Generated Files:**
- TypeORM entities
- Express controllers with validation
- Service layers
- Route definitions
- Database configuration

### ⚔️ NestJS + TypeORM

Generate a enterprise-grade NestJS application with TypeORM integration.

#### Commands:

```bash
# Create new NestJS project
crud NestJS create ./my-nest-app

# Set up database connection
crud NestJS connect

# Generate CRUD components from CSV
crud NestJS generate ./products.csv all
```

**Generated Files:**
- TypeORM entities with decorators
- Controllers with validation pipes
- Services with business logic and error handling (404, 409)
- DTOs (Create/Update/Pagination) with class-validator decorators
- Modules with dependency injection
- Custom validation pipes
- Service unit tests (mocked repository)
  - Controller integration tests (MySQL)
- `package.json` with all dependencies and test scripts
- `tsconfig.json` with ts-node configuration

### ⚡ NextJS + Prisma

Generate a modern full-stack NextJS application with Prisma ORM.

#### Commands:

```bash
# Create new NextJS project (with prompts)
crud NextJS create ./my-next-app

# Set up Prisma and database connection
crud NextJS connect

# Generate CRUD components from CSV
crud NextJS generate ./products.csv all
```

**Generated Files:**
- Prisma schema
- API routes (App Router)
- Server actions
- Database client setup
- Type definitions

```bash
  crud nestjs create <projectName>
```

#### Argument

`projectName`: Specify the project name of your project.

```bash
  crud nestjs generate [options] <csvPath> <component>
```

#### Argument

- `csvPath`: Specify the path of your csv.
- `component`: Specify the component you want to generate (`controller`, `service`, `module`, `entity`, `dto`, `test`, `pipe`, or `all`).

#### Options

- `-d, --directory <filePath>`: Specify the output directory of your generated components.

```bash
  crud nestjs connect [options]
```

**Options:**

- `-d, --directory <filePath>`: Specify the output path for the database config file
- `-e, --envPath <filePath>`: Specify the path of the .env file containing database environment variables

**Required Environment Variables:**
Your `.env` file should contain the following variables:

```env
DB_TYPE
DB_HOST
DB_PORT
DB_USERNAME
DB_PASSWORD
DB_NAME
```

**Examples:**

```bash
  # Create command
  crud nestjs create MyApp

  # Connect command
  crud nestjs connect --directory ./MyApp/src

  # Generate command
  crud nestjs generate --directory ./MyApp/src Entity
```

### 3. Generate CRUD Components

```bash
crud nestjs generate <csvPath> <component> [options]
```

## CSV Schema Format

The CSV file should follow this structure:

1. **First row**: Column headers (used as field names)
2. **First column**: Primary key field
3. **Subsequent rows**: Sample data for type inference

**Example CSV (`users.csv`):**

```csv
id,name,email,age,isActive,salary,createdAt
1,John Doe,john@example.com,30,true,50000.50,2023-01-01
2,Jane Smith,jane@example.com,25,false,45000.75,2023-01-02
3,Bob Johnson,bob@example.com,35,true,60000.00,2023-01-03
```

This will generate:

- `id`: Primary key (number)
- `name`: String field
- `email`: String field with email validation
- `age`: Number field
- `isActive`: Boolean field
- `salary`: Decimal number field
- `createdAt`: Date field

## Generated File Structure

After running the generate command with `all`, you'll get a fully runnable project:

```
output/
├── package.json
├── tsconfig.json
├── entities/
│   └── user.entity.ts
├── dto/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   ├── id-param.dto.ts
│   └── pagination.dto.ts
├── pipes/
│   ├── parse-array.pipe.ts
│   ├── parse-bool.pipe.ts
│   ├── parse-id.pipe.ts
│   ├── parse-uuid.pipe.ts
│   └── request-header.pipe.ts
├── controllers/
│   └── user.controller.ts
├── services/
│   └── user.service.ts
├── modules/
│   └── user.module.ts
└── tests/
    ├── user.service.spec.ts
    └── user.controller.spec.ts
```

## API Endpoints Generated

The generated controller includes these endpoints:

- `GET /users` - Get all users with pagination
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user (returns 409 on duplicate unique fields)
- `PATCH /users/:id` - Update user (returns 404 if not found)
- `DELETE /users/:id` - Delete user (returns 404 if not found)

## Running Generated Tests

The generated project includes service unit tests and controller integration tests. After generating:

```bash
# Install dependencies
cd output/
npm install

# Run all tests (pass your database config as env vars)
DB_TYPE=mysql DB_HOST=localhost DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=secret DB_NAME=mydb npm test

# Run only service tests (mocked, no database needed)
npm run test:service

# Run only controller tests (requires database)
DB_TYPE=mysql DB_HOST=localhost DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=secret DB_NAME=mydb npm run test:controller
```

### Test Details

**Service Tests** (`*.service.spec.ts`):
- Uses `node:test` and `node:assert` with mocked TypeORM repository
- Tests `findAll`, `findOne`, `create`, `update`, `remove`
- Verifies `NotFoundException` for missing records
- No database connection required

**Controller Integration Tests** (`*.controller.spec.ts`):
- Uses `@nestjs/testing` with a real MySQL database connection
- Tests all CRUD endpoints via HTTP with `supertest`
- Verifies pagination, 404 errors, 409 duplicate conflicts, and 400 validation errors
- Cleans up test data after each run
- Database config passed via environment variables (`DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`)

## Development

### Running Tests

```bash
node --experimental-test-module-mocks --test src/test/NestJS/*.test.js
```

### Project Structure

```
CRUD-Builder/
├── bin/                    # CLI entry points
│   ├── index.js
│   └── commands/
│       ├── NestJS/
│       │   ├── create.js
│       │   ├── generate.js
│       │   ├── connect.js
│       │   └── nestjs.js
│       ├── ExpressJS/
│       └── NextJS/
├── src/
│   ├── generators/         # Code generators
│   │   └── NestJS/
│   │       └── TypeORM.js
│   ├── utils/              # Utility functions
│   └── test/               # CLI unit tests
│       ├── NestJS/
│       │   ├── generate.test.js
│       │   ├── connect.test.js
│       │   └── create.test.js
│       └── fixtures/
│           └── user.csv
├── template/               # Code templates
│   └── NestJS/
│       └── TypeORM/
│           ├── entity.txt
│           ├── controller.txt
│           ├── service.txt
│           ├── module.txt
│           ├── db-connect.txt
│           ├── tsconfig.txt
│           ├── DTO/
│           ├── Pipes/
│           └── Tests/
│               ├── service.spec.txt
│               └── controller.spec.txt
└── scripts/
    └── seed-employees.sql
```

## 🔄 CI/CD & Publishing

This project uses automated CI/CD pipelines for quality assurance and publishing:

### 🧪 Continuous Integration
- **Automated Testing**: Tests run on Node.js 18.x, 20.x, and 22.x
- **Code Quality**: ESLint and Prettier checks on every PR
- **Security Audits**: Automated dependency vulnerability scanning
- **CLI Testing**: Functional tests ensure CLI commands work correctly

### 🚀 Automated Publishing
- **NPM Publishing**: Automatic publishing to npm registry on version tags
- **GitHub Releases**: Auto-generated release notes with changelogs
- **Multi-Registry**: Publishes to both npm and GitHub Packages
- **Semantic Versioning**: Supports patch, minor, major, and prerelease versions

### 📋 Release Process

**For Maintainers:**

1. **Create a Release** (Manual Trigger):
   - Go to GitHub Actions → "Create Release" workflow
   - Select version type: `patch`, `minor`, `major`, or `prerelease`
   - Run the workflow from the `main` branch

2. **Automatic Process**:
   ```bash
   # The workflow automatically:
   # 1. Runs full test suite
   # 2. Updates version in package.json
   # 3. Generates CHANGELOG.md
   # 4. Creates Git tag
   # 5. Pushes changes and tag
   # 6. Publishes to npm
   # 7. Creates GitHub release
   ```

3. **Manual Release** (Alternative):
   ```bash
   # For patch version
   npm run release:patch
   
   # For minor version  
   npm run release:minor
   
   # For major version
   npm run release:major
   ```

### 🛡️ Quality Gates
All releases must pass:
- ✅ Linting checks
- ✅ Unit tests
- ✅ Code formatting
- ✅ Security audit
- ✅ CLI functionality tests

### 📦 Installation Sources

```bash
# From npm registry (recommended)
npm install -g crud-builder

# From GitHub Packages
npm install -g @wat6714522/crud-builder --registry=https://npm.pkg.github.com

# Latest development version
npm install -g crud-builder@beta
```

## 📝 Changelog

### v1.0.4

- **Test Generation**: New `test` component generates service unit tests and controller integration tests using `node:test` and `@nestjs/testing`
- **MySQL Integration**: Controller tests connect to a real MySQL database via environment variables instead of SQLite in-memory
- **Fully Runnable Output**: `generate all` now produces `package.json` and `tsconfig.json` so generated projects work with just `npm install && npm test`
- **Service Error Handling**: Service `create()` now catches duplicate key errors and returns `409 Conflict` instead of `500`

**Bugs Fixes for NestJS:**
- **Entity Fixes**: Added `reflect-metadata` import, explicit column types (`varchar`, `int`, `decimal`, `boolean`), decimal transformer for MySQL string-to-number conversion, and `snake_case` timestamp columns (`created_at`, `updated_at`)
- **DTO Fixes**: Correct type mapping for `integer`, `float`, `decimal` fields; removed unreliable `@IsPositive()`/`@IsNegative()` decorators; added `@IsNumber()` for decimal fields
- **Controller Fixes**: Added explicit `@Inject()` for DI compatibility without `emitDecoratorMetadata`, removed redundant inline `ValidationPipe`
- **Pagination Fix**: Changed `skip` validation from `@IsPositive()` to `@Min(0)` to allow offset 0
- **Create Command**: Installs test dependencies (`supertest`, `ts-node`, `@types/supertest`, `@types/node`) and configures `npm test` script
- **Bug Fixes**: Fixed syntax error in `generate.js` action callback, fixed stray character in `create.js`, fixed import casing mismatches in test files

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
# 1. Fork and clone the repository
git clone https://github.com/your-username/CRUD-Builder.git
cd CRUD-Builder

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Start development
npm link
crud --help
```

### Pull Request Process
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm test`
5. Run linting: `npm run lint:fix`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

ISC

## Authors

P&P Squad
