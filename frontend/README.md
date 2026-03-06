# GIRA Frontend

Production-grade React frontend application for GIRA service ticket management system.

## Features

- **Role-Based Login**: Support for Worker, Service Provider, and Manager roles
- **Authentication**: localStorage-based session management with default demo users
- **Worker Dashboard**: Raise and track service tickets
- **Provider Dashboard**: Manage assigned tickets with status updates
- **Manager Dashboard**: Oversee all tickets and assign to providers
- **Responsive Design**: Mobile-optimized UI with Bootstrap
- **Modern Styling**: Distinctive production-grade design with custom CSS

## Default Demo Credentials

### Manager

- Email: `admin@gira.com`
- Password: `admin123`

### Worker

- Email: `worker@gira.com`
- Password: `worker123`

### Service Provider

- Email: `provider@gira.com`
- Password: `provider123`

## Installation

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar with logout
│   │   ├── Navbar.css
│   │   └── ProtectedRoute.jsx   # Route protection component
│   ├── context/
│   │   └── AuthContext.jsx      # Authentication context with default users
│   ├── pages/
│   │   ├── LoginPage.jsx & .css
│   │   ├── SignupPage.jsx & .css
│   │   ├── WorkerDashboard.jsx & .css
│   │   ├── ProviderDashboard.jsx & .css
│   │   └── ManagerDashboard.jsx & .css
│   ├── App.jsx & .css           # Main app with routing
│   └── index.js & .css          # Entry point and global styles
├── public/
│   └── index.html
└── package.json
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from create-react-app

## Design Highlights

- **Dark Theme**: Modern dark UI with vibrant accents
- **Color Palette**:
  - Primary: #0f3a7d (Deep Blue)
  - Secondary: #00d4ff (Cyan)
  - Accent colors for different statuses
- **Typography**: Custom fonts (Poppins for UI, Space Mono for details)
- **Animations**: Smooth transitions and entrance animations
- **Responsive**: Fully responsive across all device sizes

## Authentication Flow

1. User logs in with email/password (validated against hardcoded users)
2. Session stored in localStorage
3. Routes protected by role-based access
4. Automatic redirect to appropriate dashboard based on role
5. Logout clears session

## Ticket Status Flow

- **Pending**: Newly created ticket awaiting assignment
- **In Progress**: Ticket assigned and being worked on
- **Resolved**: Ticket completed

## Technologies Used

- React 18
- React Router 6 (for navigation)
- Bootstrap 5 (for components)
- Custom CSS (for styling)
- JavaScript ES6+

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is part of the GIRA Service Management System.
