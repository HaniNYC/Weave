'use strict';

/* Services */


/**
 * Query Object Service provides access to the main "singleton" query object.
 *
 * Don't worry, it will be possible to manage more than one query object in the
 * future.
 */
angular.module("aws.services", []).service("queryobj", function () {
    this.title = "AlphaQueryObject";
    this.date = new Date();
    this.author = "UML IVPR AWS Team";
<<<<<<< Upstream, based on branch 'aws' of local repository
    this.computationEngine = "R";
    this.scriptType = "columns";
    this.dataTable = {};
=======
    this.computationEngine = "r";
    this.scriptType = "columns"
    this.dataTable = {id:1,title:"default"};
>>>>>>> 1bf1fc0 progress on refactor for demo
    this.conn = {
        serverType: 'MySQL',
        connectionType: 'RMySQL',
        sqlip: 'localhost',
        sqlport: '3306',
        sqldbname: 'sdoh2010q',
        sqluser: 'root',
        sqlpass: 'pass',
        schema: 'data',
        dsn: 'brfss'
    };
<<<<<<< Upstream, based on branch 'aws' of local repository
=======
    var columnCategories = ["geography", "indicators", "byvars", "timeperiods", "analytics"];
>>>>>>> 1bf1fc0 progress on refactor for demo
    this.setQueryObject = function (jsonObj) {
        if (!jsonObj) {
            return undefined;
        }
<<<<<<< Upstream, based on branch 'aws' of local repository
        this.title = jsonObj.title;
        this.date = jsonObj.data;
        this.author = jsonObj.author;
        this.scriptType = jsonObj.scriptType;
        this.computationEngine = jsonObj.computationEngine;
        this.dataTable = jsonObj.dataTable;
        this.conn = jsonObj.conn;
        this.selectedVisualization = jsonObj.selectedVisualization;
        this.barchart = jsonObj.barchart;
        this.datatable = jsonObj.datatable;
        this.colorColumn = jsonObj.colorColumn;
        this.byvars = jsonObj.byvars;
        this.indicators = jsonObj.indicators;
        this.geography = jsonObj.geography;
        this.timeperiods = jsonObj.timeperiods;
        this.analytics = jsonObj.analytics;
        this.scriptOptions = jsonObj.scriptOptions;
        this.scriptSelected = jsonObj.scriptSelected;
        this.maptool = jsonObj.maptool;
    };
=======
        this.q = angular.copy(jsonObj);

    }
>>>>>>> 1bf1fc0 progress on refactor for demo
    return {
<<<<<<< Upstream, based on branch 'aws' of local repository
=======
        q: this,
>>>>>>> 1bf1fc0 progress on refactor for demo
        title: this.title,
        date: this.date,
        author: this.author,
        dataTable: this.dataTable,
        scriptType: this.scriptType,
<<<<<<< Upstream, based on branch 'aws' of local repository
        computationEngine : this.computationEngine,
        conn: this.conn,
=======
        slideFilter: this.slideFilter,
        getSelectedColumnIds: function(){
            // loop through the possible column groups
            // given an id, go get the minimal column object
            // return that array of objects.
            var ary = [];
            var col = ["geography", "indicators", "byvars", "timeperiods", "analytics"];
            var temp;
            for (var i =0; i< col.length; i++){
                if (this[col[i]]){
                    angular.forEach(this[col[i]], function(item){
                        if (item.hasOwnProperty('id')){
                            ary.push(item.id);
                        } else{
                            ary.push(item);
                        }
                    });
                }
            }
            return ary;
        },
>>>>>>> 1bf1fc0 progress on refactor for demo
        getSelectedColumns: function () {
            //TODO hackity hack hack
            var col = ["geography", "indicators", "byvars", "timeperiods", "analytics"];
            var columns = [];
            for (var i = 0; i < col.length; i++) {
                if (this[col[i]]){
                	angular.forEach(this[col[i]], function(item){
                		if(item.hasOwnProperty('publicMetadata')) {
                			var obj = {
                				id:item.id,
                       			title:item.publicMetadata.title,
	            				filter:[item.publicMetadata.var_range]
                			};
                			columns.push(obj);
                		}else{
                			columns.push(item);
                		}
                	});
                }
            }
            return columns;
        }

    };
});

