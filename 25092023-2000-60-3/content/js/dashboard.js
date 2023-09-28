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

    var data = {"OkPercent": 99.8990030021126, "KoPercent": 0.10099699788740224};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3900337274378266, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [5.842096478050409E-4, 500, 1500, "Get featured list by id"], "isController": false}, {"data": [0.0, 500, 1500, "Featured creators  - /users/feature/creator "], "isController": false}, {"data": [0.0, 500, 1500, "Get products by categoryId"], "isController": false}, {"data": [0.0, 500, 1500, "Products category  - products/digital/category/count"], "isController": false}, {"data": [0.008916666666666666, 500, 1500, "Featured list - products/digital/featured/list"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "Get cart  - /cart"], "isController": false}, {"data": [0.011916666666666667, 500, 1500, "Sign In Guest - /auth/guest/signin"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 107924, 109, 0.10099699788740224, 50392.61657277405, 0, 232013, 18328.5, 181404.50000000003, 186034.95, 205146.89, 35.177509132221395, 111.48840373096917, 14.988211195576213], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get featured list by id", 11982, 9, 0.07511266900350526, 89862.63812385265, 0, 107394, 91231.0, 96396.0, 98111.7, 99347.02, 4.986628245241228, 29.320023605147647, 3.581446908764929], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 6000, 4, 0.06666666666666667, 215086.4559999998, 0, 232013, 211636.0, 227617.0, 228502.75, 229688.93, 2.3048706141673483, 15.78237344435639, 1.5790434489238752], "isController": false}, {"data": ["Get products by categoryId", 23980, 74, 0.3085904920767306, 104101.1548373647, 0, 215159, 78880.5, 195617.80000000016, 206196.7, 208594.99, 8.420685952308297, 38.656427492161356, 6.1320663926139565], "isController": false}, {"data": ["Products category  - products/digital/category/count", 6000, 5, 0.08333333333333333, 25680.75799999998, 0, 30173, 25297.0, 27869.800000000003, 28253.95, 29091.949999999997, 2.411660862602857, 4.145754536710905, 1.6801669118019449], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 6000, 9, 0.15, 22598.53600000005, 0, 27090, 23460.0, 25982.7, 26180.75, 26550.96, 2.7128158848029864, 3.368927449949677, 1.8812110944053144], "isController": false}, {"data": ["Debug Sampler", 41962, 0, 0.0, 0.1521853105190399, 0, 58, 0.0, 1.0, 1.0, 1.0, 13.695960895913373, 28.309455583045267, 0.0], "isController": false}, {"data": ["Get cart  - /cart", 6000, 4, 0.06666666666666667, 26242.428666666692, 375, 30563, 26387.0, 28244.9, 28814.95, 29360.989999999998, 2.4084846095826378, 2.476773615593011, 1.6104122226780502], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 6000, 4, 0.06666666666666667, 21306.24499999995, 373, 40906, 23205.0, 25369.9, 26073.95, 28916.909999999974, 2.7489305514767026, 4.46917048615295, 1.5816354916943354], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 47, 43.11926605504587, 0.04354916422667803], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 41, 37.61467889908257, 0.03798969645305956], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ec2-54-173-30-112.compute-1.amazonaws.com:8888 [ec2-54-173-30-112.compute-1.amazonaws.com/54.173.30.112] failed: Connection timed out: connect", 13, 11.926605504587156, 0.01204551350950669], "isController": false}, {"data": ["401/Unauthorized", 8, 7.339449541284404, 0.007412623698157963], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 107924, 109, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 47, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 41, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ec2-54-173-30-112.compute-1.amazonaws.com:8888 [ec2-54-173-30-112.compute-1.amazonaws.com/54.173.30.112] failed: Connection timed out: connect", 13, "401/Unauthorized", 8, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get featured list by id", 11982, 9, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 6, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 3, "", "", "", "", "", ""], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 6000, 4, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Get products by categoryId", 23980, 74, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 34, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 31, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ec2-54-173-30-112.compute-1.amazonaws.com:8888 [ec2-54-173-30-112.compute-1.amazonaws.com/54.173.30.112] failed: Connection timed out: connect", 9, "", "", "", ""], "isController": false}, {"data": ["Products category  - products/digital/category/count", 6000, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 6000, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 4, "401/Unauthorized", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get cart  - /cart", 6000, 4, "401/Unauthorized", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 6000, 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to ec2-54-173-30-112.compute-1.amazonaws.com:8888 [ec2-54-173-30-112.compute-1.amazonaws.com/54.173.30.112] failed: Connection timed out: connect", 4, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
