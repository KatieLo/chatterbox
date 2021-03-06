
var app = {}; // create namespace

//--------------
// Models
//--------------

app.Todo = Backbone.Model.extend({  // class Todo extends backbone model. could also use: var Todo = Backbone.Model.extend({});
  defaults: {
    title: '', 
    author: 'anon'
  }
});

// Create a Firebase collection and set the 'firebase' property to the URL of your Firebase

//--------------
// Collections
//--------------

//Collection: ordered set of models 

app.TodoList = Backbone.Firebase.Collection.extend({
  model: app.Todo,
  url: "https://boiling-inferno-6812.firebaseio.com/"
});

// instance of the Collection
app.todoList = new app.TodoList();

//--------------
// Views
//--------------

// View for he individual todo item
app.TodoView = Backbone.View.extend({
  tagName: 'p', // el will be wrapped in <p>
  template: _.template($('#item-template').html()),
  render: function(){
    this.$el.html(this.template(this.model.toJSON()));
    this.input = this.$('.edit');
    return this; // enable chained calls
  },
  initialize: function() {
    this.model.on('change', this.render, this); // listen for edit
    this.model.on('destroy', this.remove, this); // listen for destroy
  },
  events: { // bind functions to events
    'dblclick .bubble' : 'edit', 
    'keypress .edit' : 'updateOnEnter',
    'blur .edit' : 'close',
    'click .destroy': 'destroy'
  },
  edit: function(){
    this.$el.addClass('editing');
    this.input.focus();
  },
  close: function(){
    var value = this.input.val().trim();
    if(value){
       this.model.save({title: value});
    }
    this.$el.removeClass('editing');
  },
  updateOnEnter: function(e){
    if(e.which == 13){
      this.close();
    }
  },
  destroy: function(){
    this.model.destroy();
  }
});

// View for the collection
app.AppView = Backbone.View.extend({
  el: '#todoapp', // from the HTML 
  initialize: function () {
    this.input = this.$('#new-todo'); // input is a jQuery object from the form
    // when new elements are added to the collection render then with addOne
    this.author = this.$('#new-author');
    app.todoList.on('add', this.addOne, this); // bind the object 'this' to the event add and the callback function addOne. The callback addOne will be executed on this when add event is triggered.
    app.todoList.on('reset', this.addAll, this); 
    app.todoList.fetch(); // Loads list from local storage
  },
  events: {
    'keypress #new-todo': 'createTodoOnEnter' // when keypress event runs on #new-todo  run function createTodoOnEnter
  },
  createTodoOnEnter: function(e){
    if ( e.which !== 13 || !this.input.val().trim() ) { // ENTER_KEY = 13
      return; // if it's not enter, do nothing
    }
    app.todoList.create(this.newAttributes());
    this.input.val(''); // clean input box
    e.preventDefault();
  },
  addOne: function(todo){ // add todo to list
    var view = new app.TodoView({model: todo});
    $('#todo-list').append(view.render().el);
  },
  addAll: function(){ 
    this.$('#todo-list').html(''); // clean the todo list
    // filter todo item list
    switch(window.filter){
      default:
        app.todoList.each(this.addOne, this);
       break; 
    }
  },
  newAttributes: function(){
    return {
      title: this.input.val().trim(),
      author: this.author.val().trim()

    }
  }
});

//--------------
// Routers
//--------------

app.Router = Backbone.Router.extend({
  routes: {
    '*filter' : 'setFilter'
  },
  setFilter: function(params) {
    console.log('app.router.params = ' + params);
    if(params) {
      window.filter = params.trim() || '';
    } else {
      window.filter = '';
    }
    app.todoList.trigger('reset');
  }
});   

//--------------
// Initializers
//--------------   
app.router = new app.Router(); 
Backbone.history.start();


app.appView = new app.AppView();


