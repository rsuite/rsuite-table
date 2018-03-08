#!/bin/bash

nrm use hypers
npm unpublish rsuite-table@3.0.0-next.3
npm run build
npm publish
