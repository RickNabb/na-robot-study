#!/usr/bin/env bash

rsync ./config.txt nrabb@hrilab.tufts.edu:./projects/na-robot-study
rsync -r ./static nrabb@hrilab.tufts.edu:./projects/na-robot-study
rsync -r ./templates nrabb@hrilab.tufts.edu:./projects/na-robot-study
