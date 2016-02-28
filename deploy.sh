#!/bin/bash

# generate clojurescript js
(
    cd themes/next/utils/
    boot prod
)

# generate hexo blog
hexo g
hexo deploy
