@echo off
echo STARTING DEBUG > debug_log.txt
echo PATH: %PATH% >> debug_log.txt
git --version >> debug_log.txt 2>&1
echo DONE >> debug_log.txt
