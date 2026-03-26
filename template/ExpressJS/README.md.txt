# CRUD API with TypeScript, Express, and TypeORM

A comprehensive RESTful API built with TypeScript, Express, and TypeORM with PostgreSQL database support, featuring full CRUD operations with pagination, validation, and error handling.

## 🚀 Features

- **Full CRUD Operations**: Create, Read (with pagination), Update, and Delete
- **TypeScript**: Fully typed for better development experience
- **PostgreSQL Database**: Persistent data storage with TypeORM
- **Data Validation**: Using class-validator for request validation
- **Error Handling**: Comprehensive error handling and logging
- **Security**: Built-in security middlewares (Helmet, CORS)
- **Pagination**: Efficient pagination for data retrieval
- **Database Connection Management**: Proper connection handling with graceful shutdown
- **Environment Configuration**: Configurable via environment variables
- **API Documentation**: Well-documented endpoints with examples

## 📋 API Endpoints

### Base URL: `http://localhost:3000/api`



## 📁 Project Structure



## 🗄️ Database Prerequisites

- **PostgreSQL** database server
- Valid database credentials
- Network access to database server

## 🛠️ Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd {{ProjectName}}
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Copy the example environment file:

   ```bash
   copy .env.example .env
   ```

   Update the `.env` file with your database configuration:

   ```env
   # Server Configuration
   APP_NAME={{ProjectName}}
   APP_PORT=3000
   NODE_ENV=development

   # CORS Configuration
   CORS_ORIGIN=*

   # Database Configuration
   DATABASE_TYPE=postgres
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=postgres
   DATABASE_PASSWORD=your-password
   DATABASE_NAME={{ProjectName}}
   DATABASE_SYNCHRONIZE=false
   DATABASE_LOGGING=false
   ```

4. **Set up PostgreSQL Database:**

   Create a PostgreSQL database:

   ```sql
   CREATE DATABASE {{ProjectName}};
   ```

   Make sure your PostgreSQL server is running and accessible with the credentials specified in your `.env` file.

5. **Run in development mode:**

   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build directory

## 📝 API Usage Examples

### 1. Get All Users (with pagination)



### 2. Get Single User







### 3. Create New User



### 4. Update User


### 5. Delete User



## ✅ Validation Rules

The User entity includes the following validation rules:

- **firstName**: Required, non-empty string
- **lastName**: Required, non-empty string
- **email**: Required, valid email format, unique
- **age**: Required, number between 0 and 150

## 🚨 Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data or validation errors
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate email addresses
- **408 Request Timeout**: Request timeout (30 seconds)
- **500 Internal Server Error**: Server errors

**Error Response Format:**

```json
{
  "error": "Error message description",
  "details": [
    {
      "field": "email",
      "constraints": {
        "isEmail": "Please provide a valid email"
      }
    }
  ]
}
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Request Timeout**: 30-second timeout protection
- **Input Validation**: Server-side validation for all inputs
- **Error Logging**: Comprehensive error logging

## 🌐 Environment Variables

### Server Configuration



### Database Configuration



⚠️ **Important**: Set `DB_SYNCHRONIZE=false` in production environments!

## 🧪 Testing the API

You can test the API using tools like:

- **curl**: Command line HTTP client
- **Postman**: GUI API testing tool
- **Thunder Client**: VS Code extension
- **Insomnia**: API testing platform

### Sample curl commands:

```bash
# Get all users


# Create a user


# Update a user


# Delete a user


## 📊 Sample Data

The application comes with pre-populated sample data:

1. John Doe (john.doe@example.com)
2. Jane Smith (jane.smith@example.com)
3. Bob Johnson (bob.johnson@example.com)

## 🚀 Production Considerations

For production deployment, consider:

1. **Database**: Replace in-memory storage with a persistent database (PostgreSQL, MySQL, MongoDB)
2. **Authentication**: Add JWT or session-based authentication
3. **Rate Limiting**: Implement API rate limiting
4. **Logging**: Use structured logging (Winston, Pino)
5. **Monitoring**: Add health checks and monitoring
6. **Docker**: Containerize the application
7. **Environment**: Use environment-specific configurations

## 📚 Technologies Used

- **Node.js**: JavaScript runtime
- **TypeScript**: Type-safe JavaScript
- **Express.js**: Web framework
- **TypeORM**: ORM for data modeling
- **class-validator**: Validation library
- **class-transformer**: Object transformation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Morgan**: HTTP request logger

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support or questions, please open an issue in the repository.

---

**Happy coding! 🚀**
