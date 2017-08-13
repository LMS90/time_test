import { AutoForm } from 'meteor/aldeed:autoform';
import { moment } from 'meteor/momentjs:moment';

import './timing.html';

const MILISECONDS_DATE_FORMAT = /^(?!\.)(?!\:)(?:(?:(?:(\d+)\:)?(\d+)\:)?(\d+)\.)?(\d+)$/;
const DEFAULT_INPUT_DATE_FORMAT = SECONDS_DATE_FORMAT = /^(?!\.)(?!\:)(?:(?:(\d*)\:)?(?:(\d+)\:))?(\d+)(\.?\d{1,3})?$/;
const MINUTE_DATE_FORMAT = /^(?!\.)(?!\:)(?:(\d+)\:(?=\d+\:\d+))?(\d+)(?:\:(\d+)(?:\.(\d{1,3}))?)?$/;
const HOUR_DATE_FORMAT = /^(?!\.)(?!\:)(\d+)(?:\:(\d+)(?:\:(\d+)(?:\.(\d{1,3}))?)?)?$/;

const DEFAULT_FORMAT = 'S';


/*const MS = 0;
const S =  1;
const M =  2;
const H =  3;
const D =  4;
const MN = 5;
const Y =  6;*/

const FORMAT_OBJECT = {
  MS: 0,
  S: 1,
  M: 2,
  H: 3
};

const FORMAT_ARRAY = [
  {
    name: 'MS',
    delimiter: '.',
    zeros: 3,
    required: false
  },
  {
    name: 'S',
    base: 1000,
    delimiter: ':',
    zeros: 2,
    required: true
  },
  {
    name: 'M',
    base: 60,
    delimiter: ':',
    zeros: 2,
    required: true
  },
  {
    name: 'H',
    base: 60,
    required: true
  }
];

/* const FORMATS = {
  MS: {
    name: 'MS',
    format: /^(?!\.)(?!\:)(?:(?:(?:(\d+)\:)?(\d+)\:)?(\d+)\.)?(\d+)$/,
    delimiter: '.',
    zeros: 3,
    required: false
  },
  S: {
    name: 'S',
    format: /^(?!\.)(?!\:)(?:(?:(\d*)\:)?(?:(\d+)\:))?(\d+)(?:\.?(\d{1,3}))?$/,
    base: 1000,
    delimiter: ':',
    zeros: 2,
    required: true
  },
  M: {
    name: 'M',
    format: /^(?!\.)(?!\:)(?:(\d+)\:(?=\d+\:\d+))?(\d+)(?:\:(\d+)(?:\.(\d{1,3}))?)?$/,
    base: 60,
    delimiter: ':',
    zeros: 2,
    required: true
  },
  H: {
    name: 'H',
    format: /^(?!\.)(?!\:)(\d+)(?:\:(\d+)(?:\:(\d+)(?:\.(\d{1,3}))?)?)?$/,
    base: 60,
    required: true
  },
}; */

function toInt(arg) {
  let result = +arg;
  let value = 0;
  if (result !== 0 && isFinite(result)) {
      value = result;
  }
  return value;
}

Array.prototype.toStringBackward = function() {
  let result = '';
  for (let i = this.length - 1; i >= 0; i--) {
    result+=this[i];
  }
  return result;
}

function convertToTimeFormat(value, format) {
  let result = '';
  const FORMAT_NUM = FORMAT_OBJECT[format];
  if (FORMAT_NUM !== undefined) {
    let res_array = new Array(FORMAT_NUM + 1);
    res_array[0] = value;
    for (let i=1; i<=FORMAT_NUM; i++) {
      let prev = res_array[i-1];
      const base = FORMAT_ARRAY[i].base;
      res_array[i] = (prev - prev % base) / base;
      prev = prev % base;
      if (!FORMAT_ARRAY[i-1].required && prev === 0) {
        prev = '';
      } else {
        prev = prev.toString();
        prev = '0'.repeat(FORMAT_ARRAY[i-1].zeros - prev.length) + prev; //bad function
        prev = FORMAT_ARRAY[i-1].delimiter + prev;
      }
      res_array[i-1] = prev;
    }
    return res_array.toStringBackward();
  }
}

const MS_OBJ = {
  name: 'MS',
  format: /^(?!\.)(?!\:)(?:(?:(?:(\d+)\:)?(\d+)\:)?(\d+)\.)?(\d+)$/,
  base: 1,
  delimiter: '.',
  zeros: 3,
  required: false,
  index: 4,
  previous: null,
};

const S_OBJ = {
  name: 'S',
  format: /^(?!\.)(?!\:)(?:(?:(\d*)\:)?(?:(\d+)\:))?(\d+)(?:\.?(\d{1,3}))?$/,
  base: 1000,
  delimiter: ':',
  zeros: 2,
  required: true,
  index: 3,
  previous: MS_OBJ.name,
};

const M_OBJ = {
  name: 'M',
  format: /^(?!\.)(?!\:)(?:(\d+)\:(?=\d+\:\d+))?(\d+)(?:\:(\d+)(?:\.(\d{1,3}))?)?$/,
  base: 60,
  delimiter: ':',
  zeros: 2,
  required: true,
  index: 2,
  previous: S_OBJ.name,
};

const H_OBJ = {
  name: 'H',
  format: /^(?!\.)(?!\:)(\d+)(?:\:(\d+)(?:\:(\d+)(?:\.(\d{1,3}))?)?)?$/,
  base: 60,
  required: true,
  index: 1,
  previous: M_OBJ.name,
};

const FORMATS = {
  MS: MS_OBJ,
  S: S_OBJ,
  M: M_OBJ,
  H: H_OBJ,
};


function sumArrayByObject(array, object) {
  let result = 0;
  for (let property in object) {
    result += toInt(array[object[property].index]) * object[property].base;
  }
  console.log(result);
  return result;
}

AutoForm.addInputType('timing', {
  template: 'timingsss',
  valueIn(value, atts) {
    // console.log("Value IN");
    let format = 'S';
    if (FORMAT_OBJECT[atts.format] !== undefined) {
      format = atts.format;
      return convertToTimeFormat(value, format);
    }
    return value;
  },
  valueOut() {
    console.log("Value OUT");
    console.log(this.attr('data-format'));
    const format = this.attr('data-format');
    const regEx = FORMATS[format] || FORMATS[DEFAULT_FORMAT];
    const arrResult = regEx.format.exec(this.val());
    if (!arrResult) return this.val(); // ??? some things are correct. Need sticky validation???
    // const def = {h: toInt(arrResult[1]), m: toInt(arrResult[2]), s: toInt(arrResult[3]), ms: toInt(arrResult[4])};
    // return def["ms"]+1000*(def["s"]+60*(def["m"]+60*def["h"]));
    return sumArrayByObject(arrResult, FORMATS);
  },
  contextAdjust(context) {
    console.log(context.atts.format);
    context.atts['data-format'] = context.atts.format || DEFAULT_FORMAT;
    return context;
  },
});

/* Template.timingsss.onCreated(() => {
  console.log('OnCreated');
  console.log(Template.instance());
}); */

Template.timingsss.helpers({
  atts() {
    let atts = _.clone(this.atts);
    const context = AutoForm.getFormSchema().namedContext(AutoForm.getFormId());
    if (context.keyIsInvalid(atts.name)) {
      atts = AutoForm.Utility.addClass(atts, 'invalid');
    }
    return atts;
  },
});
