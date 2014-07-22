// globals
var hammertime;
var pager, position, pagerData;
var map;
var setClickService;

function getDataUrl(data) {
  return 'data:image/jpeg ;base64,' + data;
}

var pagerTemplate;
function renderPager() {
  var data = {
    ids: pagerData.ids.map(function (id, pos) {
      return {
        id: id,
        active: position === pos,
      };
    }),
    image: getDataUrl(pagerData.images[position].data)
  };
  pager.html(pagerTemplate(data));
}

function handleMeasurements(result) {
  pagerData = result;
  renderPager();
}

var getMeasurementsService;

function GetMeasurements() {
  // handle the incoming data

  var req = new ROSLIB.ServiceRequest({});

  getMeasurementsService.callService(req, function(result) {
    handleMeasurements(result);
  });
}

function handleMapUpdate (msg) {
  console.log('map update');
  map.prop('src', getDataUrl(msg.data));
}

function handleClick (e) {
  var pos = {
    x: e.offsetX,
    y: e.offsetY,
  };

  var req = new ROSLIB.ServiceRequest({
    id: '',
    pos: pos,
  });

  setClickService.callService(req, function (result) {
    console.log(result);
  })
  //  console.log('click on', x, ',', y);
}

$(document).ready(function () {
  position = 0;

  pager = $('#pager-container');

  var source   = $("#pager-template").html();
  pagerTemplate = Handlebars.compile(source);

  // get the last measurements

  getMeasurementsService = new ROSLIB.Service({
      ros : ros,
      name : '/ed/get_measurements',
      serviceType : 'ed/GetMeasurements'
  });
  GetMeasurements();

  // Get the map

  var mapListener = new ROSLIB.Topic({
    ros : ros,
    name : '/ed/gui/map_image',
    messageType : 'tue_serialization/Binary'
  });
  mapListener.subscribe(function(message) {
    handleMapUpdate(message);
  });
  map = $('#map-image');
  map.on('click', handleClick);

  // click service
  setClickService = new ROSLIB.Service({
      ros : ros,
      name : '/ed/get_measurements',
      serviceType : 'ed/GetMeasurements'
  });

  // catch the swipe gesture

  var final = $('#final').get(0);
  hammertime = Hammer(final, {});

  hammertime.on('swipe', function (e) {
    var direction = e.direction;

    if (direction & Hammer.DIRECTION_LEFT) {
      position = position == 0 ? 0 : position - 1;
    }
    if (direction & Hammer.DIRECTION_RIGHT) {
      var maxpos = pagerData.ids.length - 1;
      position = position >= maxpos ? maxpos : position + 1;
    }

    renderPager();
  });
});
