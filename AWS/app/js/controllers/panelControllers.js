/**
 *  Individual Panel Type Controllers
 *  These controllers will be specified via the panel directive
 */
angular.module("aws.panelControllers", [])
.controller("SelectColumnPanelCtrl", function($scope, queryobj, dataService){
	
	$scope.options; // initialize
	$scope.selection = [];
	
	var getOptions = function getOptions(){
		// fetch Columns using current dataTable
		var fullColumnObjects = dataService.giveMeColObjs($scope);
		$scope.options=[];
		fullColumnObjects.then(function(result){
			angular.forEach(result, function(item, index){
				if(item.hasOwnProperty('publicMetadata')) {
					var obj = {
	           			title:item.publicMetadata.title,
	    				id:item.id,
	    				range:item.publicMetadata.var_range
	    			};
	    			$scope.options[index] = obj;
				}
			});
			setSelect();
		});
	};
	getOptions(); // call immediately
	
	function setSelect(){
		if(queryobj[$scope.selectorId]){
<<<<<<< Upstream, based on branch 'aws' of local repository
			var arr = queryobj[$scope.selectorId];
			angular.forEach(arr, function(item, index){
				$scope.selection[index] = angular.toJson(item);
			});
			//$scope.selection = queryobj[$scope.selectorId];
=======
			$scope.selection = $.map(queryobj[$scope.selectorId], function(item){
				return item.publicMetadata.title;
			});
>>>>>>> 1bf1fc0 progress on refactor for demo
		}
		$scope.$watch('selection', function(newVal, oldVal){
			if(newVal != oldVal){
				var arr = [];
				angular.forEach($scope.selection, function(item, i){
					arr.push(angular.fromJson(item));
				});
				queryobj[$scope.selectorId] = arr;
			}
		});
	}

	$scope.$on("refreshColumns", function(e){
		getOptions();
	});

})
.controller("SelectScriptPanelCtrl", function($scope, queryobj, scriptobj){
	$scope.selection;
	$scope.options;// = scriptobj.availableScripts;
	
	if(queryobj['scriptSelected']){
		$scope.selection = queryobj['scriptSelected'];
	}else{
		queryobj['scriptSelected'] = "No Selection";
	}
	
	$scope.$watch('selection', function(){
		queryobj['scriptSelected'] = $scope.selection;
		scriptobj.getScriptMetadata();
	});
	$scope.$watch(function(){
		return queryobj['scriptSelected'];
	},
		function(select){
			$scope.selection = queryobj['scriptSelected'];
	});
	$scope.$watch(function(){
		return queryobj.conn.scriptLocation;
	},
		function(){
		$scope.options = scriptobj.getListOfScripts();
	});
	
})
.controller("WeaveVisSelectorPanelCtrl", function($scope, queryobj, dataService){
	// set defaults or retrieve from queryobject
	if(!queryobj['selectedVisualization']){
		queryobj['selectedVisualization'] = {'maptool':false, 
		                                     'barchart':false, 
		                                     'datatable':false,
		                                     'scatterplot':false};
	}
	$scope.vis = queryobj['selectedVisualization'];
	
	// set up watch functions
	$scope.$watch('vis', function(){
		queryobj['selectedVisualization'] = $scope.vis;
	});
	$scope.$watch(function(){
		return queryobj['selectedVisualization'];
	},
		function(select){
			$scope.vis = queryobj['selectedVisualization'];
	});

})
.controller("RunPanelCtrl", function($scope, queryobj, dataService){
	$scope.runQ = function(){
		var qh = new aws.QueryHandler(queryobj);
		qh.runQuery();
		alert("Running Query");
	};
	
	$scope.clearCache = function(){
		aws.RClient.clearCache();
		alert("Cache cleared");
	};
	
})
.controller("MapToolPanelCtrl", function($scope, queryobj, dataService){
	if(queryobj.selectedVisualization && queryobj.selectedVisualization['maptool']){
		$scope.enabled = queryobj.selectedVisualization['maptool'];
	}
	var maps = dataService.giveMeGeomObjs();
	$scope.options;
	
	$scope.selection;
	
	// selectorId should be "mapPanel"

	
	maps.then(function(result){
		$scope.options = result;
		if(queryobj['maptool']){
			var fromquery = queryobj['maptool'];
			$scope.selection = queryobj['maptool'].weaveEntityId;
		}
		// watch functions for two-way binding
		$scope.$watch('selection', function(newVal, oldVal){
			angular.forEach(result, function(item, index){
				if($scope.selection == item.id){
					var send = {};
					send.weaveEntityId = item.id;
					send.keyType = item.publicMetadata.keyType;
					send.title = item.publicMetadata.title;
					queryobj['maptool'] = send;
				}
			});
			
			
			//console.log(oldVal, newVal);
//			if(($scope.options.$$v != undefined) && ($scope.options.$$v != null)){
//				var obj = $scope.options.$$v[$scope.selection];
//				if(obj){
//					var send = {};
//					send.weaveEntityId = obj.id;
//					send.keyType = obj.publicMetadata.keyType;
//					send.title = obj.publicMetadata.title;
//					queryobj['maptool'] = send;
//				}
//			}
		});
	});
	$scope.$watch('enabled', function(){
		queryobj.selectedVisualization['maptool'] = $scope.enabled;
	});
	$scope.$watch(function(){
		return queryobj.selectedVisualization['maptool'];
	},
		function(select){
			$scope.enabled = queryobj.selectedVisualization['maptool'];
	});
})
.controller("BarChartToolPanelCtrl", function($scope, queryobj, scriptobj){
	if(queryobj.selectedVisualization && queryobj.selectedVisualization['barchart']){
		$scope.enabled = queryobj.selectedVisualization['barchart'];
	}

	$scope.options;
	scriptobj.scriptMetadata.then(function(results){
		$scope.options = results.outputs;
	});
	$scope.sortSelection;
	$scope.heightSelection;
	$scope.labelSelection;
	
	if(queryobj.barchart){
		$scope.sortSelection = queryobj.barchart.sort;
		$scope.heightSelection = queryobj.barchart.height;
		$scope.labelSelection = queryobj.barchart.label;
	}else{
		queryobj['barchart'] = {};
	}
	
	// watch functions for two-way binding
	$scope.$watch('sortSelection', function(){
		queryobj.barchart.sort = $scope.sortSelection;
	});
	$scope.$watch('labelSelection', function(){
		queryobj.barchart.label = $scope.labelSelection;
	});
	$scope.$watch('heightSelection', function(){
		queryobj.barchart.height = $scope.heightSelection;
	});
	$scope.$watch('enabled', function(){
		queryobj.selectedVisualization['barchart'] = $scope.enabled;
	});
	$scope.$watch(function(){
		return queryobj.selectedVisualization['barchart'];
	},
		function(select){
			$scope.enabled = queryobj.selectedVisualization['barchart'];
	});
})
.controller("ScatterPlotToolPanelCtrl", function($scope, queryobj, scriptobj){
	if(queryobj.selectedVisualization && queryobj.selectedVisualization['scatterplot']){
		$scope.enabled = queryobj.selectedVisualization['scatterplot'];
	}

	$scope.options;
	scriptobj.scriptMetadata.then(function(results){
		$scope.options = results.outputs;
	});
	$scope.ySelection;
	$scope.xSelection;
	
	if(queryobj.scatterplot){
		$scope.ySelection = queryobj.scatterplot.yColumn;
		$scope.xSelection = queryobj.scatterplot.xColumn;
	}else{
		queryobj['scatterplot'] = {};
	}
	
	// watch functions for two-way binding
	$scope.$watch('ySelection', function(){
		queryobj.scatterplot.yColumn = $scope.ySelection;
	});
	$scope.$watch('xSelection', function(){
		queryobj.scatterplot.xColumn = $scope.xSelection;
	});

	$scope.$watch('enabled', function(){
		queryobj.selectedVisualization['scatterplot'] = $scope.enabled;
	});
	
	$scope.$watch(function(){
		return queryobj.selectedVisualization['scatterplot'];
	},
		function(select){
			$scope.enabled = queryobj.selectedVisualization['scatterplot'];
	});
})
.controller("DataTablePanelCtrl", function($scope, queryobj, scriptobj){
	if(queryobj.selectedVisualization && queryobj.selectedVisualization['datatable']){
		$scope.enabled = queryobj.selectedVisualization['datatable'];
	}
	
	$scope.options;
	scriptobj.scriptMetadata.then(function(results){
		$scope.options = results.outputs;
	});
	$scope.selection;
	// selectorId should be "dataTablePanel"
	if(queryobj['datatable']){
		$scope.selection = queryobj["datatable"];
	}
	
	// watch functions for two-way binding
	$scope.$watch('selection', function(){
		queryobj["datatable"] = $scope.selection;
	});
	$scope.$watch('enabled', function(){
		queryobj.selectedVisualization['datatable'] = $scope.enabled;
	});
	$scope.$watch(function(){
		return queryobj.selectedVisualization['datatable'];
	},
		function(select){
			$scope.enabled = queryobj.selectedVisualization['datatable'];
	});
})
.controller("ColorColumnPanelCtrl", function($scope, queryobj, scriptobj){
	$scope.selection;
	
	// selectorId should be "ColorColumnPanel"
	if(queryobj['colorColumn']){
		$scope.selection = queryobj["colorColumn"];
	}
	$scope.options;
	scriptobj.scriptMetadata.then(function(results){
		$scope.options = results.outputs;
	});
	// watch functions for two-way binding
	$scope.$watch('selection', function(){
		queryobj["colorColumn"] = $scope.selection;
	});
})
.controller("CategoryFilterPanelCrtl", function($scope, queryobj, dataService){
	
})
.controller("ContinuousFilterPanelCtrl", function($scope, queryobj, dataService){
	
})
<<<<<<< Upstream, based on branch 'aws' of local repository
.controller("ScriptOptionsPanelCtrl", function($scope, queryobj, scriptobj, $rootScope){
=======
.controller("ScriptOptionsPanelCtrl", function($scope, queryobj, scriptobj, dataService){
>>>>>>> 1bf1fc0 progress on refactor for demo
	
	// Populate Labels
	$scope.inputs = [];
<<<<<<< Upstream, based on branch 'aws' of local repository
	$scope.sliderDefault = {
	        disabled: true,
=======
	var sliderDefault = {
	        showLabel: true,
>>>>>>> 1bf1fc0 progress on refactor for demo
			range: true,
			//max/min: querobj['some property']
			max: 99,
			min: 1,
			values: [10,25]
	};
	$scope.sliderOptions = [];
<<<<<<< Upstream, based on branch 'aws' of local repository
	$scope.options = queryobj.getSelectedColumns();
	$scope.selection = [];
	$scope.show = [];
	$scope.type = queryobj.scriptType;

	$scope.setSelect = function(){
		if(queryobj['scriptOptions']){
			var tempselection = queryobj['scriptOptions'];
			angular.forEach(tempselection, function(item, index){
				var jsn = angular.toJson(item);
				if(item != ""){
					if(item.filter && (item.filter != [])){
						$scope.sliderOptions[index] = {};
						$scope.sliderOptions[index].values = item.filter[0];
						$scope.sliderOptions[index].enable = true;
						$scope.show[index] = true;
					}
					$scope.selection[index] = jsn;
				}
				var temp1 = $scope.selection[index];
			});
		}
	};
=======
	var ids = queryobj.getSelectedColumnIds();
    $scope.options = dataService.giveMePrettyColsById(ids);
	$scope.selection = [];
	$scope.show = [];
	$scope.type = "columns";
	$scope.clusterOptions={};
>>>>>>> 1bf1fc0 progress on refactor for demo
	
<<<<<<< Upstream, based on branch 'aws' of local repository
	// build an array that will conform to what query handler expects. 
=======
	// retrieve selections, else create blanks;
	if(queryobj['scriptOptions']){
		$scope.selection = queryobj['scriptOptions'];
	}

>>>>>>> 1bf1fc0 progress on refactor for demo
	var buildScriptOptions = function(){
		var arr = [];
		var obj;
<<<<<<< Upstream, based on branch 'aws' of local repository
		angular.forEach($scope.selection, function(item, index){
			if(angular.isString(item)){
				obj = item;
			//}else{
				obj = "";
				if(item != ""){
					item = angular.fromJson(item);
				
					obj = {
							id:item.id,
							title:item.title
					};
					if(item.range && ($scope.sliderOptions[index].disabled == false)){
						obj.filter = [$scope.sliderOptions[index].values];
					}else{
						obj.filter = [];
					}
=======
		angular.forEach($scope.selection, function(item, i){
			obj = "";
			if(item != ""){
				item = angular.fromJson(item);
			
				obj = {
						id:item.id,
						title:item.title
				};
				if(item.range){
					obj.filter = [$scope.sliderOptions[i].values];
>>>>>>> 1bf1fc0 progress on refactor for demo
				}
			}
<<<<<<< Upstream, based on branch 'aws' of local repository
			arr.push(obj);	
=======
			arr.push(obj);
>>>>>>> 1bf1fc0 progress on refactor for demo
		});
		return arr;
	};
	
	var setSliderOptions = function(index){
		//get selection that changed
<<<<<<< Upstream, based on branch 'aws' of local repository
		if($scope.selection[index] != ""){
			var selec = angular.fromJson($scope.selection[index]);
			selec.range = angular.fromJson(selec.range);
			var curr = angular.fromJson($scope.sliderOptions[index]);
			if(!curr.disabled){
				curr.disabled = true;
			}
			if(selec.range != []){
				curr.values = selec.range;
				curr.min = selec.range[0];
				curr.max = selec.range[1];
				$scope.sliderOptions[index] = curr;
			}
=======
		var selec = angular.fromJson($scope.selection[index]);
		selec.range = angular.fromJson(selec.range);
		var curr = angular.fromJson($scope.sliderOptions[index]);
		if(selec.range != []){
			curr.values = selec.range;
			curr.min = selec.range[0];
			curr.max = selec.range[1];
			$scope.sliderOptions[index] = curr;
>>>>>>> 1bf1fc0 progress on refactor for demo
		}
	};
	
	// set up watch functions
<<<<<<< Upstream, based on branch 'aws' of local repository
=======
	$scope.$watch('selection', function(newVal,oldVal){
		//for(i = 0; i < newVal.length; i++){$scope.setRange(i);}
		angular.forEach(newVal, function(item, i){
			if(item === oldVal[i]){
				//do nothing since they didn't change
			}else{
				//update the whole slider settings. 
				setSliderOptions(i);
				$scope.show[i] = true;
			}
		});
		queryobj.scriptOptions = buildScriptOptions();
	}, true);
>>>>>>> 1bf1fc0 progress on refactor for demo
	$scope.$watch(function(){
		return queryobj.scriptSelected;
	},function(newVal, oldVal){
<<<<<<< Upstream, based on branch 'aws' of local repository
		var temp = scriptobj.scriptMetadata;
		temp.then(function(result){
			if(result.scriptType == "columns"){
				queryobj.scriptType = result.scriptType;
				$scope.inputs = result.inputs;
				angular.forEach($scope.inputs, function(input, index){
					$scope.selection[index] = "";
					$scope.show[index] = false;
					$scope.sliderOptions[index] = angular.copy($scope.sliderDefault);
				});
				$scope.setSelect();
				$scope.$watch('selection', function(newVal, oldVal){
					angular.forEach(newVal, function(item, i){
						if(item === oldVal[i]){
							//do nothing since they didn't change
						}else{
							//update the whole slider settings. 
							setSliderOptions(i);
							$scope.show[i] = true;
						}
					});
					queryobj.scriptOptions = buildScriptOptions();
				}, true);
				$scope.$watch(function(){
					var str = "";
					angular.forEach($scope.sliderOptions, function(item, index){
						str += angular.toJson(item.enable);
					});
					return str;
				},function(newVal, oldVal){
					var temp = 0;
				});
			}else{
				$scope.inputs = [];
			}
			
=======
		$scope.inputs = scriptobj.getScriptMetadata().inputs;
<<<<<<< Upstream, based on branch 'aws' of local repository
		scriptobj.updateMetadata();
		scriptobj.scriptMetadata.then(function(result){
			$scope.inputs = result.inputs;
			angular.forEach($scope.inputs, function(input, index){
				$scope.selection[index] = "";
				$scope.sliderOptions[index] = angular.copy(sliderDefault);
				$scope.show[index] = false;
			});
>>>>>>> 1bf1fc0 progress on refactor for demo
=======

		angular.forEach($scope.inputs, function(input, index){
			$scope.selection[index] = "";
			$scope.sliderOptions[index] = angular.copy(sliderDefault);
			$scope.show[index] = false;
>>>>>>> ef72820 merging franck's code
		});
		
	});
})
.controller("RDBPanelCtrl", function($scope, queryobj){
	if(queryobj["conn"]){
		$scope.conn = queryobj["conn"];
	}else{
		$scope.conn = {};
	}
	$scope.$watch('conn', function(){
		queryobj['conn'] = $scope.conn;
	}, true);
})
.controller("FilterPanelCtrl", function($scope, queryobj){
	if(queryobj.slidFilter){
		$scope.slideFilter = queryobj.slideFilter;
	}
	$scope.sliderOptions = {
			range: true,
			//max/min: querobj['some property']
			max: 99,
			min: 1,
			values: [10,25],
			animate: 2000
	};
	$scope.options = queryobj.getSelectedColumns();
	$scope.column;
	
	$scope.$watch('slideFilter', function(newVal, oldVal){
		if(newVal){
			queryobj.slideFilter = newVal;
		}
	}, true); //by val
	
}).controller("ClusterPanelCtrl", function($scope, queryobj, scriptobj){
	$scope.inputs = [];

	
	$scope.$watch(function(){
		return queryobj.scriptSelected;
	},function(newVal, oldVal){
		
		var temp = scriptobj.scriptMetadata;
				
		temp.then(function(result){
			if(result.scriptType == "cluster"){
				queryobj.scriptType = result.scriptType;
				$scope.inputs = result.inputs;
				angular.forEach($scope.inputs, function(input, index){
					$scope.inputs[index].value = "";
				});
				$scope.$watch('inputs', function(newVal, oldVal){
					queryobj.scriptOptions = $scope.inputs;
				}, true);
			
			}else{
				$scope.inputs = [];
			}	
		});
	});
		
});

