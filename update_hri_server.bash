#!/usr/bin/env bash

rsync -v ./config.txt nrabb@hrilab.tufts.edu:./projects/na-robot-study
rsync -rv ./static nrabb@hrilab.tufts.edu:./projects/na-robot-study
rsync -rv ./templates nrabb@hrilab.tufts.edu:./projects/na-robot-study
rsync -v ./update_vm.bash nrabb@hrilab.tufts.edu:./projects/na-robot-study
