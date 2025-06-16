# ITC Attendance Management System

A professional, admin-only, authentication-protected React + Flask attendance management app.

## Features
- JWT-based login and protected routes
- CRUD operations for master tables: Vendor, Location, Approver, BillingCycleRule, Employee
- Responsive, modern UI with TailwindCSS
- All API requests include JWT token for authentication
- Foreign key fields use dropdowns with live data
- All forms and tables match backend SQLAlchemy models

## Tech Stack
- **Frontend:** React, TypeScript, Vite, TailwindCSS
- **Backend:** Flask, SQLAlchemy, JWT

## Setup

### Backend
1. `cd backend`
2. Create a virtual environment and activate it
3. `pip install -r requirements.txt`
4. `python setup_db.py`
5. `python seed_db.py`
6. `python app.py`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Development
- All master table forms require all fields and use dropdowns for FKs
- All tables display all model fields
- UI is fully responsive and visually filled
- Toast and framer-motion code removed

## License
MIT
