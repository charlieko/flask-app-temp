app.admin = {};

app.pages = ["users"];
app.transitioned_to = [false];

app.admin.init = function(){

  $.ajaxSetup({type:"json"});

  // Handle hash change event and navbar component updates
  function hashChanged(){
    if( app.isAnimating ) {
      setTimeout(hashChanged, 300);
      return;
    }
    var content_id = (window.location.hash.replace("#", "")) || "users";
    if(app.pages.indexOf(content_id) < 0) return;
    app.view_translate(content_id);
    $(".navbar .nav.navbar-nav li").removeClass("active");
    $(".navbar .nav.navbar-nav li."+content_id).addClass("active");
  }
  $(window).on('hashchange', hashChanged);
  hashChanged();

  app.render_logged_in_message();

  app.admin.render_users_ui();
  app.admin.fetch_users();
};


// Users - fetches users and render the table and other ui components in users container
app.admin.render_users_ui = function(){
  $("#users")
    .append(app.create_loading())
    .append(app.admin.create_users_table())
    .append(app.admin.create_user_post_ui());
}

app.admin.create_users_table = function(){
  return table = $("<table/>").addClass("user_table table table-striped")
    .append($("<thead>")
      .append($("<tr/>")
        .append($("<th/>").text("ID"))
        .append($("<th/>").text("Username"))
        .append($("<th/>").text("Name"))
        .append($("<th/>").text("Deactivated"))
        .append($("<th/>").text("Admin?"))
        .append($("<th/>").text("   "))
      )
    )
    .append($("<tbody>"))
    .delegate("button.deactivate", "click", function(el){
      if(!confirm("Really deactivate?")) return false;
      var id = $(this).data("user_id");
      $(this).text("Deactivating").prop('disabled',true);
      app.admin.user_activate(id, true, app.admin.fetch_users);
    })
    .delegate("button.reactivate", "click", function(el){
      if(!confirm("Really reactivate?")) return false;
      var id = $(this).data("user_id");
      $(this).text("Reactivating").prop('disabled',true);
      app.admin.user_activate(id, false, app.admin.fetch_users)
    });
};

app.admin.create_user_post_ui = function(){
  return $("<div/>").addClass("tail_interface")
    .append( $("<div/>").addClass("user_bottom_buttons")
      .append( $("<button/>").attr("type", "button").addClass("btn btn-primary show_post")
        .text("Create User")
        .click(function(e){
          app.admin.show_user_post();
        })
      )
    )
    .append( $("<div/>").addClass("user_post_interface").hide()
      .append("<hr/>")
      .append( $("<form>").addClass("form-horizontal")
        .append('<div class="form-group"><input type="text" class="form-control" id="u_username" placeholder="username"></div>')
        .append('<div class="form-group"><input type="text" class="form-control" id="u_name" placeholder="name"></div>')
        .append('<div class="form-group"><input type="text" class="form-control" id="u_email" placeholder="email"></div>')
        .append('<div class="form-group"><input type="text" class="form-control" id="u_password" placeholder="temporary password"></div>')
      )
      .append( $("<div/>").addClass("buttons")
        .append( $("<button/>").attr("type", "button").addClass("btn btn-default")
          .text("Cancel")
          .click(app.admin.hide_user_post)
        )
        .append( $("<button/>").attr("type", "button").addClass("btn btn-primary post")
          .text("Create")
          .click(app.admin.post_user)
        )
      )
    );
};

app.admin.show_user_post = function(){
  $("#users .user_post_interface").show();
  $("#users .user_bottom_buttons").hide();
  $("#users .user_table").hide();
};

app.admin.hide_user_post = function(){
  $("#users .user_post_interface").hide();
  $("#users .user_bottom_buttons").show();
  $("#users .user_table").show();
};

app.admin.post_user = function(){
  var post_data = {
    username: $("#users #u_username").val(),
    name: $("#users #u_name").val(),
    email: $("#users #u_email").val(),
    password: $("#users #u_password").val()
  };

  if(!post_data.username || !post_data.name || !post_data.email || !post_data.password){
    alert("Please fill out the user creation form completely.");
    return;
  }

  $("#users .user_post_interface *").prop("disabled", true);

  $.ajax({
    url: '/api/users',
    method: "POST",
    data: post_data,
    success: function(){
      $("#users #u_username").val("");
      $("#users #u_name").val("");
      $("#users #u_email").val("");
      $("#users #u_password").val("");
      app.admin.hide_user_post();
      app.admin.fetch_users();
    },
    error: function(){
      alert("could not create user...");
    },
    complete: function(){
      $("#users .user_post_interface *").prop("disabled", false);
    }
  })
};

app.admin.user_activate = function(id, deactivate, callback){
  $.ajax({
    url: "/api/users/"+id,
    method: "PUT",
    data: deactivate? {"deactivate":"true"}:{"reactivate":"true"},
    success: function(){

    },
    error: function(){
      alert("an error occurred");
    },
    complete: function(){
      if(callback) callback();
    }
  })
};

app.admin.fetch_users = function(){
  var loading = $("#users .loading").show();
  $.ajax({
    url: '/api/users',
    method:"GET",
    success: function(data){
      var tbody = $("#users .user_table tbody").empty();
      $.each(data.users, function(i,v){
        tbody.append($("<tr/>").attr("id", "user_tr_"+v.id)
          .append($("<td/>").text(v.id))
          .append($("<td/>").text(v.username))
          .append($("<td/>").text(v.name))
          .append($("<td/>").text(v.deactivated_date?"Yes":"No"))
          .append($("<td/>").text(v.admin_level?"Yes":"No"))
          .append($("<td/>")
            .append(
              $("<div>")
                // deactivate button
                .append( (!v.admin_level && !v.deactivated_date)? $("<button/>")
                  .attr("type", "button")
                  .addClass("btn btn-danger deactivate")
                  .text("Deactivate")
                  .data("user_id", v.id) : ""
                )
                // reactivate button
                .append( (v.deactivated_date)? $("<button/>")
                  .attr("type", "button")
                  .addClass("btn btn-default reactivate")
                  .text("Reactivate")
                  .data("user_id", v.id) : ""
                )
            )
          )
        );
      });
    },
    error: function(xhr, status, err){
      alert("Something went wrong while getting users");
    },
    complete: function(){
      loading.hide();
    }
  });
};
