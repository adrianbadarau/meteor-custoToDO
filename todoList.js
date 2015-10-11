Todos = new Mongo.Collection('todos');
if (Meteor.isClient) {

    Meteor.subscribe('todos');

    Template.main.helpers({
        todos: function() {
            return Todos.find({}, {
                sort: {
                    createdAt: -1
                }
            });
        }
    });
    Template.main.events({
        'click .toggle-checked': function(event) {
            Meteor.call('setChecked', this._id, !this.checked);
        },
        "click .deleteTodo": function() {
            if (confirm("Are you shure ?")) {
                Meteor.call('deleteTodo', this._id);
            }
        }
    });
    Template.todoForm.events({
        'submit .newTodo': function(event) {
            event.preventDefault();
            var text = event.target.text.value;
            Meteor.call('addTodo', text);
            // Clear the form
            event.target.text.value = '';
        }
    });
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}
if (Meteor.isServer) {
    Meteor.publish('todos', function(){
        if(!this.userId){
            return Todos.find();
        }
        return Todos.find({userId: this.userId});
    }) 
}
Meteor.methods({
    addTodo: function(text) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }
        Todos.insert({
            text: text,
            createdAt: new Date(),
            userId: Meteor.userId(),
            userName: Meteor.user().username,
        });
    },
    deleteTodo: function(todoId) {
        var todo = Todos.findOne(todoId);
        if(todo.userId !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        Todos.remove(todoId);
    },
    setChecked: function(todoId, setChecked) {
        var todo = Todos.findOne(todoId);
        if(todo.userId !== Meteor.userId()){
            throw new Meteor.Error('not-authorized');
        }
        Todos.update(todoId, {
            $set: {
                checked: setChecked,
            }
        });
    }
})