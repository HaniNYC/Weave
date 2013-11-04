/**
 * DataDialog Module DataDialogCtrl - Controls dialog button and closure.
 * DataDialogConnectCtrl - Manages the content of the Dialog.
 */
angular.module('aws.DataDialog', [ 'aws' ]).controller(
		'DataDialogCtrl',
		function($scope, $dialog, queryobj) {

            $scope.dataTable = queryobj.dataTable();
			$scope.opts = {
				backdrop : true,
				keyboard : true,
				backdropClick : true,
				templateUrl : 'tpls/dataDialog.tpls.html',
				controller : 'DataDialogConnectCtrl'
			};

			$scope.openDialog = function(partial) {
				if (partial) {
					$scope.opts.templateUrl = 'tpls/' + partial + '.tpls.html';
				}

				var d = $dialog.dialog($scope.opts);
				d.open();
			};
		})

.controller('DataDialogConnectCtrl', function($scope, queryobj, dialog, dataService) {
	$scope.close = function() {
		dialog.close();
	};

	if(queryobj.dataTable){
		$scope.dataTableSelect = queryobj.dataTable;
	}
	
	$scope.options = dataService.giveMeTables();

	$scope.$watch('dataTableSelect', function(newVal, oldVal){
        if ($scope.options.hasOwnProperty("$$v")) {
            var temp = angular.fromJson($scope.dataTableSelect);
            if (temp){
                queryobj.dataTable = {
                    id: temp.id,
                    title: temp.title
                };
            }
        }
	});
	$scope.$watch('entityOverride', function(newVal, oldVal){
		if(newVal != undefined){
			$scope.dataTableSelect = $scope.entityOverride;
		}
	});
	
});