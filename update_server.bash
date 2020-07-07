#!/usr/bin/env bash

scp quinnpham@192.168.0.154:./psiturkstudies/enigma-puzzle/participants.db ./participants.db.server.backup
scp ./data_parser.py quinnpham@192.168.0.154:./psiturkstudies/enigma-puzzle
scp ./config.txt quinnpham@192.168.0.154:./psiturkstudies/enigma-puzzle
scp -r ./static quinnpham@192.168.0.154:./psiturkstudies/enigma-puzzle
scp -r ./templates quinnpham@192.168.0.154:./psiturkstudies/enigma-puzzle
