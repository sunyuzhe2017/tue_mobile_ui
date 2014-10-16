function updateEntityView(result)
{
	if (selectedEntity.data.measurement_image != "")
		$("#entity-info-thumbnail img").attr("src", "data:image/png ;base64," + selectedEntity.data.measurement_image);
	else
		$("#entity-info-thumbnail img").attr("src", "https://d1luk0418egahw.cloudfront.net/static/images/guide/NoImage_592x444.jpg");

	$("#entity-info-id").html(selectedEntity.id + " (" + selectedEntity.data.type + ")");

	var html = ""
	for (var a in selectedEntity.data.affordances) {
      html += '<option value="' + selectedEntity.data.affordances[a] + '">' + selectedEntity.data.affordances[a] + '</option>';
    }
	$("#entity-info-affordances").html(html);

	html = ""
	for (var i in selectedEntity.data.property_names) {
      html += '<tr><td>' + selectedEntity.data.property_names[i] + '</td><td>' + selectedEntity.data.property_values[i] + '</td></tr>';
    }
	$("#entity-info-table").html(html);

}

// Bind actions to the affordance buttons etc ,, we should do this with templating engine though
$(document).ready(function () {
	// $("#entity-info-labels-go").click(function()
	// {
	// 	console.log("Dummy");
	// 	return;
	// 	var req = new ROSLIB.ServiceRequest({
	// 		command_yaml: '{ action: store, entity: ' + entityId + ' }'
	// 	});
	// 	clientInteract.callService(req, function(result) {
	// 		console.log('Result from server: ' + result.result_json);
	// 	});
	// });

	$("#entity-info-affordances-go").click(function()
	{	
		var affordance = $('#entity-info-affordances').find(":selected").text();
		var req = new ROSLIB.ServiceRequest({
			action: affordance,
			parameters: '{ entity: ' + selectedEntity.id + ' }'
		});
		clientActionServer.callService(req, function(result) {
			console.log('#entity-info-affordances-go - Result from server: ' + result.action_uuid + ", " + result.error_msg);
			if (result.error_msg != "")
			{
				$("#entity-info-affordances-alert").html('<div class="alert alert-error"><button type="button" class="close" data-dismiss="alert">×</button><strong>Oh snap!</strong> ' + result.error_msg + '</div>');
			}
		});
	});

	$("#reset-world-model").click(function()
	{	
		clientEdReset.callService(req, function(result) {
			console.log('Reset called :)');
		});
	});

	// $("#entity-info-store-measurement").click(function()
	// {
	// 	var req = new ROSLIB.ServiceRequest({
	// 		command_yaml: '{ action: store, entity: ' + selectedEntity.id + ' }'
	// 	});
	// 	clientInteract.callService(req, function(result) {
	// 		console.log('Result from server: ' + result.result_json);
	// 	});
	// });
	
});
