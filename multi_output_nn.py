import pandas as pd
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from sklearn.preprocessing import StandardScaler
import torch
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
import non_dl as ndl

class MultiOutputNN(nn.Module):
    '''
    MultiOutputNN is a fully connected neural network which consists of 2 hidden layers with 64 and 32 neurons, respectively.
    Each layer is batch normalized and the hidden layers use a ReLU activation function. The model is adept and being able to predict
    multiple outputs.
    '''
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
    '''
    Generates predictions from a pretrained model on a test set and prints out the relevant metrics

    Inputs:
        - model (MultiOutputNN) - A pretrained multi-output neural network model.
        - X_test_tensor (torch.Tensor) - A tensor for the test input set
        - y_test_tensor (torch.Tensor) - A tensor for the true outputs of the test set

    Returns:
        predicted (np.Array) - The predicted values from the model
    '''
    with torch.no_grad():
        # convert the actual values to a numpy array
        actual = y_test_tensor.numpy()

        # get the predictions from the model and convert to a numpy array
        y_preds = model(X_test_tensor)
        predicted = y_preds.detach().numpy()
        
        # print the MSE
        mse = mean_squared_error(actual, predicted)
        print(f"Mean Squared Error: {mse}")

        # print the MAE
        mae = mean_absolute_error(actual, predicted)
        print(f"Mean Absolute Error: {mae}")    

        # print the R2 score
        r2 = r2_score(actual, predicted)
        print(f"R² Score: {r2}")

        return predicted

def train_dl_model(model, train_loader, verbose=0):
    '''
    This model trains a MultiOutputNN over 100 epochs

    Inputs:
        - model (MultiOutputNN) - The model to train
        - train_loader (torch.DataLoader) - The training data loader
        - verbose (int) - A flag for whether or not to print training information
    
    Returns:
        - model (MultiOutputNN) - The trained model
    '''
    # set the loss function, optimizer and number of epochs to train
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    epochs = 100

    # begin the training loop
    for epoch in range(epochs):
        # start model training
        model.train()
        running_loss = 0.0

        # batch train for every batch in the loader
        for X_batch, y_batch in train_loader:
            optimizer.zero_grad()
            predictions = model(X_batch)
            loss = criterion(predictions, y_batch)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()

        # print the loss information if specified
        if verbose == 1:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {running_loss / len(train_loader):.4f}")
    
    return model

def get_tensors(X_train, y_train, X_test=None, y_test=None):
    '''
    Convert training and test sets to torch Tensors

    Inputs:
        - X_train (pd.Dataframe) - The training inputs
        - y_train (pd.Dataframe) - The training outputs
        - X_test (pd.Dataframe) - Optional inputs dataframe to include if not training on the full data
        - y_test (pd.Dataframe) - Optional outputs dataframe to include if not training on the full data 
    
    Returns:
        - X_test_tensor (torch.tensor) - the tensor for training inputs
        - y_train_tensor (torch.tensor) - the tensor for training outputs
        - X_test_tensor (torch.tensor) -  the optional tensor for inputs if not training on the full data
        - y_test_tensor (torch.tensor) - the optional tensor for outputs if not training on the full data 
    '''
    # convert the training data to tensors
    X_train_tensor = torch.tensor(X_train, dtype=torch.float32)
    y_train_tensor = torch.tensor(y_train.to_numpy(), dtype=torch.float32)

    # convert the test sets to tensors if they exist
    if X_test is not None and y_test is not None:
        X_test_tensor = torch.tensor(X_test, dtype=torch.float32)
        y_test_tensor = torch.tensor(y_test.to_numpy(), dtype=torch.float32)

        return X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor
    
    return X_train_tensor, y_train_tensor, None, None

