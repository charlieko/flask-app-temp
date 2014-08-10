var app = {};

app.pages = ["home", "account"];
app.transitioned_to = [false, false]; // keeps track of whether a page has been viewed since load

app.init = function(){

  $.ajaxSetup({type:"json"});

  // Handle hash change event and navbar component updates
  function hashChanged(){
    if( app.isAnimating ) {
      setTimeout(hashChanged, 300);
      return;
    }
    var content_id = (window.location.hash.replace("#", "")) || "home";
    if(app.pages.indexOf(content_id) < 0) return;
    app.view_translate(content_id);
    $(".navbar .nav.navbar-nav li").removeClass("active");
    $(".navbar .nav.navbar-nav li."+content_id).addClass("active");
  }
  $(window).on('hashchange', hashChanged);

  app.render_logged_in_message();
  // Initiate content boxes
  app.account.init(); // Account settings render

  hashChanged();
};

app.render_logged_in_message = function(){
  $(".navbar .logging_in_msg").remove();
  $(".navbar .logged_in_msg").empty()
    .append("Hello " + app.current_user.name + " (")
    .append($("<a/>").attr("href", "#").text("Log out").click(app.logout))
    .append(")");
};

app.create_loading = function(){
  return $("<img>").addClass("loading").attr("src", STATIC_PATH+"/img/loading.gif");
};


app.check_user = function(cb){
  $.ajax({
    method: "GET",
    url: "/api/current_user",
    type: "json",
    success: function(data){
      app.current_user = data;
      if(cb) cb();
    },
    error: function(xhr, status, err){
      window.location = "/login";
    }
  });
};

app.logout = function(e){
  $.ajax({
    method: "POST",
    url: "/api/logout",
    type: "json",
    success: function(data){
      window.location = "/login";
    },
    error: function(xhr, status, err){
      alert("something went wrong...");
    }
  });
};

// Per Page Events
app.onPageTransition = function(page_id){
  //console.log("onPageTransition  " + page_id);
  var index = app.pages.indexOf(page_id);
  if(!page_id) page_id = "_null";
  var transitioned_to = app.transitioned_to[index];

  switch(page_id){
    case 'home':
      break;
    case 'account':
      break;
    case '_null':
      break;
  }

  app.transitioned_to[index] = true;
}


// Things needed for view translation
app.isAnimating = false;
app.endCurrPage = false;
app.endNextPage = false;
app.animEndEventNames = {
  'WebkitAnimation' : 'webkitAnimationEnd',
  'OAnimation' : 'oAnimationEnd',
  'msAnimation' : 'MSAnimationEnd',
  'animation' : 'animationend'
};
app.animEndEventName = app.animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
app.css_support = Modernizr.cssanimations;
app.onEndAnimation = function(from, to, to_id){
  app.isAnimating = false;
  from.removeClass("pt-page-current pt-page-moveToLeft pt-page-moveToRight").hide();
  to.removeClass("pt-page-moveFromRight pt-page-moveFromLeft pt-page-current");
  app.onPageTransition(to_id);
};

app.view_translate = function(to_id){

  if( app.isAnimating ) return;

  var from = $(".content_container:visible").addClass( 'pt-page-current' ), to = $("#"+to_id),
    order = app.pages,
    is_left = order.indexOf(to_id) > order.indexOf(from.attr("id")),
    in_class = is_left ? "pt-page-moveFromRight": "pt-page-moveFromLeft",
    out_class = is_left ? "pt-page-moveToLeft": "pt-page-moveToRight";

  if (from.attr("id") == to_id) {
    app.onPageTransition(to_id);
    return;
  }

  app.isAnimating = true;
  app.endCurrPage = false;
  app.endNextPage = false;

  from.addClass( out_class ).on( app.animEndEventName, function() {
    from.off( app.animEndEventName );
    app.endCurrPage = true;
    if(app.endNextPage)
      app.onEndAnimation( from, to );
  });

  to.show().addClass( in_class ).on( app.animEndEventName, function() {
    to.off( app.animEndEventName );
    app.endNextPage = true;
    if(app.endCurrPage)
      app.onEndAnimation( from, to, to_id );
  });

  if( !app.css_support  ) {
    app.onEndAnimation( from, to, to_id );
  }
};
