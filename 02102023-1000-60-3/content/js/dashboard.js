/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.65437788018433, "KoPercent": 0.3456221198156682};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.41541548981715476, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.03811997319034852, 500, 1500, "Get featured list by id"], "isController": false}, {"data": [0.0115, 500, 1500, "Featured creators  - /users/feature/creator "], "isController": false}, {"data": [0.035301507537688445, 500, 1500, "Get products by categoryId"], "isController": false}, {"data": [0.024666666666666667, 500, 1500, "Products category  - products/digital/category/count"], "isController": false}, {"data": [0.09983333333333333, 500, 1500, "Featured list - products/digital/featured/list"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.03133333333333333, 500, 1500, "Get cart  - /cart"], "isController": false}, {"data": [0.099, 500, 1500, "Sign In Guest - /auth/guest/signin"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 53816, 186, 0.3456221198156682, 4716.941560130817, 0, 20482, 2432.5, 11286.0, 15947.95, 18170.980000000003, 133.8889649081342, 426.5917668695344, 61.15960361492244], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get featured list by id", 5968, 26, 0.435656836461126, 8091.645777479904, 22, 10585, 9182.0, 9834.0, 10018.55, 10287.790000000005, 16.80624940158713, 98.62249427811696, 12.941954303785348], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 3000, 37, 1.2333333333333334, 16576.627000000033, 0, 20482, 18429.0, 19602.0, 19785.0, 20170.85, 8.208293659913977, 55.766008865983196, 6.001123039927877], "isController": false}, {"data": ["Get products by categoryId", 11940, 62, 0.5192629815745393, 9751.308793969789, 14, 19776, 9151.5, 18331.0, 18764.0, 19186.77, 30.750608444827897, 141.44357861332526, 24.018661389185777], "isController": false}, {"data": ["Products category  - products/digital/category/count", 3000, 15, 0.5, 3201.8473333333263, 0, 4339, 3445.5, 3888.0, 3988.8999999999996, 4119.99, 8.112602928649657, 13.9565687365635, 6.0697956384618506], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 3000, 16, 0.5333333333333333, 2979.7143333333397, 8, 4206, 3428.5, 3879.0, 3965.0, 4098.969999999999, 8.987309918395226, 11.1521954827908, 6.706510875393945], "isController": false}, {"data": ["Debug Sampler", 20908, 0, 0.0, 0.19705375932657312, 0, 87, 0.0, 1.0, 1.0, 1.0, 52.40257852366487, 110.58896978104605, 0.0], "isController": false}, {"data": ["Get cart  - /cart", 3000, 15, 0.5, 3168.0259999999967, 13, 4221, 3399.0, 3846.0, 3939.95, 4043.99, 8.157915489434139, 8.391858056179485, 5.882502371743972], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 3000, 15, 0.5, 3780.864666666667, 14, 5465, 4439.5, 4972.0, 5060.0, 5220.0, 9.066210535541057, 15.260141099512238, 5.503653139817588], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 29, 15.591397849462366, 0.05388731975620633], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 127, 68.27956989247312, 0.23598929686338635], "isController": false}, {"data": ["401/Unauthorized", 30, 16.129032258064516, 0.05574550319607552], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 53816, 186, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 127, "401/Unauthorized", 30, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 29, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get featured list by id", 5968, 26, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 26, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 3000, 37, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 23, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 14, "", "", "", "", "", ""], "isController": false}, {"data": ["Get products by categoryId", 11940, 62, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 62, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Products category  - products/digital/category/count", 3000, 15, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 3000, 16, "401/Unauthorized", 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get cart  - /cart", 3000, 15, "401/Unauthorized", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 3000, 15, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 15, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
