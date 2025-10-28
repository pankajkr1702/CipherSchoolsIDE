# CipherStudio — Online React IDE

## 1️⃣ Overview

CipherStudio is a browser-based React IDE that enables developers to write, run, and save React projects entirely within the browser environment. Built with modern web technologies, CodeCraft provides a streamlined development experience similar to CodeSandbox but intentionally simplified for learning and assessment purposes. Users can create projects, manage files and folders, write code with syntax highlighting, and see live previews of their React applications without any local setup requirements.

## 2️⃣ Features

### Core Features
- **File Explorer CRUD**: Complete file and folder management with create, read, update, and delete operations
- **Code Editor**: Advanced code editor with syntax highlighting powered by Monaco Editor
- **Live Preview**: Real-time React application preview using Sandpack engine
- **Dual Storage**: LocalStorage for offline work + Cloud project save/load functionality
- **Authentication**: JWT-based user authentication with project scoping per user
- **Dark Theme**: Professional dark theme with cyan accent colors

### Bonus Features
- **Cloud Sync Preference**: Users can choose between local and cloud storage when authenticated
- **Session Management**: Automatic logout and session expiry handling
- **Project Templates**: Pre-configured React starter templates for new projects

## 3️⃣ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React + Sandpack |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT |
| **Deployment** | *Coming Soon* |

## 4️⃣ Architecture

CodeCraft features a three-panel user interface designed for optimal developer workflow:

- **Explorer Panel**: File tree navigation and management
- **Editor Panel**: Code editing with syntax highlighting
- **Preview Panel**: Live React application preview

The application implements a hybrid storage model combining local browser storage with cloud persistence. When authenticated, users can sync their projects to the cloud, while maintaining offline capabilities through LocalStorage.

### Data Hierarchy
```
Users (1) ←→ Projects (many)
Projects (1) ←→ Files (many)
```

The backend provides REST APIs for comprehensive project and file CRUD operations, with all endpoints requiring JWT authentication for security.

## 5️⃣ Folder Structure

### Frontend
```
frontend/
├── src/
│   ├── components/
│   │   ├── AuthPanel.jsx
│   │   ├── Editor.jsx
│   │   ├── Explorer.jsx
│   │   ├── FileTabs.jsx
│   │   ├── Header.jsx
│   │   ├── Preview.jsx
│   │   └── ProjectSelector.jsx
│   ├── context/
│   │   └── ProjectContext.jsx
│   ├── utils/
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── dndHelpers.js
│   │   ├── fileHelpers.js
│   │   ├── slugify.js
│   │   └── storage.js
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
├── package.json
└── index.html
```

### Backend
```
backend/
├── src/
│   └── server.js
├── package.json
└── ENV_EXAMPLE.txt
```

## 6️⃣ API Endpoints

All API endpoints require the `Authorization` header with a valid JWT token:
```
Authorization: Bearer <jwt_token>
```

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details with files
- `DELETE /api/projects/:id` - Delete project

### Files
- `POST /api/projects/:id/files` - Create new file/folder
- `PUT /api/projects/:id/files/:fileId` - Update file content
- `DELETE /api/projects/:id/files/:fileId` - Delete file/folder

## 7️⃣ How to Run Locally

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)

### Backend Setup
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `ENV_EXAMPLE.txt`:
   ```env
   MONGO_URI=mongodb+srv://user:password@cluster0.mongodb.net/codecraft
   PORT=4000
   JWT_SECRET=your-strong-secret-key
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:4000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Access the Application
1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account or login with existing credentials
3. Start creating and editing React projects!

## 8️⃣ Roadmap

### Upcoming Features
- **Deployment**: Deploy to Vercel (frontend) and Railway (backend)
- **File Management**: Rename and drag-and-drop functionality in file tree
- **Autosave**: Toggle for automatic file saving
- **Theme Switcher**: Multiple theme options beyond dark mode
- **Collaboration**: Real-time collaborative editing
- **Export**: Download projects as ZIP files
- **Templates**: Additional project templates (Vue, Angular, etc.)

## 9️⃣ Screenshots

*Screenshots will be added here showing the IDE interface, authentication flow, and project management features.*

## 🔟 Contributing

CodeCraft is currently a private project. For contribution inquiries, please contact the development team.

## License

This project is proprietary software. All rights reserved.

---

**CipherStudio** — Empowering developers with browser-based React development.
