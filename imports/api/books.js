import  SimpleSchema from 'simpl-schema';
import { Meteor } from 'meteor/meteor';
import { AutoForm } from 'meteor/aldeed:autoform';

SimpleSchema.extendOptions(['autoform']);

Books = new Mongo.Collection("books");
Books.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "Title",
    max: 200
  },
  slider: {
    type: Number,
    autoform: {
      type: 'timing',
      format: 'S',
    }
  }
}, { tracker: Tracker }));

/*Books.allow({
  insert: function(){
    return true;
  },
  update: function(){
    return true;
  },
  remove: function(){
    return true;
  }
});*/

Meteor.methods({
  'testmethod'(doc) {
    console.log(doc);
    throw new Meteor.Error(444, "This is Test Error From method");
  },
});

export { Books };
