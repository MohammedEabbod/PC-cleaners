@echo off
git status > git_verify.txt 2>&1
echo --- >> git_verify.txt
git log -1 >> git_verify.txt 2>&1
echo --- >> git_verify.txt
git push >> git_verify.txt 2>&1
