import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, time
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import random
import torch
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

device_name = "cpu"
if torch.cuda.is_available():
    device_name = "cuda"
elif torch.backends.mps.is_available():
    #device_name = "mps"
    print("For Tal to Test")
print(f"Using Device: {device_name}")
device = torch.device(device_name)

def process_date(val):
    if pd.isna(val):
        return np.nan
    elif isinstance(val, str):
        return float(val.split('/')[1])
    elif isinstance(val, datetime):
        return val.day
    else:
        return float(val)


def preprocess(df):
    empty_cols = ['MALE', 'CALVES'] #columns that are empty
    zero_cols = ['LINE2002', 'LINE2012', 'COLLAR', 'CONSERVANC', 'SANCTUARY'] #columns that are > 80% just 0s
    drop_cols = ['NOTES'] # other columns to drop
    df.drop(columns=empty_cols, inplace=True)
    df.drop(columns=zero_cols, inplace=True)
    df.drop(columns=drop_cols, inplace=True)
    df['TIME'] = df['TIME'].apply(lambda x: x.hour * 3600 + x.minute * 60 + x.second if pd.notna(x) else x)
    df['TIME'] = df['TIME'].fillna(0)
    df['TYPE'] = df['TYPE'].map({'Fixed-wing': 0, 'Helicopter': 1})
    df['DATE'] = df['DATE'].apply(lambda t: t.day if isinstance(t, datetime) else np.nan)
    df['DATE'] = df['DATE'].apply(process_date)

    month_mapping = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
    }

    df['MONTH'] = df['MONTH'].map(month_mapping)
    df['MONTH'] = pd.to_numeric(df['MONTH'], errors='coerce')

    df['lat_lag1'] = df.groupby('SPECIES')['LATITUDE'].shift(1)
    df['lat_lag2'] = df.groupby('SPECIES')['LATITUDE'].shift(2)
    

    df['lon_lag1'] = df.groupby('SPECIES')['LONGITUDE'].shift(1)
    df['lon_lag2'] = df.groupby('SPECIES')['LONGITUDE'].shift(2)
    

    df['number_lag1'] = df.groupby('SPECIES')['NUMBER'].shift(1)
    df['number_lag2'] = df.groupby('SPECIES')['NUMBER'].shift(2)
    
    df['SPECIES'] = df['SPECIES'].str.lower()
    df['STRATUM'] = df['STRATUM'].str.lower()
    df = pd.get_dummies(df, columns=['SPECIES', 'STRATUM'])

    return df

def split(df):
    # Get Train Test Split
    train_df = df[df['COUNT'] != 2022]
    test_df = df[df['COUNT'] == 2022]

    #fillna with mean
    train_df = train_df.fillna(train_df.mean())
    test_df = test_df.fillna(test_df.mean())

    X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_train = train_df[['NUMBER', 'LATITUDE', 'LONGITUDE']]
    X_test = test_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_test = test_df[['NUMBER', 'LATITUDE', 'LONGITUDE']]

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    return X_train, X_test, y_train, y_test

def create_model(X_train, X_test, y_train, y_test):
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Convert to PyTorch tensors
    X_train_tensor = torch.FloatTensor(X_train_scaled)
    y_train_tensor = torch.FloatTensor(y_train.values)
    X_test_tensor = torch.FloatTensor(X_test_scaled)
    y_test_tensor = torch.FloatTensor(y_test.values)

    # Reshape input to be [samples, time steps, features]
    X_train_tensor = X_train_tensor.unsqueeze(1)
    X_test_tensor = X_test_tensor.unsqueeze(1)

    # Create DataLoader
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

    # Define the LSTM Model
    class LSTMModel(nn.Module):
        def __init__(self, input_size, hidden_size, num_layers, output_size):
            super(LSTMModel, self).__init__()
            self.hidden_size = hidden_size
            self.num_layers = num_layers
            self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout= 0.2)
            self.fc = nn.Linear(hidden_size, output_size)

        def forward(self, x):
            h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            out, _ = self.lstm(x, (h0, c0))
            out = self.fc(out[:, -1, :])
            return out

    # Instantiate the model
    input_size = X_train.shape[1]
    hidden_size = 64
    num_layers = 2
    output_size = 3  # Number of target variables

    model = LSTMModel(input_size, hidden_size, num_layers, output_size)

    # Define loss function and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters())

    # Training loop
    num_epochs = 100
    model.to(device)

    for epoch in range(num_epochs):
        model.train()
        for batch_X, batch_y in train_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
        
        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

    # Evaluation
    model.eval()
    with torch.no_grad():
        X_test_tensor = X_test_tensor.to(device)
        predictions = model(X_test_tensor)
        test_loss = criterion(predictions, y_test_tensor.to(device))
        print(f'Test Loss: {test_loss.item():.4f}')

    # Convert predictions back to numpy for further analysis if needed
    predictions = predictions.cpu().numpy()

    with torch.no_grad():
        actual = y_test_tensor.numpy()
        y_preds = model(X_test_tensor)
        #y_preds[:, 0] = torch.round(y_preds[:, 0])
        predicted = y_preds.detach().numpy()
    
    return actual, predicted

