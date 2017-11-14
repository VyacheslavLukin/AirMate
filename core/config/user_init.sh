#!/bin/bash
mysql -u root -pangelhack -e "GRANT ALL ON *.* TO innosoft@%;"
mysql -u root -pangelhack -e "FLUSH PRIVILEGES;"