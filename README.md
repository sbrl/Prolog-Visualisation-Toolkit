Prolog Trace Visualisation Toolkit
==================================
Welcome to the Prolog Visualisation Toolkit. This project exists out of frustration at the lack of such tools available to both understand and debug Prolog code that I am reading and writing for a module at [Hull University](//hull.ac.uk/). This project aims to act as a place in which I (and hopefully you too!) can write tools to visualise Prolog code in order to gain a better understanding as to how it works. 

For now, this repository contains a web based tool that given a Prolog trace (examples are in the `test_traces` folder), produces a diagram that represents that trace. The next step will be to animate the diagram.

Getting Started
---------------
Currently the latest working version of this code is hosted on [GitHub Pages](//pages.github.com/). You can find it [here](http://sbrl.github.io/Prolog-Visualisation-Toolkit/index.html).

If you want to run the bleeding edge version, simply clone this repository and open `index.html` in your browser. Help cloning is available if you [open an issue](https://github.com/sbrl/Prolog-Visualisation-Toolkit/issues/new).

Contributing
------------
If you want to help out, there are several things you can do:

 - Open an issue if you find a trace that breaks the diagram.
 - Fork this repository and play around with the code. Remember to commit to the `master` branch and not the `gh-pages` branch!

Credits
-------
 - (none yet! [Open an issue](https://github.com/sbrl/Prolog-Visualisation-Toolkit/issues/new) or [Fork this repository](https://github.com/sbrl/Prolog-Visualisation-Toolkit/fork) and be the first!)
 
License
-------
This code is released under the [MPL 2.0](https://raw.githubusercontent.com/sbrl/Prolog-Visualisation-Toolkit/master/LICENSE). If you don't know what that means, [tl;dr Legal have an excellent explanation](https://tldrlegal.com/license/mozilla-public-license-2.0-(mpl-2)). If this license isn't suitable, please [open an issue](https://github.com/sbrl/Prolog-Visualisation-Toolkit/issues/new) and I will try and sort it out.

Notes
-----
This tool uses the following libraries:

 - [Mermaid: A Diagram rendering tool](https://github.com/knsv/mermaid/), ([Live editor](http://knsv.github.io/mermaid/live_editor/), [Docs](http://knsv.github.io/mermaid/))
