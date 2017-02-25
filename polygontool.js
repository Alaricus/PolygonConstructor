"use strict";

window.onload = function() {

    let canvas = document.getElementById("screen")
    let ctx = canvas.getContext("2d");
    let mouseData;

    let initDrop = document.getElementById("initDrop");
    initDrop.addEventListener("change", () => {
        let controls = document.getElementById("controls");
        switch(initDrop.value) {
            case "default":
                canvas.style.display = "inline";
                canvas.width = 800;
                canvas.height = 800;
                controls.style.display = "inline-block";
                break;
            case "dimensions":
                let dimensions = document.getElementById("dimensions");
                let hSize = document.getElementById("hSize");
                let wSize = document.getElementById("wSize");
                let setSize = document.getElementById("setSize");

                dimensions.style.display = "inline";

                hSize.addEventListener("keypress", (e) => {                    
                    if (e.charCode < 48) {
                        console.log(e.charCode);
                        e.preventDefault();
                        return false;
                    }
                }, false);

                wSize.addEventListener("keypress", (e) => {
                    if (e.charCode < 48) {
                        console.log(e.charCode);
                        e.preventDefault();
                        return false;
                    }
                }, false);

                setSize.addEventListener("click", (e) => {
                    if (hSize.value > 0 && wSize.value > 0) {
                        canvas.style.display = "inline";
                        canvas.width = wSize.value;
                        canvas.height = hSize.value;
                        controls.style.display = "inline-block";
                        dimensions.style.display = "none";
                    }                    
                }, false);
                break;
            case "upload":
                document.getElementById("upload").style.display = "inline";
                // TODO: Add the code for uploading an image and setting the size
                break;
        }
        document.getElementById("selector").style.display = "none";    
    });

    document.getElementById("clearsaved").addEventListener("click", (e) => {
        allPolygons = [];
    }, false);

    ctx.canvas.addEventListener("mousemove", (e) => {
        mouseData = getMouseData(ctx.canvas, e);
    }, false);

    ctx.canvas.addEventListener("mousedown", (e) => {
        checkForVertex(mouseData);
    }, false);

    // A right click cancels polygon in progress.
    ctx.canvas.addEventListener("contextmenu", (e) => {        
        currentPolygon = [];
        polygonInProgress = false;
        e.preventDefault();
        return false;
    }, false);

    ctx.canvas.addEventListener("mouseup", (e) => {
        if (selectedPoint !== null || keyUsed) {
            selectedPoint = null;
            currentPolygon = [];
            polygonInProgress = false;
            keyUsed = false;
        } else {
            switch(checkForVertex(mouseData)) {
                case "savePolygon":
                    // Check if the polygon being saved is clockwise.
                    if (!isClockwise(currentPolygon)) {
                        // If not, make it clockwise
                        currentPolygon.reverse();
                    }
                    allPolygons.push(currentPolygon);
                    currentPolygon = [];
                    polygonInProgress = false;
                    break;
                case "place":
                    polygonInProgress = true;
                    currentPolygon.push({x: mouseData.x, y: mouseData.y});
                    break;
            }
        }
    }, false);

    document.addEventListener("keypress", (e) => { 
        // delete a point unless a polygon is a triangle, because we can't have
        // a polygon with less then 3 vertices
        if (selectedPoint !== null && allPolygons[selectedPoint.poly].length > 3 
                && e.keyCode === 120) { // the X key
            allPolygons[selectedPoint.poly].splice(selectedPoint.vert, 1);
            selectedPoint = null;
            keyUsed = true;
        }
    });

    let expo = document.getElementById("export");
    expo.addEventListener("click", (e) => {
        if (allPolygons.length > 0) {
            let dataURL = JSON.stringify({canvas: {w: canvas.width, h: canvas.height}, polygons: allPolygons});
            expo.href = "data:text/json;charset=utf-8," + encodeURIComponent(dataURL);
        } else {
            e.preventDefault();
        }
    });

    let impo = document.getElementById("import");
    impo.addEventListener("click", () => {
        document.getElementById("uploadArea").style.display = "block";
        impo.style.display = "none";
    });

    let uploadArea = document.getElementById("uploadArea");

    uploadArea.addEventListener("dragenter", (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = "limegreen";
        uploadArea.style.backgroundColor = "palegreen";
        return false;
    }, false);

    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = "limegreen";
        uploadArea.style.backgroundColor = "palegreen";
        return false;
    }, false);

    uploadArea.addEventListener("dragleave", (e) => {
        uploadArea.style.borderColor = "dodgerblue";
        uploadArea.style.backgroundColor = "white";
    }, false);

    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        if(e.dataTransfer.files.length === 1) {
            let fr = new FileReader();
            fr.onload = function(event) {
                try {
                    let importedData = JSON.parse(event.target.result);
                    canvas.width = importedData.canvas.w;
                    canvas.height = importedData.canvas.h;
                    allPolygons = importedData.polygons;
                    uploadArea.style.display = "none";
                    uploadArea.style.borderColor = "dodgerblue";
                    uploadArea.style.backgroundColor = "white";
                    impo.style.display = "block";
                } catch (err) {
                    uploadArea.style.borderColor = "red";
                    uploadArea.style.backgroundColor = "pink";
                    uploadArea.innerHTML = "<br>Wrong file type or file corrupted.<br><br>Try again."
                }
            }
            fr.readAsText(e.dataTransfer.files[0]);
        } else {
            uploadArea.style.borderColor = "red";
            uploadArea.style.backgroundColor = "pink";
            uploadArea.innerHTML = "<br>Cannot import multiple files.<br><br>Try again."
        }
    }, false);

    let getMouseData = (canv, e) => {
        let rect = canv.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    let checkForVertex = (coords) => {
        // first check all vertices in allPolygons
        for (let i = 0; i < allPolygons.length; i++) {
            for (let j = 0; j < allPolygons[i].length; j++) {
                if (coords.x >= allPolygons[i][j].x - 4
                && coords.x <= allPolygons[i][j].x + 4
                && coords.y >= allPolygons[i][j].y - 4
                && coords.y <= allPolygons[i][j].y + 4) {
                    if (polygonInProgress) {
                        return "existing";
                    } else {
                        selectedPoint = { poly: i, vert: j, x: coords.x, y: coords.y };
                        return "dragging";
                    }
                }
            }
        }
        // then check all vertices in currentPolygon except 0
        for (let i = 1; i < currentPolygon.length; i++) {
            if (coords.x >= currentPolygon[i].x - 4
            && coords.x <= currentPolygon[i].x + 4
            && coords.y >= currentPolygon[i].y - 4
            && coords.y <= currentPolygon[i].y + 4) {
                return "existing";
            }
        }
        // finally check for vertex 0 of currentPolygon
        // and if the polygon is AT LEAST a triangle allow to save it
        if (currentPolygon.length > 2
        && coords.x >= currentPolygon[0].x - 4
        && coords.x <= currentPolygon[0].x + 4
        && coords.y >= currentPolygon[0].y - 4
        && coords.y <= currentPolygon[0].y + 4) {
            return "savePolygon";
        }
        // if none of the above cases
        return "place"
    };

    let isClockwise = (vertices) => {
        // Using the shoelace formula
        let xx = 0;
        let yy = 0;
        for (let i = 0; i < vertices.length; i++) {
            if(i !== vertices.length - 1) {
                xx += vertices[i].x * vertices[i + 1].y;
                yy += vertices[i].y * vertices[i + 1].x;
            } else {
                xx += vertices[i].x * vertices[0].y;
                yy += vertices[i].y * vertices[0].x;
            }
        }
        // This is inverted because on HTML canvas Y is inverted
        if (xx > yy) {
            return true;
        }
        return false;
    };

    let isConcave = (vertices, vertex) => {
        let prev = vertices[vertex === 0 ? vertices.length - 1 : vertex - 1];
        let curr = vertices[vertex];
        let next = vertices[(vertex + 1) % vertices.length];
        // convert the side of the polygon from "prev" to "curr" into a vector (origin to "vector1")
        let vector1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        // convert the side of the polygon from "curr" to "next" into a vector (origin to "vector2")
        let vector2 = { x: next.x - curr.x, y: next.y - curr.y };
        // get a cross product of the two vectors
        // A cross product is a 3D vector (not a scalar) and in this case we have the z-axis be 0
        // so both vectors look like this: (value, value, 0). Because both vectors are flat on a
        // plane, the cross product looks like this: (0, 0, value) it's perpendicular to both of
        // them by being perfectly vertical and can go either above that plane or below it. If
        // the z value is positive the angle is convex, and if it is negative it is concave.
        let zCrossProduct = (vector1.x * vector2.y) - (vector1.y * vector2.x);
        return zCrossProduct < 0;
    };

    let isComplex = (polygon) => {
        // This compares each side of a polygon to each of its other sides. If a cross exists
        // then it's a complex polygon. If that's the case it shouldn't be used.
        let crossExists = false;
        for (let i = 0; i < polygon.length; i++) {
            for (let j = 0; j < polygon.length; j++) {
                if (i + 1 <= polygon.length) {
                    if (segmentsCross(polygon[i], polygon[(i + 1) % polygon.length], polygon[j], polygon[(j + 1) % polygon.length])) {
                        crossExists = true;
                    }
                }
            }               
        }
        return crossExists;
    };   

    let segmentsCross = (A, B, C, D) => {
        let crossProductABCD = ((B.x - A.x) * (D.y - C.y)) - ((B.y - A.y) * (D.x - C.x));
        
        // vectors AB and CD are parallel
        if (crossProductABCD == 0) {
            return false;
        }
    
        let crossProductACDC = ((A.y - C.y) * (D.x - C.x)) - ((A.x - C.x) * (D.y - C.y)); 
        let crossProductABAC = ((A.y - C.y) * (B.x - A.x)) - ((A.x - C.x) * (B.y - A.y));
        
        // vectors AC and DC (or BA and AC) touch only at endpoints
        // so in one case there is no B and in another no D
        if (crossProductACDC == 0 || crossProductABAC == 0) {
            return false;
        }
        
        // all other cases must be between 0 and a crossProduct of BADC
        // so since neither is equal to 0 we divide by the crossProduct
        // of BADC to make sure they aren't equal as (value / itself = 1)
        let test1 = crossProductACDC / crossProductABCD;
        let test2 = crossProductABAC / crossProductABCD;
        
        return (test1 > 0 && test1 < 1) && (test2 > 0 && test2 < 1);
    };

    // TODO: Write a function to check if a point is inside a polygon
    let isPointInside = (polygon, point) => {
        let isInside = false;
    };

    let allPolygons = [];
    let currentPolygon = []; 
    let polygonInProgress = false;
    let selectedPoint = null;
    let keyUsed = false;

    let draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Draw the vertices and connecting lines of the polygon currently being built
        if (polygonInProgress && selectedPoint === null) {
            for (let i = 0; i < currentPolygon.length; i++) {
                ctx.fillStyle="#ff00ff";
                ctx.strokeStyle="#ff00ff";
                ctx.fillRect(currentPolygon[i].x - 4, currentPolygon[i].y - 4, 9, 9);
                if (i > 0) {
                    ctx.beginPath();
                    ctx.moveTo(currentPolygon[i - 1].x, currentPolygon[i - 1].y);
                    ctx.lineTo(currentPolygon[i].x, currentPolygon[i].y);
                    ctx.stroke();
                }
            }        
            ctx.beginPath();
            ctx.moveTo(currentPolygon[currentPolygon.length - 1].x, currentPolygon[currentPolygon.length - 1].y);
            ctx.lineTo(mouseData.x, mouseData.y);
            ctx.stroke();
        }
        // Draw all other existing polygons
        for (let i = 0; i < allPolygons.length; i++) {
            ctx.strokeStyle="#0000ff"; 

            if (isComplex(allPolygons[i])) {
                ctx.strokeStyle="#ff0000"; 
            } else {
                ctx.strokeStyle="#0000ff";  
            }

            for (let j = 0; j < allPolygons[i].length; j++) {
                ctx.fillStyle="#0000ff";
                              
                if (isConcave(allPolygons[i], j))
                {
                    ctx.fillStyle="#ff0000";
                } else {
                    ctx.fillStyle="#0000ff";
                }
                
                // Draw vertices
                ctx.fillRect(allPolygons[i][j].x - 4, allPolygons[i][j].y - 4, 9, 9); 
                // Draw surfaces      
                if (j > 0) {    
                    ctx.beginPath();
                    ctx.moveTo(allPolygons[i][j - 1].x, allPolygons[i][j - 1].y);
                    ctx.lineTo(allPolygons[i][j].x, allPolygons[i][j].y);
                    if (j === allPolygons[i].length - 1) {
                        ctx.moveTo(allPolygons[i][j].x, allPolygons[i][j].y);
                        ctx.lineTo(allPolygons[i][0].x, allPolygons[i][0].y);
                    }
                    ctx.stroke();
                } 
            }
        }        
    };

    let update = () => {
        document.getElementById("clearsaved").innerHTML = `Clear Saved Polygons (${allPolygons.length})`;
        if (selectedPoint !== null) {
            allPolygons[selectedPoint.poly][selectedPoint.vert].x = mouseData.x;
            allPolygons[selectedPoint.poly][selectedPoint.vert].y = mouseData.y;
        }
    }

    let main = () => {
        update();
        draw();
        requestAnimationFrame(main);
    }

    main();
}
