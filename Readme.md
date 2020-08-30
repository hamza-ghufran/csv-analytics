* Translates a CSV file into a Table A in a MySQL database. 

* The 1st line of the CSV file is treated as the column names of the table. 

* The code here dynamically create the table reading the first line of the File.

* Another Table B manages the whole upload process.

* While uploading the CSV, it store analytics to show the status of the upload in this table. 

* If the upload process breaks, you can to resume the upload using this table (Table - B).

* While uploading, it generates analytics over the data and stores it in Table C.

* If you use the “accidents” CSV, list the number of accidents happened in every region.
  https://www.kaggle.com/sobhanmoosavi/us-accidents
