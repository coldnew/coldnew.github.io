#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'Yen-Chin,Lee'
SITENAME = u"coldnew's blog"
SITEURL = 'http://localhost:3000'

PATH = 'content'

TIMEZONE = 'Asia/Taipei'

DEFAULT_LANG = u'zh_TW'

# Feed  setup
CATEGORY_FEED_ATOM = None
CATEGORY_FEED_RSS = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# set default feed here for backward compability
FEED_ALL_ATOM = 'atom.xml'
FEED_ALL_RSS = 'rss.xml'

TAG_FEED_ATOM = 'tag/%s.atom.xml'
TAG_FEED_RSS = 'tag/%s.rss.xml'

TRANSLATION_FEED_ATOM = 'feeds/all-%s.atom.xml'
TRANSLATION_FEED_RSS = 'feeds/all-%s.rss.xml'

# backward compability with blogit
ARTICLE_URL = 'blog/{date:%Y}/{date:%m}/{date:%d}_{slug}.html'
ARTICLE_SAVE_AS = 'blog/{date:%Y}/{date:%m}/{date:%d}_{slug}.html'

# Blogroll
LINKS = (('Pelican', 'http://getpelican.com/'),
         ('Org-mode', 'http://orgmode.org/'),
         ('emacs-blogit', 'https://github.com/coldnew/emacs-blogit'),
         ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = 10

# Uncomment following line if you want document-relative URLs when developing
RELATIVE_URLS = True

# theme path note that I do not set THEME_STATIC_PATHS here, since all file will
# be generate by gulp
THEME = "theme"
THEME_STATIC_PATHS = []
DEFAULT_CATEGORY = 'misc';

# File paths
STATIC_PATHS = [ 'data' ]

#READERS = {'html': None}

# prevent static source not include html
STATIC_EXCLUDE_SOURCES = False

## Some plugins not list here, use pip to install
PLUGIN_PATHS = ['plugins', 'plugins/pelican-plugins']
PLUGINS = []

# Social widget
SOCIAL = (
    ('Bitbucket', 'https://bitbucket.org/coldnew'),
    ('GitHub', 'https://github.com/coldnew'),
    ('EMAIL', 'mailto:coldnew.tw@gmail.com'),
)

# Share
SHARE = True

# Disqus
DISQUS_SITENAME = 'coldnew'
DISQUS_LOAD_LATER = True

# License
CC_LICENSE = "CC-BY-NC"

# org-pelican
ORG_PELICAN_COPY_ORG_FILE = True
ORG_PELICAN_COPY_ORG_HTML_FILE = True
