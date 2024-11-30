### EDA Findings

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

### To-Do:
- Incorporate Count into the model predictions somehow
- Use 2012 data as the test set instead of random split
- Setup deep learning model
- More extensive EDA/Testing


# Write UP
This project aims to predict the migration of animals in the reserve forests and wildlife sanctuaries of Mozambique, in East Africa.

Data has been collected from 1969 in various time intervals.

We have compared many potential solutions to predict these values including Deep Learning and Non Deep Learning approaches such as.

In this repository we bring forth our best models - RandomForest Regressor, Long Short Term Memory Neural Networks, and an Ensemble of various fully connected neural networks.

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
1. 


### LSTM
1. First we convert our data to PyTorch Tensors and then we reshape them.
2. Now we create our DataLoaders.
3. We define the LSTM Model - with a hidden layer size as 64, number of layers as 2, output size as 3.
4. We define the training loss metric as MSE Loss and our optimizer as ADAM.
5. Next we set our number of epochs to 100 and set our device to cuda if a gpu in available.
6. Next we Train the model and evaluate it on the 2022 data and obtain metrics such as MSE, MAE and R Squared Score.


