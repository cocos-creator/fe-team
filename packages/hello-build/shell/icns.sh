#!/bin/bash

# 执行脚本的目录
pwd=$(pwd)

logo="logo.png"

# 如果执行命令的时候没有指定 logo 文件，则让用户输入
if [ $1 ]
then
    logo=$1
    logoPath=$pwd/$1
else
    echo -n "Enter a logo file (default: $logo): "
    read logo

    if [ -z $logo ] 
    then
        logo="logo.png"
    fi

    logoPath=$pwd/$logo
fi    

# 判断文件是否存在
if test -e $logoPath
then
    echo "start creating the .icns file..."
else
    echo $logoPath "is not exist!!"
    exit 1  
fi    


# 从 logo 中获取名称
icnsName=$(basename "$logoPath")
icnsBaseName=$(echo "$icnsName" | cut -d'.' -f1)

# 定义图标大小列表
sizes=(16 32 64 128 256 512 1024)

tempDir=$pwd/icons.iconset
mkdir $tempDir

# 遍历图标大小列表，并执行命令
for size in "${sizes[@]}"; 
do    
    size2x=$((size * 2))
    name=icon_${size}x${size}
    sips -z $size $size $logoPath --out $tempDir/$name.png > /dev/null 2>&1
    sips -z $size2x $size2x $logoPath --out $tempDir/$name@2x.png > /dev/null 2>&1
done

# 创建 icns 文件
icns=$pwd/$icnsBaseName.icns
iconutil -c icns $tempDir -o $icns

# 将临时目录删除
rm -r $tempDir
echo $icns is created !!

open -R $icns


# 学习 shell
# https://www.bookstack.cn/read/bash-tutorial/docs-intro.md
# https://www.runoob.com/linux/linux-shell-process-control.html