def metrics(actual, predicted):
    df_actual = pd.DataFrame(actual)
    df_predicted = pd.DataFrame(predicted)


    mse = mean_squared_error(actual[0], predicted[0])
    print(f"Mean Squared Error NUMBER: {mse}")

    mae = mean_absolute_error(actual[0], predicted[0])
    print(f"Mean Absolute Error NUMBER: {mae}")    

    r2 = r2_score(actual[0], predicted[0])
    print(f"R² Score NUMBER: {r2}")


    mse = mean_squared_error(actual[1], predicted[1])
    print(f"Mean Squared Error LATITUDE: {mse}")

    mae = mean_absolute_error(actual[1], predicted[1])
    print(f"Mean Absolute Error LATITUDE: {mae}")    

    r2 = r2_score(actual[1], predicted[1])
    print(f"R² Score LATITUDE: {r2}")

    mse = mean_squared_error(actual[2], predicted[2])
    print(f"Mean Squared Error LONGITUDE: {mse}")

    mae = mean_absolute_error(actual[2], predicted[2])
    print(f"Mean Absolute Error LONGITUDE: {mae}")    

    r2 = r2_score(actual[2], predicted[2])
    print(f"R² Score LONGITUDE: {r2}")

def final_split(df, values_to_predict):
    # Get Train Test Split
    train_df = df
    

    #fillna with mean
    train_df = train_df.fillna(train_df.mean())
    

    X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_train = train_df[values_to_predict]

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    

    return X_train, y_train, scaler

def final_train(df, values_to_predict):
    X_train_scaled, y_train, scaler = final_split(df, values_to_predict)
    # Define loss function and optimizer
    # Scale the features
    

    # Convert to PyTorch tensors
    X_train_tensor = torch.FloatTensor(X_train_scaled)
    y_train_tensor = torch.FloatTensor(y_train.values)
    

    # Reshape input to be [samples, time steps, features]
    X_train_tensor = X_train_tensor.unsqueeze(1)

    # Create DataLoader
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

    # Define the LSTM Model
    class LSTMModel(nn.Module):
        def __init__(self, input_size, hidden_size, num_layers, output_size):
            super(LSTMModel, self).__init__()
            self.hidden_size = hidden_size
            self.num_layers = num_layers
            self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout= 0.2)
            self.fc = nn.Linear(hidden_size, output_size)

        def forward(self, x):
            h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
            out, _ = self.lstm(x, (h0, c0))
            out = self.fc(out[:, -1, :])
            return out

    # Instantiate the model
    input_size = X_train_scaled.shape[1]
    hidden_size = 64
    num_layers = 2
    output_size = len(values_to_predict)  # Number of target variables

    model = LSTMModel(input_size, hidden_size, num_layers, output_size)

    # Define loss function and optimizer
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters())

    # Training loop
    num_epochs = 100
    model.to(device)

    for epoch in range(num_epochs):
        model.train()
        for batch_X, batch_y in train_loader:
            batch_X, batch_y = batch_X.to(device), batch_y.to(device)
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
        
        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch+1}/{num_epochs}], Loss: {loss.item():.4f}')

    return model, scaler

def final_predict(model, scaler, row):
    row_scaled = scaler.transform(row)
    row_tensor = torch.FloatTensor(row_scaled)
    row_tensor = row_tensor.unsqueeze(1)
    model.eval()
    row_tensor = row_tensor.to(device)
    pred_values = model(row_tensor)
    predicted = pred_values.detach().numpy()

    return predicted




def main():
    df = pd.read_excel('./data/GNP_Aerial_counting_1969_2022.xlsx')
    print("done reading")
    df = preprocess(df)
    print("done preprocessing")
    X_train, X_test, y_train, y_test = split(df)
    print("done splitting")
    actual, predicted = create_model(X_train, X_test, y_train, y_test)
    print("done training")
    metrics(actual, predicted)
    


if __name__ == '__main__':
    main()