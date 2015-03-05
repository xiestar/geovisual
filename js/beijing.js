function drawMap(mapPath, svg) {
	//Define map projection    
       var projection = d3.geo.mercator()
      .center([118, 40])
      .scale(12000)
      .translate([w/2, h/2]);

      var path = d3.geo.path()
                 .projection(projection);

      //Load in agriculture data
      d3.csv("data/csv/beijing-avg-age-2005.csv", function(data) {

        //Set input domain for color scale
        color.domain([
          d3.min(data, function(d) { return d.value; }), 
          d3.max(data, function(d) { return d.value; })
        ]);

        //Load in GeoJSON data
        d3.json(mapPath, function(json) {

          //Merge the ag. data and GeoJSON
          //Loop through once for each ag. data value
          for (var i = 0; i < data.length; i++) {
        
            //Grab state name
            var dataId = data[i].id;
            
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data[i].value);
        
            //Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
            
              var jsonId = json.features[j].properties.id;
        
              if (dataId == jsonId) {
            
                //Copy the data value into the JSON
                json.features[j].properties.value = dataValue;
                
                //Stop looking through the JSON
                break;
                
              }
            }   
          }


          var overColor = "yellow";
          //Bind data and create one path per GeoJSON feature
          svg.selectAll("path")
             .data(json.features)
             .enter()
             .append("path")
             .attr("d", path)
             .attr("stroke","#000")
             .attr("stroke-width",1)
             .attr("fill", function(d,i) {
               return drawBackColor(d);
             })
             .on("mouseover",function(d,i) {
             	d3.select(this)
                    .attr("fill", overColor);

              //获得中心点坐标
              var centroid = path.centroid(d);
              centroid.x = centroid[0];
              centroid.y = centroid[1];

              var areaName = d.properties.name;
              var areaValue = d.properties.value;

	          	drawTip(areaName,areaValue,centroid);
             })
             .on("mouseout",function(d,i) {
             	d3.select(this)
                   .attr("fill", function(d) {
                    return drawBackColor(d);
             	   });
         	     //Hide the tooltip
                d3.select("#tooltip").classed("hidden", true);
             });
      
        });
      
      });
} //end drawMap

function drawBackColor(d) {
	//Get data value
    var value = d.properties.value;
    
    if (value) {
      //If value exists…
      // console.log(color(value));
      return color(value);

    } else {
      //If value is undefined…
      return "#ccc";
    }
} // end drawBackColor

function drawTip(areaName,areaValue,centroid) {
	

	var tooltip = d3.select("#tooltip")
    .style("left",centroid.x + "px")
    .style("top",centroid.y + "px");

	tooltip.select("#area").text(areaName)
	tooltip.select("#value").text(areaValue);

	//Show the tooltip
	d3.select("#tooltip").classed("hidden", false);
}