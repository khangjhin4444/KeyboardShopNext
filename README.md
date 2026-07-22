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

## Getting Started

### Prerequisites

Ensure you have Node.js and npm (or yarn/pnpm) installed on your local machine.
Have a Neon and ImgBB account.

### Installation

1. Clone the repository:
   git clone https://github.com/khangjhin4444/KeyboardShopNext.git

2. Navigate to the project directory:
   cd KeyboardShopNext

3. Install dependencies:
   npm install

### Environment Setup

Create a `.env.local` file in the root directory and configure the required environment variables (refer to `.env.example` for the structure).

### Running the Development Server

Start the application in development mode:
npm run dev

Open `http://localhost:3000` in your browser to view the application.

## Project Architecture

This frontend is designed to work as a BFF (Backend for Frontend) intermediary, communicating with a separate Express.js & PostgreSQL (Neon) backend. Authentication tokens (Access & Refresh) are securely handled via NextAuth callbacks and HTTP-only cookies.
