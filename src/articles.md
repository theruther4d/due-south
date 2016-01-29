---
#=======================================
# This fetches articles from prismic
# and generates files for each of them
#=======================================
title: Articles
layout: article.hbs
permalink: false
prismic:
  articles:
    query: '[[:d = at(document.type, "articles")]]'
    collection: true
---
