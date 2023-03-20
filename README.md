# react-site-editor
A React editor for designing and building webpages in the browser

Most of the work for this was done while building an experimental editor for my project [Collectorius](https://collectorius.com)
### Philosophy
A good library handles the essential parts of a problem but is unopinionated about what consumers do with the solutions.
For instance we are building a no code site builder using React, so what are the essential problems:
* How do we represent HTML as a data structure that React can work with and users can extend and store.
    - React should render this efficiently, don't want to rerender the entire component during a drag.
    - Users can customize data in each node.
* Layout, nodes will all require the ability to be positioned and styled, users can control node contents.
* Conversion of React -> HTML using React.renderToStaticMarkup

This leaves consumers with the role of determining what html nodes are: how users can edit them and how they ultimately render.

A consumer who wanted to have text, image and tables as potential nodes for their editable page would need to define the behavior of
those while the library determines all the layout and sizing information for them.
### TODOS