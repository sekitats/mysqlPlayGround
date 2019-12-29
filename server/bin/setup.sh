#!/bin/bash

# mysql -uroot yoursql -h localhost -P 3306 --protocol=tcp < ./sql/drop_table.sql
mysql -uroot yoursql -h localhost -P 3306 --protocol=tcp < ./sql/create_for_mysql.sql
mysql -uroot yoursql -h localhost -P 3306 --protocol=tcp < ./sql/data.sql