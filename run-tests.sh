#!/bin/bash

echo `whoami`
git pull
npm run test:all
npm run generate-test-report
npm run publish-test-report
