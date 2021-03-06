from flask_app_temp import app
from flask import render_template, request, jsonify
from flask.ext.login import login_required, current_user

@app.route('/')
def index():
  if current_user and not current_user.is_anonymous() and current_user.is_active():
    return render_template('index.html', current_user = jsonify(current_user.asDict()).get_data().decode('string-escape') )
  return render_template('login.html')

@app.route('/login')
def index_login():
  return render_template('login.html')

@app.route('/admin')
@login_required
def index_admin():
  if current_user.admin_level < 1:
    return "You are not authorized! Go AWAY!!", 403

  return render_template("admin.html", current_user = jsonify(current_user.asDict()).get_data().decode('string-escape') )
