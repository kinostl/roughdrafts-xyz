#!/usr/bin/env node

// So the goal here is to just create a pastebin that you log into using Discord. When you log in, you're presented with all your files. You can edit or delete them.
// The real value is that when you paste the link to Discord it has a user created Embed, acting like a really good preview to the longer article
// People can just make index pages if they want to have collections

const server = require('server')
const { get } = server.router
const { render, redirect } = server.reply
const es6Renderer = require('express-es6-template-engine')
const routes = require('auto-load')('routes')

// need to make a Procfile that handles making the secret key and prisma shit

// Run the server!
server(
  {
    port: 3000,
    views: 'views',
    favicon: './favicon.png',
    session: {
      secret: 'This is a super very long secret password',
      saveUninitialized: false,
      cookie: { secure: false }
    },
    engine: {
      html: (file, options, cb) =>
        es6Renderer(
          file,
          {
            locals: options,
            partials: { head: './partials/head.html' }
          },
          cb
        )
    },
    log: 'debug'
  },
  [
    get('/', async ctx => {
      console.log('slash')
      if (ctx.session.user) {
        console.log('ctx session', ctx.session.user)
        return redirect(`/@${ctx.session.user.displayId}`)
      } else {
        return render('login')
      }
    }),
    get('/welcome', async ctx => render('registered'))
  ],
  ...routes.login,
  ...routes.user.settings,
  ...routes.user.view,
  ...routes.article.edit,
  ...routes.article.settings,
  ...routes.article.view
)
