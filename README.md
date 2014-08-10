## Flask Application Template (for myself) ##

This is a little sample app built with Flask. It's meant to be edited and expanded to become a large to mid sized web application backed by PostgreSQL.

### Things to re-configure before starting ###

Everything is generically named as it is just a template / sample / demo. Here is a list of things you want to edit before proceeding.

- The app is name "flask_app_temp". So do a global search and replace it with something you want. In VagrantFile, it's "flask-app-temp". Take care of that too.
- The apache server config file is named "app_dev.conf". If you don't like it, change the file name, change refereces using global search.
- The wsgi file is named "app_dev.wsgi". Change the same way as above if you want.
- Take a look at the "provision.sh" and see if you want to edit anything there.
- Edit the VagrantFile as needed for different configs.

Why did I not create a script for the tasks above?

Because I use Atom and Sublime Text. It's so easy to do global search/replace. The script is a waste of effort.

### What's available after setting up

You should be able to create users from an admin tools at "/admin". You should be able to log in as a user and access the home page as a user.
From the provisioning, the very first admin user is automatically created (username: admin, password: admin).
There is some basic "account" funtionality. That's it. There is no app specific funtionality what so ever. The point is to learn/build/edit from here.

### Set Up ###

To run the server locally. Install the following on your computer. Do not use a Windows based machine. Use OS X or Linux.

- VirtualBox 4.3.8+
- Vagrant 1.5+

Then simply run this:

```
vagrant up
```

After a series of provisioning executions, you will have the server running at 192.168.56.107.


### DB Setup / Initial User Setup ###

SSH into vagrant and source
```
vagrant ssh
sudo su
source /opt/pyvenv/flask_app_temp/bin/activate
cd /mnt/flask_app_temp
```

Database migration is managed by alembic (flask extention is called Flask-Migration).

To run the migration to make the database schema up to date, use
```
python -m flask_app_temp db upgrade head
```
To create a new migration script, use the following command.
```
python -m flask_app_temp db revision -m "<description of the new migration>"
```
To create an admin user 
```
python -m flask_app_temp user create_admin -n <name> -e <email> -u <username> -p <password>
```
To reset user password
```
python -m flask_app_temp user reset_password -u <username> -p <password>
```
To set admin level (0 for regular user and 1 for admin user)
```
python -m flask_app_temp user set_admin_level -u <username> -a <admin_level>
```
