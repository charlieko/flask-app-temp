activate_this = '/opt/pyvenv/flask_app_temp/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))

import sys
sys.path.insert(0,'/mnt/flask_app_temp')

from flask_app_temp import app as application
