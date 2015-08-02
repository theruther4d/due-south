"use strict";

var campaignUids = require('./campaigns');

module.exports = function() {
  edh.widgets.initModal('pageSearchWidget', 'PageSearch', {
    country: 'us',
    campaignUids: campaignUids
  });

  edh.widgets.renderWidget('topTeams', 'TeamLeaderboard', {
    campaignUids: campaignUids,
    limit: 5,
    pageSize: 5
  });

  edh.widgets.renderWidget('topIndividuals', 'Leaderboard', {
    campaignUids: campaignUids,
    limit: 5,
    pageSize: 5
  });
};

