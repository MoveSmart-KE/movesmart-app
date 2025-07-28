# MoveSmart AI: Predictive Traffic Route Optimizer 🚗💨🧠

Welcome to the MoveSmart AI project! This is a full-stack web application that uses a pre-trained, chained XGBoost model to predict traffic and find the truly fastest, AI-optimized route between two points.

This isn't just a map that shows you the path; it's an intelligent system that analyzes multiple route alternatives and, using our bespoke traffic prediction model, recommends the one that will actually save you the most time.

## 🏛️ Project Architecture

This repository contains a **monorepo** with two distinct parts:

*   **`/backend`**: A lean Python/Flask application that serves our pre-trained machine learning model as a REST API.
*   **`/frontend`**: A modern React/TypeScript application (built with Vite) that provides the user interface, calls the Mapbox API for route geometry, and communicates with our backend to get AI-powered predictions.

## ✨ Tech Stack

| Area      | Technology                               |
| :-------- | :--------------------------------------- |
| **Backend** | Python, Flask, XGBoost, Pandas, Scikit-learn |
| **Frontend**  | React, TypeScript, Vite, Mapbox GL JS, Axios |

## 🚀 Getting Started: A Foolproof Guide

Follow these steps precisely to get the application up and running on your local machine.

### Prerequisites

Make sure you have the following software installed on your system:

*   **Git:** For cloning the repository.
*   **Python:** Version 3.8 or higher.
*   **Node.js:** Version 18.x or higher.
*   **npm:** (Usually comes with Node.js).

### Step 1: Clone the Repository

First, clone this repository to your local machine.

```bash
git clone <your-repository-url>
cd movesmart-prediction-model
```

### Step 2: Configure the Backend (Python)

Our Python server needs its own isolated environment and dependencies.

1.  **Navigate to the Backend Directory:**
    ```bash
    cd backend
    ```

2.  **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    ```

3.  **Activate the Virtual Environment:**
    *   On **macOS / Linux**:
        ```bash
        source venv/bin/activate
        ```
    *   On **Windows**:
        ```bash
        .\venv\Scripts\activate
        ```
    You'll know it's working if you see `(venv)` at the beginning of your terminal prompt.

4.  **Install Python Dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

### Step 3: Configure the Frontend (React)

The frontend has its own set of dependencies and requires a secret API key.

1.  **Navigate to the Frontend Directory:** (From the project root)
    ```bash
    cd frontend
    ```

2.  **Create the Environment File (CRITICAL STEP):**
    The application needs a Mapbox API key to function. You must create a file named `.env` inside the `/frontend` directory.

    > **⚠️ IMPORTANT:** This file contains your secret key. Our `.gitignore` is configured to **never** commit this file to GitHub.

    Create the file and add your key like this:

    **File: `frontend/.env`**
    ```
    VITE_MAPBOX_ACCESS_TOKEN='YOUR_MAPBOX_TOKEN_HERE'
    ```
    Replace `YOUR_MAPBOX_TOKEN_HERE` with your actual, valid access token from your [Mapbox account](https://www.mapbox.com/).

3.  **Install Node Dependencies:**
    ```bash
    npm install
    ```

### Step 4: Run the Application!

To run the full application, you need **two separate terminals** running at the same time.

**In your FIRST terminal, run the Backend API:**

1.  Navigate to the `backend` directory.
2.  Make sure your virtual environment is activated.
3.  Start the Flask server.

    ```bash
    cd backend
    source venv/bin/activate  # Or .\venv\Scripts\activate on Windows
    python app.py
    ```
    You should see messages indicating that the models are being loaded and the server is running on port 5001.

**In your SECOND terminal, run the Frontend App:**

1.  Navigate to the `frontend` directory.
2.  Start the Vite development server.

    ```bash
    cd frontend
    npm run dev
    ```
    You should see a message telling you which URL to open in your browser, usually `http://localhost:5173/`.

**You're live!** Open the URL in your browser, and you will see the MoveSmart AI Route Optimizer, ready for action.
