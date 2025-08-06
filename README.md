# 🌐 Weather Data Visualization

An interactive React + TypeScript dashboard to draw polygons on a map and visualize weather data over a custom time range.

---

## 🛠️ Tech Stack

- **React + Vite + TypeScript** – Frontend framework & tooling
- **Tailwind CSS** – Utility-first CSS framework
- **shadcn/ui** – Reusable headless UI components
- **Zustand** – Lightweight global state manager
- **React Query** – Server state + caching
- **Leaflet** – Map and polygon drawing
- **React Leaflet** – React bindings for Leaflet
- **Vercel** – Deployment
- **GitHub** – Version control and repo management

---

## Getting Started

To run the project locally:

```bash
# Step 1: Clone the repository
git clone https://github.com/your-username/geo-visualization-dashboard.git

# Step 2: Navigate to the project folder
cd geo-visualization-dashboard

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Deployment

### GitHub

To push the project to GitHub:

```bash
# Initialize git (if not already a repo)
git init

# Add the remote repository
git remote add origin https://github.com/your-username/geo-visualization-dashboard.git

# Commit and push
git add .
git commit -m "Initial commit"
git push -u origin main
```

### Vercel

To deploy the project using Vercel:

1. Go to https://vercel.com and log in with your GitHub account.
2. Click on **"Add New Project"** and import your GitHub repo.
3. Select the following configuration:
   - **Framework Preset:** Vite  
   - **Build Command:** `npm run build`  
   - **Output Directory:** `dist`
4. Click **Deploy**.

Your app will be live at:  
`https://your-project-name.vercel.app`

## Notes

- Uses **Leaflet** for interactive polygon drawing and weather data visualization.
- Timeline-based data filtering is supported through a custom **slider component**.
