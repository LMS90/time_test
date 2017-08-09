import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { HTTP } from 'meteor/http'

import './main.html';
import { Books } from '../imports/api/books.js';

AutoForm.setDefaultTemplate('materialize');

AutoForm.hooks({
  insertBookForm: {
    onError: function(formType, error) {
      //console.log("Error?!");
      //console.log("Error reason:" + error.reason);
    },
    after: {
      method: function(error, result) {
        console.log("Error reason after:" + error.reason);
      }
    },
  }
});

Template.hello.onCreated(function helloOnCreated() {
  // counter starts at 0
  this.counter = new ReactiveVar(0);
});

Template.hello.helpers({
  counter() {
    return Template.instance().counter.get();
  },
});

Template.hello.events({
  'click button'(event, instance) {
    // increment the counter when button is clicked
    instance.counter.set(instance.counter.get() + 1);
    HTTP.get('http://ergast.com/api/f1/current/last/results.json', null, (error, result) => {
      if (!error) {
        console.log(result);
      } else {
        console.log(error);
      }
    });
  },
});

Template.insertBookForm.helpers({
  exampl() {
    console.log(Books.findOne({title:"jjjj"}));
    return Books.findOne({title:"jjjj"});
  }
});

Template.maskDateInput.rendered = function () {
    $(".mask_date").mask("99.99.9999",{placeholder:"dd.mm.yyyy"});
};
