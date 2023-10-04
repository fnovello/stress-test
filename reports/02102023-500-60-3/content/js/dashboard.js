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

    var data = {"OkPercent": 99.50805008944543, "KoPercent": 0.4919499105545617};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5946258199165176, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.22224091520861372, 500, 1500, "Get featured list by id"], "isController": false}, {"data": [0.11166666666666666, 500, 1500, "Featured creators  - /users/feature/creator "], "isController": false}, {"data": [0.2193808882907133, 500, 1500, "Get products by categoryId"], "isController": false}, {"data": [0.6073333333333333, 500, 1500, "Products category  - products/digital/category/count"], "isController": false}, {"data": [0.6156666666666667, 500, 1500, "Featured list - products/digital/featured/list"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.604, 500, 1500, "Get cart  - /cart"], "isController": false}, {"data": [0.44433333333333336, 500, 1500, "Sign In Guest - /auth/guest/signin"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 26832, 132, 0.4919499105545617, 1290.9732781753048, 0, 7539, 806.0, 3819.9000000000015, 5788.950000000001, 6625.0, 121.66610742819832, 387.40216396947466, 55.46574155446], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get featured list by id", 2972, 12, 0.4037685060565276, 2310.536002691795, 22, 4041, 2862.0, 3626.7000000000003, 3761.7, 3917.0, 15.3336566540434, 89.99686850241459, 11.811739637399263], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 1500, 28, 1.8666666666666667, 4250.400666666674, 0, 7539, 5355.5, 6519.0, 7083.8, 7373.97, 7.763653678936691, 52.51480916939257, 5.639647426607594], "isController": false}, {"data": ["Get products by categoryId", 5944, 35, 0.5888290713324361, 2647.371298788705, 15, 7503, 2382.5, 5777.5, 6353.0, 7135.55, 28.9667204350856, 133.23024494124056, 22.609481831228894], "isController": false}, {"data": ["Products category  - products/digital/category/count", 1500, 14, 0.9333333333333333, 926.213999999999, 0, 1711, 1135.5, 1424.0, 1494.95, 1598.96, 7.71962328238382, 13.291251334851525, 5.750616765735165], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 1500, 14, 0.9333333333333333, 856.561333333333, 8, 1690, 978.0, 1384.9, 1456.8500000000001, 1595.98, 7.966815557597422, 9.877969547511432, 5.929354346030666], "isController": false}, {"data": ["Debug Sampler", 10416, 0, 0.0, 0.19479646697388614, 0, 47, 0.0, 1.0, 1.0, 1.0, 47.94035071569936, 101.21804001789248, 0.0], "isController": false}, {"data": ["Get cart  - /cart", 1500, 15, 1.0, 934.7633333333328, 13, 1700, 1147.0, 1426.9, 1499.95, 1607.99, 7.7449735121905885, 7.976445357275628, 5.5638608967259415], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 1500, 14, 0.9333333333333333, 1055.0460000000005, 14, 2202, 1203.5, 1692.0, 1796.0, 1996.99, 7.950263153710387, 13.405913852936033, 4.783159885092196], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 27, 20.454545454545453, 0.10062611806797854], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 77, 58.333333333333336, 0.28697078115682767], "isController": false}, {"data": ["401/Unauthorized", 28, 21.21212121212121, 0.10435301132975551], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 26832, 132, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 77, "401/Unauthorized", 28, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 27, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get featured list by id", 2972, 12, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 1500, 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 15, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["Get products by categoryId", 5944, 35, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 35, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Products category  - products/digital/category/count", 1500, 14, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 1500, 14, "401/Unauthorized", 14, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get cart  - /cart", 1500, 15, "401/Unauthorized", 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 1500, 14, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 14, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
