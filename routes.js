/*
  routes.js

  This file is an optional place to specify additional routes to be handled by this provider's controller
  Documentation: http://koopjs.github.io/docs/specs/provider/
*/
module.exports = [
  {
    path: '/acled/live',
    methods: [ 'get', 'post' ],
    handler: 'getACLEDLive'
  }
  // possible more routes for historic data?
];
