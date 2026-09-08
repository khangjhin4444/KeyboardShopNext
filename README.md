# KeyboardShopNext

A modern, high-performance e-commerce frontend application specializing in mechanical keyboards. Built with Next.js (App Router), this project provides a seamless shopping experience with advanced features like multi-step authentication, real-time product search, and smooth animations.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database**: Neon
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management & Fetching:** TanStack React Query
- **Authentication:** NextAuth.js (Credentials & Google OAuth)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Cloud Storage:** ImgBB

## Key Features

- **Secure Authentication:** Multi-step registration and login flows using NextAuth, supporting both local credentials and Google OAuth.
- **Smart Search & Pagination:** Real-time product filtering with debounce and infinite scroll/pagination implementations.
- **Dynamic Cart Management:** Session-based cart tracking integrated seamlessly with the Express backend.
- **Responsive UI:** Fully optimized layout for mobile, tablet, and desktop viewports.
- **Smooth Transitions:** Reveal animations on scroll and interactive hover states using Framer Motion and Tailwind utility classes.

---

# Getting Started

## Prerequisites

Before running the project, make sure you have one of the following setups:

### Local Development

- Node.js
- npm, yarn, or pnpm
- A Neon PostgreSQL account
- An ImgBB account
- The backend API running on port `8000`

### Docker

- Docker
- Docker Compose

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/khangjhin4444/KeyboardShopNext.git
cd KeyboardShopNext
```

## 2. Install Dependencies

```bash
npm install
```

---

# Environment Setup

Create a `.env.local` file in the root directory and configure the required environment variables.

You can use `.env.example` as a reference:

```bash
cp .env.example .env.local
```

Make sure the backend API URL points to the Express.js backend:

```env
BACKEND_URL=http://localhost:8000
```

Other required environment variables may include:

```env
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

IMGBB_API_KEY=your_imgbb_api_key
```

---

# Running the Development Server

Make sure the Express.js backend is running on port `8000`.

Start the Next.js frontend:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:3000
```

The backend API should be available at:

```text
http://localhost:8000
```

---

# Running with Docker

The project also supports running the frontend using Docker.

## Docker Architecture

When running the application with Docker, the services are expected to use the following ports:

| Service  |   Port | Description         |
| -------- | -----: | ------------------- |
| Frontend | `3000` | Next.js application |
| Backend  | `8000` | Express.js REST API |

The frontend communicates with the backend through:

```text
http://localhost:8000
```

## Running Frontend and Backend with Docker Compose

Start all services with:

```bash
docker compose up --build
```

Run in detached mode:

```bash
docker compose up --build -d
```

The applications will then be available at:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8000
```

To stop the containers:

```bash
docker compose down
```

To rebuild the containers after making changes:

```bash
docker compose up --build
```

---

## Project Architecture

This frontend is designed to work as a BFF (Backend for Frontend) intermediary, communicating with a separate Express.js & PostgreSQL (Neon) backend. Authentication tokens (Access & Refresh) are securely handled via NextAuth callbacks and HTTP-only cookies.

# License

This project is for educational and development purposes.