angular.module("aws.services").service("scriptobj", ['queryobj', '$rootScope', '$q', function (queryobj, scope, $q) {
    this.scriptMetadata = {"scriptType": "columns", "inputs": [],
        "outputs": []
    };

    this.updateMetadata = function () {
        this.scriptMetadata = this.getScriptMetadata();
    };

    this.getScriptsFromServer = function () {
        var deferred = $q.defer();
        var prom = deferred.promise;

        var callbk = function (result) {
            scope.$safeApply(function () {
                console.log(result);
                deferred.resolve(result);
            });
        };

        aws.RClient.getListOfScripts(callbk);
        return prom;
    };
    this.availableScripts = this.getScriptsFromServer();

    this.getScriptMetadata = function () {
        var deferred2 = $q.defer();
        var promise = deferred2.promise;

        var callback = function (result) {
            scope.$safeApply(function () {
                console.log(result);
                deferred2.resolve(result);
            });
        };

        aws.RClient.getScriptMetadata(queryobj.scriptSelected, callback);
        return promise;
    };
    this.scriptMetadata = this.getScriptMetadata();

}]);

angular.module("aws.services").service("dataService", ['$q', '$rootScope', 'queryobj',
    function ($q, scope, queryobj) {


        var fetchColumns = function (table) {
            var deferred = $q.defer();
            var prom = deferred.promise;
            var deferred2 = $q.defer();
            if (table == undefined) {
            	return deferred2.promise;
            };
            var id = table.id;
            var callbk = function (result) {
                scope.$safeApply(function () {
                    //console.log(result);
                    deferred.resolve(result);
                });
            };
            var callbk2 = function (result) {
                scope.$safeApply(function () {

                    console.log(result);
                    deferred2.resolve(result);
                });
            };

            aws.DataClient.getEntityChildIds(id, callbk);

            deferred.promise.then(function (res) {
                aws.DataClient.getDataColumnEntities(res, callbk2);
            });

            prom = deferred2.promise.then(function (response) {
                //console.log(response);
                return response;
            }, function (response) {
                console.log("error " + response);
            });

            return prom;
        };

        var fetchGeoms = function () {
            var deferred = $q.defer();
            var prom = deferred.promise;
            var deferred2 = $q.defer();
            var callbk = function (result) {
                scope.$safeApply(function () {
                    console.log(result);
                    deferred.resolve(result);
                });
            };
            var callbk2 = function (result) {
                scope.$safeApply(function () {

                    console.log(result);
                    deferred2.resolve(result);
                });
            };
            aws.DataClient.getEntityIdsByMetadata({"dataType": "geometry"}, callbk);
            deferred.promise.then(function (res) {
                aws.DataClient.getDataColumnEntities(res, callbk2);
            });

            prom = deferred2.promise.then(function (response) {
                //console.log(response);
                return response;
            }, function (response) {
                console.log("error " + response);
            });

            return prom;
        };

        var fetchTables = function(){
            var deferred = $q.defer();
            var callback = function(result){
                scope.$safeApply(function(){
                	// fetching tables callback
                    console.log(result);
                    deferred.resolve(result);
                });
            };
            aws.DataClient.getDataTableList(callback);
            return deferred.promise;
        };

        var fullColumnObjs = fetchColumns(queryobj.dataTable);
        var fullGeomObjs = fetchGeoms();
        var databaseTables = fetchTables();
        var filter = function (data, type) {
            var filtered = [];
            for (var i = 0; i < data.length; i++) {
                try {
                	if (type == "numeric"){
                		if (data[i].publicMetadata.dataType == "number"){
                			filtered.push(data[i]);
                		}
                	}else if (data[i].publicMetadata.ui_type == type) {
                        filtered.push(data[i]);
                    }
                } catch (e) {
                    console.log(e);
                }
            }
            filtered.sort();
            return filtered;
        };

        return {
            giveMeColObjs: function (scopeobj) {
                return fullColumnObjs.then(function (response) {
                    var type = scopeobj.panelType;
                    return filter(response, type);
                });
            },
            refreshColumns: function (scopeobj) {
                fullColumnObjs = fetchColumns(queryobj.dataTable);
            },
            giveMeGeomObjs: function () {
                return fullGeomObjs.then(function (response) {
                    return response;
                });
            },
            giveMeTables: function(){
                return databaseTables.then(function(response)
                {
                    return response;
                });
            },
            giveMePrettyColsById: function(ids){
                return [].reduce(function(x){return x;}, fullColumnObjs.then(function(response){
                    response.forEach(function(item){
                    if (ids.indexOf(item.id)){
                        return { id: item.id,
                            title: item.publicMetadata.title,
                            range: item.publicMetadata.var_range,
                            var_type: item.publicMetadata.ui_type,
                            var_label: item.publicMetadata.var_label
                        };
                    }});
                }));
            }
        };
    }]);
