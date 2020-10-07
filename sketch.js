var degree, n, nplus1, w_arr, U, points, t_step, arr, drawed, pointsize_arr, mouseymin, mousexmax;

// calculate nurbs weight for a given controllpoint (idx) and parameter (t)
function nurbs_weight(idx, t) {
    // arr will contain the values of the weight functions at different levels
    // first, calculate the values of the level zero weight functions
    arr.fill(0);
    // at level zero find the knot range that return 1 for the parameter value t
    for ( var x = idx + degree; x >= idx; --x ) {
        if ( t >= U[x] ) {
            // if knot range is invalid then return 0 (to eliminate NaN return value)
            if ( U[x] == U[x + 1] ) {
                return 0;
            }
            arr[x - idx] = 1;
            break;
        }
    }
    // compute the values of the weight functions from level one to level p (degree)
    var level = 1;
    // on level one there are p (degree) weight functions, the next level with one less, and so on...
    for ( x = degree; x >= 1; --x ) {
        // at the given level compute all values of weight functions
        for ( var y = 0; y < x; ++y ) {
            let ii = idx + y;
            if ( arr[y] != 0 ) {
                arr[y] = ((t - U[ii]) / (U[ii + level] - U[ii])) * arr[y];
            }
            if ( arr[y + 1] != 0 ) {
                arr[y] += ((U[ii + level + 1] - t) / (U[ii + level + 1] - U[ii + 1])) * arr[y + 1];
            }
        }
        ++level;
    }
    // arr[0] is the value of the N(idx, p)(t) from the formula
    return arr[0];
}

function setup() {
    // setAttributes('antialias', true);
    
    // assignments of parameters
    degree = 3; n = 6; nplus1 = n + 1;
    // control points weigths array
    w_arr = [1, 1, 1, 1, 1, 1, 1];
    // control points draw sizes
    pointsize_arr = [1, 1, 1, 1, 1, 1, 1];
    // knot vector with two endpoints interpolation
    U = [0, 0, 0, 0, 1, 2, 3, 4, 4, 4, 4];
    // split the curve to 200 parts
    t_step = (U[nplus1] - U[degree]) / 200;
    // full window canvas creation on the webpage
    var canvasDiv = document.getElementById('cvas');
    let myCanvas = createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight - 4);
    myCanvas.parent('cvas');
    // toenforce mouse event within canvas
    mousexmax = windowWidth - document.getElementById('two').offsetWidth;
    mouseymin = document.getElementById('leiras').offsetHeight;
    // define the controllpoints
    points = [
                0.10 * width, 0.42 * height,
                0.22 * width, 0.22 * height,
                0.36 * width, 0.32 * height,
                0.46 * width, 0.70 * height,
                0.62 * width, 0.83 * height,
                0.76 * width, 0.66 * height,
                0.84 * width, 0.42 * height
             ];
    // no fill because no closed shape
    noFill();
    // arr will contain the values of the weight functions at different levels
    arr = new Array(degree + 1).fill(0);
    drawed = false;
}

function draw() {
    // draw the curve on page loading and when the parameters have changed
    if( !drawed ){
        // clear the canvas
        background(111);
        
        // draw curve
        // point / line width
        strokeWeight(8);
        // controll poligon
        // point / line color
        stroke(0);
        beginShape();
        for ( var i = 0; i < points.length; i += 2 ) {
            vertex(points[i], points[i + 1]);
        }
        endShape();
        stroke(255, 50, 50);
        // end knot for curve - floating point error
        var tnplus1 = U[nplus1] - t_step / 2;
        // calculate the vertices of the curve
        beginShape();
            // for ( let kk = 0; kk < U.length; ++kk ) {
            //     console.log(U[kk]);
            // }
            // looping the t parameter from t|degree to t|nplus1
            for ( var t = U[degree]; t < tnplus1; t += t_step ) {
                // calculate the start and end indices of the points which will have non zero weigts
                let startWFi = 0, endWFi = 0;
                for ( i = n; ; --i ) {
                    if ( t >= U[i] ) {
                        endWFi = i;
                        startWFi = i - degree;
                        break;
                    }
                }
                // calculate the bsplineweights * points * pointweights
                let sum_x = 0, sum_y = 0, nw_sum = 0;
                for ( i = startWFi; i <= endWFi; ++i ) {
                    let nw = nurbs_weight(i, t) * w_arr[i];
                    nw_sum += nw;
                    sum_x += nw * points[i * 2];
                    sum_y += nw * points[i * 2 + 1];
                }
                // create only valid vertex
                if ( nw_sum > 0 ) {
                    let nurbs_div = 1 / nw_sum;
                    vertex(sum_x * nurbs_div, sum_y * nurbs_div);
                }
            }
            // last curve point
            let sum_x = 0, sum_y = 0, nw_sum = 0;
            for ( i = nplus1 - degree; i < nplus1; ++i ) {
                let nw = nurbs_weight(i, U[nplus1] - 0.001) * w_arr[i];
                nw_sum += nw;
                sum_x += nw * points[i * 2];
                sum_y += nw * points[i * 2 + 1];
            }
            
            if( nw_sum > 0 ){
                let nurbs_div = 1 / nw_sum;
                vertex(sum_x * nurbs_div, sum_y * nurbs_div);
            }
            
        endShape();
        
        // draw knotpoints
        stroke(255, 255, 50);
        strokeWeight(10);
        for ( i = degree; i < nplus1; ++i ) {
            let sum_x = 0, sum_y = 0, nw_sum = 0;
            for ( j = i - degree; j <= i; ++j ) {
                let nw = nurbs_weight(j, U[i]) * w_arr[j];
                nw_sum += nw;
                sum_x += nw * points[j * 2];
                sum_y += nw * points[j * 2 + 1];
            }
            if ( nw_sum > 0 ) {
                let nurbs_div = 1 / nw_sum;
                point(sum_x * nurbs_div, sum_y * nurbs_div);
            }
        }
        
        // draw controllpoints
        stroke(50, 255, 50);
        for (var i = 0; i < points.length; i += 2) {
            if ( pointsize_arr[i / 2] != 0 ) {
                strokeWeight(20 * pointsize_arr[i / 2]);
                point(points[i], points[i+1]);
            }
        }
        drawed = true;
    }
}

