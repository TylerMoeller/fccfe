

// Options for marked.js markdown converter
marked.setOptions({
  breaks: false,
  langPrefix: 'hljs ',
  highlight: function highlight(code) {
    return hljs.highlightAuto(code).value;
  },
});

// Viewer for converted markdown
const MDView = React.createClass({
  displayName: 'MDView',

  render: function render() {
    return React.createElement('div', {
      id: 'mdViewer',
      dangerouslySetInnerHTML: { __html: marked(document.getElementById('mdInput').value) },
    });
  },
});

// <textarea> input for text to be converted to markdown
const MDInput = React.createClass({
  displayName: 'MDInput',

  getInitialState: function getInitialState() {
    const defaultText = '# Markdown Previewer!' + '\n\n### Pictures: ' + '\n\n![alt text](https://tylermoeller.github.io/fccfe/React-Markdown-Previewer/fcc.png)' + '\n\n### Headings:\n# H1\n## H2\n### H3\netc...\n###### H6' + '\n\n### Code blocks:' + '\n```javascript\nfunction hello() {\n  console.log(\'Hello!\');\n}\n\nhello();\n```' + '\n\n### Text Decoration:\n' + '*italic*, \n**bold**, \n~~strikethrough~~, \n`inline code or monospace text`' + '\n\n### Unordered lists:\n* item 1\n* item 2\n* item 3' + '\n\n### Ordered lists:\n1. item 1\n2. item 2\n3. item 3' + '\n\n### Hyperlinks: ' + '\n\n*[HyperLink](https://#)*' + '\n\n##### Most markdown engines also allow HTML:\n\n' + '<a href="https://freecodecamp.com/TylerMoeller" target="blank">Developed by Tyler Moeller</a><br>' + '\n<a href="https://twitter.com/Tyler_Moeller" target="_blank"><i class="fa fa-twitter footer"></i></a>' + '\n<a href="https://www.linkedin.com/in/tylermoeller" target="_blank"><i class="fa fa-linkedin footer"></i></a>' + '\n<a href="https://github.com/TylerMoeller" target="_blank"><i class="fa fa-github footer"></i></a>' + '\n<a href="https://www.freecodecamp.org/tylermoeller" target="_blank"><i class="fa fa-fire footer"></i></a>' + '\n<a href="https://codepen.io/TylerMoeller" target="_blank"><i class="fa fa-codepen footer"></i></a>' + '\n<a href="http://tylermoeller.net" target="_blank"><i class="fa fa-wordpress footer"></i></a>';

    return {
      value: defaultText,
      height: defaultText.split('\n').length + 1,
    };
  },

  // Display the default textarea value converted to markdown
  componentDidMount: function componentDidMount() {
    ReactDOM.render(React.createElement(MDView, null), document.getElementById('previewer'));
  },

  // Update the markdown preview whenever textarea changes
  // Adjust the height of the element if needed
  handleChange: function handleChange(event) {
    const textAreaHeight = document.getElementById('mdInput').value.split('\n').length;
    this.setState({ height: textAreaHeight });
    this.setState({ value: event.target.value });
    ReactDOM.render(React.createElement(MDView, null), document.getElementById('previewer'));
  },

  render: function render() {
    let markdown = null;
    markdown = React.createElement('textarea', {
      id: 'mdInput',
      autofocus: true,
      rows: this.state.height,
      maxLength: '2000',
      value: this.state.value,
      onChange: this.handleChange,
    });
    return React.createElement(
      'div',
      { className: 'mdInput' },
      markdown,
    );
  },
});

ReactDOM.render(React.createElement(MDInput, null), document.getElementById('textbox'));
