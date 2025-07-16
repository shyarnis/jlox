# Lox Web API
This is spring boot based backend API that runs and evaluates **Lox** code from the book **Crafting Interpreters** by Bob Nystrom.
The backend exposes REST endpoints for running user provided Lox code and loaded example program

## Features
- Execute Lox code via HTTP `POST /api/lox/execute`
- Capture standard output, runtime errors and static errors

## Technologies
- Java 21
- Spring Boot 3.2
- Docker

## API Endpoints
### `POST /api/lox/execute`
Executes a Lox program submitted in the request body.

### `GET /api/lox/examples`
Returns a JSON object with multiple named Lox example programs.