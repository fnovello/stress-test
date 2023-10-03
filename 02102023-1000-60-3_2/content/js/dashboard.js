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

    var data = {"OkPercent": 99.58654084926745, "KoPercent": 0.41345915073255524};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3973988080456916, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.007789733243667339, 500, 1500, "Get featured list by id"], "isController": false}, {"data": [2.2222222222222223E-4, 500, 1500, "Featured creators  - /users/feature/creator "], "isController": false}, {"data": [0.007675930076199014, 500, 1500, "Get products by categoryId"], "isController": false}, {"data": [0.001888888888888889, 500, 1500, "Products category  - products/digital/category/count"], "isController": false}, {"data": [0.05644444444444444, 500, 1500, "Featured list - products/digital/featured/list"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0032222222222222222, 500, 1500, "Get cart  - /cart"], "isController": false}, {"data": [0.056, 500, 1500, "Sign In Guest - /auth/guest/signin"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 80540, 333, 0.41345915073255524, 8353.140737521842, 0, 34491, 4652.0, 24676.40000000001, 28415.9, 32864.95000000001, 134.25794729033655, 427.6834769968244, 61.29140928441048], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get featured list by id", 8922, 28, 0.3138309796009863, 14378.10916834791, 19, 17330, 15745.5, 16644.7, 16858.0, 17059.77, 17.16680391900316, 100.80608702587816, 13.235781154997651], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 4500, 72, 1.6, 29760.597777777763, 0, 34491, 31661.0, 33507.8, 33705.9, 33949.92, 8.255063105371296, 55.93845735801291, 6.012910574735838], "isController": false}, {"data": ["Get products by categoryId", 17848, 80, 0.44822949350067237, 17231.552050649923, 17, 32856, 15742.5, 30907.0, 31335.0, 32147.51, 30.50027769470671, 140.29719842087837, 23.840143974024866], "isController": false}, {"data": ["Products category  - products/digital/category/count", 4500, 38, 0.8444444444444444, 5567.718444444445, 0, 6920, 5750.0, 6341.0, 6427.9, 6601.969999999999, 8.155261684224643, 14.039598014692155, 6.080590012794699], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 4500, 39, 0.8666666666666667, 5156.218666666649, 8, 6921, 5905.5, 6428.0, 6510.0, 6724.949999999999, 9.245942058763099, 11.467448184199712, 6.884011181811178], "isController": false}, {"data": ["Debug Sampler", 31270, 0, 0.0, 0.22069075791493475, 0, 95, 0.0, 1.0, 1.0, 1.0, 52.386720209345846, 110.63135607284718, 0.0], "isController": false}, {"data": ["Get cart  - /cart", 4500, 38, 0.8444444444444444, 5622.653999999998, 176, 7011, 5825.0, 6410.9, 6491.95, 6651.0, 8.189024523398773, 8.425870021300563, 5.890528124977253], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 4500, 38, 0.8444444444444444, 6542.771777777779, 14, 8809, 7717.5, 8279.0, 8368.95, 8546.99, 9.348745606089564, 15.758248028193739, 5.646920292724806], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 74, 22.22222222222222, 0.09187981127390117], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 183, 54.95495495495496, 0.22721629004221505], "isController": false}, {"data": ["401/Unauthorized", 76, 22.822822822822822, 0.09436304941643904], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 80540, 333, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 183, "401/Unauthorized", 76, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 74, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get featured list by id", 8922, 28, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 28, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 4500, 72, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 37, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 35, "", "", "", "", "", ""], "isController": false}, {"data": ["Get products by categoryId", 17848, 80, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 80, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Products category  - products/digital/category/count", 4500, 38, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 37, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 4500, 39, "401/Unauthorized", 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get cart  - /cart", 4500, 38, "401/Unauthorized", 38, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 4500, 38, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 38, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
