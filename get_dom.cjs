const http = require('http');
http.get('http://localhost:4321/p/hi-this-is-just-test', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    // print the order of tags: main, footer, section
    let idxMain = data.indexOf('<main');
    let idxMainClose = data.indexOf('</main>');
    let idxFooter = data.indexOf('<footer');
    let idxComments = data.indexOf('<section class="comments-section"');
    console.log("main starts:", idxMain);
    console.log("main ends:", idxMainClose);
    console.log("comments starts:", idxComments);
    console.log("footer starts:", idxFooter);
  });
});
