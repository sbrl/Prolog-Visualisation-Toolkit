"use strict";
/*
███████ ██    ██ ███████ ███    ██ ████████     ██████  ██ ███    ██ ██████  ██ ███    ██  ██████  ███████ 
██      ██    ██ ██      ████   ██    ██        ██   ██ ██ ████   ██ ██   ██ ██ ████   ██ ██       ██      
█████   ██    ██ █████   ██ ██  ██    ██        ██████  ██ ██ ██  ██ ██   ██ ██ ██ ██  ██ ██   ███ ███████ 
██       ██  ██  ██      ██  ██ ██    ██        ██   ██ ██ ██  ██ ██ ██   ██ ██ ██  ██ ██ ██    ██      ██ 
███████   ████   ███████ ██   ████    ██        ██████  ██ ██   ████ ██████  ██ ██   ████  ██████  ███████ 
*/
window.addEventListener("load", function (event) {
	// Initialise the graph rendering library
	mermaidAPI.initialize({ startOnLoad: false });
	
	// Listen for input in the textbox
	document.getElementById("prolog-trace").addEventListener("input", function (event) {
		// Parse the trace and generate the graph code
		var trace = parseTrace(this.value),
			graphCode = generateGraphCode(trace);
		
		document.getElementById("diagram-code").value = graphCode;
		
		// Wipe the diagram output box
		document.getElementById("diagram-output").innerHTML = "";
		
		// Check the graph code syntax first
		if(!mermaid.parse(graphCode)) console.error("Invalid diagram syntax.");
		// Draw the diagram to the screen
		mermaidAPI.render("diagram-output", graphCode, function(svgCode) {
			var outputElement = document.getElementById("diagram-output");
			outputElement.innerHTML = svgCode;
			// A hack to copy a few attributes over to get it to display properly
			var attrs = [ "height", "viewbox", "style" ];
			for (let attr of attrs)
			{
				outputElement.querySelector("svg").setAttribute(attr, outputElement.getAttribute(attr));
				outputElement.removeAttribute(attr);
			}
			// An even bigger hack to forcefully update the display after performing the above hack
			outputElement.innerHTML += "";
		});
	});
});

/*
████████ ██████   █████   ██████ ███████     ██████   █████  ██████  ███████ ███████ ██████  
   ██    ██   ██ ██   ██ ██      ██          ██   ██ ██   ██ ██   ██ ██      ██      ██   ██ 
   ██    ██████  ███████ ██      █████       ██████  ███████ ██████  ███████ █████   ██████  
   ██    ██   ██ ██   ██ ██      ██          ██      ██   ██ ██   ██      ██ ██      ██   ██ 
   ██    ██   ██ ██   ██  ██████ ███████     ██      ██   ██ ██   ██ ███████ ███████ ██   ██ 
*/
function parseTrace(source)
{
	console.log("source", source);
	var lines = source.trim().split(/\r?\n/),
		trace = [],
		result;
	for(let line of lines)
	{
		// Skip blank lines
		if(line.trim().length == 0) continue;
		// Normalise the line by removing:
		//	The `T` from the beginning
		//	The ` ? creep` from the end
		//	Whitespace from either end
		line = line.replace(/^\s*T\s+/, "");
		line = line.replace(/\s+\?\s+creep\s*/i, "");
		line = line.trim();
		
		let matches = line.match(/^([a-z]+): \(([0-9]+)\) (.*)$/i);
		
		if(matches == null)
		{
			// We don't havea regular trace line.
			// It's possible that this is the final result.
			result = line;
			continue;
		}
		
		trace.push({
			type: matches[1].toLowerCase(),
			recursionDepth: parseInt(matches[2]),
			call: matches[3]
		});
	}
	
	return {
		trace,
		result
	};
}

/*
██████  ██  █████   ██████  ██████   █████  ███    ███ ███    ███ ██ ███    ██  ██████  
██   ██ ██ ██   ██ ██       ██   ██ ██   ██ ████  ████ ████  ████ ██ ████   ██ ██       
██   ██ ██ ███████ ██   ███ ██████  ███████ ██ ████ ██ ██ ████ ██ ██ ██ ██  ██ ██   ███ 
██   ██ ██ ██   ██ ██    ██ ██   ██ ██   ██ ██  ██  ██ ██  ██  ██ ██ ██  ██ ██ ██    ██ 
██████  ██ ██   ██  ██████  ██   ██ ██   ██ ██      ██ ██      ██ ██ ██   ████  ██████  
*/
function generateGraphCode(trace) {
	var result = "graph LR\n\tstart\n",
		stack = [],
		i = 0;
	for(let part of trace.trace)
	{
		// Set this trace line's ID
		part.id = i;
		// Calculate the id of the last node in the sequence
		let lastID = "start";
		if(stack.length > 0) lastID = "id" + stack[stack.length - 1].id;
		
		switch(part.type)
		{
			
			case "call":
				// Calculate the number of times we have remade our dicision from this node
				let label = "";
				if(stack.length > 0)
				{
					let lastNode = stack[stack.length - 1];
					if(typeof lastNode.redone != "number")
						lastNode.redone = 0;
					else
						lastNode.redone++;
					label = `|${lastNode.redone}|`;
				}
				// Add this node to the diagram
				result += `\tid${i}["${part.call.replace(/\[/g, "")}"]\n`;
				result += `\t${lastID}-->${label}id${i}\n`;
				
				// Push the node onto the stack
				stack.push(part);
				break;
			case "fail":
				// Remove the last element from the stack
				stack.pop();
				break;
			case "redo":
				// This will be used later when we add an animation to the mix
				break;
			case "exit":
				// This will be used later in the animation, but also to update
				// the visual description of each call as we get to know
				// additional information upon exiting a call.
				stack.pop();
				break;
		}
		
		i++;
	}
	
	result += `\tgoal["${trace.result.replace(/\[/g, "\[")}"]\n`;
	result += `\tstyle goal fill:#ffba00,stroke:#e88600;\n`
	result += `\tid${stack[stack.length - 1].id} --> goal`;
	
	return result;
}

/*
 * @summary Finds the "call" associated with the given trace entry.
 * 
 * @param trace {array} - The trace to search.
 * @param entry {object} - The entry to find the associated call for.
 * @param entryIndex {number} - The index of the above entry in the trace. This is needed because we search backwards from this point in order to find the associated call to avoid finding the incorrect answer
 * 
 * @returns {number} - The index of the trace that contains the call of the associated function.
 */
function findCall(trace, entry, entryIndex)
{
	// todo implement this
}
