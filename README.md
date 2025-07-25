# Predictive Traffic Analysis Engine 🚗💨

Welcome to the lab! This project is a comprehensive, end-to-end machine learning pipeline designed to predict traffic congestion and vehicle speed based on a variety of temporal and spatial features. What started as a simple model evolved into a sophisticated, two-stage predictive engine. Mwahaha!

## ✨ Features

- **📈 Synthetic Data Generation:** Includes a script to generate realistic, time-series traffic data, complete with simulated rush hours.
- **🛠️ Advanced Feature Engineering:** We didn't just use the raw data! We brewed a powerful concoction of features, including:
  - **Cyclical Time Features:** `hour_sin` and `hour_cos` to represent the time of day smoothly.
  - **Interaction Features:** Combining location and time (`lat_x_hour_sin`) to capture complex relationships.
  - **Lag Features:** Giving the model a "memory" of the traffic conditions from 10 minutes prior.
- **🚀 Chained Modeling Pipeline:** Our crowning achievement! This is a two-stage prediction process:
  1.  First, a highly-tuned XGBoost model predicts the **congestion level**.
  2.  Then, that prediction is used as a **powerful new feature** for a second XGBoost model that predicts the **vehicle speed**.
- **📦 Automated Model Saving & Versioning:** The training script automatically saves the best-performing models, their feature lists, performance metrics, and hyperparameters, with clear prefixes to keep our experiments organized.
- **🌐 Portability:** Comes with a minimal `requirements.txt` and a `.gitignore` file, making the project clean, lean, and ready for deployment anywhere.

## 💻 Tech Stack

- **Python 3**
- **Pandas** for data manipulation
- **Scikit-learn** for preprocessing and model evaluation
- **XGBoost** as our champion modeling library
- **Joblib** for saving and loading our magnificent creations

## 🚀 Getting Started

Follow these steps to unleash the power of this project on your own machine.

### 1. Prerequisites

- Python 3.8 or higher
- `venv` for virtual environments

### 2. Installation & Setup

Clone the repository and set up the virtual environment:

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows, use: .\venv\Scripts\activate

# 2. Install the required libraries from our magical scroll
pip install -r requirements.txt
```

### 3. Training the Models

Run the main analysis script. This will generate fresh data, perform all the feature engineering, and train both stages of our chained XGBoost pipeline.

```bash
python traffic_analysis.py
```
This will populate the `saved_models/` directory with our champion models and their artifacts.

### 4. Making Predictions

Once the models are trained, you can use the `predict.py` script to see them in action on new data.

```bash
python predict.py
```

This will output a prediction for a sample rush-hour scenario and a non-rush-hour scenario, demonstrating the model's intelligence.

## 📊 Final Model Performance

Our final, chained XGBoost champion achieved the following performance on the test set:

| Task | R-squared | RMSE | MAE |
| :--- | :--- | :--- | :--- |
| **Congestion** | 0.44 | 0.21 | 0.16 |
| **Speed** | 0.51 | 16.95 km/h | 11.95 km/h |

This shows a strong ability to explain the variance in the data and make predictions with a reasonably low error.

## 🎨 Future Ideas for More SCIENCE!

- **Real-World Data:** The ultimate test would be to unleash this pipeline on a real-world traffic dataset.
- **Even More Features:** Experiment with weather data, holidays, or road event information.
- **Alternative Models:** Test other champions like CatBoost or even deep learning models like LSTMs for the time-series component.

---

It's been a pleasure building this. Now go forth and predict!
