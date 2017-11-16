'use strict';

const signalFxLambda = require('signalfx-lambda');

exports.handler = signalFxLambda.wrapper((event, context, callback) => {
  signalFxLambda.helper.sendGauge('application.performance', 100, {'service':'rest-server'});
  callback();
});
