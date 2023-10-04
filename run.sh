#!/bin/bash

# NAME="jmeter"
# JMETER_VERSION= ${JMETER_VERSION:-"latest"}
# IMAGE="justb4/jmeter:${JMETER_VERSION}"

# # Finally run
# docker run --rm --name ${NAME} -i -v ${PWD}:${PWD} -w ${PWD} ${IMAGE} $@

echo $@
docker run --rm --name sdh5 -i -v ${PWD}:${PWD} -w ${PWD} justb4/jmeter:5.5 $@