let dragged_point = -1, epsilon = 5, on_point = -1;

function mouseDragged() {
    if ( mouseX <= mousexmax && mouseY > mouseymin ) {
        if ( dragged_point >= 0 ) {
            points[dragged_point] = mouseX;
            points[dragged_point + 1] = mouseY;
            drawed = false;
        }
    }
}

function distance(px, py, mx, my) {
    let dx = px - mx,
        dy = py - my;
    return dx * dx + dy * dy;
}

function mousePressed() {
    if ( mouseX <= mousexmax && mouseY > mouseymin ) {
        // remove controllpoint if right click was on it
        if ( mouseButton === RIGHT ) {
            for ( var i = 0; i < points.length; i += 2 ) {
                if ( distance(points[i], points[i + 1], mouseX, mouseY) <= 100 ) {
                    dragged_point = i;
                    break;
                }
            }
            if ( dragged_point != -1 ) {
                // if there is only two points then nothing happen
                if ( n == 1 ) {
                    return;
                }
                points.splice(dragged_point, 2);
                w_arr.splice(dragged_point / 2, 1);
                pointsize_arr.splice(dragged_point / 2, 1);
                --n;
                --nplus1;
                // delete last knot dom element
                let x = document.getElementsByClassName("knotdiv");
                x[U.length - 2].firstElementChild.max = 1000;
                x[U.length - 1].remove();
                U.pop();
                
                let elemIdegree = document.getElementById("idegree");
                --elemIdegree.max;
                if ( n == degree ) {
                    --degree;
                    // degree dom element decrease
                    --elemIdegree.value;
                    // delete last knot dom element
                    let x = document.getElementsByClassName("knotdiv");
                    x[U.length - 2].firstElementChild.max = 1000;
                    x[U.length - 1].remove();
                    U.pop();
                }
                drawed = false;
            }
        }else if( mouseButton === LEFT ){
            for ( var i = 0; i < points.length; i += 2 ) {
                if ( distance(points[i], points[i + 1], mouseX, mouseY) <= 100 ) {
                    dragged_point = i;
                    break;
                }
            }
            // if mouse pressed not on a controllpoint area then create new controllpoint
            if ( dragged_point == -1 ) {
                points.push(mouseX, mouseY);
                w_arr.push(1);
                pointsize_arr.push(1);
                ++n;
                ++nplus1;
                U.push(U[U.length - 1] + 1);
                let lastinput = document.getElementById("two").lastElementChild.firstElementChild;
                let newdiv = document.getElementById("two").lastElementChild.cloneNode(true);
                let newinput = newdiv.firstElementChild;
                newinput.min = lastinput.value;
                newinput.max = 1000;
                newinput.value = newinput.min * 1 + 1;
                newinput.addEventListener('change', Knotchanged);
                lastinput.max = newinput.value;
                document.getElementById("two").appendChild(newdiv);
                
                ++document.getElementById("idegree").max;
                
                dragged_point = points.length - 1;
                drawed = false;
            }
        }
    }
}

function mouseReleased() {
    dragged_point = -1;
}

function mouseMoved() {
    if ( mouseX <= mousexmax && mouseY > mouseymin ) {
        for ( var i = 0; i < points.length; i += 2 ) {
            if ( distance(points[i], points[i + 1], mouseX, mouseY) <= 100 ) {
                on_point = i / 2;
                return;
            }
        }
    }
    on_point = -1;
}

function mouseWheel(event) {
    if ( on_point >= 0 ) {
        w_arr[on_point] += event.delta > 0 ? -1 : 1;
        if ( w_arr[on_point] < 0 ) {
            w_arr[on_point] = 0;
        }
        if ( w_arr[on_point] == 0 ) {
            pointsize_arr[on_point] = 0;
        }else if( w_arr[on_point] == 1 ){
            pointsize_arr[on_point] = 1;
        }else {
            pointsize_arr[on_point] *= event.delta > 0 ? 0.9 : 1.1;
        }
        drawed = false;
    }
    
    //comment to unblock page scrolling
    return false;
}
