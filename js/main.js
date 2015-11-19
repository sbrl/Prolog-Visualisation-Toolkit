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
//			graphCode = generateGraphCode(trace);
			graphTree = generateTraceTree(trace.trace),
			graphCode = generateGraphCodeFromTree(graphTree.rootNode, graphTree.walkthrough);
		
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
		
		var traceTreeData = generateTraceTree(trace.trace);
		console.log("trace tree:", traceTreeData.rootNode);
		console.log("walkthrough:", traceTreeData.walkthrough);
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

function generateTraceTree(trace)
{
	var i = 0,
		prevNode, // The previous node we were working on - usually the parent node
		currentNode, // The current ndoe we are working on
		walkthough = []; // An array that essentially contains a guide on how to walk the tree.
	
	for(var i = 0; i < trace.length; i++)
	{
		// This starts to break when i is about 37. I think its because of edge case that causes us to back up through the tree too fast.
		// I theorise that it has to be because if some kind of redo edge case.
		// We might need to checl that the thing we are failing on is the same as the current node or something.
		// We can't do a similar check on exit however because the call signature changes O.o
		switch(trace[i].type)
		{
			case "call":
				// Set the preiously current node to be the previous node
				prevNode = currentNode;
				// Set this node to be the current node
				currentNode = trace[i];
				// Give this node a unique id
				currentNode.id = i;
				// Set the current node's parent
				currentNode.parentNode = prevNode;
				// Create an array to hold all the child calls
				currentNode.childCalls = [];
				// Add this node to the parent node's list of calls
				if(typeof prevNode !== "undefined") // But only if the previous node is defined (it isn't in the beginning)
					prevNode.childCalls.push(currentNode);
				
				// Push this call to the walkthough
				walkthough.push({ type: trace[i].type, id: currentNode.id });
				break;
			case "fail":
				// Push this fail onto the walkthough before we back up one level
				walkthough.push({ type: trace[i].type, id: currentNode.id });
				
				
				// We have failed! Back up the tree one level.
				prevNode = prevNode.parentNode;
				currentNode = currentNode.parentNode;
				
				
				break;
			case "exit":
				// Push this exit onto the walkthough before we back up one level
				// todo Include the exitSignature in the object that we push here
				walkthough.push({ type: trace[i].type, id: currentNode.id });
				
				// Save the new call signature - new / different information is often available upon exit.
				if(!Array.isArray(currentNode.callSignatureUpdates))
					currentNode.callSignatureUpdates = [];
				currentNode.callSignatureUpdates.push(trace[i].call);
				
				// Back up the tree one level
				prevNode = (typeof prevNode != "undefined") ? prevNode.parentNode : undefined;
				if(i < trace.length - 1) // Don't back up ont he last node. This causes us to loose our reference to the last node!
					currentNode = currentNode.parentNode;
				
				
				break;
			case "redo":
				// Check if the recursion depth of the redo is the same or different to the recursion depth of the currentNode.
				// note This might be useful as a secondary indicator as to whether we are dealing with a redo of a child call or a redo of the currentNode
				
				if(trace[i].recursionDepth == currentNode.recursionDepth)
					break;
				
				// Loop over each of the child calls to work out if this redo is actually a redo of one of the child calls
				for(let j = 0; j < currentNode.childCalls.length; j++)
				{
					if(currentNode.childCalls[j].call == trace[i].call)
					{
						// We have found the exact call signature of the next trace item!
						// Go down a level to the redo.
						prevNode = currentNode;
						currentNode = prevNode.childCalls[j];
					}
				}
				
				// Push this redo onto the walkthrough
				walkthough.push({ type: trace[i].type, id: currentNode.id, redoCallSignature: trace[i].call });
				break;
		}
	}
	
	return {
		// We will have exited all the calls by this point, therefore currentNode will be undefined as it was in the beginning.
		rootNode: currentNode,
		
		walkthrough: walkthough
	}
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
	// Todo convert this from  astcak into a tree of sorts
		stack = [],
		lastPopped,
		startingDepth = trace.trace[0].recursionDepth,
		i = 0;
	for(let part of trace.trace)
	{
		// Set this trace line's ID
		part.id = i;
		// Calculate the id of the last node in the sequence
		let lastID = "start";
		if(stack.length > 0) lastID = "id" + stack[stack.length - 1].id;
		
		//console.log("stack:");
		//console.table(stack);
		//console.log(`cline: ${part.type} ${part.call} (depth ${part.recursionDepth})`);
		
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
				if(stack[stack.length - 1].call !== part.call)
					break;
				// Remove the last element from the stack
				lastPopped = stack[stack.length - 1];
				stack.pop();
				break;
			case "redo":
				// This will be used later when we add an animation to the mix
				break;
			case "exit":
				if(stack[stack.length - 1].call !== part.call)
					break;
				// This will be used later in the animation, but also to update
				// the visual description of each call as we get to know
				// additional information upon exiting a call.
				stack.pop();
				lastPopped = stack[stack.length - 1];
				break;
		}
		
		// stack.length = part.recursionDepth - startingDepth;
		
		i++;
	}
	
	// result += `\tgoal["${trace.result.replace(/\[/g, "\[")}"]\n`;
	// result += `\tstyle goal fill:#ffba00,stroke:#e88600;\n`
	// result += `\tid${lastPopped.id} --> goal`;
	
	return result;
}

function generateGraphCodeFromTree(rootNode, walkthrough)
{
	// todo Use the walkthrough to make an animation.
	// node We might want ot add an extra paramter here telling us which node we are currently on in the animation
	
	// todo Wipe the initialisedOnGraph parameter on start - it might be already set as this function can be called multiple times
	// note Maybe use symbols here? Although this may cause an increase in memory usage when run many times
	var result = "graph LR\n\tidstart\n",
		initialisedIds = [],
		// Create a startingt pseudo-node
		startNode = { id: "start", call: "Start", childCalls: [rootNode] },
		currentNode = rootNode;
	
	// Set the parent of the root node to be the starting node
	rootNode.parentNode = startNode;
	
	for(var i = 0; i < walkthrough.length; i++)
	{
		switch(walkthrough[i].type)
		{
			case "call":
				// Check to make sure we are looking at the node we want to call (node that at the beginning we will be but later on we won't)
				// The index of the current node in its parent's childCalls[] array
				let childCallIndex = 0;
				if(currentNode.id !== walkthrough[i].id)
				{
					// We aren't currently looking at the node we want to do a call on - find it
					let j = 0;
					for(let child of currentNode.childCalls)
					{
						if(child.id == walkthrough[i].id)
						{
							currentNode = child;
							childCallIndex = j;
							break;
						}
						
						j++;
					}
				}
				
				if(initialisedIds.indexOf(walkthrough[i].id) == -1)
				{
					// This node hasn't been initialised on the graph yet. We should do that now.
					result += `\tid${currentNode.id}["${currentNode.call}"]\n`;
					initialisedIds.push(walkthrough[i].id);
				}
				
				result += `\tid${currentNode.parentNode.id} -->|${childCallIndex}| id${currentNode.id}\n`;
				break;
			
			case "fail":
			case "exit":
				// Back up
				currentNode = currentNode.parentNode;
				break;
			
			case "redo":
				if(currentNode.id !== walkthrough[i].id)
				{
					// This redo is a redo of one of the child nodes, not of the currentNode
					// Our mission here is to find that node
					
					for(let child of currentNode.childCalls)
					{
						if(child.id == walkthrough[i].id)
						{
							currentNode = child;
							break;
						}
					}
				}
				break;
		}
	}
	
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
