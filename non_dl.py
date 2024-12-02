import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor
import random

def process_date(val):
    '''
    Function to properly convert the Date column from a date to day of the month (since a month and year column already exist)

    Inputs:
        - val - The value of that index of the DATE column in the dataframe
    
    Returns:
        - The day of the month as a float
    '''


    if pd.isna(val):
        return np.nan # if is Nan return as an np.Nan
    elif isinstance(val, str):
        return float(val.split('/')[1]) # if it's a string we want to return the middle value corresponding to day
    elif isinstance(val, datetime):
        return val.day # if it's a datetime we want to return the day
    else:
        return float(val) # if it's anything else we return the value as a float
    
def clean_df(df):
    '''
    Pre-process the original dataframe

    Inputs:
        - df (pd.Dataframe) - The original dataframe
    
    Returns:
        - df (pd.Dataframe) - The cleaned dataframe
    '''

    # label encoding for the month column
    month_mapping = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
    }
        
    # empty columns to remove
    empty_cols = ['MALE', 'CALVES']

    # columns that are more than 80% just 0s to remove
    zero_cols = ['LINE2002', 'LINE2012', 'COLLAR', 'CONSERVANC', 'SANCTUARY']

    # remove the notes column as it was found to hurt performance
    drop_cols = ['NOTES']

    df.drop(columns=empty_cols, inplace=True)
    df.drop(columns=zero_cols, inplace=True)
    df.drop(columns=drop_cols, inplace=True)

    # convert the time column to seconds past midnight and replace Nan values with 0 so they don't get filled in with the 
    # mean of the time column later on
    df['TIME'] = df['TIME'].apply(lambda x: x.hour * 3600 + x.minute * 60 + x.second if pd.notna(x) else x)
    df['TIME'] = df['TIME'].fillna(0)

    # convert the TYPE column to binary
    df['TYPE'] = df['TYPE'].map({'Fixed-wing': 0, 'Helicopter': 1})

    # convert the date column as specified in process_date()
    df['DATE'] = df['DATE'].apply(process_date)

    # label encode the month column and ensure it is numeric
    df['MONTH'] = df['MONTH'].map(month_mapping)
    df['MONTH'] = pd.to_numeric(df['MONTH'], errors='coerce')

    # create the lag for 1 timestep and 2 timesteps behind for the latitude, longitude and number (number of animals) columns
    df['lat_lag1'] = df.groupby('SPECIES')['LATITUDE'].shift(1)
    df['lon_lag1'] = df.groupby('SPECIES')['LONGITUDE'].shift(1)
    df['lat_lag2'] = df.groupby('SPECIES')['LATITUDE'].shift(2)
    df['lon_lag2'] = df.groupby('SPECIES')['LONGITUDE'].shift(2)
    df['count_lag1'] = df.groupby('SPECIES')['NUMBER'].shift(1)
    df['count_lag2'] = df.groupby('SPECIES')['NUMBER'].shift(2)

    # convert the species and stratum columns to lowercase to avoid creating duplicate columns when one-hot encoding
    df['SPECIES'] = df['SPECIES'].str.lower()
    df['STRATUM'] = df['STRATUM'].str.lower()

    # one-hot encode the species and stratum columns
    df = pd.get_dummies(df, columns=['SPECIES', 'STRATUM'])

    return df

def run_cv(df, train_drop, pred_col, num_splits=5):
    '''
    Perform cross validation on the GradientBoostingRegressor model

    Inputs:
        - df (pd.Dataframe) - the pre-processed dataframe to get split into training and test set
        - train_drop (list) - A list of columns to drop from the dataframe for training
        - pred_col (str) - The prediction column to use
        - num_splits (int) - The number of splits to use for cross-validation
    '''
    # using 2022 as a true test set so remove it from CV
    tested_years = [2022]

    # start cross-validation
    for _ in range(num_splits):
        # remove a random year from the training set to be used as the validation set
        cv_year = random.choice(df['COUNT'].unique())

        # ensure that year hasn't already been tested
        while cv_year in tested_years:
            cv_year = random.choice(df['COUNT'].unique())
        
        # add the year tested to the list to ensure we are not retraining on the same test set
        tested_years.append(cv_year)

        # split the data into training and test dataframes
        train_df = df[~df['COUNT'].isin([2022, cv_year])]
        test_df = df[df['COUNT'] == cv_year]

        # drop the appropriate columns from the dataframe
        train_df = train_df.drop(columns=train_drop)
        test_df = test_df.drop(columns=train_drop)

        #fillna with mean
        train_df = train_df.fillna(train_df.mean())
        test_df = test_df.fillna(test_df.mean())

        # remove the predictions columns from the inputs and assign it to the outputs
        X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
        y_train = train_df[pred_col]
        X_test = test_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
        y_test = test_df[pred_col]

        # scale the training and test set
        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        # Multi-output regressor with hyperparameters optimized from GridSearchCV
        model = GradientBoostingRegressor(max_depth=3, min_samples_leaf=2, min_samples_split=5, n_estimators=500)

        # train the model
        model.fit(X_train, y_train)

        # Get predictions
        y_pred = model.predict(X_test)

        # print the metrics for this fold
        print(f"year being tested for CV: {cv_year}")
        print_metrics(y_test, pd.DataFrame(y_pred))

