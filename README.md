# DTR DENR - Daily Time Record System

<p align="center">
  <img src="storage/app/public/images/logo.png" alt="DENR Logo" width="200">
</p>

<p align="center">
  <strong>Department of Environment and Natural Resources</strong><br>
  <em>Bulacan Provincial Office</em>
</p>

## Overview

A comprehensive Daily Time Record (DTR) management system designed for the Department of Environment and Natural Resources (DENR) Bulacan office. This application streamlines attendance tracking, break management, and DTR document generation.

## Features

- **Employee Management** - Add, edit, and manage personnel records
- **DTR Records** - View and manage daily time records with schedule tracking
- **Break Management** - Track break out/in times (12:00 PM - 12:59 PM)
- **Document Generation** - Export DTR as PDF or DOCX formats
- **Bulk Download** - Generate DTR summaries for multiple employees
- **Travel Order Tracking** - Manage travel order documentation
- **Schedule Management** - Toggle between 8HR and 10HR shift schedules
- **User Authentication** - Secure login and role-based access

## Built With

- Laravel 12.x
- PHP 8.2+
- React 19
- Inertia.js
- Tailwind CSS
- MySQL
- PHPWord (DOCX generation)
- LibreOffice (PDF conversion)

## Getting Started

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js & npm
- MySQL
- LibreOffice (for PDF generation)

### Installation

1. Clone the repository
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Install Node dependencies:
   ```bash
   npm install
   ```
4. Configure your `.env` file with database credentials
5. Run migrations:
   ```bash
   php artisan migrate
   ```
6. Generate application key:
   ```bash
   php artisan key:generate
   ```
7. Build frontend assets:
   ```bash
   npm run build
   ```
8. Start the development server:
   ```bash
   php artisan serve
   ```

## Usage

1. Log in with your credentials
2. Select an employee from the sidebar
3. View their DTR records by month
4. Double-click Break Out/Break In cells to add break times
5. Download DTR as PDF or DOCX

## License

Proprietary - Department of Environment and Natural Resources