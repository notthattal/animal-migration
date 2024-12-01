# Mozambique Animal Migration
This project aims to predict the migration of animals in the reserve forests and wildlife sanctuaries of Mozambique, in East Africa.

Done by Vihaan Nama, Tal Erez, Lennox Anderson, and Ahmed Boutar

Data has been collected from 1969 in various time intervals.

We have compared many potential solutions to predict these values including Deep Learning and Non Deep Learning approaches such as a RandomForestRegressor, GradientBoostingRegressor, Long Short Term Memory Neural Networks, and an Ensemble of various fully connected neural networks.

## Instructions on how to Run
### Cloning the Project
- Open the Command Shell or Terminal on your machine and execute the following command
   ```sh
   git clone https://github.com/AIPI520/project-beeg-daytah.git
   ```

### Setting Up a Virtual Environment

### Windows

1. **Open Command Prompt or PowerShell**:
   - Search for `cmd` or `PowerShell` in the start menu and open it.

2. **Navigate to your project directory**:
   cd (move) into your specific project path (where you have saved it on your computer), for example - 
   ```sh
   cd /Animal-Migration
   ```

3. **Create a virtual environment**:
   ```sh
   python -m venv venv
   ```
   This creates a directory named `venv` that contains the virtual environment.

4. **Activate the virtual environment**:
   ```sh
   .\venv\Scripts\activate
   ```
   After activation, your command prompt will show `(venv)` indicating the virtual environment is active.

### Mac

1. **Open Terminal**:
   - You can find Terminal in your Applications > Utilities folder.

2. **Navigate to your project directory**:
   cd (move) into your specific project path (where you have saved it on your computer), for example - 
   ```sh
   cd /Animal-Migration
   ```

3. **Create a virtual environment**:
   ```sh
   python3 -m venv venv
   ```
   This creates a directory named `venv` that contains the virtual environment.

4. **Activate the virtual environment**:
   ```sh
   source venv/bin/activate
   ```
   After activation, your terminal prompt will show `(venv)` indicating the virtual environment is active.

### Installing Dependencies

1. **Ensure your virtual environment is activated**:
   - Verify that `(venv)` is present in your terminal/command prompt.

2. **Install the dependencies from `requirements.txt`**:
   ```sh
   pip install -r requirements.txt
   ```
   This command installs all the packages listed in the `requirements.txt` file into your virtual environment.  

### Deactivating the Virtual Environment

Once you're done working, you can deactivate the virtual environment by running:
  ```sh
  deactivate
  ```
  After deactivation, the `(venv)` prefix will disappear from your terminal/command prompt.


### To run the script
Go into the Animal-Migration directory and run the pipeline.py file.

The code to do so is - 
```sh
  cd /Animal-Migration
  python animal_migration.py
```

## Description of Data - 
*Notes: The data from 1969 to 1972 were digitised using old maps.*
*From 2014 until 2024, the same block (aka surface area) was used to count.*

- ID - the unique value of each observation.
- IN_STRIP - means random observations during the counting.
- CNT_BLKZ - count by block
- RIFTVALLEY - Whether the observation was made in the Rift Valley or not
- RFBLOK - Rift Valley portion of the count block.
- COUNT_DAY - each count per day, for instance, per visualisation.
- SESSION - It's time to go for the count and come back.
- LINE2002/2012/2014 - are lines used to count in those years.
- Type is type of helicopter
- count_day: is about how many times people went to count in a day
- Session: How many sessions they went to count
- 1969 and other years have 0 for count_day and session because no data
- FLDPLN_BLK GRSSLD_BLK is whether the block is fields or grass lands (it’s about the habitat) 
- CONSERVANC: count of animals in the conservancy areas (only 3 community conservancy  area where the community takes care of the animals) 
- COUNT - this is the year the observation was observed on
- MONTH - the month it was observed on
- DATE AND TIME are mostly Empty but these represent the date and time of the observations
- Species - Type of animal the observaation relates too
- Sanctuary - mostly 0
- Stratum - denotes the part of the park where the recordings were taken.
- Male & Calves mostly NAN
- LATITUDE - the latitude of the animal in the particular observation
- LONGITUDE - the longitude of the animal in the particular observation.
- NOTES - The notes column where notes for any particular observation is recorded

