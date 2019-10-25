#!/bin/bash

# LOG
RED='\033[31m'
GREEN='\033[32m'
YELLOW='\033[33m'
NC='\033[0m'
# SYSTEM
if [[ "$(uname)" == 'Darwin' ]]; then
   	OS_NAME='darwin'
    IS_MAC='true'
else
   	OS_NAME=$( cat /etc/os-release | grep ^NAME | cut -d'=' -f2 | sed 's/\"//gI' )
   	if [[ "${OS_NAME}" != "Ubuntu" ]]; then
   		printf "\\n\\tUnsupported Linux Distribution. Exiting now.\\n\\n"
     	exit 1
   	fi
   	OS_NAME="ubuntu"
fi
# 路径
CURRENT_PATH=$(cd $(dirname ${BASH_SOURCE[0]});pwd)

pushd "${CURRENT_PATH}" &> /dev/null

EXTENSION_PATH="$(ls | grep .vsix)"
if [ -n "${IS_MAC}" ]; then
    VSCODE_PACKAGE_PATH="$(ls | grep .zip)"
    CODE_PATH='/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
else
    VSCODE_PACKAGE_PATH="$(ls | grep .deb)"
    CODE_PATH='/usr/share/code/bin/code'
fi
CODE_LINK_PATH='/usr/local/bin/code'

function _do() {
    $@ || { echo -e "${RED}Exec failed: $@${NC}"; exit -1;}
}

# 检查code命令
if [ ! `command -v code` ]; then
    if [ ! -e "${CODE_PATH}" ]; then
        # 安装vscode
        echo -e "\nInstalling vscode..."
        [ -e "${VSCODE_PACKAGE_PATH}" ] || { echo -e "${RED}Not found vscode package.${NC}"; exit -1;}
        if [ -n "${IS_MAC}" ]; then
            # mac，.zip解压移动
            _do unzip -o -q "${VSCODE_PACKAGE_PATH}"
            VSCODE_APP_PATH="Visual Studio Code.app"
            [ -e "${VSCODE_APP_PATH}" ] || VSCODE_APP_PATH="$(ls | grep .app)"
            [ -e "${VSCODE_APP_PATH}" ] || { echo -e "${RED}Not found vscode app.${NC}"; exit -1;}
            mv "${VSCODE_APP_PATH}" "/Applications/" || exit -1;
            CODE_PATH="/Applications/${VSCODE_APP_PATH}/Contents/Resources/app/bin/code"
        else
            # ubuntu，.deb，dpkg安装
            # echo -e "sudo dpkg -i vscode.deb"
            _do sudo dpkg -i "${VSCODE_PACKAGE_PATH}"
        fi
        sleep 1
    fi
    if [ ! `command -v code` ]; then
        echo -e "\nLinking code command line tool..."
        [ -e "${CODE_PATH}" ] || { echo -e "${RED}Not found code command line tool: ${CODE_PATH}.${NC}"; exit -1;}
        sudo ln -s "${CODE_PATH}" "${CODE_LINK_PATH}" || exit -1;
    fi
fi
# 安装插件
echo -e ""
[[ `code --version` == 1.3* ]] || { echo -e "${RED}Extension need VSCode 1.30.x or higher to install.\n${YELLOW}You can uninstall the existing VSCode and execute the script again.${NC}"; exit -1;}
_do code --install-extension "${EXTENSION_PATH}" --force
# _do code
echo -e "\n\t=========== Installed ===========\n"
echo -e "\\tFor more information:"
echo -e "\\tBeosin-VaaS website: https://beosin.com/vaas/index.html"
echo -e "\\tBeosin Tools website: https://beosin.com"
echo -e "\\tBeosin website: https://lianantech.com"

popd &> /dev/null