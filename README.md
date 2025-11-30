# 🚀 Express API Starter Kit (TypeScript)

A production-ready, database-agnostic REST API starter kit built with **Express.js** and **TypeScript**. It features a modular architecture, automated documentation, and robust authentication.

This project is designed to run seamlessly on **Local Environments** (using SQLite) or **Docker Containers** (using PostgreSQL).

## ✨ Key Features

-   **⚡ Framework:** Built with [Express.js](https://expressjs.com/) and [TypeScript](https://www.typescriptlang.org/) for type safety.
-   **🗄️ Database Agnostic:** Uses [Knex.js](https://knexjs.org/) Query Builder. Switch between **SQLite** (Dev) and **PostgreSQL** (Prod) easily.
-   **🛡️ Validation:** Request validation using [Zod](https://zod.dev/).
-   **📚 API Documentation:** Auto-generated Swagger UI via `swagger-jsdoc`.
-   **🔐 Authentication:** Secure JWT (Access & Refresh Tokens) with Role-Based Access Control (RBAC).
-   **🐳 Docker Ready:** Complete manual Docker setup instructions (Network, Volumes, Persistence).
-   **🧪 Automated Testing:** Python-based integration test suite included.
-   **👮 Security:** Helmet, CORS, Rate Limiting, and XSS protection included.

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [npm](https://www.npmjs.com/) (usually installed with Node.js)
*   [Git](https://git-scm.com/)
*   [Docker](https://www.docker.com/) (Optional, for containerized deployment)
*   [Python 3](https://www.python.org/) (Optional, for running API tests)

---

## 🚀 Getting Started (Local Development)

**Recommended:** Run the project locally first to understand the flow before deploying to Docker.

### 1. Clone the Repository
```bash
git clone https://github.com/mnabielap/starter-kit-restapi-express.git
cd starter-kit-restapi-express
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory. Copy the content below:

```properties
# .env

NODE_ENV=development
PORT=5000

# --- Database (SQLite for Local Dev) ---
DB_CLIENT=sqlite
DB_FILE=./database.sqlite

# --- JWT Secrets ---
JWT_SECRET="super_secret_key_for_development_only"
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
```

### 4. Run Database Migrations
This command creates the necessary tables (`users`, `tokens`) in your SQLite database.
```bash
npm run migrate:latest
```

### 5. Start the Server
```bash
npm run dev
```
The server is now running at `http://localhost:5000`.

---

## 🐳 Running with Docker (PostgreSQL)

For a production-like environment, we use **Docker**. This setup uses **PostgreSQL** and ensures data persistence using Docker Volumes.

### 1. Prepare Docker Environment File
Create a file named `.env.docker`. This file configures the container to talk to the database container.

```properties
# .env.docker

NODE_ENV=production
PORT=5000

# --- Database Config (PostgreSQL) ---
DB_CLIENT=pg
# "restapi-express-postgres" is the name of the DB container we will create
DB_HOST=restapi-express-postgres 
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=mysecretpassword
DB_NAME=starter_express
# Disable SSL for local Docker network
DB_SSL=false 

# --- JWT Secrets ---
JWT_SECRET="docker_secret_key_change_this_in_production"
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
```

### 2. Create Docker Network & Volumes
We create a dedicated network for communication and volumes for persistent data.

```bash
# 1. Create Network
docker network create restapi_express_network

# 2. Create Volume for Postgres Data (Persistence)
docker volume create restapi_express_pg_data

# 3. Create Volume for Media/Uploads
docker volume create restapi_express_media_volume

# 4. Create Volume for SQLite (Optional fallback)
docker volume create restapi_express_db_volume
```

### 3. Start PostgreSQL Container
Run the database container attached to the network and volume.

```bash
docker run -d \
  --name restapi-express-postgres \
  --network restapi_express_network \
  -v restapi_express_pg_data:/var/lib/postgresql/data \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=starter_express \
  postgres:15-alpine
```

### 4. Build the App Image
Build the Docker image from the source code.
```bash
docker build -t restapi-express-app .
```

### 5. Run the Application Container
This command starts your app, connects it to the DB network, loads environment variables, and runs migrations automatically via `entrypoint.sh`.

```bash
docker run -d -p 5005:5000 \
  --env-file .env.docker \
  --network restapi_express_network \
  -v restapi_express_db_volume:/app/database_storage \
  -v restapi_express_media_volume:/app/uploads \
  --name restapi-express-container \
  restapi-express-app
```

🚀 **Done!** The API is accessible at `http://localhost:5005`.

---

## 📦 Docker Management Cheat Sheet

Here are common commands to manage your containers.

#### View Logs
Check real-time logs (including migration status).
```bash
docker logs -f restapi-express-container
```

#### Stop Container
Stops the running application.
```bash
docker stop restapi-express-container
```

#### Restart Container
Starts the application again (data remains safe).
```bash
docker start restapi-express-container
```

#### Remove Container
Deletes the container instance (your data is **SAFE** in the volume).
```bash
docker stop restapi-express-container
docker rm restapi-express-container
```

#### Manage Volumes
```bash
# List all volumes
docker volume ls

# Remove volume 
# ⚠️ WARNING: This PERMANENTLY DELETES your Database Data!
docker volume rm restapi_express_pg_data
```

---

## 📚 API Documentation (Swagger)

Interactive API documentation is auto-generated.

*   **Local:** [http://localhost:5000/v1/docs](http://localhost:5000/v1/docs)
*   **Docker:** [http://localhost:5005/v1/docs](http://localhost:5005/v1/docs)

---

## 🧪 API Testing (Python Scripts)

We provide a suite of Python scripts in the `api_tests/` folder to test endpoints sequentially. These scripts automatically handle token management (saving `access_token` to `secrets.json`).

### How to Run Tests
No arguments needed. Just run the file.

1.  **Register Admin:** (Creates user & saves token)
    ```bash
    python api_tests/A1.auth_register.py
    ```

2.  **Create Secondary User:** (Uses Admin token to create another user)
    ```bash
    python api_tests/B1.user_create.py
    ```

3.  **Get All Users:**
    ```bash
    python api_tests/B2.user_get_all.py
    ```

> **Note:** The `utils.py` script generates detailed logs for every request in `*.json` files within the `api_tests/` folder.

---

## 📜 NPM Scripts

*   `npm run dev`: Run server in development mode (Nodemon).
*   `npm run build`: Compile TypeScript to JavaScript (`dist/`).
*   `npm run start`: Run the compiled production server.
*   `npm run migrate:latest`: Run pending database migrations.
*   `npm run migrate:make <name>`: Create a new migration file.
*   `npm run lint`: Lint code using ESLint.
*   `npm run format`: Format code using Prettier.

---

## 🏗️ Project Structure

```text
src/
├── config/         # Environment config & Logger
├── controllers/    # Request handlers (Auth, User)
├── database/       # Knex connection & Migrations
├── middlewares/    # Auth, Validation, Error Handling
├── routes/         # Route definitions & Swagger docs
├── services/       # Business logic (DB queries)
├── types/          # TypeScript definitions
├── utils/          # Helpers (ApiError, Pick, CatchAsync)
├── validations/    # Zod Schemas
├── app.ts          # Express App setup
└── index.ts        # Server Entry point
```