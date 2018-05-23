#!/bin/bash
mysql -u root -pinnosoft -e "GRANT ALL ON *.* TO 'innosoft'@'%';"
mysql -u root -pinnosoft -e "FLUSH PRIVILEGES;"