## EDA Findings

- The time column is not numeric so it was converted to numeric by counting seconds since midnight
- The MALE and CALVES columns are completely empty so they were dropped them
- The TYPE column to binary since it only consists of fixed-wing or helicopter (0 = fixed-wing, 1 = heli)
- COLLAR column is over 99% just 0s
- LINE2002 is over 99% just 0s
- LINE2012 is 84.2% just 0s
- LINE2014 is almost 61% just 0s
- Since the month and year columns already exist the DATE column was converted from a datetime to the day of the month
- RFBLK2014 and CNTBLK2014 have multicollinearity of 0.84
- IN_STRIP and LINE2014 have multicollinearity 0f 0.71
- GRSSLD_BLK and FLDPLN_BLK have multicollinearity of 0.7
- TYPE and COUNT have multicollinearity of 0.78
- SESSION and COUNT_DAY have multicollinearity of 0.98

Testing the inclusion and exclusion of different columns was done based on perceived importance by definition of the column, trying to account for multicollinearity and review of changes to metrics. GridSearchCV was run on each of the non-deep learning models to find the optimal hyperparameters. For deep learning hyperparameter tuning, batch normalization, dropout, early stopping, optimizer selection, learning rate schedulers, and manual tuning of learning rates were all performed to find the best hyperparameters. For the non-deep learning models, the GradientBoostingRegressor was found to perform the best on the training data, and for the deep learning models the LSTM was found to be the best model.


## Data Science Pipelines

### Preprocessing
1. Data provided is in an Excel file, so it was read into a pandas.Dataframe from that format to avoid loss of information.
2. Next empty columns, columns which have more than 80% 0 values, and the Notes column were dropped.
3. The TIME column was then converted into seconds and NAN values were filled with 0.
4. Next the TYPE column was label encoded
5. The DATE column was converted to the format specified above and also label encoded the MONTH column.
6. Next we bring into picture lag attributes for the Latitude, Longitude and Count_Day attributes. Specifically, we created two lags for each of these columns.
7. We then convert the other columns to lower case and one hot encode them.
8. For training the model in the testing phase of the modeling process we used 2022 (the latest year in the dataset) as the target year. We then divided our train and test splits to have the year 2022 as the test and all other years as the train. We then used the StandardScaler to fit our model and generate metrics.
9. For final modeling we fit the data on the full dataset and generated predictions for 2023 based on all the previous data.

The dependant variables we are predicting are - NUMBER, LATITUDE, LONGITUDE

## Final Models
### GradientBoostingRegressor 
1. We create the model setting the hyperparameters we found to be the best using GridSearchCV
2. We fit the model on the training data
3. Calculate the MSE and R Squared using the test set

### long Short Term Memory
1. First we convert our data to PyTorch Tensors and then we reshape them.
2. Now we create our DataLoaders.
3. We define the LSTM Model - with a hidden layer size as 64, number of layers as 2, output size as 3.
4. We define the training loss metric as MSE Loss and our optimizer as ADAM.
5. Next we set our number of epochs to 100 and set our device to cuda if a gpu in available.
6. Next we Train the model and evaluate it on the 2022 data and obtain metrics such as MSE, MAE and R Squared Score.

## Other Models Tested
### RandomForesRegressor 
1. We create the model - Random forest Regressor in our case
2. We predict the y_pred on the X_test
3. Calculate the MSE and R Squared

### Multi Output Neural Network
1. First we convert our data to PyTorch Tensors and then we reshape them.
2. Now we create our DataLoaders.
3. We define the neural network model as a class called ‘MultiOutputNN’ that has 2 hidden layers with 64 and 32 neurons, respectively. Between each layer we perform batch normalization and the between hidden layers we use a ReLu activation function.
4. We define the training loss metric as MSE Loss and our optimizer as ADAM with a learning rate of 0.001.
5. Next we set our number of epochs to 100 and train the neural network

### Ensembled Full-Connected NN
1. Create 3 separate MultiOutputNN
2. fit the training data on each of these models
3. average the predictions for each of these 3 models

## Link to video