def get_tensor_datasets(X_train_tensor, y_train_tensor, X_test_tensor=None, y_test_tensor=None):
    '''
    Convert training and test set tensors to torch TensorDatasets

    Inputs:
        - X_test_tensor (torch.tensor) - the tensor for training inputs
        - y_train_tensor (torch.tensor) - the tensor for training outputs
        - X_test_tensor (torch.tensor) -  the optional tensor for inputs if not training on the full data
        - y_test_tensor (torch.tensor) - the optional tensor for outputs if not training on the full data 
    
    Returns:
        - train_dataset (torch.TensorDatasets) - the dataset for training data
        - test_dataset (torch.TensorDatasets) - the optional dataset if not training on the full data
    '''
    # convert the training data tensors to a dataset
    train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
    
    # convert the test data tensors to a dataset if they exist
    if X_test_tensor is not None and y_test_tensor is not None:
        test_dataset = TensorDataset(X_test_tensor, y_test_tensor)
        return train_dataset, test_dataset
    
    return train_dataset, None

def get_data_loaders(train_dataset, test_dataset=None):
    '''
    Convert training and test TensorDatasets tensors to torch DataLoaders

    Inputs:
        - train_dataset (torch.TensorDatasets) - the dataset for training data
        - test_dataset (torch.TensorDatasets) - the optional dataset if not training on the full data
    
    Returns:
        - train_loader (torch.DataLoader) - the DataLoader for training data
        - test_loader (torch.DataLoader) - the optional DataLoader if not training on the full data
    '''
    # convert the training dataset to a dataloader
    train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)

    # convert the test dataset to a dataloader if it exists
    if test_dataset is not None:
        test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
        return train_loader, test_loader
    
    return train_loader, None

def setup_dl_model(X_train_tensor):
    '''
    Creates a MultiOutputNN for a give training tensor

    Inputs:
        - X_train_tensor (torch.tensor) - the tensor for training inputs

    Returns:
        - model (MultiOutputNN) - The untrained MultiOutputNN model
    '''
    model = MultiOutputNN(input_size=X_train_tensor.shape[1])
    return model

def ensemble_dl_models(models, train_loader, verbose=0):
    '''
    This function takes in a list of untrained MultiOutputNN, trains them and returns the trained models

    Inputs:
        - models (list) - A list of untrained MultiOutputNN models
        - train_loader (torch.DataLoader) - the data loader for the training set
        - verbose (int) - A flag for whether or not to print training information
    
    Returns:
        - trained_models (list) - A list of trained MultiOutputNN models
    '''
    # create the output list
    trained_models = []
    
    # train each model in the list and add it to the output list
    for model in models:
        trained_model = train_dl_model(model, train_loader, verbose=verbose)
        trained_models.append(trained_model)
    
    return trained_models

def print_metrics(df_actual, df_predicted):
    '''
    This function prints useful metrics for each of the predicted values (i.e. number of animals, latitude and longitude) individually

    Inputs:
        - df_actual (pd.Dataframe) - the dataframe of true values 
        - df_predicted (pd.Dataframe) - the dataframe of predicted values
    '''

    # print the MSE for the predicted number of animals 
    mse = mean_squared_error(df_actual.iloc[:, 0], df_predicted.iloc[:, 0])
    print(f"Mean Squared Error NUMBER: {mse}")

    # print the MAE for the predicted number of animals 
    mae = mean_absolute_error(df_actual.iloc[:, 0], df_predicted.iloc[:, 0])
    print(f"Mean Absolute Error NUMBER: {mae}")    

    # print the R2 for the predicted number of animals 
    r2 = r2_score(df_actual.iloc[:, 0], df_predicted.iloc[:, 0])
    print(f"R² Score NUMBER: {r2}")

    # print the MSE for the predicted latitude
    mse = mean_squared_error(df_actual.iloc[:, 1], df_predicted.iloc[:, 1])
    print(f"Mean Squared Error LATITUDE: {mse}")

    # print the MAE for the predicted latitude
    mae = mean_absolute_error(df_actual.iloc[:, 1], df_predicted.iloc[:, 1])
    print(f"Mean Absolute Error LATITUDE: {mae}")    

    # print the R2 for the predicted latitude
    r2 = r2_score(df_actual.iloc[:, 1], df_predicted[1])
    print(f"R² Score LATITUDE: {r2}")

    # print the MSE for the predicted longtitude
    mse = mean_squared_error(df_actual.iloc[:, 2], df_predicted.iloc[:, 2])
    print(f"Mean Squared Error LONGITUDE: {mse}")

    # print the MAE for the predicted longtitude
    mae = mean_absolute_error(df_actual.iloc[:, 2], df_predicted.iloc[:, 2])
    print(f"Mean Absolute Error LONGITUDE: {mae}")    

    # print the R2 for the predicted longtitude
    r2 = r2_score(df_actual.iloc[:, 2], df_predicted.iloc[:, 2])
    print(f"R² Score LONGITUDE: {r2}")

