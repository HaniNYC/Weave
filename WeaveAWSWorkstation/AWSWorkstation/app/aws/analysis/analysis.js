/**
 * Handle all Analysis Tab related work - Controllers to handle Analysis Tab
 */'use strict';

angular.module('aws.AnalysisModule', ['wu.masonry']).controller('WidgetsController', function($scope, $filter, dasboard_widget_service) {

	$scope.widtget_bricks = dasboard_widget_service.get_widget_bricks();
	$scope.tool_list = dasboard_widget_service.get_tool_list();

	$scope.add_widget = function(element_id) {
		dasboard_widget_service.add_widget_bricks(element_id);
	}

	$scope.remove_widget = function(widget_index) {
		dasboard_widget_service.remove_widget_bricks(widget_index);
	}
	
}).controller('ScriptsBarController', function($scope) {

	$scope.selectedIcon = "";
	$scope.selectedIcons = ["Gear", "Globe", "Heart", "Camera"];
	$scope.icons = [];

});
