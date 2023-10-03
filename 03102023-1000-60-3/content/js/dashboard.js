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

    var data = {"OkPercent": 99.78297967057426, "KoPercent": 0.21702032942573082};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.43928995399910964, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.07286096256684492, 500, 1500, "Get featured list by id"], "isController": false}, {"data": [0.03, 500, 1500, "Featured creators  - /users/feature/creator "], "isController": false}, {"data": [0.06268793852322085, 500, 1500, "Get products by categoryId"], "isController": false}, {"data": [0.096, 500, 1500, "Products category  - products/digital/category/count"], "isController": false}, {"data": [0.15383333333333332, 500, 1500, "Featured list - products/digital/featured/list"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.09583333333333334, 500, 1500, "Get cart  - /cart"], "isController": false}, {"data": [0.13783333333333334, 500, 1500, "Sign In Guest - /auth/guest/signin"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 53912, 117, 0.21702032942573082, 3389.3699732897862, 0, 15715, 1434.5, 8074.600000000006, 10755.900000000001, 13854.990000000002, 162.41000150625092, 520.6551426702064, 78.06829788936587], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get featured list by id", 5984, 18, 0.30080213903743314, 5857.905581550797, 6, 8126, 6820.5, 7696.5, 7813.75, 7978.0, 19.829934452522814, 116.45276912616066, 16.063357038234923], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 3000, 26, 0.8666666666666667, 11893.54166666668, 0, 15715, 14158.0, 14932.0, 15115.9, 15553.0, 9.799470175312521, 66.74465071421805, 7.570511781413018], "isController": false}, {"data": ["Get products by categoryId", 11972, 44, 0.3675242231874373, 6991.008937520896, 14, 15152, 6624.5, 13843.0, 14157.0, 14548.27, 37.32339040540709, 171.77576792244454, 30.649578038682645], "isController": false}, {"data": ["Products category  - products/digital/category/count", 3000, 7, 0.23333333333333334, 2281.787333333333, 0, 3427, 2575.0, 2940.8, 3076.8999999999996, 3216.99, 9.681854268729547, 16.647945263435187, 7.640628176858431], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 3000, 8, 0.26666666666666666, 2140.406666666663, 7, 3431, 2520.5, 2877.9, 3064.95, 3256.99, 10.431662181051928, 12.94840594965506, 8.204923375094754], "isController": false}, {"data": ["Debug Sampler", 20956, 0, 0.0, 0.19512311509830196, 0, 70, 0.0, 1.0, 1.0, 1.0, 63.591866213103756, 136.64163588186832, 0.0], "isController": false}, {"data": ["Get cart  - /cart", 3000, 7, 0.23333333333333334, 2286.9613333333336, 12, 3447, 2584.0, 2959.0, 3080.95, 3231.0, 9.751562687920739, 10.02935207671717, 7.424961090249088], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 3000, 7, 0.23333333333333334, 2721.822666666669, 12, 4377, 3274.0, 3718.9, 3905.8999999999996, 4168.959999999999, 10.566319504369172, 18.177161709375145, 6.717073284690108], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 89, 76.06837606837607, 0.16508384033239354], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-52-22-240-148.compute-1.amazonaws.com:8888 failed to respond", 14, 11.965811965811966, 0.025968244546668646], "isController": false}, {"data": ["401/Unauthorized", 14, 11.965811965811966, 0.025968244546668646], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 53912, 117, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 89, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-52-22-240-148.compute-1.amazonaws.com:8888 failed to respond", 14, "401/Unauthorized", 14, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get featured list by id", 5984, 18, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 18, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 3000, 26, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 19, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-52-22-240-148.compute-1.amazonaws.com:8888 failed to respond", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["Get products by categoryId", 11972, 44, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 44, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Products category  - products/digital/category/count", 3000, 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-52-22-240-148.compute-1.amazonaws.com:8888 failed to respond", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 3000, 8, "401/Unauthorized", 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get cart  - /cart", 3000, 7, "401/Unauthorized", 7, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 3000, 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 7, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