def get_ensemble_dl_preds(trained_models, X_test_tensor, y_test_tensor):
    '''
    This function ensembles predictions of a list of trained MultiOutputNN models by averaging the values of their predictions

    Inputs:
        - trained_models (list): A list of trained MultiOutputNN models
        - X_test_tensor (torch.tensor): A tensor for the test inputs
        - y_test_tensor (torch.tensor): A tensor for the actual output values
    
    Returns:
        - df_predicted (pd.Dataframe): A dataframe of the predicted values
    '''
    # A list that will hold the prediction values for each model
    predictions = []

    # generate predictions for each model on the test set and add it to the predictions list
    for model in trained_models:
        model.eval()
        with torch.no_grad():
            y_preds = model(X_test_tensor)
            predictions.append(y_preds.detach().numpy())

    # Average predictions
    predicted = sum(predictions) / len(predictions)

    # create a dataframe for the true values
    actual = y_test_tensor.numpy()
    df_actual = pd.DataFrame(actual)

    # create a dataframe for the predicted values
    df_predicted = pd.DataFrame(predicted)

    # print the metrics for the ensembled model
    print_metrics(df_actual, df_predicted)

    return df_predicted

def main():
    print('Reading in dataframe')
    df = pd.read_excel('./data/GNP_Aerial_counting_1969_2022.xlsx') # read in the dataframe
    print('Successfuly loaded dataframe')

    print('Cleaning dataframe')
    cleaned_df = ndl.clean_df(df) #pre-process the data
    print('Cleaning complete')

    # fill Nan values with the mean of that column
    train_df = cleaned_df.fillna(cleaned_df.mean())
    
    # create the training and test dataframes
    test_df = train_df[train_df['COUNT'] == 2022]
    train_df = train_df[train_df['COUNT'] != 2022]

    # Split into inputs and outputs for the training and test set
    X_train = train_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_train = train_df[['NUMBER', 'LATITUDE', 'LONGITUDE']]

    X_test = test_df.drop(columns=['ID', 'LATITUDE', 'LONGITUDE', 'NUMBER'])
    y_test = test_df[['NUMBER', 'LATITUDE', 'LONGITUDE']]

    # scale the inputs for the training and test set
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)

    # create the tensors
    X_train_tensor, y_train_tensor, X_test_tensor, y_test_tensor = get_tensors(X_train, y_train, X_test, y_test)

    # create the datasets
    train_dataset, _ = get_tensor_datasets(X_train_tensor, y_train_tensor)

    # create the data loaders
    train_loader, _ = get_data_loaders(train_dataset)

    # create the untrained models
    dl_models = [setup_dl_model(X_train_tensor) for _ in range(3)]

    # train the models
    trained_dl_models = ensemble_dl_models(dl_models, train_loader, verbose=1)

    # print the metrics for the ensembled models
    get_ensemble_dl_preds(trained_dl_models, X_test_tensor, y_test_tensor)

if __name__ == '__main__':
    main()