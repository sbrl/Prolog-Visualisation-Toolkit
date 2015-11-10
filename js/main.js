"use strict";
/*
███████ ██    ██ ███████ ███    ██ ████████     ██████  ██ ███    ██ ██████  ██ ███    ██  ██████  ███████ 
██      ██    ██ ██      ████   ██    ██        ██   ██ ██ ████   ██ ██   ██ ██ ████   ██ ██       ██      
█████   ██    ██ █████   ██ ██  ██    ██        ██████  ██ ██ ██  ██ ██   ██ ██ ██ ██  ██ ██   ███ ███████ 
██       ██  ██  ██      ██  ██ ██    ██        ██   ██ ██ ██  ██ ██ ██   ██ ██ ██  ██ ██ ██    ██      ██ 
███████   ████   ███████ ██   ████    ██        ██████  ██ ██   ████ ██████  ██ ██   ████  ██████  ███████ 
*/
window.addEventListener("load", function (event) {
    document.getElementById("prolog-trace").addEventListener("input", function (event) {
        var trace = parseTrace(this.value);
        console.log(trace);
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
        //    The `T` from the beginning
        //    The ` ? creep` from the end
        //    Whitespace from either end
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
        console.log(matches);
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
