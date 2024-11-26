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