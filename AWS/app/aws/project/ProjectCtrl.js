/**
 * Project Module ProjectButtonCtrl - Controls actions of the project button.
 * ProjectContentCtrl - Controls dialog content for project actions.
 */
angular.module('aws.project', []).controller('ProjectCtrl',
		function($scope, $dialog) {
	$scope.opts = {
			backdrop : true,
			keyboard : true,
			backdropClick : true,
			templateUrl : 'tpls/ProjectMenu.tpls.html',
			controller : 'ProjectButtonContentCtrl'
	};

	$scope.openDialog = function(partial) {
		console.log("hello");
		if (partial) {
			$scope.opts.templateUrl = 'tpls/' + partial + '.tpls.html';
		}

		var d = $dialog.dialog($scope.opts);
		d.open();
	};	
})
.controller('ProjectButtonContentCtrl', function($scope, queryService, $dialog) {
	$scope.close = function() {
		$dialog.close();
	};

	$scope.query = queryService;
	
});