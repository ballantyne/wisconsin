const path = require('path');
const os = require('os');
const qs = require('querystring');

const {
  get,
  post,
  cp,
  construct,
  prepare,
  requireJSON
} = require('great-lakes');


var Parser = require(path.join(__dirname, 'parsers'));

var constructQuery = construct(requireJSON(path.join(__dirname, 'queries')));
var applyOptions = construct(requireJSON(path.join(__dirname, 'defaults')));


const paths = {
  advanced: '/apps/CorpSearch/Advanced.aspx',
  results: '/apps/CorpSearch/Results.aspx'
}





function search(query, config) {
  return new Promise(async(resolve, reject) => {
    if (typeof query == 'string') {
      query = constructQuery('default', {q: query})
    }

    var options = applyOptions('default', 'get');
    options.path = [paths.results, qs.stringify(query)].join('?');   

    config.signature = {options: options, function: 'search', query: query};
    
    var cache = await prepare(config);
    var cached = config.cache && cache.missed == false;

    if (cached == true) {
      var response = JSON.parse(cache.data);
    } else {
      var response = await get(options, config).catch(console.log);
      if (config.cache && cache.missed) {
	await cache.write(JSON.stringify(response));
      }
    } 

    var list = await Parser.search(response.body, config, {query: query}).catch(console.log);

    if (config.meta && config.response) {
      list.response = response
    }

    resolve(list);
  })
}
module.exports.search = search;







function entities(query, config) {
  if (typeof query == 'string') {
    query = constructQuery('default', 'entities', {q: query})
  }

  return search(query, config);
}
module.exports.entities = entities;






function agents(query, config) {
  if (typeof query == 'string') {
    query = constructQuery('default', 'agents', {q: query})
  }

  return search(query, config);
}
module.exports.agents = agents;









function find(query, config) {
  if (typeof query == 'string') {
    query = constructQuery('default', 'entities', {q: query})
  }

  var initial = cp(config);

  return new Promise(async(resolve, reject) => {
    config.signature = {options: options, function: 'find', query: query};

    var cache = await prepare(config);
    var cached = config.cache && cache.missed == false;

    if (cached == true) {
      var response = JSON.parse(cache.data);
    } else {
      var results = await search(query, cp(initial));

      var entity = config.meta ? results.data[0] : results[0];
      
      var options = applyOptions('default', 'get');
      options.path = entity.url.replace('https://apps.dfi.wi.gov', '');
      var response = await get(options, cp(initial)).catch(console.log);
      if (config.cache && cache.missed) {
	await cache.write(JSON.stringify(response));
      }
    } 

    //console.log('parsing');
    var entity = await Parser.entity(response.body, config, {}).catch(console.log)
    //console.log('entity', entity);

    //console.log(response);
    resolve(entity);
  });
}
module.exports.find = find;
