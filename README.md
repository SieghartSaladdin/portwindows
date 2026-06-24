# Windows 11 Pro Interactive Portfolio 🖥️

A high-fidelity replica of the Windows 11 Pro desktop environment, built as an interactive developer portfolio website. This project combines desktop-grade windowing capabilities, modular app panels, a functional CLI terminal, and customizable display preferences inside a modern React application.

---

## ✨ Features

- **Draggable & Adjustable Windows**: Built using **Framer Motion**, applications can be dragged around the screen area, maximized to cover the workspace, minimized to the taskbar, and closed. Window stacking order (z-index) adjusts dynamically on focus.
- **Glassmorphic & Mica Aesthetics**: Tailwind CSS v4 styling creates a premium desktop vibe with realistic backdrop blurs (`backdrop-blur-md`), subtle borders, translucent overlays, and dark-mode defaults.
- **Interactive Command Prompt (Terminal)**: A fully operational terminal emulator supporting custom inputs. Users can type:
  - `help` to see options
  - `about` to print your biography
  - `projects` to display a flat folder view of your github repos
  - `skills` to list categorized tags
  - `contact` to show your active emails and profile handles
  - `neofetch` to draw a retro ASCII layout of your specs
- **Personalized Settings (Theme Changer)**: Features a personalization tab where users can switch between 4 different desktop wallpapers (Default Blue, Crimson Dusk, Forest Glow, and Cyber Neon) that update the desktop styling instantly using a global state manager.
- **File Explorer (Projects)**: A folder navigation directory showing quick access drives. Selecting a project card expands a metadata details panel displaying technology tags, descriptions, and direct links to GitHub or live sites.
- **Taskbar & Start Menu**:
  - Centered app icons showing open indicators (under-line pills) that track minimize, maximize, and active focus.
  - Windows Start button which toggles the animated launcher start menu (featuring search filtering for pinned apps).
  - Tray clock with live date/time formatting.
- **Custom Right-Click Context Menu**: A customized, clamp-guarded right-click desktop menu allowing you to Refresh the desktop, open the Terminal, customize display settings, or arrange views.

---

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router, ESModules, React 19)
- **Styling**: Tailwind CSS v4
- **Animation**: Framer Motion (for smooth window dragging, spring maximizers, and start menu slides)
- **State Management**: Zustand (coordinates open/closed apps, layout indices, active focus, and wallpapers)
- **Icons**: Lucide React (with custom inline SVG brand logos)

---

## 📂 Folder Architecture

```
c:/laragon/www/webapp/portwindows/
├── src/
│   ├── app/
│   │   ├── globals.css         # Glassmorphism utilities, scrollbars, base resets
│   │   ├── layout.tsx          # Page metadata, viewport settings, Geist font loader
│   │   └── page.tsx            # Desktop workspace mount point
│   ├── components/
│   │   ├── apps/               # Application-specific layouts
│   │   │   ├── BioApp.tsx      # Notepad: Text editor bio viewer
│   │   │   ├── ProjectsApp.tsx # File Explorer: Folder-grid project detailer
│   │   │   ├── SettingsApp.tsx # Settings: Specs panel & Wallpaper selector
│   │   │   └── TerminalApp.tsx # Command Prompt: Interactive console CLI
│   │   ├── ui/                 # Reusable desktop interface items
│   │   │   ├── AppIcon.tsx     # Desktop icons (selection highlight, double click)
│   │   │   ├── ContextMenu.tsx # Right-click context actions
│   │   │   └── WindowContainer.tsx # Drag handle & window frame manager
│   │   ├── Desktop.tsx         # Central layout coordinate manager
│   │   ├── Taskbar.tsx         # System clock, tray icons, open app indicators
│   │   └── StartMenu.tsx       # Start launcher panel with pinned apps & search
│   ├── hooks/
│   │   ├── useContextMenu.ts   # Intercepts default context clicks & clamps coordinates
│   │   └── useDateTime.ts      # Keeps taskbar clock synced with system time
│   └── lib/
│       ├── data.ts             # Centralized developer details (projects, bio, links)
│       └── store.ts            # Zustand global state model
```

---

## 🚀 Setup & Local Execution

Follow these steps to run the virtual environment locally:

1. Clone or navigate to the directory:
   ```bash
   cd c:\laragon\www\webapp\portwindows
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Boot up the local development server:
   ```bash
   npm run dev
   ```
4. Open your browser and head to: **[http://localhost:3000](http://localhost:3000)**.

---

## 🐳 Docker Deployment

You can build, run, and publish this application inside a Docker container.

### 1. Build the Docker Image
```bash
docker build -t rfieq/portwindows:latest .
```

### 2. Run the Container

#### Option A: Using OpenRouter (Cloud LLM)
```bash
docker run -d -p 3000:3000 \
  --name portwindows \
  -e LLM_PROVIDER=openrouter \
  -e OPENROUTER_API_KEY=your_openrouter_api_key_here \
  rfieq/portwindows:latest
```

#### Option B: Using Ollama (Local LLM)
```bash
docker run -d -p 3000:3000 \
  --name portwindows \
  -e LLM_PROVIDER=ollama \
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
  -e OLLAMA_MODEL=gemma2 \
  rfieq/portwindows:latest
```

### 3. Push to Docker Hub
```bash
docker push rfieq/portwindows:latest
```

---

## ⚙️ Customization (Editing Portfolio Details)

All information presented inside the portfolio is completely separated from the UI logic. To swap in your own biography, skills, projects, and social handles, open **[src/lib/data.ts](file:///c:/laragon/www/webapp/portwindows/src/lib/data.ts)** and edit the following structures:

- **`PROFILE`**: Name, subtitle, location, email, and description biography.
- **`PROJECTS`**: Array containing your title, detailed descriptions, skill tags, repository URLs, and live links.
- **`SKILLS`**: Grouped categories (e.g., Frontend Core, Styling, Tooling) and tags.
- **`DESKTOP_ICONS`**: Desktop icon layout arrangement (ordering text files, folders, CLI shortcuts, or external URLs).
