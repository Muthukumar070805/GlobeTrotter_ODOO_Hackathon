<div align="center">

  <h1>🌍 GlobeTrotter</h1>
  <p><strong>AI-Powered Personalized Travel Planning</strong></p>
---

## 🌟 Overview

**GlobeTrotter** is an intelligent travel planning companion designed to take the stress out of vacation planning. Leveraging **Google's Gemini AI**, it provides personalized city recommendations, detailed activity suggestions, and comprehensive budget breakdowns tailored to your preferences.

Built for the **ODOO Hackathon**, this application combines a sleek, modern UI with powerful AI capabilities to help travelers explore, plan, and manage their trips effortlessly.

## ✨ Key Features

- 🤖 **AI-Driven Explorations**: Discover new destinations with real-time suggestions from Google Gemini AI based on your interests and budget.
- 📅 **Smart Trip Management**: Create, edit, and organize multiple trips with a centralized dashboard.
- 📊 **Budget Visualizations**: Get detailed cost estimations and breakdowns using interactive charts (Recharts).
- 🗓️ **Interactive Timeline**: Visualize your journey with a dedicated trip calendar and timeline.
- 👤 **User Profiles & Auth**: Secure login/signup system with personalized profile management.
- 🛡️ **Admin Dashboard**: Comprehensive management tools for platform administrators.
- 🎨 **Modern UI/UX**: A responsive, premium interface built with Tailwind CSS and React.

## 🚀 Tech Stack

- **Frontend**: [React 19](https://react.dev/), [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI Engine**: [Google Gemini AI API (@google/genai)](https://aistudio.google.com/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **State Management**: Built-in React Hooks & MockDB Service

## 🛠️ Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [NPM](https://www.npmjs.com/)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Muthukumar070805/GlobeTrotter_ODOO_Hackathon.git
   cd GlobeTrotter_ODOO_Hackathon
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).*

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### Deploy with Vercel

The easiest way to deploy GlobeTrotter is using [Vercel](https://vercel.com/):

1. Push your code to GitHub.
2. Import the project into Vercel.
3. Add the `VITE_GEMINI_API_KEY` as an **Environment Variable** in the Vercel project settings.
4. Deploy!

## 📦 Production Build

To create an optimized production build:

```bash
npm run build
```

The output will be available in the `dist/` directory. You can preview it locally using:

```bash
npm run preview
```

## 📄 License

This project is developed for the ODOO Hackathon.

---

<div align="center">
  Made with ❤️ for travelers everywhere.
</div>
