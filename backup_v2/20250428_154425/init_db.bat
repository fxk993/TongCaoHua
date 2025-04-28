@echo off
echo 正在初始化数据库...
mysql -u root -p123456 < init.sql
echo 数据库初始化完成！
pause 