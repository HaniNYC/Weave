/*
 * 
 * Analysis Service which handle all data services for the analysis tab
 * 
 */

angular.module('aws.analysisService', []).service('dasboard_widget_service',['$filter', function($filter) {

	var tool_list = [{
		id : 'BarChartTool',
		title : 'Bar Chart Tool',
		template_url : 'aws/visualization/tools/barChart/bar_chart.tpl.html',
		description: 'Display a Bar Chart in Weave'
	}, {
		id : 'MapTool',
		title : 'Map Tool',
		template_url : 'aws/visualization/tools/mapChart/map_chart.tpl.html',
		description: 'Display Map in Weave'
	}, {
		id : 'DataTableTool',
		title : 'Data Table Tool',
		template_url : 'aws/visualization/tools/dataTable/data_table.tpl.html',
		description: 'Display a Data Table in Weave'
	}, {
		id : 'ScatterPlotTool',
		title : 'Scatter Plot Tool',
		template_url : 'aws/visualization/tools/scatterPlot/scatter_plot.tpl.html',
		description: 'Display a Scatter Plot in Weave'
	}];

	/*Model to hold the widgets that are being displayed in dashboard*/
	var widget_bricks = [];
	
	
		this.get_widget_bricks = function() {

			return widget_bricks;
		};

		this.add_widget_bricks = function(element_id) {

			var widget_id = element_id;
			var widget_brick_found = $filter('filter')(widget_bricks, {
				id : widget_id
			})
			if (widget_brick_found.length == 0) {
				var tool = $filter('filter')(tool_list, {
					id : widget_id
				});
				widget_bricks.splice(0, 0, tool[0]);
			} else {
				//TODO: Hightlight the div if already added to dashboard. Use ScrollSpy
			}
		};

		this.remove_widget_bricks = function(widget_index) {

			widget_bricks.splice(widget_index, 1);

		};
		
		this.get_tool_list = function() {

			return tool_list;

		};
	}]);

		

