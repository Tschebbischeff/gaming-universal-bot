@ECHO OFF
git add .
git commit -m %1
git push origin dev
git push origin dev:master