# PolygonConstructor
A polygon construction tool.

This is a tool I wrote to help me with an adventure game engine I'm working on. I use it to define polygons that can be used for walkable areas to which a character is restricted.

Features:

* Can construct polygons by placing vertices.
* Can close a polygon in progress by clicking on the starting vertex.
    (Only works if there are at least 3 existing vertices.)
* All constructed polygons will be autmatically converted to clockwise direction.
* Vertices are color coded: convex ones are blue, concave ones are red.
* Polygons are color coded: simple ones are blue, complex ones are res.
* Points of constructed polygons can be dragged and dropped.
* The resulting work can be exported to a JSON file.
* JSON files can be imported.

Planned features:

* Record all coordinates as relative to allow for the scaling of game's window.
* Check imported JSON for validity.
