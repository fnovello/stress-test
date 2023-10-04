#!/bin/bash
#
# Test the JMeter Docker image using a trivial test plan.

# Example for using User Defined Variables with JMeter
# These will be substituted in JMX test script
# See also: http://stackoverflow.com/questions/14317715/jmeter-changing-user-defined-variables-from-command-line
# export TARGET_HOST="www.map5.nl"
# export TARGET_PORT="80"
# export TARGET_PATH="/kaarten.html"
# export TARGET_KEYWORD="Kaartdiensten"
export THREADS="5"
export RAMPUP="60"
export LOOPS="1"


T_DIR=reports
name="1-Scenario-Home-and-discover-nogui"
date="04102023"
# Reporting dir: start fresh
# R_DIR=${T_DIR}/report
# rm -rf ${R_DIR} > /dev/null 2>&1
# mkdir -p ${R_DIR}
echo ${PWD}
echo "--------------------------------------------------------"
rm -rf ${T_DIR}/${date}-${THREADS}-${RAMPUP}-${LOOPS}  > /dev/null 2>&1
folder=${T_DIR}/${date}-${THREADS}-${RAMPUP}-${LOOPS}
mkdir ${T_DIR}/${folder}
chmod +777 ${T_DIR}

./run.sh -JTHREADS=${THREADS} -JRAMPUP=${RAMPUP} \
	-JLOOPS=${LOOPS} \
	-n -t ${PWD}/${name}.jmx -l ${PWD}/${folder}/${folder}.jtl \
	-e -o ${PWD}/${folder}

# -n -t ${pwd}/${name}.jmx -l ${pwd}/${name}.jtl -j ${date}-${THREADS}-${RAMPUP}-${LOOPS}/jmeter.log \

# echo "==== jmeter.log ===="
# cat ${T_DIR}/jmeter.log

# echo "==== Raw Test Report ===="
# cat ${T_DIR}/test-plan.jtl

# echo "==== HTML Test Report ===="
# echo "See HTML test report in ${R_DIR}/index.html"
