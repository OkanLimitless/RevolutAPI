#!/bin/bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch certs/*" \
  --prune-empty --tag-name-filter cat -- --all 