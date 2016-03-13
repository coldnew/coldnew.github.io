#!/bin/bash

PID_BOOT=0
PID_HEXO=0

trap killgroup SIGINT

killgroup () {
    echo "killing boot and hexo daemon"
    kill $PID_BOOT
    kill $PID_HEXO
}

# generate clojurescript js
do_boot () {
    echo "start: boot dev"
    (
	cd themes/next/utils/
	boot dev
    ) &
    PID_BOOT=$!
}

do_hexo () {
    echo "start: hexo s --draft"
    # generate hexo blog
    hexo clean
    hexo s --draft &
    PID_HEXO=$!
}

do_boot
do_hexo

# wait for C-c
echo "Wait for C-c to kill all process..."
wait
