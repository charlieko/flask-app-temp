#!/usr/bin/env bash
echo -------------------- provision.sh --------------------
echo Starting to provision server post script

APP_PATH="/mnt/flask_app_temp"

# Create swapfile of 1GB with block size 1MB
/bin/dd if=/dev/zero of=/swapfile bs=1024 count=1048576
# Set up the swap file and enable
mkswap /swapfile
swapon /swapfile
echo '/swapfile   none    swap    sw    0   0' >> /etc/fstab

# Install global dependencies
sudo apt-get update -y
sudo apt-get -y install openssh-server build-essential postgresql-9.3 postgresql-server-dev-9.3 postgresql-client apache2 python-pip python-dev
sudo pip install virtualenv

# Set up python virtual environment and install mwapy dependencies
virtualenv /opt/pyvenv/flask_app_temp
source /opt/pyvenv/flask_app_temp/bin/activate

# PostgreSQL
# - set password so web server can access as postgres user
# THIS IS NOT A GOOD IDEA FOR PROD, BUT FOR LOCAL IT'S FINE
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
sudo -u postgres createdb -E UTF8 -T template0 --locale=en_US.utf8 flask_app_temp

# Web Framework
sudo apt-get -y install libapache2-mod-wsgi
pip install -r $APP_PATH/requirements.txt
# - Set Web Environment
export APP_ENV=dev
echo 'APP_ENV=dev' >> /etc/environment
# DB
cd $APP_PATH
python -m flask_app_temp db upgrade head

#copy the apache config and restart apache
sudo cp $APP_PATH/server_configs/app_dev.conf /etc/apache2/sites-available/
sudo rm /etc/apache2/sites-enabled/*.conf
sudo ln -s /etc/apache2/sites-available/app_dev.conf /etc/apache2/sites-enabled/app_dev.conf
sudo service apache2 restart

#Create the first admin user
python -m flask_app_temp user create_admin -n 'Admin User' -e 'admin@flask_app_temp.com' -u admin -p admin
