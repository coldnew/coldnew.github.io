#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = 'http://coldnew.github.io'
RELATIVE_URLS = False

DELETE_OUTPUT_DIRECTORY = True

# Google Analytics
GOOGLE_ANALYTICS = 'UA-42122243-1'

# Extra plugins for optimize output

PLUGINS = [
    # ...
    'minify', # pelican-minify
    # ...
    "optimize_images",
]