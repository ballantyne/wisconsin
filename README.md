# wisconsin

This is a module to collect data scraping utilities related to wisconsin.  I am trying to use the same tools for various states so I can make a toolkit for scraping.  These test cases work.  I don't know about other test cases.  If you find one that doesn't work, make a ticket on github.

I'm going to put this on the wisconsin npm module name and see if people get mad or if they appreciate what I made.  If wisconsin wants their name back or if they want to maintain this code, that would be ok with me.


There might be a better way to look up companies by their id number.  If there is, I haven't thought of it.  I got as far as the addresses because it sounded like people were really interested in those.  Go ahead and add code to scrape the officers or the reports.  I haven't found a entry that lists the officers yet.

```javascript

var dfi = require('wisconsin/apps.dfi.wi.gov');

dfi.entities('cheese').then((theCheesiest) => { console.log(theCheesiest); })


```
