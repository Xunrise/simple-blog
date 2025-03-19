# Blog with Admin Panel

A simple markdown blog with an admin panel protected by Google authentication.

## Features

- Responsive blog interface with light/dark theme support
- Admin panel for creating, editing and deleting posts
- Protected routes with Google OAuth authentication
- Markdown editor for blog posts

## Setup

### Prerequisites

- Node.js (v14 or later)
- NPM or Yarn

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Auth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secure-random-string
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   
   # Authorized email domains (comma-separated)
   AUTHORIZED_EMAILS=your.email@gmail.com
   ```

2. To get Google OAuth credentials:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select an existing one)
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application" as the application type
   - Add `http://localhost:3000` to the "Authorized JavaScript origins"
   - Add `http://localhost:3000/api/auth/callback/google` to the "Authorized redirect URIs"
   - Copy the Client ID and Client Secret to your `.env.local` file

3. Generate a secure random string for NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```
   
4. Add your email address to AUTHORIZED_EMAILS to allow access to the admin panel

### Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the blog.
Admin panel is available at `http://localhost:3000/admin` (requires authentication).

## Authentication Flow

1. Authentication is handled by NextAuth.js with Google Provider
2. Only emails listed in the AUTHORIZED_EMAILS env variable can access the admin panel
3. The middleware protects all routes under /admin
4. Unauthorized users are redirected to the login page

## License

MIT
