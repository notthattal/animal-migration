import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
import random
import torch
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
from non_dl import clean_df, train_gb_model

def get_future_predictions(df, models, last_year=2022):
    past_year = df[df['COUNT'] == last_year].copy()

    past_year['timestamp'] = pd.to_datetime(past_year['TIME'], unit='s').dt.strftime('%H:%M:%S')

    past_year['timestamp'] = pd.to_datetime(
        past_year['COUNT'].astype(int).astype(str) + '-' + 
        past_year['MONTH'].astype(int).astype(str).str.zfill(2) + '-' +
        past_year['DATE'].astype(float).astype(int).astype(str).str.zfill(2) + ' ' +
        past_year['timestamp']
    )

    species_columns = [col for col in df.columns if col.startswith('SPECIES_')]
    past_year['species'] = past_year[species_columns].idxmax(axis=1).str.replace('SPECIES_', '')
    
    future_rows = past_year.copy()
    future_rows['COUNT'] = last_year + 1

    last_id = past_year['ID'].max()
    future_rows['ID'] = (future_rows.index - future_rows.index[0]) + 1 + last_id

    grouped = future_rows.groupby('species')

    out_df = future_rows.copy()
    out_df = out_df.drop(columns=['timestamp', 'species'])
    
    for _, group in grouped:
        last_lat, last_long, last_count = 0, 0, 0
        last_lat_2, last_long_2, last_count_2 = 0, 0, 0

        if len(group) >= 1:
            last_lat = group.iloc[-1]['LATITUDE']
            last_long = group.iloc[-1]['LONGITUDE']
            last_count = group.iloc[-1]['NUMBER']

            if len(group) >= 2:
                last_lat_2 = group.iloc[-2]['LATITUDE']
                last_long_2 = group.iloc[-2]['LONGITUDE']
                last_count_2 = group.iloc[-2]['NUMBER']
        
        i = 0
        for row_idx, row in group.iterrows():
            if i == 0:
                row['lat_lag1'] = last_lat
                row['lon_lag1'] = last_long
                row['count_lag1'] = last_count
                row['lat_lag2'] = last_lat_2
                row['lon_lag2'] = last_long_2
                row['count_lag2'] = last_count_2
            else:
                row['lat_lag1'] = future_rows.loc[row_idx-1, 'LATITUDE']
                row['lon_lag1'] = future_rows.loc[row_idx-1, 'LONGITUDE']
                row['count_lag1'] = future_rows.loc[row_idx-1, 'NUMBER']
                row['lat_lag2'] = future_rows.loc[row_idx-1, 'lat_lag1']
                row['lon_lag2'] = future_rows.loc[row_idx-1, 'lon_lag1']
                row['count_lag2'] = future_rows.loc[row_idx-1, 'count_lag1']
            
            row['LATITUDE'] = np.nan
            row['LONGITUDE'] = np.nan
            row['NUMBER'] = np.nan

            curr_row_df = row.to_frame().T 
            curr_row = curr_row_df.drop(columns=['ID', 'timestamp', 'species', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
            
            num_row_scaled = models['num_model'][1].transform(curr_row)
            num_pred = models['num_model'][0].predict(num_row_scaled)

            lat_row_scaled = models['lat_model'][1].transform(curr_row)
            lat_pred = models['lat_model'][0].predict(lat_row_scaled)

            long_row_scaled = models['long_model'][1].transform(curr_row)
            long_pred = models['long_model'][0].predict(long_row_scaled)
            
            row['NUMBER'] = np.round(num_pred[0])
            row['LATITUDE'] = lat_pred[0]
            row['LONGITUDE'] = long_pred[0]

            row = row.drop(labels=['timestamp', 'species'])
            out_df.loc[row_idx] = row

    combined_df = pd.concat([df, out_df], ignore_index=True)
    return combined_df

def get_predictions_for_mult_yrs(df, models, num_years_to_pred=1, last_year=2022):
    out_df = df.copy()
    next_year = last_year
    for i in range(num_years_to_pred):
        out_df = get_future_predictions(out_df, models, next_year)
        next_year += 1
    
    return out_df

def main():
    print('Reading in dataframe')
    df = pd.read_excel('./data/GNP_Aerial_counting_1969_2022.xlsx')
    print('Successfuly loaded dataframe')

    print('Cleaning dataframe')
    cleaned_df = clean_df(df)
    print('Cleaning complete')

    train_df = cleaned_df.fillna(cleaned_df.mean())

    X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)

    print('Starting non-dl model training')

    print('Training number model')
    num_model = train_gb_model(X_train, y_train=train_df['NUMBER'])
    print('Number model training complete')

    print('Training latitude model')
    lat_model = train_gb_model(X_train, y_train=train_df['LATITUDE'])
    print('Latitude model training complete')

    print('Training longitude model')
    long_model = train_gb_model(X_train, y_train=train_df['LONGITUDE'])
    print('Longitude model training complete')

    trained_models = {
        'num_model': [num_model, scaler],
        'lat_model': [lat_model, scaler],
        'long_model': [long_model, scaler]
    }

    print('Successfully trained non-dl model')

    last_year = 2022
    num_years = 1
    if num_years == 1:
        print(f'Producing predictions for: {last_year + 1}')
    else:
        print(f'Producing predictions for years: {last_year + 1} to {last_year + num_years}')

    predicted_df = get_predictions_for_mult_yrs(train_df, trained_models, num_years_to_pred=num_years, last_year=last_year)
    print('Completed generating predictions')

    predictions_from_2023 = predicted_df[predicted_df['COUNT'] >= 2023]
    output_df = pd.concat([cleaned_df, predictions_from_2023], ignore_index=True)

    print('Outputting to CSV')
    output_df.to_csv('animal_migration.csv')
    print('Completed outputting to CSV')

if __name__ == '__main__':
    main()