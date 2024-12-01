import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
import random

def process_date(val):
    if pd.isna(val):
        return np.nan
    elif isinstance(val, str):
        return float(val.split('/')[1])
    elif isinstance(val, datetime):
        return val.day
    else:
        return float(val)
    
def clean_df(df):
    month_mapping = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
    }
        
    empty_cols = ['MALE', 'CALVES'] #columns that are empty
    zero_cols = ['LINE2002', 'LINE2012', 'COLLAR', 'CONSERVANC', 'SANCTUARY'] #columns that are > 80% just 0s
    drop_cols = ['NOTES'] # other columns to drop
    df.drop(columns=empty_cols, inplace=True)
    df.drop(columns=zero_cols, inplace=True)
    df.drop(columns=drop_cols, inplace=True)

    df['TIME'] = df['TIME'].apply(lambda x: x.hour * 3600 + x.minute * 60 + x.second if pd.notna(x) else x)
    df['TIME'] = df['TIME'].fillna(0)
    df['TYPE'] = df['TYPE'].map({'Fixed-wing': 0, 'Helicopter': 1})

    df['DATE'] = df['DATE'].apply(process_date)

    df['MONTH'] = df['MONTH'].map(month_mapping)
    df['MONTH'] = pd.to_numeric(df['MONTH'], errors='coerce')

    df['lat_lag1'] = df.groupby('SPECIES')['LATITUDE'].shift(1)
    df['lon_lag1'] = df.groupby('SPECIES')['LONGITUDE'].shift(1)
    df['lat_lag2'] = df.groupby('SPECIES')['LATITUDE'].shift(2)
    df['lon_lag2'] = df.groupby('SPECIES')['LONGITUDE'].shift(2)
    df['count_lag1'] = df.groupby('SPECIES')['NUMBER'].shift(1)
    df['count_lag2'] = df.groupby('SPECIES')['NUMBER'].shift(2)

    df['SPECIES'] = df['SPECIES'].str.lower()
    df['STRATUM'] = df['STRATUM'].str.lower()
    df = pd.get_dummies(df, columns=['SPECIES', 'STRATUM'])

    return df

def run_cv(df, train_drop, pred_col, num_splits=5):
    tested_years = [2022]
    for _ in range(num_splits):
        cv_year = random.choice(df['COUNT'].unique())
        while cv_year in tested_years:
            cv_year = random.choice(df['COUNT'].unique())
        
        tested_years.append(cv_year)

        train_df = df[~df['COUNT'].isin([2022, cv_year])]
        test_df = df[df['COUNT'] == cv_year]

        train_df = train_df.drop(columns=train_drop)
        test_df = test_df.drop(columns=train_drop)

        #fillna with mean
        train_df = train_df.fillna(train_df.mean())
        test_df = test_df.fillna(test_df.mean())

        X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
        y_train = train_df[pred_col]
        X_test = test_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
        y_test = test_df[pred_col]

        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        # Multi-output regressor
        model = GradientBoostingRegressor(max_depth=3, min_samples_leaf=2, min_samples_split=5, n_estimators=500)
        model.fit(X_train, y_train)

        # Predictions
        y_pred = model.predict(X_test)

        print(f"year being tested for CV: {cv_year}")
        print_metrics(y_test, pd.DataFrame(y_pred))

def print_metrics(actual, df_predicted):
    mse = mean_squared_error(actual, df_predicted.iloc[:, 0])
    print(f"Mean Squared Error LONGITUDE: {mse}")

    mae = mean_absolute_error(actual, df_predicted.iloc[:, 0])
    print(f"Mean Absolute Error LONGITUDE: {mae}")  

    r2 = r2_score(actual, df_predicted.iloc[:, 0])
    print(f"R² Score LONGITUDE: {r2}")


def get_predictions(model, X_test, y_test=None):
    y_pred = model.predict(X_test)

    if y_test:
        print_metrics(y_test, pd.DataFrame(y_pred))
    
    return y_pred

def train_gb_model(X_train, y_train):
    model = GradientBoostingRegressor(max_depth=3, min_samples_leaf=2, min_samples_split=5, n_estimators=500)
    model.fit(X_train, y_train)
    return model