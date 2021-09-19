d3.json('flare-2.json').then(data => {
        
    const name = d => d.ancestors().reverse().map(d => d.data.name).join("/")
        const {DOM} = new observablehq.Library;
        // d3.csv('data_example.csv').then(data => {
            
        //   console.log(data[0]['level1;level2;level3;value_level1;value_level2;value_level3'])
        // })
      
      const color = d3.scaleOrdinal(d3.schemeCategory10)
      const width = 954
      const height = 954
      const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);

      function tile(node, x0, y0, x1, y1) {
          d3.treemapBinary(node, 0, 0, width, height);
          for (const child of node.children) {
            child.x0 = x0 + (child.x0 / width) * (x1 - x0);
            child.x1 = x0 + (child.x1 / width) * (x1 - x0);
            child.y0 = y0 + (child.y0 / height) * (y1 - y0);
            child.y1 = y0 + (child.y1 / height) * (y1 - y0);
          }
        }
        
      const treemap = data => d3.treemap()
        .tile(tile)
        .size([width, height])
        .padding(1)
        .round(true)
        (d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value))
      const format = d3.format(",d")
    //   const root = treemap(data);
    // const svg = d3.create("svg")
    //     .attr("viewBox", [0.5, -30.5, width, height + 30])
    //     .style("font", "10px sans-serif");
  
    const svg = d3.select('#partitionSVG')
            .style("width", "70%")
            .style("height", "99vh")
            .style("font", "10px sans-serif");

    let group = svg.append("g")
        .call(render, treemap(data));
  
    function render(group, root) {
      console.log('root',root)
      const node = group
        .selectAll("g")
        .data(root.children.concat(root))
        // .data(root.leaves())
        .join("g")
        .attr("transform", d => {
            return `translate(${d.x0},${d.y0})`
        });
  
      node.filter(d => {
        console.log('filtered',d)
        console.log('parant',d.parent)
        console.log('children',d.children)
        return d === root ? d.parent : d.children
      })
          .attr("cursor", "pointer")
          .on("click", (event, d) => d === root ? zoomout(root) : zoomin(d));
      node.append("title")
      .text(d => `${d.ancestors().reverse().map(d => d.data.name).join("/")}\n${format(d.value)}`);  
      node.append("rect")
          .attr("id", d => (d.leafUid = DOM.uid("leaf")).id)
          //.attr("fill", d => d === root ? "#fff" : d.children ? "#ccc" : "#ddd")
          .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
           .attr("stroke", "#fff");
    //         .attr("fill-opacity", 0.6)
    // .attr("width", d => d.x1 - d.x0)
    // .attr("height", d => d.y1 - d.y0);
  
      node.append("clipPath")
          .attr("id", d => (d.clipUid = DOM.uid("clip")).id)
        .append("use")
          .attr("xlink:href", d => d.leafUid.href);
  
      node.append("text")
          .attr("clip-path", d => d.clipUid)
          .attr("font-weight", d => d === root ? "bold" : null)
        .selectAll("tspan")
        .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
        .join("tspan")
          .attr("x", 3)
          .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
          .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
          .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
          .text(d => d);
  
      group.call(position, root);
    }
  
    function position(group, root) {
      group.selectAll("g")
          .attr("transform", d =>{ 
              return d === root ? `translate(0,-30)` : `translate(${d.x0},${d.y0})`
            })
        .select("rect")
          .attr("width", d => d === root ? width : d.x1 - d.x0)
          .attr("height", d => d === root ? 30 : d.y1 - d.y0);
    }
  
    // When zooming in, draw the new nodes on top, and fade them in.
    function zoomin(d) {
      console.log('d', d)
      const group0 = group.attr("pointer-events", "none");
      const group1 = group = svg.append("g").call(render, d);
  
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);
  
      svg.transition()
          .duration(750)
          .call(t => group0.transition(t).remove()
            .call(position, d.parent))
          .call(t => group1.transition(t)
            .attrTween("opacity", () => d3.interpolate(0, 1))
            .call(position, d));
    }
  
    // When zooming out, draw the old nodes on top, and fade them out.
    function zoomout(d) {
      const group0 = group.attr("pointer-events", "none");
      const group1 = group = svg.insert("g", "*").call(render, d.parent);
  
      x.domain([d.parent.x0, d.parent.x1]);
      y.domain([d.parent.y0, d.parent.y1]);
  
      svg.transition()
          .duration(750)
          .call(t => group0.transition(t).remove()
            .attrTween("opacity", () => d3.interpolate(1, 0))
            .call(position, d))
          .call(t => group1.transition(t)
            .call(position, d.parent));
    }
  
 svg.node()})