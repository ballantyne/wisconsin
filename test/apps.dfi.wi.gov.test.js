process.env.NODE_ENV = 'test';

var path        = require('path');
var assert      = require('assert');

var fs = require('fs');

const {
  readFile
} = require(path.join(__dirname, '..', 'utils'));

var dfi = require(path.join(__dirname, '..', 'apps.dfi.wi.gov'));
var Parser = require(path.join(__dirname, '..', 'apps.dfi.wi.gov', 'parsers'));

//console.log(cofs);

describe('Wisconsin', () => {
  describe('Services', () => {
    describe('apps.dfi.wi.gov', () => {

      it('find', (done) => {
	var options = {cache: true, meta: true};
	dfi.find('H033986', options).then((list) => {
	  //console.log(list);
	  assert.equal(list.data.id, 'H033986')
	  done();
	}).catch(console.log);
      });

      it('find', (done) => {
	var options = {cache: true, meta: true};
	dfi.find('1B06889', options).then((list) => {
	  //console.log(list);
	  assert.equal(list.data.id, '1B06889')
	  done();
	}).catch(console.log);
      });

      it('find', (done) => {
	var options = {cache: true, meta: true};
	dfi.find('E054974', options).then((list) => {
	  //console.log(list.data);
	  assert.equal(list.data.id, 'E054974')
	  done();
	}).catch(console.log);
      });


      it('find', (done) => {
	var options = {cache: true, meta: true};
	dfi.find('E039779', options).then((list) => {
	  //console.log(list.data);
	  assert.equal(list.data.id, 'E039779')
	  done();
	}).catch(console.log);
      });


      it('entities', (done) => {
	var options = {cache: true, meta: true, ttl: 60000};
	dfi.entities('cheese', options).then((list) => {
	  //console.log(list);
	  assert.equal(list.data[0].id, 'C030124')
	  done();
	}).catch(console.log);
      });

      it('agents', (done) => {
	var options = {cache: true, meta: true, ttl: 300000};
	dfi.agents('cheese', options).then((list) => {
	  //console.log(list);
	  assert.equal(list.data[0].name, '948 WISSOTA LLC')
	  done();
	}).catch(console.log);
      });
    });
  });
});


