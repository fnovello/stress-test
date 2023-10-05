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


T_DIR=reports
while getopts n:t:r:l: flag
do
    case "${flag}" in
        n) name=${OPTARG};;
        t) threads=${OPTARG};;
        r) rampup=${OPTARG};;
        l) loops=${OPTARG};;
    esac
done

if [ -z "${name}" ];
then
     prefix_folder_report=$(date +%d%m%Y)
else
      prefix_folder_report=$(date +%d%m%Y)${name}
fi

export THREADS=$threads
export RAMPUP=$rampup
export LOOPS=$loops

name_test="1-Scenario-Home-and-discover-nogui"
name_folder_report=$prefix_folder_report 

# Reporting dir: start fresh
# R_DIR=${T_DIR}/${date}
# rm -rf ${R_DIR} > /dev/null 2>&1
# mkdir -p ${R_DIR}
echo "--------------------------------------------------------"

echo ${PWD}

folder=${T_DIR}/${name_folder_report}-${THREADS}-${RAMPUP}-${LOOPS}
rm -rf ${folder}  > /dev/null 2>&1
# mkdir ${T_DIR}/${folder}
mkdir ${folder}
chmod +777 ${folder}

./run.sh -JTHREADS=${THREADS} -JRAMPUP=${RAMPUP} \
	-JLOOPS=${LOOPS} \
	-n -t ${PWD}/${name_test}.jmx -l ${PWD}/${folder}/${folder}.jtl \
	-e -o ${PWD}/${folder}

echo "--------------------------------------------------------"