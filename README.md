# Mozambique Animal Migration
This project aims to predict the migration of animals in the reserve forests and wildlife sanctuaries of Mozambique, in East Africa.

Done by Vihaan Nama, Tal Erez, Lennox Anderson, and Ahmed Boutar

Data has been collected from 1969 in various time intervals.

We have compared many potential solutions to predict these values including Deep Learning and Non Deep Learning approaches such as.

In this repository we bring forth our best models - RandomForest Regressor, Long Short Term Memory Neural Networks, and an Ensemble of various fully connected neural networks.

## Description of Data - 
- Please note that the data from 1969 to 1972 were digitised using old maps. 
- From 2014 until 2024, the same block was used to count.
- IN_STRIP - means random observations during the counting.
- CNT_BLKZ - count by block
- RFBLOK - Rift Valley portion of the count block.
- COUNT_DAY - each count per day, for instance, per visualisation.
- SESSION - It's time to go for the count and come back.
- LINE2002/2004 - are lines used to count in those years.
- Type is type of helicopter
- count_day: is about how many times people went to count in a day
- Session: How many sessions they went to count
- 1969 and other years have 0 for count_day and session because no data
- FLDPLN_BLK GRSSLD_BLK is whether the block is fields or grass lands (it’s about the habitat) 
- CONSERVANC: count of animals in the conservancy areas (only 3 community conservancy  area where the community takes care of the animals) 
- COUNT - this is the year the observation was observed on
- MONTH - the month it was observed on
- DATE AND TIME are mostly Empty
- Species - Type of animal the observaation relates too
- Sanctuary
- Stratum 
- Male & Calves mostly NAN



## EDA Findings

- The time column is not numeric so I converted it to numeric by counting seconds since midnight
- The MALE and CALVES columns are completely empty so I dropped them
- Convert TYPE to binary since there is only fixed-wing or helicopter (0 = fixed-wing, 1 = heli)
- COLLAR column is over 99% just 0s
- LINE2002 is over 99% just 0s
- LINE2012 is 84.2% just 0s
- LINE2014 is almost 61% just 0s
- Since we already have a month and year column, I converted the DATE column to just be the day of the month
- Drop NOTES col for now before talking to ahmed and Lenny
- RFBLK2014 and CNTBLK2014 have multicollinearity of 0.84
- IN_STRIP and LINE2014 have multicollinearity 0f 0.71
- GRSSLD_BLK and FLDPLN_BLK have multicollinearity of 0.7
- TYPE and COUNT have multicollinearity of 0.78
- SESSION and COUNT_DAY have multicollinearity of 0.98


## Data Science Pipelines

### Preprocessing
1. Data provided in an Excel file, so we read it in that format to avoid loss in information, and convert it over to a Pandas Dataframe.
2. Next we drop columns that are empty, have more than 80% 0 values, and also the Notes column.
3. We then convert the TIME column into seconds and fill NAN values with 0.
4. Next we label encode the TYPE column
5. Next we Convert the DATE column to the required format and also Label Encode the MONTH column.
6. Next we bring into picture lag attributes for the Latitude, Longitude and Count_Day attributes
7. Next we convert the other columns to lower case and one hot encode them.
8. We now create our target year - which is the latest year 2022, and then divide our train and test splits. Upon which we scale our data using StandardScaler

The dependant variables we are predicting are - COUNT_DAY, LATITUDE, LONGITUDE

### RandomForesRegressor 
1. We create the model - Random forest Regressor in our case
2. We predict the y_pred on the X_test
3. Calculate the MSE and R Squared


### long Short Term Memory
1. First we convert our data to PyTorch Tensors and then we reshape them.
2. Now we create our DataLoaders.
3. We define the LSTM Model - with a hidden layer size as 64, number of layers as 2, output size as 3.
4. We define the training loss metric as MSE Loss and our optimizer as ADAM.
5. Next we set our number of epochs to 100 and set our device to cuda if a gpu in available.
6. Next we Train the model and evaluate it on the 2022 data and obtain metrics such as MSE, MAE and R Squared Score.

### Multi Output Neural Network
1. First we convert our data to PyTorch Tensors and then we reshape them.
2. Now we create our DataLoaders.
3. We define the neural network model as a class called ‘MultiOutputNN’ that has 2 hidden layers with 64 and 32 neurons, respectively. Between each layer we perform batch normalization and the between hidden layers we use a ReLu activation function.
4. We define the training loss metric as MSE Loss and our optimizer as ADAM with a learning rate of 0.001.
5. Next we set our number of epochs to 100 and train the neural network

## Instructions on how to Run
To run the notebook - 
## Cloning the Project
- Open the Command Shell or Terminal on your machine and execute the following command
   ```sh
   git clone https://github.com/vihaannnn/Individual-Dataset.git
   ```


## Setting Up a Virtual Environment

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

## Installing Dependencies

1. **Ensure your virtual environment is activated**:
   - Verify that `(venv)` is present in your terminal/command prompt.

2. **Install the dependencies from `requirements.txt`**:
   ```sh
   pip install -r requirements.txt
   ```
   This command installs all the packages listed in the `requirements.txt` file into your virtual environment.

  

## Deactivating the Virtual Environment

Once you're done working, you can deactivate the virtual environment by running:
  ```sh
  deactivate
  ```
  After deactivation, the `(venv)` prefix will disappear from your terminal/command prompt.


## To run the script
Go into the Animal-Migration directory and run the pipeline.py file.

The code to do so is - 
```sh
  cd /Animal-Migration
  python animal_migration.py
```

## Link to video