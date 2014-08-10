app.account = {};

app.account.create_account = function(){
  return $("<div>")
    .append("<p>Username: " + app.current_user.username + "</p>")
    .append( $("<form/>").attr("role", "form")
      .append($("<div/>").addClass("form-group")
        .append($("<label/>").attr("for", "account_name").text("Name:"))
        .append($("<input/>").attr("type", "text").attr("placeholder",  "Type your name").attr("id", "account_name").val(app.current_user.name))
      )
      .append($("<div/>").addClass("form-group")
        .append($("<label/>").attr("for", "account_email").text("Email:"))
        .append($("<input/>").attr("type", "email").attr("placeholder",  "Type your email").attr("id", "account_email").val(app.current_user.email))
      )
      .append($("<div/>").addClass("form-group")
        .append($("<label/>").attr("for", "account_pw").text("New Password:"))
        .append($("<input/>").attr("type", "password").attr("placeholder",  "Type your new password").attr("id", "account_pw"))
      )
      .append($("<div/>").addClass("form-group")
        .append($("<label/>").attr("for", "account_pw_cf").text("New Password Confirm:"))
        .append($("<input/>").attr("type", "password").attr("placeholder",  "Type your new password again").attr("id", "account_pw_cf"))
      )
      .append($("<button/>").attr("type", "button").addClass("btn btn-primary").text("Save").click(app.account.save_account))
      .append($("<p/>").attr("id", "account_msg").hide())
    )
};

app.account.msg = function(msg, color){
  $("#account_msg").css("color", (color || "red")).text(msg).fadeIn().delay(5000).fadeOut();
}

app.account.validate_form = function(){
  if(!$.trim($("#account_name").val())){
    app.account.msg("Please enter your name");
    return false;
  }

  if(!$.trim($("#account_email").val())){
    app.account.msg("Please enter your email");
    return false;
  }

  if($.trim($("#account_pw").val()) && $("#account_pw").val() != $("#account_pw_cf").val()){
    app.account.msg("Passwords do not match. Please try again.");
    return false;
  }

  return true;
}

app.account.save_account = function(){
  if(!app.account.validate_form()) return;
  var post_data = {
    name: $.trim($("#account_name").val()),
    email: $.trim($("#account_email").val())
  };

  if($.trim($("#account_pw").val())){
    post_data["password"] = $("#account_pw").val();
  }
  $("#account button").prop("disabled", true);
  $.ajax({
    url: "/api/current_user",
    method: "PUT",
    data: post_data,
    type: "json",
    success: function(data){
      app.account.msg("Account Saved!", "green");
      app.current_user = data;
      app.render_logged_in_message();
    },
    error: function(xhr, status, err){
      app.account.msg("There was an error saving your account...", "red");
    },
    complete: function(){
      $("#account button").prop("disabled", false);
    }
  });
};

app.account.init = function(){
  $("#account").append(app.account.create_account());
};
