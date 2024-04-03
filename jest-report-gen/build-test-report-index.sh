#!/bin/bash

tree html-report -L 2 -Jdr --noreport -o jest-report-gen/tree.json
hbs --data jest-report-gen/tree.json jest-report-gen/index.hbs -o html-report
