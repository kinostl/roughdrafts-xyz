const { render, redirect } = require('server/reply')
const prisma = require('../../prisma')
const md = require('markdown-it')()

const getRaw = async ctx => {
  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.fileId }
  })

  return render('viewRaw', post)
}

const getEmptyEditor = async ctx => {
  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!post) {
    return render('new', {
      displayId: ctx.params.displayId,
      title: 'New Article',
      rawContent: ''
    })
  } else {
    return redirect(`/${ctx.params.displayId}/edit`)
  }
}
const getEditor = async ctx => {
  const { id } = ctx.session.user

  const post = await prisma.article.findUnique({
    where: { displayId: ctx.params.displayId }
  })

  if (!post) {
    return redirect(`${ctx.params.displayId}/new`)
  }

  if (id !== post.authorId) {
    return redirect(`/${ctx.params.fileId}/raw`)
  } else {
    // cache will be able to handle anything important here
    return render('edit', post)
  }
}

const updateArticle = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null

  // just write the new file to the database
  // do category and spam detection using https://simplestatistics.org/docs/#bayesianclassifier
  // break stuff into 4 sets of words, then use BayesianClassifier to get estimates
  // Object.assign({}, ['a','b','c']); // {0:"a", 1:"b", 2:"c"}

  // https://www.npmjs.com/package/markdown-it-anchor
  // https://www.npmjs.com/package/markdown-it-emoji
  // https://www.npmjs.com/package/markdown-it-table-of-contents
  // https://www.npmjs.com/package/markdown-it-highlightjs
  // https://www.npmjs.com/package/markdown-it-external-links
  // https://www.npmjs.com/package/markdown-it-math or https://www.npmjs.com/package/markdown-it-mathjax
  const rawContent = ctx.body.article
  const content = md.render(rawContent)

  await prisma.article.upsert({
    where: { displayId: ctx.params.displayId },
    update: {
      rawContent,
      content
    },
    create: {
      displayId: ctx.params.displayId,
      title: ctx.body.title,
      rawContent,
      content,
      summary: '',
      author: {
        connect: { id }
      }
    }
  })

  return redirect(`/${ctx.params.displayId}`)
}

const deleteArticle = async ctx => {
  const { id } = ctx.session.user
  if (!id) return null
}

module.exports = {
  // File Stuff
  getRaw,
  getEditor,
  getEmptyEditor,
  updateArticle,
  deleteArticle
}