def print_metrics(actual, df_predicted):
    '''
    Prints metrics for the output dataframe

    Inputs:
        - actual (pd.Series): The list of actual values for the predicted column
        - df_predicted (pd.Dataframe): The predicted values 
    '''
    # print the MSE for the actual vs predicted values
    mse = mean_squared_error(actual, df_predicted.iloc[:, 0])
    print(f"Mean Squared Error LONGITUDE: {mse}")

    # print the MAE for the actual vs predicted values
    mae = mean_absolute_error(actual, df_predicted.iloc[:, 0])
    print(f"Mean Absolute Error LONGITUDE: {mae}")  
    
    # print the R2 for the actual vs predicted values
    r2 = r2_score(actual, df_predicted.iloc[:, 0])
    print(f"R² Score LONGITUDE: {r2}")


def get_predictions(model, X_test, y_test=None):
    '''
    gets the predictions for the trained model

    Inputs:
        - model (GradientBoostingRegressor) - The trained GradientBoostingRegressor model
        - X_test (pd.Dataframe) - The dataframe to use for getting predictions
        - y_test (pd.Series) - The optional list of actual values if they exist to get metrics from
    
    Returns:
        - y_pred (pd.Dataframe) - The predicted values from the model
    '''
    # generate predictions from the model on the test set
    y_pred = model.predict(X_test)

    # print metrics for comparison against the actual values if they exist
    if y_test is not None:
        print_metrics(y_test, pd.DataFrame(y_pred))
    
    return y_pred

def train_gb_model(X_train, y_train):
    '''
    Trains a GradientBoostingRegressor model

    Inputs:
        - X_train (pd.Dataframe) - The training inputs for the model
        - y_train (pd.Dataframe) - The training outputs for the model
    
    Returns:
        - model (GradientBoostingRegressor) - The trained GradientBoostingRegressor model
    '''
    # create the GradientBoostingRegressor usijng the hyperparameters optimized from GridSearchCV
    model = GradientBoostingRegressor(max_depth=3, min_samples_leaf=2, min_samples_split=5, n_estimators=500)

    # train the model on the training data
    model.fit(X_train, y_train)

    return model

def main():
    print('Reading in dataframe')
    df = pd.read_excel('./data/GNP_Aerial_counting_1969_2022.xlsx') # read in the dataframe
    print('Successfuly loaded dataframe')

    print('Cleaning dataframe')
    cleaned_df = clean_df(df) # pre-process the data
    print('Cleaning complete')

    # fill Nan values with the mean of the data
    train_df = cleaned_df.fillna(cleaned_df.mean()) 

    # create the training and test dataframes
    test_df = train_df[train_df['COUNT'] == 2022]
    train_df = train_df[train_df['COUNT'] != 2022]

    # Split into inputs for the training and test set
    X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    X_test = test_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])

    # scale the input training data
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # split the outputs for the number model
    y_train = train_df['NUMBER']
    y_test = test_df['NUMBER']

    print('-' * 50)

    # train the number model
    print('Start number model training')
    model = train_gb_model(X_train, y_train)

    print('Metrics for number model')
    get_predictions(model, X_test, y_test)
    
    print('-' * 50)
    # split the outputs for the latitude model
    y_train = train_df['LATITUDE']
    y_test = test_df['LATITUDE']

    # train the latitude model
    print('Start latitude model training')
    model = train_gb_model(X_train, y_train)

    print('Metrics for latitude model')
    get_predictions(model, X_test, y_test)

    print('-' * 50)

    # split the outputs for the longitude model
    y_train = train_df['LONGITUDE']
    y_test = test_df['LONGITUDE']

    # train the longitude model
    print('Start longitude model training')
    model = train_gb_model(X_train, y_train)

    print('Metrics for longitude model')
    get_predictions(model, X_test, y_test)

if __name__ == '__main__':
    main()