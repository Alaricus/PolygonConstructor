# PolygonConstructor
A polygon construction tool.

This is a tool I wrote to help me with an adventure game engine I'm working on. I use it to define polygons that can be used for walkable areas to which a character is restricted.

![alt tag](http://www.alaric.us/adventure/tools/polygontool/sample3-4-17.png)

Demo:

[PolygonConstructor Demo](http://www.alaric.us/adventure/tools/polygontool/)

Features:

* Can choose either a default canvas size or a custom one.
* Can import an image as background and to establish canvas dimensions.
* Can construct polygons by placing vertices.
* Can close a polygon in progress by clicking on the starting vertex.
    (Only works if there are at least 3 existing vertices.)
* Can delete a polygon in progress by right-clicking.
* All constructed polygons will be autmatically converted to clockwise direction.
* Vertices are color coded: convex ones are blue, concave ones are red.
* Polygons are color coded: simple ones are blue, complex ones are res.
* Points of constructed polygons can be dragged and dropped.
* The resulting work can be exported to a JSON file.
* JSON files can be imported via drag and drop.
* Multiple files can be imported to display all of the polygons they contain.
* Imports can be done either file by file, or several files at a time.
* Polygons identical to previously drawn or imported ones will be ignored. 

Planned features:

* Record all coordinates as relative to allow for the scaling of game's window.
* Drag and drop entire polygons.
* Delete entire polygons.
