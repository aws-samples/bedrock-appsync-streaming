#!/bin/sh

# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

## Change variables as necessary
module_name=$(grep '^name' pyproject.toml | sed -e 's/.*"\(.*\)"[
\r]*/\1/g')
module_version=$(grep '^version' pyproject.toml | sed -e 's/.*"\(.*\)"[\n\r]*/\1/g')

## !IMPORTANT! DO NOT MODIFY BELOW THIS LINE

## check for all required CLI utilities, i.e. aws cli, zip
zip -h >/tmp/$$.zip.version.log 2>&1
if [ $? -ne 0 ]; then
    echo "zip command not found.  Please install zip."
    exit 1
fi

PYTHON_BIN="python"
PIP_BIN="pip"
${PYTHON_BIN} --version >/tmp/$$.python.version.log 2>&1
if [ $? -ne 0 ]; then
    PYTHON_BIN="python3"
    PIP_BIN="pip3"
    ${PYTHON_BIN} --version >/tmp/$$.python.version.log 2>&1
    if [ $? -ne 0 ]; then
        echo "python or python3 command not found.  Please install python 3.12+"
        rm -rf /tmp/$$.*
        exit 2
    fi
fi

echo "Using python: ${PYTHON_BIN}"
echo "Using pip: ${PIP_BIN}"
echo "All required build utilities found."

WORKING_DIR="$(pwd)"

# show some stats
echo
echo "Environment Variables:"
echo "WORKING_DIR: ${WORKING_DIR}"
echo

## module level variables
module_build="build"
module_dist="${module_build}/dist"
module_zip="${module_build}/compressed"

## create distribution zip

# empty module_dist folder
echo "cleaning dist and compressed folders"
rm -rf "${module_dist}"
mkdir -p "${module_dist}" >/tmp/$$.mkdir_dist.log 2>&1
mkdir -p "${module_zip}" >/tmp/$$.mkdir_zip.log 2>&1

# copy src folder to dist and remove __pycache__ folders
cp requirements.txt "${module_dist}"
(
    cd src
    tar cf - . | (cd "${WORKING_DIR}/${module_dist}" && tar xf -) >/tmp/$$.tar.log 2>&1
    if [ $? -ne 0 ]; then
        echo "tar command failed to copy src folder to ${module_dist}: $?"
        echo "tar logs:"
        cat /tmp/$$.tar.log
        rm -rf /tmp/$$.*
        exit 2
    fi
)

# remove __pycache__ folders
(
    cd "${module_dist}"
    find . -type d -name "__pycache__" -exec rm -rf {} \; >/tmp/$$.find.log 2>&1
)

# distribution zip file name relative to WORKING_DIR
dist_name_zip="${module_name}-${module_version}.zip"
rm -rf "${WORKING_DIR}/${module_zip}/${dist_name_zip}"

# compress dist - add src folder into new zip file ${dist_name_zip}
echo "packaging source code in zip: WORKING_DIR/${module_zip}/${dist_name_zip}"
(
    cd "${module_dist}"
    zip -9r "${WORKING_DIR}/${module_zip}/${dist_name_zip}" . >/tmp/$$.zip.log 2>&1
    if [ $? -ne 0 ]; then
        echo "zip command failed ${WORKING_DIR}/${module_zip}/${dist_name_zip}: $?"
        echo "zip logs:"
        cat /tmp/$$.zip.log
        rm -rf /tmp/$$.*
        exit 2
    fi
)
if [ $? -ne 0 ]; then
    rm -rf /tmp/$$.*
    exit 2
fi

# install requirements into dist folder
echo "installing dependencies into dist folder"
(
    cd "${module_dist}"
    ${PYTHON_BIN} -m venv virtual_env
    . ./virtual_env/bin/activate
    # remove boto references from requirements.txt
    sed '/^boto3/d' requirements.txt >requirements.txt.tmp
    mv requirements.txt.tmp requirements.txt
    # if line starts with ../../ replace with  ../../../../
    sed 's|^\.\./\.\./|\.\./\.\./\.\./\.\./|g' requirements.txt >requirements.txt.tmp
    mv requirements.txt.tmp requirements.txt
    cat requirements.txt
    # install deps
    ${PIP_BIN} install -r requirements.txt
    deactivate
) >/tmp/$$.pyvenv.log 2>&1

if [ $? -ne 0 ]; then
    echo "failed to install dependencies into dist folder: $?"
    echo "logs:"
    cat /tmp/$$.pyvenv.log
    rm -rf /tmp/$$.*
    exit 2
fi

# compress dist - add site-packages folder into existing zip file ${dist_name_zip}
echo "adding dependencies in zip: WORKING_DIR/${module_zip}/${dist_name_zip}"
(
    cd "${module_dist}"
    python_version="$(${PYTHON_BIN} -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
    cd "virtual_env/lib/python${python_version}/site-packages"
    zip -9r "${WORKING_DIR}/${module_zip}/${dist_name_zip}" . >/tmp/$$.zip.log 2>&1
    if [ $? -ne 0 ]; then
        echo "zip command failed ${WORKING_DIR}/${module_zip}/${dist_name_zip}: $?"
        echo "zip logs:"
        cat /tmp/$$.zip.log
        rm -rf /tmp/$$.*
        exit 2
    fi
)
if [ $? -ne 0 ]; then
    exit 2
fi

## clean up
rm -rf /tmp/$$.*
echo "done!"
