#!/bin/bash
cd /home/kavia/workspace/code-generation/trivia-challenge-87628-87641/quickquiz_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

