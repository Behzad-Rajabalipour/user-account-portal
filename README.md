
# User Account Portal

User Account Portal is a web application designed to manage user accounts. It provides features for user registration, login, profile management, and account settings, ensuring users can securely and efficiently manage their accounts.

## Features

- User registration with email verification
- User login with authentication
- Profile management (update personal information, change password)
- Account settings (manage preferences, notifications, etc.)
- Password recovery
- User-friendly interface with responsive design

## Technologies Used

- **Frontend:**
  - HTML
  - CSS
  - JavaScript
  - React

- **Backend:**
  - Node.js
  - Express.js
  - TypeScript

- **Database:**
  - MongoDB

- **Other Tools:**
  - Docker
  - Webpack
  - Babel
  - Prettier
  - Husky

## Getting Started

### Prerequisites

To run this project locally, you need to have the following installed:

- Node.js
- npm (Node package manager)
- MongoDB
- Docker (optional, for running with Docker)

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/Behzad-Rajabalipour/user-account-portal.git
   \`\`\`
2. Navigate to the project directory:
   \`\`\`bash
   cd user-account-portal
   \`\`\`
3. Install the dependencies for both the backend and the frontend:
   \`\`\`bash
   npm run install:global
   \`\`\`

### Running the Application

#### Using Docker

1. Start the application using Docker Compose:
   \`\`\`bash
   npm run start:docker
   \`\`\`
2. Open your browser and navigate to \`http://localhost:3000\` to see the application in action.

#### Without Docker

1. Start the MongoDB server:
   \`\`\`bash
   mongod
   \`\`\`
2. Start the backend server:
   \`\`\`bash
   npm run start:server
   \`\`\`
3. Start the frontend development server:
   \`\`\`bash
   npm run start:client
   \`\`\`
4. Open your browser and navigate to \`http://localhost:3000\` to see the application in action.

## Usage

- **User Registration:**
  - Navigate to the "Register" section
  - Fill out the form with your personal information (name, email, password, etc.)
  - Click "Register" to create a new account
  - Check your email for a verification link to activate your account

- **User Login:**
  - Navigate to the "Login" section
  - Enter your email and password
  - Click "Login" to access your account

- **Profile Management:**
  - Navigate to the "Profile" section
  - Update your personal information or change your password
  - Click "Save" to apply the changes

- **Account Settings:**
  - Navigate to the "Account Settings" section
  - Manage your preferences, notifications, and other account settings
  - Click "Save" to apply the changes

- **Password Recovery:**
  - Navigate to the "Forgot Password" section
  - Enter your email address
  - Check your email for a password recovery link
  - Follow the instructions to reset your password

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (\`git checkout -b feature/your-feature-name\`)
3. Make your changes
4. Commit your changes (\`git commit -m 'Add some feature'\`)
5. Push to the branch (\`git push origin feature/your-feature-name\`)
6. Open a pull request


- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)

---

Feel free to reach out if you have any questions or need further assistance!
