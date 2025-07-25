# Model Performance Log

This log tracks the performance of different models for predicting traffic congestion and speed.

| Model | Task | R-squared | MSE | MAE | RMSE | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| XGBoost | Congestion | -0.01 | 0.07 | - | - | Baseline on new data |
| LightGBM | Congestion | 0.37 | 0.05 | - | - | Baseline on new data |
| XGBoost | Speed | 0.18 | 405.57 | - | - | Baseline on new data |
| LightGBM | Speed | 0.43 | 309.45 | - | - | Baseline on new data |
| LightGBM | Congestion | 0.10 | 0.07 | 0.21 | 0.27 | Baseline |
| LightGBM | Speed | 0.24 | 442.50 | 16.17 | 21.04 | Baseline |
| Tuned LightGBM | Congestion | 0.16 | 0.06 | 0.19 | 0.24 | Tuned with RandomizedSearch |
| Tuned LightGBM | Speed | 0.22 | 373.19 | 13.95 | 19.32 | Tuned with RandomizedSearch |
| Tuned LightGBM | Congestion | 0.35 | 0.05 | 0.18 | 0.23 | Tuned with RandomizedSearch |
| Tuned LightGBM | Speed | 0.34 | 335.74 | 13.52 | 18.32 | Tuned with RandomizedSearch |
| Tuned LightGBM | Congestion | 0.22 | 0.06 | 0.18 | 0.24 | Tuned with RandomizedSearch |
| Tuned LightGBM | Congestion | 0.28 | 0.06 | 0.19 | 0.25 | Tuned with RandomizedSearch |
| Tuned LightGBM | Speed | 0.35 | 368.58 | 13.92 | 19.20 | Tuned with RandomizedSearch |
| Tuned XGB | Congestion | 0.34 | 0.06 | 0.18 | 0.24 | Tuned with RandomizedSearch |
| Tuned XGB | Speed | 0.42 | 302.00 | 13.11 | 17.38 | Tuned with RandomizedSearch |
| Tuned XGB | Congestion | 0.28 | 0.05 | 0.16 | 0.21 | Tuned with RandomizedSearch |
| Tuned XGB | Speed | 0.38 | 274.97 | 12.16 | 16.58 | Tuned with RandomizedSearch |
| Tuned XGB | Congestion | 0.28 | 0.05 | 0.17 | 0.21 | Tuned with RandomizedSearch |
| Tuned XGB | Speed | 0.39 | 275.72 | 12.78 | 16.60 | Tuned with RandomizedSearch |
| Tuned XGB | Congestion | 0.43 | 0.05 | 0.17 | 0.22 | Tuned with RandomizedSearch |
| Tuned XGB | Speed | 0.47 | 325.10 | 13.49 | 18.03 | Tuned with RandomizedSearch |
| Tuned XGB (congestion) | Congestion | 0.27 | 0.06 | 0.18 | 0.24 | Chained model with lag/interaction features |
| Tuned XGB (speed) | Speed | 0.35 | 341.20 | 12.95 | 18.47 | Chained model with lag/interaction features |
| Tuned XGB (congestion) | Congestion | 0.44 | 0.04 | 0.16 | 0.21 | Chained model with lag/interaction features |
| Tuned XGB (speed) | Speed | 0.51 | 287.24 | 11.95 | 16.95 | Chained model with lag/interaction features |
