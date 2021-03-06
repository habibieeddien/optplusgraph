export var footerHtml = `
<p>
  <button id="genUrlBtn" class="smallBtn" type="button">Generate permanent link</button> <input type="text" id="urlOutput" size="70"/>
</p>
<p>
  <button id="genUrlShortenedBtn" class="smallBtn" type="button">Generate shortened link</button> <input type="text" id="urlOutputShortened" size="25"/>
</p>

<p>Click the button above to create a permanent link to your
visualization. To report a bug, paste the link along with a brief error
description in an email addressed to philip@pgbovine.net</p>

<div id="embedLinkDiv">
<p>
  <button id="genEmbedBtn" class="smallBtn" type="button">Generate embed code</button> <input type="text" id="embedCodeOutput" size="70"/>
</p>

<p>To embed this visualization in your webpage, click the 'Generate
embed code' button above and paste the resulting HTML code into your
webpage. Adjust the height and width parameters and
change the link to <b>https://</b> if needed.</p>
</div>

<p style="margin-top: 25px;">
<a href="http://pythontutor.com/">Python Tutor</a> (<a href="https://github.com/pgbovine/OnlinePythonTutor">code on GitHub</a>) supports seven
languages (despite its name!):</p>

<p>1. Python <a href="https://docs.python.org/2.7/">2.7</a> and <a
href="https://docs.python.org/3.6/">3.6</a> with limited module
imports and no file I/O.
The following modules may be imported: 
bisect,
collections,
copy,
datetime,
functools,
hashlib,
heapq,
itertools,
json,
math,
operator,
random,
re,
string,
time,
io/StringIO.
<a
href="https://github.com/pgbovine/OnlinePythonTutor/tree/master/v3">Backend source code</a>.
</p>

<p>2. Java using Oracle's Java 8. The original <a
href="http://cscircles.cemc.uwaterloo.ca/java_visualize/">Java
visualizer</a> was created by <a href="https://github.com/daveagp">David Pritchard</a> and Will Gwozdz.
It supports
<code><a href="http://introcs.cs.princeton.edu/java/stdlib/javadoc/StdIn.html">StdIn</a></code>, 
<code><a href="http://introcs.cs.princeton.edu/java/stdlib/javadoc/StdOut.html">StdOut</a></code>, 
most other <a href="http://introcs.cs.princeton.edu/java/stdlib"><tt>stdlib</tt> libraries</a>,
<a href="http://introcs.cs.princeton.edu/java/43stack/Stack.java.html"><tt>Stack</tt></a>,
<a href="http://introcs.cs.princeton.edu/java/43stack/Queue.java.html"><tt>Queue</tt></a>,
and <a href="http://introcs.cs.princeton.edu/java/44st/ST.java.html"><tt>ST</tt></a>.
(To access Java's built-in <tt>Stack</tt>/<tt>Queue</tt> classes, write
<tt>import java.util.Stack;</tt> &mdash; note, <tt>import
java.util.*;</tt> won't work.)
<a
href="https://github.com/pgbovine/OnlinePythonTutor/tree/master/v4-cokapi/backends/java">Backend
source code</a>.</p>

<p>3. JavaScript running in Node.js v6.0.0 with limited support for ES6. <a
href="https://github.com/pgbovine/OnlinePythonTutor/tree/master/v4-cokapi/backends/javascript">Backend
source code</a>.</p>

<p>4. <a href="http://www.typescriptlang.org">TypeScript</a> 1.4.1 running in Node.js v6.0.0. <a
href="https://github.com/pgbovine/OnlinePythonTutor/tree/master/v4-cokapi/backends/javascript">Backend
source code</a>.</p>

<p>5. Ruby 2 using MRI 2.2.2. <a
href="https://github.com/pgbovine/OnlinePythonTutor/tree/master/v4-cokapi/backends/ruby">Backend
source code</a>.</p>

<p>6. C using gcc 4.8, C11, and Valgrind Memcheck.
<a href="https://github.com/pgbovine/opt-cpp-backend">Backend source code</a>.</p>

<p>7. C++ using gcc 4.8, C++11, and Valgrind Memcheck.
<a href="https://github.com/pgbovine/opt-cpp-backend">Backend source code</a>.</p>

<p style="margin-top: 30px;">Privacy Policy: By using Online Python
Tutor, your visualized code, options, user interactions, text chats, and
IP address are logged on our server and may be analyzed for research
purposes. Nearly all Web services collect this basic information from
users. However, the Online Python Tutor website (pythontutor.com) does
not collect any personal information or session state from users, nor
does it issue any cookies.</p>

<p style="margin-top: 25px;">
Copyright &copy; <a href="http://www.pgbovine.net/">Philip Guo</a>.  All rights reserved.
</p>
`;

// @habibieeddien
export var myFooterHTML = `
<div id="genLink">
<p>
  <input type="text" id="urlOutput" size="70" class="form-control"/>
</p>
<p class="form-inline">
  <button id="genUrlShortenedBtn" class="btn btn-info btn-sm" type="button">Generate shortened link</button><input type="text" id="urlOutputShortened" class="form-control" style="margin-left:7px;"/>
</p>

<p>Click the button above to create a permanent link to your
visualization. To report a bug, paste the link along with a brief error
description in an email addressed to <a href="mailto:23515043@std.stei.itb.ac.id" target="_blank">23515043@std.stei.itb.ac.id</a></p>

<div id="embedLinkDiv">
<p>
  <button id="genEmbedBtn" class="btn btn-info btn-sm" type="button" style="margin-bottom:7px;">Generate embed code</button> <input type="text" id="embedCodeOutput" size="70" class="form-control"/>
</p>

<p>To embed this visualization in your webpage, click the 'Generate
embed code' button above and paste the resulting HTML code into your
webpage. Adjust the height and width parameters and
change the link to <b>https://</b> if needed.</p>
</div>
</div>

<div id="info">
<p>1. Graph Visualization Frontend.
<a href="http://gitlab.informatika.org/" target="_blank">Frontend source code</a>.</p>

<p>2. C using gcc 4.8, C11, and Valgrind Memcheck.
<a href="https://github.com/pgbovine/opt-cpp-backend" target="_blank">Backend source code</a>.</p>

<p>3. C++ using gcc 4.8, C++11, and Valgrind Memcheck.
<a href="https://github.com/pgbovine/opt-cpp-backend" target="_blank">Backend source code</a>.</p>

<p>Graph Visualization feature by <a href="http://habibie.tk/" target="_blank">Habibie Ed Dien</a>.
Based on <a href="http://pythontutor.com/c.html" target="_blank">the Online Python Tutor website (pythontutor.com)</a></p></div>`;