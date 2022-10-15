import { getMessage } from '../../utils/fluent.js'

export default data => `
  <!doctype html>
  <html lang=${data.locale}>
    <head>
      <meta charset='utf-8'>
      <title>${getMessage('take-control')}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"> 
      <link href='css/index.css' type='text/css' rel='stylesheet'>
      <script src='js/index.js' type='module'></script>
    </head>
    <body>
      <header>
        <a href='/'><img src='images/monitor-logo-transparent.png' width='220' height='40'></a>
        <a href='/user/login' class='button'>Sign Up</a>
      </header>
      <nav>
      </nav>
      <main>
        ${data.partial}
      </main>
      <footer>
        <img src='images/moz-logo-1color-white-rgb-01.svg' width='100'>
        <p>MOZILLA footer image</p>
      </footer>
    </body>
  </html>
`
