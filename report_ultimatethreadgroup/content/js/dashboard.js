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

    var data = {"OkPercent": 96.21212121212122, "KoPercent": 3.787878787878788};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7301378857518056, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5, 500, 1500, "Select any product-12"], "isController": false}, {"data": [0.5642857142857143, 500, 1500, "Select any product"], "isController": true}, {"data": [0.9902912621359223, 500, 1500, "Click on any category``"], "isController": true}, {"data": [0.9426229508196722, 500, 1500, "Add to cart-13"], "isController": false}, {"data": [0.8688524590163934, 500, 1500, "Proceed to checkout"], "isController": true}, {"data": [0.9426229508196722, 500, 1500, "Add to cart"], "isController": true}, {"data": [0.482258064516129, 500, 1500, "Enter the store"], "isController": true}, {"data": [0.9869565217391304, 500, 1500, "Click on any category"], "isController": false}, {"data": [0.482258064516129, 500, 1500, "enter the store"], "isController": false}, {"data": [0.84, 500, 1500, "Proceed to checkout-14"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 792, 30, 3.787878787878788, 400.38888888888897, 0, 2216, 207.0, 708.7, 807.1999999999989, 1743.3499999999997, 7.02532487692376, 27.422353167827204, 3.9472840760411585], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Select any product-12", 61, 30, 49.18032786885246, 97.96721311475409, 0, 632, 149.0, 190.00000000000006, 242.6, 632.0, 2.1278080089298173, 5.613428953885866, 0.7941127738244733], "isController": false}, {"data": ["Select any product", 70, 30, 42.857142857142854, 85.37142857142857, 0, 632, 0.0, 181.9, 240.8, 632.0, 1.0244252242759508, 2.355091850697341, 0.33316686423438846], "isController": true}, {"data": ["Click on any category``", 309, 0, 0.0, 143.7411003236247, 0, 1355, 159.0, 184.0, 221.5, 1089.4999999999977, 2.773638762723731, 7.79151467941583, 1.4537550154390249], "isController": true}, {"data": ["Add to cart-13", 61, 0, 0.0, 260.47540983606575, 149, 1866, 167.0, 498.6000000000007, 830.4999999999998, 1866.0, 2.1192329071706504, 9.652443631878821, 1.4693900039952752], "isController": false}, {"data": ["Proceed to checkout", 61, 0, 0.0, 426.3606557377048, 0, 2037, 475.0, 538.4000000000001, 558.2, 2037.0, 2.1313021906991367, 7.203312799168443, 1.1771568516124524], "isController": true}, {"data": ["Add to cart", 61, 0, 0.0, 260.50819672131166, 149, 1866, 167.0, 498.6000000000007, 830.4999999999998, 1866.0, 2.118055555555556, 9.647081163194445, 1.4685736762152777], "isController": true}, {"data": ["Enter the store", 310, 0, 0.0, 722.9516129032262, 581, 2216, 658.0, 813.8000000000004, 1302.8499999999997, 1989.5299999999988, 2.7454036628998546, 13.93649545071115, 1.6266845348533423], "isController": true}, {"data": ["Click on any category", 230, 0, 0.0, 193.11304347826098, 146, 1355, 164.5, 192.60000000000002, 264.5999999999999, 1123.46, 2.5215980353462264, 9.516527259297021, 1.7756110078717713], "isController": false}, {"data": ["enter the store", 310, 0, 0.0, 722.9258064516132, 581, 2216, 658.0, 813.8000000000004, 1302.8499999999997, 1989.5299999999988, 2.749811504856522, 13.958870983390252, 1.629296233977913], "isController": false}, {"data": ["Proceed to checkout-14", 50, 0, 0.0, 520.1600000000001, 433, 2037, 483.0, 548.5, 629.6499999999993, 2037.0, 2.0785699438786116, 8.570609670546665, 1.4005988879650801], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 79: https://petstore.octoperf.com/actions/Catalog.action?viewProduct=&amp;productId=Not Found", 30, 100.0, 3.787878787878788], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 792, 30, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 79: https://petstore.octoperf.com/actions/Catalog.action?viewProduct=&amp;productId=Not Found", 30, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Select any product-12", 61, 30, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 79: https://petstore.octoperf.com/actions/Catalog.action?viewProduct=&amp;productId=Not Found", 30, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
