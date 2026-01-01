@echo off
echo CHECKING REMOTE... > push_debug.txt
git remote -v >> push_debug.txt 2>&1
echo. >> push_debug.txt
echo CHECKING STATUS... >> push_debug.txt
git status >> push_debug.txt 2>&1
echo. >> push_debug.txt
echo ATTEMPTING PUSH... >> push_debug.txt
git push origin main >> push_debug.txt 2>&1
echo. >> push_debug.txt
echo DONE >> push_debug.txt
