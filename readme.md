On docker

sudo ./main.sh -n cartasguest_a -t 1000 -r 60 -l 1

-Dlog_level.jmeter=DEBUG -n -t ${pwd}/1-Scenario-Home-and-discover.jmx -l rr.jtl  -e -o report

-Dlog_level.jmeter=DEBUG -n -t ${pwd}/1-Scenario-Home-and-discover.jmx -l /ddmmyyyy-threads-ramup-loops.jtl  -e -o /ddmmyyyy-threads-ramup-loops

-Dlog_level.jmeter=DEBUG -n -t ${pwd}/1-Scenario-Home-and-discover.jmx -l /ddmmyyyy-threads-ramup-loops.jtl  -e -o /ddmmyyyy-threads-ramup-loops

On ubuntu host

sudo ./jmeter -n -t /./stress-test/stress-test/1-Scenario-Home-and-discover-nogui.jmx -l /./stress-test/stress-test/02102023-10-60-2/02102023-10-60-2.jtl -e -o /./stress-test/stress-test/02102023-10-60-2

sudo ./jmeter -n -t /./stress-test/stress-test/1-Scenario-Home-and-discover-nogui.jmx -l /./stress-test/stress-test/03102023-1000-60-3/03102023-1000-60-3_2.jtl -e -o /./stress-test/stress-test/03102023-1000-60-3


http://52.201.236.69:8888/03102023-1000-60-2/index.html


wget https://jmeter-plugins.org/get/ -O /opt/apache-jmeter-5.5/lib/ext/jmeter-plugins-manager.jar

sudo wget https://jmeter-plugins.org/get/ -O /opt/apache-jmeter-5.5/lib/ext/jmeter-plugins-manager.jar

sudo wget https://jmeter-plugins.org/get/ /lib/ext

sudo systemctl restart apache2
systemctl enable apache2

wget https://repo1.maven.org/maven2/kg/apc/cmdrunner/2.2/cmdrunner-2.2.jar -P /opt/apache-jmeter-5.5/lib/

sudo java -cp /opt/apache-jmeter-5.5/lib/ext/jmeter-plugins-manager.jar org.jmeterplugins.repository.PluginManagerCMDInstaller


wget https://jmeter-plugins.org/get/ -O /opt/apache-jmeter-5.5.1/lib/ext/jmeter-plugins-manager.jar


sudo ./apache-jmeter-5.5/bin/jmeter -n -t 1-Scenario-Home-and-discover.jmx -l  02102023-10-60-2/jmeteroutput.csv

sudo ./jmeter -n -t ./stress-test/stress-test/1-Scenario-Home-and-discover.jmx -l  ./stress-test/stress-test/02102023-10-60-2/jmeteroutput.csv
sudo ./jmeter -n -t /./stress-test/stress-test/1-Scenario-Home-and-discover.jmx -l  /./stress-test/stress-test/C:\Users\Franco-PC\Desktop\testimageasdsad.png/jmeteroutput.csv