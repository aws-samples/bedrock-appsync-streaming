#!/bin/sh

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

echo
echo " ---- setup developer workspace ---- "
echo

# ----------------------------------------------
#  !IMPORTANT! DO NOT MODIFY BELOW THIS LINE
# ----------------------------------------------

force_install_venv=0
if [ $# -eq 1 ]; then
    if [ "$1" = "--force-virtual-env" -o "$1" = "-f" ]; then
        force_install_venv=1
        # remove the lock
        rm -rf ~/.setup_workspace.lock
    fi
    if [ "$1" = "--help" -o "$1" = "-h" ]; then
        echo "Usage: $0 [-f]"
        echo "  -f: force reinstall virtual environment"
        echo "  -h: help"
        echo
        exit 0
    fi
fi

if [ -f "$HOME/.setup_workspace.lock" ]; then
    echo "Workspace is already setup.  Please delete ~/.setup_workspace.lock to rerun setup."
    echo
    echo "👩‍💻👾👨‍💻 happy hacking! 👻(◣ _ ◢)👻"
    echo
    rm -rf /tmp/$$.*
    exit 0
else
    echo "Setup will take approximately 5-10 minutes.  Hang tight!"
    echo
fi

## check for all required CLI utilities, i.e. aws cli, zip
aws --version > /tmp/$$.aws.version.log 2>&1
if [ $? -ne 0 ]; then
  echo "aws cli not found.  Please install aws cli."
  echo "Error Log:"
  cat /tmp/$$.aws.version.log
  rm -rf /tmp/$$.*
  exit 1
fi

zip -h > /tmp/$$.zip.version.log 2>&1
if [ $? -ne 0 ]; then
  echo "zip command not found.  Please install zip."
  echo "Error Log:"
  cat /tmp/$$.zip.version.log
  rm -rf /tmp/$$.*
  exit 1
fi

PYTHON_BIN="python"
PIP_BIN="pip"
${PYTHON_BIN} --version > /tmp/$$.python.version.log 2>&1
if [ $? -ne 0 ]; then
  PYTHON_BIN="python3"
  PIP_BIN="pip3"
  ${PYTHON_BIN} --version > /tmp/$$.python.version.log 2>&1
  if [ $? -ne 0 ]; then
    echo "python or python3 command not found.  Please install python 3.12+"
    echo "Error Log:"
    cat /tmp/$$.python.version.log
    rm -rf /tmp/$$.*
    exit 2
  fi
fi

echo "Using python: ${PYTHON_BIN} version: `${PYTHON_BIN} --version`"
echo "Using pip: ${PIP_BIN} version: `${PIP_BIN} --version`"
echo "Using aws cli version: `aws --version`"
echo "All required build utilities found."

# ----------------------------------------------
#            Define common methods
# ----------------------------------------------

setupPythonVirtualEnvionment() {
    project_dir=${1}
    if [ ! -d "${project_dir}" ]; then
        echo "Error: ${project_dir} does not exist. Please make sure you have the correct path"
        rm -rf /tmp/$$.*
        exit 3
    fi

    project_name=`basename ${project_dir}`
    echo "${project_name}"
    echo "  installing python virtual environment"
    (
        cd $project_dir
        # if force_install_venv or .venv doesn't exist, install venv
        if [ $force_install_venv -eq 1 -o ! -d ".venv" ]; then
            rm -rf .venv
            ${PYTHON_BIN} -m venv .venv
        fi

        . .venv/bin/activate
        if [ -f "requirements.txt" ]; then
            ${PIP_BIN} install -r requirements.txt
        fi
        deactivate
    ) > "/tmp/$$.venv.${project_name}.log" 2>&1
    if [ $? -ne 0 ]; then
        echo "Error setting up python virtual environment.  Error Log:"
        cat "/tmp/$$.venv.${project_name}.log"
        rm -rf /tmp/$$.*
        exit 3
    fi
    echo "    done!"
}

buildSdk() {
    sdk_dir=${1}
    if [ ! -d "${sdk_dir}" ]; then
        echo "Error: ${sdk_dir} does not exist. Please make sure you have the correct path"
        rm -rf /tmp/$$.*
        exit 3
    fi

    if [ ! -d "${sdk_dir}/.venv" ]; then
        echo "Error: python virtual environment not installed.  .venv folder is missing"
        rm -rf /tmp/$$.*
        exit 3
    fi

    project_name=`basename ${sdk_dir}`
    echo "  building sdk ${project_name}"
    (
        cd $sdk_dir
        . .venv/bin/activate
        ${PYTHON_BIN} -m pip install --upgrade build
        ${PYTHON_BIN} -m build
        deactivate
    ) > "/tmp/$$.sdk.${project_name}.log" 2>&1
    if [ $? -ne 0 ]; then
        echo "Error building sdk.  Error Log:"
        cat "/tmp/$$.sdk.${project_name}.log"
        rm -rf /tmp/$$.*
        exit 4
    fi
    echo "    done!"
}

buildProject() {
    project_dir=${1}
    if [ ! -d "${project_dir}" ]; then
        echo "Error: ${project_dir} does not exist. Please make sure you have the correct path"
        rm -rf /tmp/$$.*
        exit 3
    fi

    if [ ! -d "${project_dir}/.venv" ]; then
        echo "Error: python virtual environment not installed.  .venv folder is missing"
        rm -rf /tmp/$$.*
        exit 3
    fi

    if [ ! -f "${project_dir}/build.sh" ]; then
        echo "Error: build.sh not found in ${project_dir}"
        rm -rf /tmp/$$.*
        exit 3
    fi

    project_name=`basename ${project_dir}`
    echo "  building project ${project_name}"
    (
        cd ${project_dir}
        ./build.sh
    ) > "/tmp/$$.project.${project_name}.log" 2>&1
    if [ $? -ne 0 ]; then
        echo "Error building sdk.  Error Log:"
        cat "/tmp/$$.project.${project_name}.log"
        rm -rf /tmp/$$.*
        exit 4
    fi
    echo "    done!"
}

# ----------------------------------------------
#            Start workspace setup
# ----------------------------------------------

echo

setupPythonVirtualEnvionment "common"
buildSdk "common"


# setup projects - order doesn't matter

setupPythonVirtualEnvionment "blueprint-appsync-api"
setupPythonVirtualEnvionment "blueprint-appsync-ds-lambda"
setupPythonVirtualEnvionment "blueprint-appsync-kendra-rag-lambda"


# ----------------------------------------------
#           Finish workspace setup
# ----------------------------------------------

# create ~/.aws folder with credentails file template
if [ ! -d ~/.aws ]; then
    mkdir -p ~/.aws
fi
rm -rf ~/.aws/credentials
cat <<EOF > ~/.aws/credentials
[default]
aws_access_key_id=
aws_secret_access_key=
aws_session_token=
EOF

# clean-up
rm -rf /tmp/$$.*

# create a lock file so we don't end up executing this script
touch "$HOME/.setup_workspace.lock"

# all done!
echo
echo "Workspace setup complete!"
echo
echo "👩‍💻👾👨‍💻 happy hacking! 👻(◣ _ ◢)👻"
echo
