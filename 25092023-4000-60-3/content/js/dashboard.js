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

    var data = {"OkPercent": 99.65697545056739, "KoPercent": 0.34302454943261884};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.39390343395386784, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.003007016371533578, 500, 1500, "Get featured list by id"], "isController": false}, {"data": [0.0, 500, 1500, "Featured creators  - /users/feature/creator "], "isController": false}, {"data": [0.010684474123539232, 500, 1500, "Get products by categoryId"], "isController": false}, {"data": [0.0, 500, 1500, "Products category  - products/digital/category/count"], "isController": false}, {"data": [0.018333333333333333, 500, 1500, "Featured list - products/digital/featured/list"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "Get cart  - /cart"], "isController": false}, {"data": [0.025666666666666667, 500, 1500, "Sign In Guest - /auth/guest/signin"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 53932, 185, 0.34302454943261884, 22516.952625528418, 0, 113092, 10531.5, 56614.600000000006, 93452.85000000002, 100457.98000000001, 34.29423143201244, 108.31099170471873, 14.555199243574124], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get featured list by id", 5986, 24, 0.4009355162044771, 41715.32592716347, 0, 49666, 44141.5, 46778.0, 47381.0, 48353.78, 4.753230624590068, 27.89346217510128, 3.402687012547703], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 3000, 85, 2.8333333333333335, 98395.69766666669, 0, 113092, 100736.0, 108569.5, 109494.95, 111221.99, 2.217709593885627, 14.902119076959696, 1.4772674717630125], "isController": false}, {"data": ["Get products by categoryId", 11980, 54, 0.4507512520868113, 44328.81293823037, 1, 107261, 37204.5, 88556.7, 90492.84999999999, 96413.61000000002, 7.836001258469651, 35.9087073813186, 5.69815324974932], "isController": false}, {"data": ["Products category  - products/digital/category/count", 3000, 5, 0.16666666666666666, 12343.542666666675, 0, 16236, 12330.0, 13742.9, 14124.95, 15374.939999999999, 2.1901998776408336, 3.7657000542713277, 1.5246058347472289], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 3000, 7, 0.23333333333333334, 10698.067666666693, 81, 16197, 11651.0, 13269.9, 14080.9, 15577.619999999992, 2.5742057717125677, 3.196173102574378, 1.7842153710867783], "isController": false}, {"data": ["Debug Sampler", 20966, 0, 0.0, 0.1521511017838411, 0, 37, 0.0, 1.0, 1.0, 1.0, 13.364908668449418, 27.602975586220747, 0.0], "isController": false}, {"data": ["Get cart  - /cart", 3000, 5, 0.16666666666666666, 12734.476000000002, 369, 16428, 12734.0, 14081.0, 14417.95, 15984.859999999997, 2.2033792493086897, 2.2659625358967204, 1.4722654514265043], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 3000, 5, 0.16666666666666666, 10366.209000000004, 66, 16499, 11056.0, 13795.6, 14890.95, 16066.96, 2.602619102356672, 4.231516388909372, 1.494382883767031], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 114, 61.62162162162162, 0.2113772899206408], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 61, 32.972972972972975, 0.11310539197507972], "isController": false}, {"data": ["401/Unauthorized", 10, 5.405405405405405, 0.018541867536898318], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 53932, 185, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 114, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 61, "401/Unauthorized", 10, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get featured list by id", 5986, 24, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 19, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, "", "", "", "", "", ""], "isController": false}, {"data": ["Featured creators  - /users/feature/creator ", 3000, 85, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 49, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 36, "", "", "", "", "", ""], "isController": false}, {"data": ["Get products by categoryId", 11980, 54, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 36, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 18, "", "", "", "", "", ""], "isController": false}, {"data": ["Products category  - products/digital/category/count", 3000, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Featured list - products/digital/featured/list", 3000, 7, "401/Unauthorized", 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Get cart  - /cart", 3000, 5, "401/Unauthorized", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sign In Guest - /auth/guest/signin", 3000, 5, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: ec2-54-173-30-112.compute-1.amazonaws.com:8888 failed to respond", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
