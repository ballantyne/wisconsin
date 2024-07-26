const path = require('path');                                    
const { createHmac } = require('node:crypto');

//const {  
//  newCursor, 
//  extraction
//} = require(path.join(__dirname, '..', '..', 'utils'));

const {
  sway,
  alphabetize,
  extract, 
  fingerprint, 
  ignorant,
  cp, 
  merge, 
  requireJSON,
  construct 
} = require('great-lakes');



function deglyph(text) {
  return text.replace('&amp;', '&').replace('&nbsp;', ' ')
}
//module.exports.deglyph = deglyph;





function search(html, config, meta={}) {
  var results;

  if (config.meta) {
    Object.assign(meta, {version: {cache: fingerprint('list', html)}});
  }

  var fields = {
    entityID: 'id',
    code: 'code',
    url: 'url',
    name: 'name',
    description: 'description',
    statusDescription: 'status',
    statusDate: 'date'
  }

  var ignoranceRules = requireJSON(path.join(__dirname, 'search', 'ignore'));
  var ignorance = ignorant(ignoranceRules);
  var transitions = requireJSON(path.join(__dirname, 'search', 'transitions'));
  var modulator = sway(transitions);
  var context = {state: 'scan', parser: 'none', headers: []};

  //config.verbose = true;

  return new Promise((resolve) => {
    var rows = html.split("\n").reduce((obj, raw, index) => {

      var line = raw.trim();

      if (ignorance(line)) {
        line = line.replace('<td>', '').replace('</td>', '').replace("</span>", "").trim();

        var modulations = modulator(context.state, line);
      
        if (config.verbose) {
	  console.log(line);
          console.log('state:',context.state);

          if (modulations.length > 0) {
            console.log('.......................................................')
            console.log('modulations');
            console.log('.......................................................')
            console.log(modulations);
          }
        }

        var changes = modulations.filter((modulation) => {
          return Object.keys(modulation).indexOf('sets') > -1
        });

        var actions = modulations.filter((modulation) => {
          return Object.keys(modulation).indexOf('action') > -1
        });

        while(changes.length > 0) {
          var change = changes.shift();
          Object.assign(context, cp(change.sets));
	}
	
	while(actions.length > 0) {
	  var modulation = actions.shift();

	  if (modulation.action == 'new') {
	    if (Object.keys(obj.current).length > 0) {
              obj.list.push(cp(obj.current));
	    }
	    obj.current = {};
	  }

	  if (modulation.action == 'next_key') {
            var extractor = extract([
	      /<td class="(?<next_key>.+)">/,
	      /<span class="(?<next_key>.+)">/
	    ]);
	    var result = extractor(line);
	    Object.assign(context, result);
	  }

	  if (modulation.action == 'gather_value') {
            obj.current[fields[context.next_key]] = line.trim();
	    delete context.next_key;
	  }


	  if (modulation.action == 'gather_name_parts') {
	    var part = context.fields.shift();
	    if (part == 'url') {
              var matched = line.match(/<span class=\"name\"><a href=\"(?<path>.+)\">/);
	      obj.current[fields[part]] = ["https://apps.dfi.wi.gov/apps/CorpSearch/", matched.groups.path].join('')
	    } else {
              obj.current[fields[part]] = line.trim();
	    }
	  }
	}

      }
      return obj;


    }, {list: [], current: {}});


    if (config.meta) {
      meta.version.data = fingerprint('list', rows.list);
      meta.requested_at = new Date();

      // not sure if this one needs a next cursor
      // Object.assign(meta, newCursor(meta));

      results = {meta: meta, data: rows.list};
    } else {
      results = rows.list
    }

    resolve(results);
  });

}

module.exports.search = search;












function entity(html, config, meta={}) {
  var results;

  if (config.meta) {
    Object.assign(meta, {version: {cache: fingerprint('entity', html)}});
  }

  var fields = {
    Name: 'name',
    "Entity ID": 'id',
    "Registered Effective Date": 'registered_effective_date',
    "Period of Existence": "period_of_existence",
    "Status": "status",
    "Status Date": 'status_date',
    "Entity Type": 'entity_type',
    "Annual Report Requirements": 'annual_report_requirements',
    "Certificates of Newly-elected Officers/Directors": "newly_elected_officers",
    "Old Names": "old_names",
    "Annual Reports": "annual_reports",
    "Principal Office": "principal_office",
    "Registered Agent Office": "registered_agent",
    "'Chronology": "chronology"
  }

  var ignoranceRules = requireJSON(path.join(__dirname, 'entity', 'ignore'));
  var ignorance = ignorant(ignoranceRules);
  var transitions = requireJSON(path.join(__dirname, 'entity', 'transitions'));
  var modulator = sway(transitions);
  var context = {state: 'scan', parser: 'none', headers: []};

  //config.verbose = true;

  return new Promise((resolve) => {
    var entity = html.split("\n").reduce((obj, raw, index) => {

      var line = raw.trim();

      if (ignorance(line)) {
        line = line.replace('<td>', '').replace('</td>', '').trim();

        var modulations = modulator(context.state, line);
      
        if (config.verbose) {
	  //console.log('.......................................................')
	  //console.log('raw:');
	  //console.log(raw);
	  console.log(context.state, line);
          //console.log('state:',context.state);

          if (modulations.length > 0) {
            console.log('.......................................................')
            console.log('modulations');
            console.log('.......................................................')
            console.log(modulations);
          }
        }

        var changes = modulations.filter((modulation) => {
          return Object.keys(modulation).indexOf('sets') > -1
        });

        var actions = modulations.filter((modulation) => {
          return Object.keys(modulation).indexOf('action') > -1
        });

        while(changes.length > 0) {
          var change = changes.shift();
          Object.assign(context, cp(change.sets));
	}

	while(actions.length > 0) {
	  var modulation = actions.shift();

	  if (modulation.action == 'gather_name') {
            obj.name = deglyph(line);
	  }

	  if (modulation.action == 'gather_key') {
            if (context.next_key == undefined) {
	      context.next_key = [];
	      context.next_value = [];
	    }
	 
	    if (line.indexOf('<br />') > -1) {
	      line = line.replace('<br />', '');
	    }
            
	    context.next_key.push(line);

	  }

	  if (modulation.action == 'gather_regex_data') {
	    var key = context.next_key.join(' ');
	    var matched = line.match(new RegExp(modulation.regex));
	    if (matched.groups != undefined) {
	      if (obj[fields[key]] == undefined) {
		obj[fields[key]] = matched.groups.value;
		delete context.next_key;
	      } else {
		obj[fields[key]].push(matched.groups.value);
	      }
	    }
	  }

	  if (modulation.action == 'gather_data') {
	    var key = context.next_key.join(' ');
	    if (obj[fields[key]] == undefined) {
	      obj[fields[key]] = [];
	    }

	    obj[fields[key]].push(line);
	  }

	  if (modulation.action == 'gather_data_end') {
	    var key = context.next_key.join(' ');
	    //console.log('gather_data_end:', key);

	    if (key == 'Registered Agent Office') {
              var name = obj[fields[key]].shift();
	      obj[fields[key]] = {
		name: name, 
		address: {
		  street: obj[fields[key]][0],
		  city: obj[fields[key]][1],
		  state: obj[fields[key]][3],
		  zip: obj[fields[key]][4]
		}
	      };
	    } else if (key == "Principal Office") {
	      obj[fields[key]] = {
		address: {
		  street: obj[fields[key]][0],
		  city: obj[fields[key]][1],
		  state: obj[fields[key]][3],
		  zip: obj[fields[key]][4]
		}
	      };

	      if (obj[fields[key]][5] != undefined) {
	        obj[fields[keys]].address.country = obj[fields[key]][5];
	      }
	    } else {
	      obj[fields[key]] = deglyph(obj[fields[key]].join(' ')).trim();
	    }
	    delete context.next_key;
	
	  }
	}

      }
      return obj;


    }, {});


    if (config.meta) {
      meta.version.data = fingerprint('entity', entity);
      meta.requested_at = new Date();

      results = {meta: meta, data: entity};
    } else {
      results = entity;
    }

    resolve(results);
  });

}

module.exports.entity = entity;
