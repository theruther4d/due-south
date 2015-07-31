"use strict";

var campaignUids = require('./campaigns');

module.exports = function() {
  edh.widgets.renderWidget('fundsRaisedProgress', 'EntityGoalProgress', {
    campaignUid: campaignUids,
    goal: 20000000
  });

  edh.widgets.renderWidget('ShareButtonWidget', 'ShareButton');

  edh.widgets.renderWidget('TotalDonationsWidget', 'TotalDonations', {
    campaignUids: campaignUids,
    renderIcon: false
  });

  edh.widgets.renderWidget('TotalSupportersWidget', 'TotalSupporters', {
    campaignUids: campaignUids,
    renderIcon: false
  });

  edh.widgets.renderWidget('CountdownWidget', 'CountDown', {
    date: "2017-04-24"
  });
};
