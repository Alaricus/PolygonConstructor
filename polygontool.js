"use strict";

window.onload = function() {

    /*-----------------------------------------------------*/
    // HTML elements and interface-related event listeners //
    /*-----------------------------------------------------*/

    const canvas = document.getElementById("screen")
    const ctx = canvas.getContext("2d");
    const clearSaved = document.getElementById("clearSaved");
    const clearImage = document.getElementById("clearImage");
    const expo = document.getElementById("export");
    const uploadArea = document.getElementById("uploadArea");
    const imgUploadArea = document.getElementById("imgUploadArea");
    const hSize = document.getElementById("hSize");
    const wSize = document.getElementById("wSize");
    const resize = document.getElementById("resize");
    const img = new Image();

    canvas.width = 800;
    canvas.height = 600;

    // Does not allow entering negative numbers into height.
    hSize.addEventListener("keypress", (e) => {                    
        if (e.charCode < 48) {
            e.preventDefault();
            return false;
        }
    }, false);

    // Does not allow entering negative numbers into width.
    wSize.addEventListener("keypress", (e) => {
        if (e.charCode < 48) {
            e.preventDefault();
            return false;
        }
    }, false);

    // The Resize button.
    resize.addEventListener("click", (e) => {
        if (hSize.value > 0 && wSize.value > 0) {
            canvas.width = wSize.value;
            canvas.height = hSize.value;
        }                    
    }, false);

    // Clear Saved Polygons button.
    clearSaved.addEventListener("click", (e) => {
        allPolygons = [];
    }, false);

    // Clear Image button.
    clearImage.addEventListener("click", (e) => {
        img.src = "";
        clearImage.style.color = "lightslategray";
        clearImage.style.borderColor = "lightslategray";
    }, false);   

    // Export Current Polygons button.
    expo.addEventListener("click", (e) => {
        if (allPolygons.length > 0) {
            const dataURL = JSON.stringify({canvas: {w: canvas.width, h: canvas.height}, polygons: allPolygons});
            expo.href = "data:text/json;charset=utf-8," + encodeURIComponent(dataURL);
        } else {
            e.preventDefault();
        }
    });
    
    // 1 of 4 drag and drop events for the image uploader.
    imgUploadArea.addEventListener("dragenter", (e) => {
        e.preventDefault();
        dragOverColorChange(imgUploadArea);
        return false;
    }, false);

    // 2 of 4 drag and drop events for the image uploader.
    imgUploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragOverColorChange(imgUploadArea);
        return false;
    }, false);

    // 3 of 4 drag and drop events for the image uploader.
    imgUploadArea.addEventListener("dragleave", (e) => {
        dragOutColorChange(imgUploadArea);
    }, false);

    // 4 of 4 drag and drop events for the image uploader.
    imgUploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        const fr = new FileReader();
        fr.onload = function(event) {
            try {
                img.onload = () => {
                    canvas.width = img.width;
                    wSize.value = img.width;
                    canvas.height = img.height;
                    hSize.value = img.height;
                }
                img.src = event.target.result;

                uploadSuccess(imgUploadArea);
                clearImage.style.color = "black";
                clearImage.style.borderColor = "black";
            } catch (err) {
                uploadFailure(imgUploadArea);
            }
        }
        // Only accept images and only use the first file if several are dragged.
        const file = e.dataTransfer.files[0];
        if (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/gif") {
            fr.readAsDataURL(file);
        } else {
            uploadFailure(imgUploadArea);
        }

    }, false);

    // 1 of 4 drag and drop events for the JSON uploader.
    uploadArea.addEventListener("dragenter", (e) => {
        e.preventDefault();
        dragOverColorChange(uploadArea);
        return false;
    }, false);

    // 2 of 4 drag and drop events for the JSON uploader.
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        dragOverColorChange(uploadArea);
        return false;
    }, false);

    // 3 of 4 drag and drop events for the JSON uploader.
    uploadArea.addEventListener("dragleave", (e) => {
        dragOutColorChange(uploadArea);
    }, false);

    // 4 of 4 drag and drop events for the JSON uploader.
    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        let maxW = 0;
        let maxH = 0;
        let error = false;
        // Borrowing an array method to iterate through these files.
        Array.prototype.forEach.call(e.dataTransfer.files, (item) => {
            const fr = new FileReader();
            fr.onload = function(event) {
                try {
                    // If there was an error in one of the previous files, stop the rest.
                    if (error) { throw "Had an error in a previous file." }
                    const importedData = JSON.parse(event.target.result);
                    // Using the largest of all imported files' canvas dimensions to merge all files.
                    if (importedData.canvas.w > maxW) {
                        canvas.width = importedData.canvas.w;
                        maxW = importedData.canvas.w;
                        wSize.value = importedData.canvas.w;
                    }
                    if (importedData.canvas.h > maxH) {
                        canvas.height = importedData.canvas.h;
                        maxH = importedData.canvas.h;
                        hSize.value = importedData.canvas.h;
                    }

                    importedData.polygons.forEach((newPoly) => {
                        // If even one matches, the whole thing stops and returns true.
                        const match = allPolygons.some((existingPoly) => {
                            return polygonsMatch(existingPoly, newPoly);
                        }); 
                        
                        if (!match) {
                            allPolygons.push(newPoly);
                        }
                    });

                    uploadSuccess(uploadArea);
                } catch (err) {
                    uploadFailure(uploadArea);
                    error = true;
                }
            }
            fr.readAsText(item);
        });
    }, false);

    // Change the CSS of upload areas when draging a file over.
    const dragOverColorChange = (element) => {
        element.style.borderColor = "limegreen";
        element.style.backgroundColor = "palegreen";
    }

    // Reset the CSS of upload areas when draging a file away.
    const dragOutColorChange = (emelemt) => {
        emelemt.style.borderColor = "dodgerblue";
        emelemt.style.backgroundColor = "white";
    }

    // CSS changes on a sucessful upload of image or JSON.
    const uploadSuccess = (element) => {
        element.style.borderColor = "dodgerblue";
        element.style.backgroundColor = "white";
    }

    // CSS changes on a failed upload of image or JSON.
    const uploadFailure = (element) => {
        element.style.display = "block";
        element.style.borderColor = "red";
        element.style.backgroundColor = "pink";
        element.innerHTML = `<br>Wrong file type or corrupted file.<br><br>Try again.`;
    }

    // When the mouse moves, grab the coordinates.
    ctx.canvas.addEventListener("mousemove", (e) => {
        mouseData = getMouseData(ctx.canvas, e);
    }, false);

    // When a mouse left-clicks check if there's already a vertex there.
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

    // When letting of of the left mouse button after a click.
    ctx.canvas.addEventListener("mouseup", (e) => {
        if (selectedPoint !== null || keyUsed) {
            selectedPoint = null;
            currentPolygon = [];
            polygonInProgress = false;
            keyUsed = false;
        } else {
            switch(checkForVertex(mouseData)) {
                // If clicking on the starting point of polygon - save the polygon.
                case "savePolygon":
                    // Check if the polygon being saved is clockwise.
                    if (!isClockwise(currentPolygon)) {
                        // If not, make it clockwise.
                        currentPolygon.reverse();
                    }
                    allPolygons.push(currentPolygon);
                    currentPolygon = [];
                    polygonInProgress = false;
                    break;
                // If clicking on an empty area - place a vertex.
                case "place":
                    polygonInProgress = true;
                    currentPolygon.push({x: mouseData.x, y: mouseData.y});
                    break;
            }
        }
    }, false);

    // Press event for the "X" key to delete a vertex being dragged.
    document.addEventListener("keypress", (e) => { 
        // Delete a point unless a polygon is a triangle, because we can't have.
        // a polygon with less then 3 vertices
        if (selectedPoint !== null && allPolygons[selectedPoint.poly].length > 3 
                && e.keyCode === 120) { // the X key
            allPolygons[selectedPoint.poly].splice(selectedPoint.vert, 1);
            selectedPoint = null;
            keyUsed = true;
        }
    });

    /*--------------------------------------------------*/
    // Functions related to actual polygon calculations //
    /*--------------------------------------------------*/

    let mouseData = {};
    let allPolygons = [];
    let currentPolygon = []; 
    let polygonInProgress = false;
    let selectedPoint = null;
    let keyUsed = false;

    const polygonsMatch = (poly1, poly2) => {
        if (poly1.length !== poly2.length) { return false; }
        // If even one doesn't match, the whole thing stops and returns false.
        return poly1.every((item, index) => {
            return item.x === poly2[index].x && item.y === poly2[index].y;
        });
    };

    const getMouseData = (canv, e) => {
        const rect = canv.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const checkForVertex = (coords) => {
        // First check all vertices in allPolygons.
        allPolygons.forEach((polygon, polyIndex) => {
            polygon.forEach((vertex, vertIndex) => {
                if (coords.x >= vertex.x - 4
                && coords.x <= vertex.x + 4
                && coords.y >= vertex.y - 4
                && coords.y <= vertex.y + 4) {
                    if (polygonInProgress) {
                        return "existing";
                    } else {
                        selectedPoint = { poly: polyIndex, vert: vertIndex, x: coords.x, y: coords.y };
                        return "dragging";
                    }
                }
            });
        });
        // Then check all vertices in currentPolygon except 0.
        currentPolygon.forEach((vertex) => {
            if (coords.x >= vertex.x - 4
            && coords.x <= vertex.x + 4
            && coords.y >= vertex.y - 4
            && coords.y <= vertex.y + 4) {
                return "existing";
            }
        });
        // Finally check for vertex 0 of currentPolygon and if the polygon is AT LEAST a triangle allow to save it.
        if (currentPolygon.length > 2
        && coords.x >= currentPolygon[0].x - 4
        && coords.x <= currentPolygon[0].x + 4
        && coords.y >= currentPolygon[0].y - 4
        && coords.y <= currentPolygon[0].y + 4) {
            return "savePolygon";
        }
        // If none of the above cases.
        return "place"
    };

    const isClockwise = (vertices) => {
        // Using the shoelace formula.
        let xx = 0;
        let yy = 0;
        vertices.forEach((vertex, index) => {
            if(index !== vertices.length - 1) {
                xx += vertex.x * vertices[index + 1].y;
                yy += vertex.y * vertices[index + 1].x;
            } else {
                xx += vertex.x * vertices[0].y;
                yy += vertex.y * vertices[0].x;
            }
        });
        // This is inverted because on HTML canvas Y is inverted.
        if (xx > yy) {
            return true;
        }
        return false;
    };

    const isConcave = (vertices, vertex) => {
        const prev = vertices[vertex === 0 ? vertices.length - 1 : vertex - 1];
        const curr = vertices[vertex];
        const next = vertices[(vertex + 1) % vertices.length];
        // Convert the side of the polygon from "prev" to "curr" into a vector (origin to "vector1").
        const vector1 = { x: curr.x - prev.x, y: curr.y - prev.y };
        // Convert the side of the polygon from "curr" to "next" into a vector (origin to "vector2").
        const vector2 = { x: next.x - curr.x, y: next.y - curr.y };
        // Get a cross product of the two vectors.
        // A cross product is a 3D vector (not a scalar) and in this case we have the z-axis be 0
        // so both vectors look like this: (value, value, 0). Because both vectors are flat on a
        // plane, the cross product looks like this: (0, 0, value) it's perpendicular to both of
        // them by being perfectly vertical and can go either above that plane or below it. If
        // the z value is positive the angle is convex, and if it is negative it is concave.
        const zCrossProduct = (vector1.x * vector2.y) - (vector1.y * vector2.x);
        return zCrossProduct < 0;
    };

    const isComplex = (polygon) => {
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

    const segmentsCross = (A, B, C, D) => {
        const crossProductABCD = ((B.x - A.x) * (D.y - C.y)) - ((B.y - A.y) * (D.x - C.x));
        
        // Vectors AB and CD are parallel.
        if (crossProductABCD == 0) {
            return false;
        }
    
        const crossProductACDC = ((A.y - C.y) * (D.x - C.x)) - ((A.x - C.x) * (D.y - C.y)); 
        const crossProductABAC = ((A.y - C.y) * (B.x - A.x)) - ((A.x - C.x) * (B.y - A.y));
        
        // Vectors AC and DC (or BA and AC) touch only at endpoints so in one case there is no B and in another no D.
        if (crossProductACDC == 0 || crossProductABAC == 0) {
            return false;
        }
        
        // All other cases must be between 0 and a crossProduct of BADC
        // so since neither is equal to 0 we divide by the crossProduct
        // of BADC to make sure they aren't equal as (value / itself = 1).
        const test1 = crossProductACDC / crossProductABCD;
        const test2 = crossProductABAC / crossProductABCD;
        
        return (test1 > 0 && test1 < 1) && (test2 > 0 && test2 < 1);
    };

    // Check if a point is inside a polygon.
    const isPointInside = (polygon, point) => {
        const isInside = false;

        // Run a ray from off-screen to a point and count the times it crosses sides.
        const origin = { x: -1, y: -1 };
        let crossings = 0;

        for (let i = 0; i < polygon.length; i++) {
            let j = null;
            i === polygon.length - 1 ? j = 0 : j = i + 1;
            if (segmentsCross(origin, point, polygon[i], polygon[j])) crossings++;
        }

        if (crossings === 0) {
            return false;
        } else if (crossings % 2 === 0) {
            return false;
        } else {
            return true;
        }
    };

    /*---------------------------------------------*/
    // Rendeting functions: Main, Update, and Draw //
    /*---------------------------------------------*/

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // In case an image was uploaded.
        if (img.src !== "") {
            ctx.globalAlpha = 0.25;
            ctx.drawImage(img, 0, 0);
            ctx.globalAlpha = 1;
        }

        // Draw the vertices and connecting lines of the polygon currently being built.
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
        // Draw all other existing polygons.
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
                
                // Draw vertices.
                ctx.fillRect(allPolygons[i][j].x - 4, allPolygons[i][j].y - 4, 9, 9);

                // Draw edges.     
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

    const update = () => {
        clearSaved.innerHTML = `Clear Saved Polygons (${allPolygons.length})`;
        if (selectedPoint !== null) {
            allPolygons[selectedPoint.poly][selectedPoint.vert].x = mouseData.x;
            allPolygons[selectedPoint.poly][selectedPoint.vert].y = mouseData.y;
        }
    }

    const main = () => {
        update();
        draw();
        requestAnimationFrame(main);
    }

    main();
}
