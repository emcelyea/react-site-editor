# react-site-editor
A React editor for designing and building webpages in the browser

Most of the work for this was done while building an experimental editor for my project [Collectorius](https://collectorius.com)

### Philosophy
A good library handles the essential parts of a problem but is unopinionated about what consumers do with the solutions.
For instance we are building a no code site builder using React, so what are the essential problems:
* How to represent DOM elements as Data that React can use and users can customize and store easily.
    - React should render this efficiently, don't want to rerender the entire component during a drag.
    - Users can customize data in each node.
    - each node will need information about its positioning, parents & children.
* Layout functionality, nodes will all require the ability to be positioned via DnD and styled via css, drag resizing.
* Conversion of React -> HTML using React.renderToStaticMarkup. Conversion between page as JSON and as HTML.

This leaves consumers with the role of determining what html nodes are: how users can edit them and how they ultimately render.

A consumer who wanted to have text, image and tables as potential nodes for their editable page would need to define the behavior of
those while the library determines all the layout and sizing information for them.

### How to run / test
#### Testing
* yarn dev
* localhost:1234

#### Deploying
* yarn build
* check deploy 'npm publish –dry-run'
* deploy: npm publish

### TODOS
* Write up type for data structure
* Come up with positioning functionality, what CSS can back drag n drop dynamic positioning while enforcing styling spacing guidelines

* how do different apps do it:
    - squarespace: uses grid to render n * n matrix of divs, element takes up m * m grid spaces. This seems ideal but is not performant.
    - wix: uses absolute positioning to line up element. Terrible as it breaks DOM flow.