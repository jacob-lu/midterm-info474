'use strict';

(function() {

  let data = ""; // keep data in global scope
  let svgContainer = ""; // keep SVG reference in global scope

  // load data and make scatter plot after window loads
  window.onload = function() {
    svgContainer = d3.select('body')
      .append('svg')
      .attr('width', 500)
      .attr('height', 500);
    // d3.csv is basically fetch but it can be be passed a csv file as a parameter
    d3.csv("data/data2.csv")
      .then((csvData) => makeScatterPlot(csvData));
  }

  // make scatter plot with trend line
  function makeScatterPlot(csvData) {
    //console.log(csvData)
    data = csvData;
    //console.log(data);
    // get an array of gre scores and an array of chance of admit
    let greScores = data.map((row) => parseInt(row["Year"]));
    let admissionRates= data.map((row) => parseInt(row["Avg. Viewers (mil)"]));

    console.log(admissionRates)

    let axesLimits = findMinMax(greScores, admissionRates);

    // draw axes with ticks and return mapping and scaling functions
    let mapFunctions = drawTicks(axesLimits);

    // plot the data using the mapping and scaling functions
    plotData(mapFunctions);
    // plot the trend line using gre scores, admit rates, axes limits, and
    // scaling + mapping functions
    //plotTrendLine(greScores, admissionRates, axesLimits, mapFunctions);
  }

 

  // plot all the data points on the SVG
  function plotData(map) {
    let xMap = map.x;
    let yMap = map.y;

    // make tooltip
    let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

    // append data to SVG and plot as points
    svgContainer.selectAll('.dot')
      .data(data)
      .enter()
      .append('rect')
        .attr('x', xMap)
        .attr('y', yMap)
        .attr('class', "image-border")
        .attr('width', 11)
        .attr('height', (d) => 450 - yMap(d))//(d) => console.log(d)
        .attr("transform", "translate(-4," + 0 + ")") 
        .attr('fill', function(d) {
          if (d.Year == 1999 || d.Year == 2000) {
            return "#8E8783";
          } else {
          return "#72A4D4"
          };
        }
        )
      .on("mouseover", (d) => {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html( "<p style = text-align:left> " + "<font size = 5, color = red> Year # </font>" 
        + " <font size = 5, color = red> " + d["Year"] + "</font>" 
        + "<br/>" + "Year: " + d["Year"] + "<br/>" + "Episodes: " + d['Episodes']
        + "<br/>" + "Avg Viewers (mil): " + d['Avg. Viewers (mil)'] + "<br/>" + "<br/>"
         + "Most Watched Episode: " + d['Most watched episode'] + 
        "<br/>" + "Viewers (mil): " + d['Viewers (mil)'] + "</p>")
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px") 
        
      })
      .on("mouseout", (d) => {
        div.transition()
          .duration(500)
          .style("opacity", 0);
      })
    
    // label for rectangles textlabels
    svgContainer.selectAll(".text")  		
      .data(data)
      .enter()
      .append("text")
      .text(function(d){
        return d['Avg. Viewers (mil)'];
      })
      .attr("x", xMap)
      .attr("y", d => yMap(d) - 8)
      .attr("dy", ".35em") // vertical-align: middle
      .attr("text-anchor", "middle") // text-align: right
      .style("font-size", "7px");

  // label the y axis
    svgContainer.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -350)
      .attr("y", 20)
      .attr('font-size', '15px')
      //.attr("dy", "1em")
      .text("Avg. Viewers (in millions)"); 
      

    var originalArray = [ {'Year': 1989, 'Avg. Viewers (mil)': 13.5}, {'Year': 2014.5, 'Avg. Viewers (mil)': 13.5}]
    console.log(originalArray);
    
    // build the reference line
    var line = d3.line()
      .x(xMap) // set the x values for the line generator
      .y(yMap) // set the y values for the line generator 

    svgContainer.append("path")
      .datum(originalArray) // 10. Binds data to the line 
      .attr("class", "line") // Assign a class for styling 
      .attr("d", line) // 11. Calls the line generator 
    
    // add text about the line 
    svgContainer.append("text")
        .attr("x", 380)
        .attr("y", 265)
        .attr('font-size', '8px')
        .text("Avg. Viewers (mil): 13.5")
  }

  // draw the axes and ticks
  function drawTicks(limits) {
    // return gre score from a row of data
    let xValue = function(d) { return +d["Year"]; }

    // function to scale gre score
    let xScale = d3.scaleLinear()
      .domain([limits.greMin -1 , limits.greMax]) // give domain buffer room
      .range([50, 450]);

    // xMap returns a scaled x value from a row of data
    let xMap = function(d) { return xScale(xValue(d)); };

    // plot x-axis at bottom of SVG
    let xAxis = d3.axisBottom().scale(xScale).ticks(18).tickFormat(d3.format("d"));
    svgContainer.append("g")
      .attr('transform', 'translate(0, 450)')
      .call(xAxis)
    .selectAll("text")
      .attr("transform", "rotate(270)")
      .attr("dy", "-.3em")
      .attr("y", 6)
      .attr("x", -20);
    

    // return Chance of Admit from a row of data
    let yValue = function(d) { return +d["Avg. Viewers (mil)"]}

    // function to scale Chance of Admit
    let yScale = d3.scaleLinear()
      .domain([limits.admitMax + 3, limits.admitMin - 5]) // give domain buffer
      .range([50, 450]);

    // yMap returns a scaled y value from a row of data
    let yMap = function (d) { return yScale(yValue(d)); };

    // plot y-axis at the left of SVG
    let yAxis = d3.axisLeft().scale(yScale);
    svgContainer.append('g')
      .attr('transform', 'translate(50, 0)')
      .call(yAxis);


    // return mapping and scaling functions
    return {
      x: xMap,
      y: yMap,
      xScale: xScale,
      yScale: yScale
    };
  }

  // find min and max for GRE Scores and Chance of Admit
  function findMinMax(greScores, admissionRates) {

    // get min/max gre scores
    let greMin = d3.min(greScores);
    let greMax = d3.max(greScores);

    // round x-axis limits
    greMax = Math.round(greMax*10)/10;
    greMin = Math.round(greMin*10)/10;

    // get min/max admit chance
    let admitMin = d3.min(admissionRates);
    let admitMax = d3.max(admissionRates);

    // round y-axis limits to nearest 0.05
    admitMax = Number((Math.ceil(admitMax*20)/20).toFixed(2));
    admitMin = Number((Math.ceil(admitMin*20)/20).toFixed(2));

    // return formatted min/max data as an object
    return {
      greMin : greMin,
      greMax : greMax,
      admitMin : admitMin,
      admitMax : admitMax
    }
  }

  // plot trend a line on SVG
  // greScores -> array of greScores
  // admitRates -> array of Chance of Admit
  // limits -> min/max data for GRE Scores and Chance of Admit
  // scale -> scaling functions for x and y
  function plotTrendLine(greScores, admitRates, limits, scale) {

    // use linear regression code from previous lab to get coefficients
    let leastSquareCoefficients = linearRegression(greScores, admitRates);
    let a = leastSquareCoefficients.a;
    let b = leastSquareCoefficients.b;

    // find and initial and end points for the trend line
    let x1 = limits.greMin;
    let y1 = a*x1 + b;
    let x2 = limits.greMax;
    let y2 = a*x2 + b;
    let trendData = [[x1,y1,x2,y2]];

    // append trend line to SVG and assign attributes
    let xScale = scale.xScale;
    let yScale = scale.yScale;
    let trendLine = svgContainer.selectAll('.trendLine')
      .data(trendData)
      .enter()
      .append('line')
      .attr('x1', function(d) { return  xScale(d[0]); })
      .attr("y1", function(d) { return yScale(d[1]); })
			.attr("x2", function(d) { return xScale(d[2]); })
			.attr("y2", function(d) { return yScale(d[3]); })
      .attr('stroke', 'black')
      .attr('stroke-width', 2);
  }

  /*********************************************************
                      Regression Functions
*********************************************************/

function linearRegression(independent, dependent)
  {
      let lr = {};

      let independent_mean = arithmeticMean(independent);
      let dependent_mean = arithmeticMean(dependent);
      let products_mean = meanOfProducts(independent, dependent);
      let independent_variance = variance(independent);

      lr.a = (products_mean - (independent_mean * dependent_mean) ) / independent_variance;

      lr.b = dependent_mean - (lr.a * independent_mean);

      return lr;
  }


  function arithmeticMean(data)
  {
      let total = 0;

      // note that incrementing total is done within the for loop
      for(let i = 0, l = data.length; i < l; total += data[i], i++);

      return total / data.length;
  }


  function meanOfProducts(data1, data2)
  {
      let total = 0;

      // note that incrementing total is done within the for loop
      for(let i = 0, l = data1.length; i < l; total += (data1[i] * data2[i]), i++);

      return total / data1.length;
  }


  function variance(data)
  {
      let squares = [];

      for(let i = 0, l = data.length; i < l; i++)
      {
          squares[i] = Math.pow(data[i], 2);
      }

      let mean_of_squares = arithmeticMean(squares);
      let mean = arithmeticMean(data);
      let square_of_mean = Math.pow(mean, 2);
      let variance = mean_of_squares - square_of_mean;

      return variance;
  }

})();
