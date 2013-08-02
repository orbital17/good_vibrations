It is an application for online solving and visualising the boundary value problem of vibrating string.

Try it at http://orbital.pythonanywhere.com/oscill/.

##How it works
User formulates the problem, by setting the input data. Every input should be a valid python statement, that stands for a constant value or a function, depending on context. There can be used any function from the [python.math](http://docs.python.org/2/library/math.html) module. Than a python program solves a partial differential equation on the server side, using the finite difference method and transfers the solution data back to user. The app visualizes solution on a graph, using HTML5 canvas and javascript.

##Used technologies
* django
* jQuery
* twitter bootstrap
* [bootstrap slider](http://www.eyecon.ro/bootstrap-slider/)
* [online LaTeX generator](http://www.codecogs.com/latex/about.php).