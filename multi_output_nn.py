import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler
import torch
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
import non_dl as ndl

class MultiOutputNN(nn.Module):
    def __init__(self, input_size, output_size=3):
        super(MultiOutputNN, self).__init__()
        self.fc1 = nn.Linear(input_size, 64)
        self.bn1 = nn.BatchNorm1d(64)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(64, 32)
        self.bn2 = nn.BatchNorm1d(32) 
        self.output = nn.Linear(32, output_size)

    def forward(self, x):
        x = self.fc1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.fc2(x)
        x = self.bn2(x)
        x = self.relu(x)
        x = self.output(x)
        return x

def get_predictions_dl(model, X_test_tensor, y_test_tensor):
    with torch.no_grad():
        actual = y_test_tensor.numpy()
        y_preds = model(X_test_tensor)
        #y_preds[:, 0] = torch.round(y_preds[:, 0])
        predicted = y_preds.detach().numpy()
        
        mse = mean_squared_error(actual, predicted)
        print(f"Mean Squared Error: {mse}")

        mae = mean_absolute_error(actual, predicted)
        print(f"Mean Absolute Error: {mae}")    

        r2 = r2_score(actual, predicted)
        print(f"R² Score: {r2}")

def train_dl_model(model, train_loader, verbose=0):
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    epochs = 100

    for epoch in range(epochs):
        model.train()
        running_loss = 0.0

        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            predictions = model(X_batch)
            loss = criterion(predictions, y_batch)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        if verbose == 1:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {running_loss / len(train_loader):.4f}")
    
    return model

def get_tensors(X_train, y_train, X_test=None, y_test=None):
    X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_train_tensor = torch.tensor(y_train.to_numpy(), dtype=torch.float32)

    if X_test is not None and y_test is not None:
        X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
        y_test_tensor = torch.tensor(y_test.to_numpy(), dtype=torch.float32)

        return X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor
    
    return X_train_tensor, y_train_tensor, None, None

def get_tensor_datasets(X_train_tensor, y_train_tensor, X_test_tensor=None, y_test_tensor=None):
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    
    if X_test_tensor is not None and y_test_tensor is not None:
        test_dataset = TensorDataset(X_test_tensor, y_test_tensor)
        return train_dataset, test_dataset
    
    return train_dataset, None

def get_data_loaders(train_dataset, test_dataset=None):
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
    if test_dataset is not None:
        test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
        return train_loader, test_loader
    
    return train_loader, None

def setup_dl_model(X_train_tensor):
    model = MultiOutputNN(input_size=X_train_tensor.shape[1])
    return model

def ensemble_dl_models(models, train_loader, verbose=0):
    trained_models = []
    for model in models:
        trained_model = train_dl_model(model, train_loader, verbose=verbose)
        trained_models.append(trained_model)
    
    return trained_models

def print_metrics(df_actual, df_predicted):
    mse = mean_squared_error(df_actual.iloc[:, 0], df_predicted.iloc[:, 0])
    print(f"Mean Squared Error NUMBER: {mse}")

    mae = mean_absolute_error(df_actual.iloc[:, 0], df_predicted.iloc[:, 0])
    print(f"Mean Absolute Error NUMBER: {mae}")    

    r2 = r2_score(df_actual.iloc[:, 0], df_predicted.iloc[:, 0])
    print(f"R² Score NUMBER: {r2}")

    mse = mean_squared_error(df_actual.iloc[:, 1], df_predicted.iloc[:, 1])
    print(f"Mean Squared Error LATITUDE: {mse}")

    mae = mean_absolute_error(df_actual.iloc[:, 1], df_predicted.iloc[:, 1])
    print(f"Mean Absolute Error LATITUDE: {mae}")    

    r2 = r2_score(df_actual.iloc[:, 1], df_predicted[1])
    print(f"R² Score LATITUDE: {r2}")

    mse = mean_squared_error(df_actual.iloc[:, 2], df_predicted.iloc[:, 2])
    print(f"Mean Squared Error LONGITUDE: {mse}")

    mae = mean_absolute_error(df_actual.iloc[:, 2], df_predicted.iloc[:, 2])
    print(f"Mean Absolute Error LONGITUDE: {mae}")    

    r2 = r2_score(df_actual.iloc[:, 2], df_predicted.iloc[:, 2])
    print(f"R² Score LONGITUDE: {r2}")

    return 

def get_ensemble_dl_preds(trained_models, X_test_tensor, y_test_tensor):
    # Predict with all models
    predictions = []

    for model in trained_models:
        model.eval()
        with torch.no_grad():
            y_preds = model(X_test_tensor)
            predictions.append(y_preds.detach().numpy())

    # Average predictions
    predicted = sum(predictions) / len(predictions)

    actual = y_test_tensor.numpy()

    df_actual = pd.DataFrame(actual)
    df_predicted = pd.DataFrame(predicted)
    print_metrics(df_actual, df_predicted)

    return df_predicted

def main():
    print('Reading in dataframe')
    df = pd.read_excel('./data/GNP_Aerial_counting_1969_2022.xlsx')
    print('Successfuly loaded dataframe')

    print('Cleaning dataframe')
    cleaned_df = ndl.clean_df(df)
    print('Cleaning complete')

    train_df = cleaned_df.fillna(cleaned_df.mean())
    test_df = train_df[train_df['COUNT'] == 2022]
    train_df = train_df[train_df['COUNT'] != 2022]

    X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_train = train_df[['NUMBER', 'LATITUDE', 'LONGITUDE']]

    X_test = test_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_test = test_df[['NUMBER', 'LATITUDE', 'LONGITUDE']]

    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor = get_tensors(X_train, y_train, X_test, y_test)
    train_dataset, _ = get_tensor_datasets(X_train_tensor, y_train_tensor)
    train_loader, _ = get_data_loaders(train_dataset)

    dl_models = [setup_dl_model(X_train_tensor) for _ in range(3)]
    trained_dl_models = ensemble_dl_models(dl_models, train_loader, verbose=1)

    get_ensemble_dl_preds(trained_dl_models, X_test_tensor, y_test_tensor)

if __name__ == '__main__':
    main()