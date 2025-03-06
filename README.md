# Todo list application — a demo web app for practicing software testing

## About

A simple web application that allows users to create and manage todos.

Features include:

- 🪪 User authentication (register, login, logout)
- 📋 Create, read, update, delete todo lists
- 📝 Create, read, update, delete todo items within a list
- 🖨️ Clone todo lists (copy all items to a new list)
- 🤝 Share todo lists with other users
- 📺 Live updates (websockets) for shared lists

The application includes the following four services.

- `frontend` — a web application implemented in [TypeScript](https://www.typescriptlang.org/), [Astro](https://astro.build/), [SolidJS](https://www.solidjs.com/), and [Tailwind CSS](https://tailwindcss.com/)
- `backend` — a REST API implemented with [Python](https://www.python.org/) and [FastAPI](https://fastapi.tiangolo.com/)
- `database` — a [PostgreSQL](https://www.postgresql.org/) database
- `database-migration` — a database migration service ([Refinery](https://github.com/rust-db/refinery)) for incremental database schema updates

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Running the Application

In the project directory, run 

```
docker compose up
```

Open `localhost` in a browser.

### Development

In the project directory, run 

```
docker compose -f compose.dev.yml up
```

Open `localhost:4321` in a browser.

The development environment includes hot reloading for the frontend and backend services.

