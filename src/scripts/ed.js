// Demo of the "cameras/orbit" node type, which orbits the eye about a point of interest

// Point SceneJS to the bundled plugins
SceneJS.setConfigs({
    pluginPath:"http://scenejs.org/api/latest/plugins"
});

// Create scene
var scene = SceneJS.createScene({
    nodes:[

        // Mouse-orbited camera,
        // implemented by plugin at http://scenejs.org/api/latest/plugins/node/cameras/orbit.js
        {
            type:"cameras/orbit",
            yaw:40,
            pitch:-20,
            zoom:10,
            zoomSensitivity:10.0,
            eye:{ x:0, y:0, z:10 },
            look:{ x:0, y:0, z:0 },

            nodes:[

                // Blue material
                {
                    type:"material",
                    color:{ r:0.3, g:0.3, b:1.0 },

                    nodes:[

                        // Teapot primitive,
                        // implemented by plugin at http://scenejs.org/api/latest/plugins/node/prims/teapot.js
                        {
                            type:"prims/teapot"
                        }
                    ]
                }
            ]
        }
    ]
});

$(document).ready(function () {
  console.log("TEST")
});
